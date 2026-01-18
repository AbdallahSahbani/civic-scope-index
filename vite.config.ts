import { defineConfig, loadEnv, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { componentTagger } from "lovable-tagger";

/**
 * Civic-grade config goals:
 * - Deterministic builds (stable chunking + hashed output)
 * - Strict env contracts (fail fast)
 * - Safer dev server defaults
 * - Security headers in dev/preview (CSP-lite)
 * - Feature flags that mirror product constraints (USA-only, descriptive-only, provenance)
 */

type AppEnv = {
  APP_ENV: string; // "development" | "staging" | "production"
  VITE_API_BASE_URL: string; // e.g. https://xyz.supabase.co/functions/v1
  VITE_USA_ONLY: string; // "true" | "false"
  VITE_DESCRIPTIVE_ONLY: string; // "true" | "false"
  VITE_PROVENANCE_BADGES: string; // "true" | "false"
  VITE_BUILD_COMMIT?: string;
  VITE_SENTRY_DSN?: string;
};

function must(env: Record<string, string | undefined>, key: keyof AppEnv): string {
  const v = env[String(key)];
  if (!v) throw new Error(`Missing required env var: ${String(key)}`);
  return v;
}

function oneOf(name: string, value: string, allowed: string[]) {
  if (!allowed.includes(value)) {
    throw new Error(`${name} must be one of: ${allowed.join(", ")} (got "${value}")`);
  }
}

function boolStr(name: string, value: string): boolean {
  if (value !== "true" && value !== "false") {
    throw new Error(`${name} must be "true" or "false" (got "${value}")`);
  }
  return value === "true";
}

function shortHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 10);
}

function readPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"));
    return String(pkg.version ?? "0.0.0");
  } catch {
    return "0.0.0";
  }
}

export default defineConfig(({ mode }): UserConfig => {
  const raw = loadEnv(mode, process.cwd(), "");
  const isDev = mode === "development";
  const isProd = mode === "production";

  // ---- strict env contract ----
  const APP_ENV = must(raw, "APP_ENV");
  oneOf("APP_ENV", APP_ENV, ["development", "staging", "production"]);

  const API_BASE = must(raw, "VITE_API_BASE_URL");
  const USA_ONLY = boolStr("VITE_USA_ONLY", must(raw, "VITE_USA_ONLY"));
  const DESCRIPTIVE_ONLY = boolStr("VITE_DESCRIPTIVE_ONLY", must(raw, "VITE_DESCRIPTIVE_ONLY"));
  const PROVENANCE_BADGES = boolStr("VITE_PROVENANCE_BADGES", must(raw, "VITE_PROVENANCE_BADGES"));

  // Build metadata for UI + logs
  const pkgVersion = readPackageVersion();
  const buildCommit = raw.VITE_BUILD_COMMIT ?? "";
  const buildId = shortHash(`${pkgVersion}:${buildCommit}:${mode}`);

  // Minimal security headers (dev/preview only). Real headers belong at CDN/reverse-proxy.
  const securityHeaders: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    // CSP-lite: allows dev tools + inline styles often used by libs; tighten at CDN.
    "Content-Security-Policy": isDev
      ? "default-src 'self' data: blob: https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:;"
      : "default-src 'self';",
  };

  return {
    // ---- baseline ----
    root: process.cwd(),
    base: "/",
    clearScreen: false,
    logLevel: isDev ? "info" : "warn",

    plugins: [
      react({
        tsDecorators: true,
        // SWC is fast, but still keep it sane:
        // (You can add SWC plugins here later if needed.)
      }),

      // Keep loveable tooling only in dev
      isDev && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@app": path.resolve(__dirname, "./src/app"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@store": path.resolve(__dirname, "./src/store"),
        "@styles": path.resolve(__dirname, "./src/styles"),
      },
    },

    // ---- dev server hardening ----
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      cors: false, // don't be lazy; you can proxy /api instead
      headers: securityHeaders,

      // Proxy your edge functions to avoid CORS chaos in dev
      proxy: {
        "/api": {
          target: API_BASE,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },

      hmr: {
        overlay: true,
      },
    },

    preview: {
      port: 8080,
      strictPort: true,
      headers: securityHeaders,
    },

    // ---- build settings that don't suck ----
    build: {
      target: "es2022",
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      sourcemap: isDev ? true : "hidden", // hidden source maps for prod debugging w/out exposing
      minify: "esbuild",
      reportCompressedSize: true,
      cssCodeSplit: true,

      // Deterministic chunking: stable vendor splits + feature splits
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].${buildId}.[hash].js`,
          chunkFileNames: `assets/[name].${buildId}.[hash].js`,
          assetFileNames: `assets/[name].${buildId}.[hash].[ext]`,

          manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // core
            if (id.includes("react")) return "react-core";

            // router / data / ui buckets — adjust to your stack
            if (id.includes("react-router")) return "router";
            if (id.includes("@tanstack")) return "tanstack";
            if (id.includes("zod")) return "validation";
            if (id.includes("date-fns") || id.includes("dayjs")) return "dates";

            // charts/maps if you add them
            if (id.includes("recharts") || id.includes("d3")) return "charts";

            // everything else vendor
            return "vendor";
          },
        },
      },
    },

    // ---- env + product constraint flags exposed to the app ----
    define: {
      __DEV__: isDev,
      __APP_ENV__: JSON.stringify(APP_ENV),
      __BUILD_ID__: JSON.stringify(buildId),
      __PKG_VERSION__: JSON.stringify(pkgVersion),
      __USA_ONLY__: JSON.stringify(USA_ONLY),
      __DESCRIPTIVE_ONLY__: JSON.stringify(DESCRIPTIVE_ONLY),
      __PROVENANCE_BADGES__: JSON.stringify(PROVENANCE_BADGES),
    },

    // ---- dependency optimization ----
    optimizeDeps: {
      include: ["react", "react-dom"],
      esbuildOptions: {
        target: "es2022",
      },
    },

    // ---- prod hygiene ----
    esbuild: {
      // Drop noise in production builds (keep warnings if you prefer)
      drop: isProd ? ["console", "debugger"] : [],
      legalComments: "none",
    },
  };
});

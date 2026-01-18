import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const isDev = mode === "development";

  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      cors: true,
    },

    preview: {
      port: 8080,
      strictPort: true,
    },

    plugins: [
      react({
        jsxImportSource: undefined,
        tsDecorators: true,
      }),
      isDev && componentTagger(),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@store": path.resolve(__dirname, "./src/store"),
      },
    },

    build: {
      target: "es2022",
      sourcemap: isDev,
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      cssCodeSplit: true,
      minify: "esbuild",

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react")) return "react";
              if (id.includes("lodash")) return "lodash";
              return "vendor";
            }
          },
        },
      },
    },

    define: {
      __DEV__: isDev,
      __APP_ENV__: JSON.stringify(env.APP_ENV ?? mode),
    },

    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },

    optimizeDeps: {
      include: ["react", "react-dom"],
      esbuildOptions: {
        target: "es2022",
      },
    },
  };
});

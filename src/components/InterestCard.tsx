import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
import clsx from "clsx";

type Party = "R" | "D" | "I";

interface InterestItem {
  id: string;
  name: string;
  role?: string;
  party?: string | null;
  state?: string;
  jurisdiction?: string;
  photoUrl?: string;
  entityType?: string;
}

interface InterestCardProps {
  item: InterestItem;
  onRemove: (id: string) => void;
}

/* ---------- party normalization ---------- */

function normalizeParty(party?: string | null): Party {
  const p = party?.toLowerCase();
  if (p === "r" || p?.includes("republican")) return "R";
  if (p === "d" || p?.includes("democrat")) return "D";
  return "I";
}

const PARTY_STYLES: Record<Party, { border: string; bg: string; header: string }> = {
  R: {
    border: "border-red-500",
    bg: "bg-red-600",
    header: "bg-red-700",
  },
  D: {
    border: "border-blue-500",
    bg: "bg-blue-600",
    header: "bg-blue-700",
  },
  I: {
    border: "border-gray-400",
    bg: "bg-gray-500",
    header: "bg-gray-600",
  },
};

/* ---------- helpers ---------- */

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* ---------- component ---------- */

export function InterestCard({ item, onRemove }: InterestCardProps) {
  const party = useMemo(() => normalizeParty(item.party), [item.party]);
  const styles = PARTY_STYLES[party];
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={clsx(
        "relative w-full max-w-[280px] rounded-xl border-4 shadow-xl overflow-hidden",
        "transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl",
        styles.border,
      )}
    >
      {/* Header */}
      <header className={clsx("px-4 py-3 text-center", styles.header)}>
        <h3 className="truncate text-lg font-bold font-serif text-white">{item.name}</h3>
      </header>

      {/* Media */}
      <div className="relative h-48 bg-gradient-to-br from-red-900 via-blue-900 to-red-900">
        <div className="absolute inset-0 flex items-center justify-center">
          {!imgError && item.photoUrl ? (
            <img
              src={item.photoUrl}
              alt={item.name}
              className="h-40 w-40 rounded-lg object-cover border border-white/40 shadow-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-40 w-40 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-4xl font-bold font-serif text-white border border-white/40">
              {getInitials(item.name)}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={clsx("px-4 py-3 text-center", styles.bg)}>
        <p className="text-sm font-semibold text-white">{item.role ?? item.entityType ?? "Official"}</p>
        <p className="text-xs text-white/80">{item.jurisdiction ?? item.state ?? "United States"}</p>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between bg-white/90 px-4 py-3">
        <div
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white",
            styles.bg,
          )}
          aria-label={`Party ${party}`}
        >
          {party}
        </div>

        <button
          onClick={() => onRemove(item.id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
        >
          <X size={14} />
          Remove
        </button>
      </footer>

      {/* View profile (explicit, not hijacking clicks) */}
      <Link
        to={`/official/${item.id}`}
        className="absolute inset-0 z-10 focus:outline-none"
        aria-label={`View profile for ${item.name}`}
      />
    </article>
  );
}

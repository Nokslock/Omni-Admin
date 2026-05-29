"use client";

import { useEffect, useRef, useState } from "react";
import { searchPlaces, getPlaceDetails, type PlaceSuggestion } from "./places";

const fieldClass =
  "h-10 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-fg placeholder:text-fg-subtle focus:border-fg-muted focus:outline-none focus:ring-1 focus:ring-fg-muted/30";

export function LocationAutocomplete() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);

    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const res = await searchPlaces(q);
      setLoading(false);
      if ("error" in res) {
        setError(res.error);
        setSuggestions([]);
        setOpen(false);
        return;
      }
      setError(null);
      setSuggestions(res.suggestions);
      setOpen(res.suggestions.length > 0);
    }, 300);
  }

  async function choose(s: PlaceSuggestion) {
    setQuery(s.secondary ? `${s.primary}, ${s.secondary}` : s.primary);
    setOpen(false);
    setSuggestions([]);
    const d = await getPlaceDetails(s.placeId);
    if ("error" in d) {
      setError(d.error);
      return;
    }
    setError(null);
    setLat(String(d.lat));
    setLng(String(d.lng));
    if (d.district) setDistrict(d.district);
  }

  return (
    <>
      <div ref={boxRef} className="relative">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fg-muted">Location</span>
          <input
            name="location"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            autoComplete="off"
            required
            placeholder="Start typing a place…"
            className={fieldClass}
          />
        </label>

        {loading && (
          <span className="absolute right-3 top-9 text-[11px] text-fg-subtle">…</span>
        )}

        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-bg-card py-1 shadow-xl shadow-black/40">
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  onClick={() => choose(s)}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-bg-elev transition-colors"
                >
                  <span className="text-sm text-fg">{s.primary}</span>
                  {s.secondary && (
                    <span className="text-[11px] text-fg-muted">{s.secondary}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-fg-muted">District / Area</span>
        <input
          name="address"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
          placeholder="Auto-filled from location"
          className={fieldClass}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fg-muted">Latitude</span>
          <input
            name="lat"
            value={lat}
            readOnly
            placeholder="From selected place"
            className={`${fieldClass} cursor-default text-fg-muted`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-fg-muted">Longitude</span>
          <input
            name="lng"
            value={lng}
            readOnly
            placeholder="From selected place"
            className={`${fieldClass} cursor-default text-fg-muted`}
          />
        </label>
      </div>

      {error && <p className="text-[11px] text-danger">{error}</p>}
      {!error && !lat && (
        <p className="text-[11px] text-fg-subtle">
          Search and select a location to auto-fill the coordinates.
        </p>
      )}
    </>
  );
}

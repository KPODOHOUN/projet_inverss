import { useEffect, useRef, useState } from 'react';

// Free, no-API-key city lookup via OpenStreetMap's Nominatim, scoped to the
// selected country so "Cotonou" suggests Bénin's Cotonou, not any other.
// Debounced and request-cancelled per OSM's usage policy (no hammering it on
// every keystroke): https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export default function CityAutocomplete({ value, onChange, countryIso2, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!countryIso2 || !value || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          city: value.trim(),
          countrycodes: countryIso2.toLowerCase(),
          format: 'json',
          limit: '6',
          addressdetails: '1',
        });
        const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        const names = [...new Set(
          data.map(r => r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.display_name?.split(',')[0])
            .filter(Boolean)
        )];
        setSuggestions(names);
      } catch (e) {
        if (e.name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [value, countryIso2]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        disabled={!countryIso2}
        placeholder={countryIso2 ? (placeholder || 'Commencez à écrire…') : "Sélectionnez d'abord un pays"}
        className="w-full px-4 py-3 bg-black border-2 border-yellow-900/30 rounded text-white text-sm focus:border-yellow-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {open && countryIso2 && (loading || suggestions.length > 0) && (
        <div className="absolute z-20 mt-1 w-full bg-black border-2 border-yellow-900/30 rounded max-h-48 overflow-y-auto">
          {loading && <div className="px-4 py-2 text-xs text-gray-500">Recherche…</div>}
          {!loading && suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onChange(s); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-yellow-900/20 hover:text-yellow-400 bg-transparent border-none cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

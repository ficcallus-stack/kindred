"use client";

import { useState, useEffect, useRef } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface MapboxAutocompleteProps {
  initialLocation?: string;
  onSelect: (location: string, lat: number, lng: number) => void;
  placeholder?: string;
  inputClassName?: string;
}

export default function MapboxAutocomplete({
  initialLocation = "",
  onSelect,
  placeholder = "Search by State and Area (e.g. Austin, TX)",
  inputClassName = ""
}: MapboxAutocompleteProps) {
  const [query, setQuery] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query === initialLocation || !hasInteracted) {
      setSuggestions([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn("Missing Mapbox API Token in .env.local");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=us&types=place,region,address&access_token=${token}`);
        const data = await res.json();
        if (data.features) {
          setSuggestions(data.features);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Mapbox fetch error", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, initialLocation, hasInteracted]);

  const handleSelect = (feature: MapboxFeature) => {
    const [lng, lat] = feature.center;
    setQuery(feature.place_name);
    setSuggestions([]);
    setIsOpen(false);
    setHasInteracted(false);
    onSelect(feature.place_name, lat, lng);
  };

  return (
    <div className={`relative w-full`} ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHasInteracted(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        className={inputClassName}
      />
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className="px-4 py-3 hover:bg-surface-container cursor-pointer text-sm font-semibold transition-colors flex items-center gap-3 border-b border-outline-variant/10 last:border-none"
            >
              <MaterialIcon name="location_on" className="text-secondary opacity-60 text-lg" />
              <span className="truncate">{suggestion.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

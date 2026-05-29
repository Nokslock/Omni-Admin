// Google Maps basemap styles for the app's light/dark themes.
// The active theme is signalled by the `dark` class on <html> (see ThemeToggle).

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1115" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a93a3" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#222730" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1e25" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2d333d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1622" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2a2f38" }] },
];

// Standard light basemap, just decluttered (no POI/transit labels).
export const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export function isDarkTheme(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  );
}

export function currentMapStyle(): google.maps.MapTypeStyle[] {
  return isDarkTheme() ? DARK_MAP_STYLE : LIGHT_MAP_STYLE;
}

/**
 * Calls `apply` with the right style whenever the light/dark theme changes.
 * Returns a cleanup function that stops observing.
 */
export function observeMapTheme(
  apply: (styles: google.maps.MapTypeStyle[]) => void,
): () => void {
  const observer = new MutationObserver(() => apply(currentMapStyle()));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

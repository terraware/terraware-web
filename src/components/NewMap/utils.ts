const latToY = (lat: number): number => {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
};

const getBoundsZoomLevel = (
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  mapWidth: number,
  mapHeight: number
): number => {
  const TILE_SIZE = 256;

  // Latitude fraction (north–south span)
  const latFraction = (latToY(bounds.maxLat) - latToY(bounds.minLat)) / (2 * Math.PI);

  // Longitude fraction (east–west span, handle wraparound)
  let lngDiff = bounds.maxLng - bounds.minLng;
  if (lngDiff < 0) {
    lngDiff += 360;
  }
  const lngFraction = lngDiff / 360;

  // Zoom levels required for height and width
  const latZoom = Math.log2(mapHeight / TILE_SIZE / latFraction);
  const lngZoom = Math.log2(mapWidth / TILE_SIZE / lngFraction);

  // Use the smaller zoom so the whole box fits
  return Math.floor(Math.min(latZoom, lngZoom));
};

export { getBoundsZoomLevel };

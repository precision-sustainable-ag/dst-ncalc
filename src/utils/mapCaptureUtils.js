/**
 * Fit a Mapbox map to `bounds` and resolve only once the camera animation
 * and the subsequent tile/render cycle are both complete.
 */
export function fitAndWaitForIdle(mapInstance, bounds) {
  return new Promise((resolve) => {
    const waitForIdle = () => {
      mapInstance.once('idle', resolve);
      mapInstance.triggerRepaint();
    };
    if (!bounds) {
      waitForIdle();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      waitForIdle();
    };

    mapInstance.once('moveend', finish);

    mapInstance.fitBounds(
      [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
      { padding: 40, animate: false },
    );
    setTimeout(finish, 100);
  });
}

/**
 * Extract legend items from the DOM node that wraps the map.
 */
export function extractLegend(containerEl) {
  const legendEl = containerEl?.querySelector('[class*="rasterlegend"]');
  if (!legendEl) return { legendTitle: [], legendItems: [] };

  const headerEl = legendEl.querySelector('[class*="rasterlegendheader"]');
  const legendTitle = headerEl
    ? [...headerEl.querySelectorAll('[class*="rasterlegendvalue"]')].map((v) => v.textContent.trim())
    : [];

  const legendItems = [];
  legendEl.querySelectorAll('[class*="rasterlegenditem"]').forEach((item) => {
    const color = item.querySelector('[class*="rasterlegendcolor"]')?.style?.backgroundColor;
    const values = [...item.querySelectorAll('[class*="rasterlegendvalue"]')].map((v) => v.textContent.trim());
    if (color && values.length) legendItems.push({ color, values });
  });

  return { legendTitle, legendItems };
}

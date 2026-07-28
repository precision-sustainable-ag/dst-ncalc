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
  const legendTitle = legendEl?.querySelector('span')?.textContent?.trim() ?? '';
  const legendItems = [];

  if (legendEl) {
    legendEl.querySelectorAll('[class*="rasterlegenditem"]').forEach((item) => {
      const color = item.querySelector('[class*="rasterlegendcolor"]')?.style?.backgroundColor;
      const label = item.querySelector('[class*="rasterlegendvalue"]')?.textContent?.trim();
      if (color && label) legendItems.push({ color, label });
    });
  }

  return { legendTitle, legendItems };
}

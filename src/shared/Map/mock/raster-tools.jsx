import React, { useEffect } from 'react';
import styles from './map.module.scss';

const RasterTools = ({ map, colorStops }) => {
  const [opacityValue, setOpacityValue] = React.useState(50);

  const handleOpacityChange = (event) => {
    const { value: val } = event.target;
    setOpacityValue(val);
    if (map && map.current) {
      map.current.setPaintProperty('biomassPolygons', 'fill-opacity', val / 100);
    }
  };

  useEffect(() => {
    if (map && map.current) {
      map.current.setPaintProperty('biomassPolygons', 'fill-color', {
        property: 'value',
        stops: colorStops,
      });
    }
  }, [colorStops]);

  return (
    <div>
      <div className={styles.rastertools}>
        <div className={styles.rasterlegend}>
          {colorStops.map((stop, i) => (
            <div key={i} className={styles.rasterlegenditem}>
              <div className={styles.rasterlegendcolor} style={{ backgroundColor: stop[1] }} />
              <div className={styles.rasterlegendvalue}>{stop[0]}</div>
            </div>
          ))}
        </div>
        <div className={styles.opacityslider}>
          <div className={styles.slidecontainer}>
            <input type="range" min="0" max="100" value={opacityValue} className={styles.slider} onChange={handleOpacityChange} id="myRange" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default RasterTools;

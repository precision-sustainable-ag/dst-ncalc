import React from 'react';
import styles from './map.module.scss';

const InfoBox = ({ cursorLoc }) => (
  <div className={styles.infobar}>
    <p>
      {cursorLoc.latitude}
      {', '}
      {cursorLoc.longitude}
    </p>
  </div>
);
export default InfoBox;

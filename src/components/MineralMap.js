import React from 'react';
import './MineralMap.css';

function MineralMap() {
  return (
    <div className="arcgis-embed-container">
      <iframe
        title="DEV-CaMP Mineral Web Experience"
        src="https://experience.arcgis.com/experience/3eee5130613442df856bc707c381b9a5"
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 'none' }}
        allowFullScreen
      ></iframe>
    </div>
  );
}

export default MineralMap;

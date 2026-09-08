import React from 'react';
import MineralMap from '../components/MineralMap';

function MapPage() {
  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <MineralMap />
    </div>
  );
}

export default MapPage;
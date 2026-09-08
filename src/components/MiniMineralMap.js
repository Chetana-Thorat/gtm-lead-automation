// MiniMineralMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import Papa from 'papaparse';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Use same color mapping as full map
const mineralColors = {
  Lithium: '#FFAA1D',
  Copper: '#00008B',
  Cobalt: '#FF4500',
  Nickel: '#32CD32',
  Graphite: '#8A2BE2',
  Other: '#A52A2A'
};

// Simple circle icons
const createMiniIcon = (color) =>
  L.divIcon({
    className: 'mini-div-icon',
    html: `<svg width="20" height="20"><circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="1"/></svg>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });

function MiniMineralMap() {
  const [sampleData, setSampleData] = useState([]);
  const mainMinerals = ['Lithium', 'Copper', 'Cobalt', 'Nickel', 'Graphite'];

  useEffect(() => {
    Papa.parse('/minerals_with_coords.csv', {
      header: true,
      download: true,
      complete: (results) => {
        const valid = results.data.filter(
          d => d.Latitude && d.Longitude && mainMinerals.includes(d.Primary_Critical_Material)
        );
        setSampleData(valid.slice(0, 6)); // just 6 markers
      }
    });
  }, []);

  return (
        <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      minZoom={3}
      maxZoom={7}
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      zoomControl={false}
      attributionControl={false}
      style={{ height: '420px', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {sampleData.map((item, index) => {
        const color = mineralColors[item.Primary_Critical_Material] || mineralColors.Other;
        const icon = createMiniIcon(color);

        return (
          <Marker key={index} position={[item.Latitude, item.Longitude]} icon={icon}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div style={{ maxWidth: '200px' }}>
                <strong>{item.Primary_Critical_Material}</strong><br />
                {item.Project_Name}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MiniMineralMap;

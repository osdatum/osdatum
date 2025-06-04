import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useSearchParams, useNavigate } from 'react-router-dom';
import datumBackground from '../assets/images/datumbackground.png';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Datum = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gridId = searchParams.get('gridId');
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [purchasedGrids, setPurchasedGrids] = useState([]);
  const [accessChecked, setAccessChecked] = useState(false);

  // Check user access
  useEffect(() => {
    const checkUserAccess = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access this data');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/access`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check user access');
        }

        const data = await response.json();
        setPurchasedGrids(data.purchasedGrids || []);
        
        // Check if user has purchased this grid
        if (!data.purchasedGrids.includes(String(gridId))) {
          setError('You need to purchase access to view this grid data');
          setLoading(false);
          return;
        }

        setAccessChecked(true);
      } catch (err) {
        console.error('Error checking user access:', err);
        setError('Error checking access permissions');
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [gridId]);

  // Fetch grid data from GeoJSON
  useEffect(() => {
    const fetchGridData = async () => {
      if (!gridId || !accessChecked) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Searching for gridId:', gridId);
        const response = await fetch('/data/datumvertikal.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Set the full map data
        setMapData(data);
        
        console.log('All features:', data.features);
        // Find the grid with matching GRID_ID
        const grid = data.features.find(feature => {
          return String(feature.properties.GRID_ID) === String(gridId);
        });
        
        if (grid) {
          console.log('Found grid:', grid.properties);
          setGridData(grid.properties);
        } else {
          setError('No data found for this grid');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching grid data:', err);
        setError('Error fetching grid data. Please try again.');
        setLoading(false);
      }
    };

    fetchGridData();
  }, [gridId, accessChecked]);

  // Style untuk GeoJSON
  const geoJSONStyle = (feature) => {
    const isSelected = String(feature.properties.GRID_ID) === String(gridData.GRID_ID);
    return {
      color: isSelected ? '#ef4444' : '#2563eb',
      weight: isSelected ? 2 : 1,
      fillOpacity: isSelected ? 0.4 : 0.1,
      fillColor: isSelected ? '#ef4444' : '#2563eb',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/services/datum')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
            >
              Back to Grid List
            </button>
            {error.includes('purchase') && (
          <button
                onClick={() => navigate(`/services/datum?gridId=${gridId}`)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
                Purchase Access
          </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-18">
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-stretch">
          <div className="container mx-auto px-4 py-32">
            <h1 className="text-3xl font-bold text-blue-900 mb-2 tracking-wide">DATUM DATA</h1>
            <div className="text-blue-900 font-semibold mb-8">GRID INFORMATION</div>
            
            {gridData && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-4">Grid Details</h2>
                    <div className="space-y-2">
                      <p><span className="font-semibold">Grid ID:</span> {gridData.GRID_ID}</p>
                      <p><span className="font-semibold">MSL:</span> {gridData.MSL}</p>
                      <p><span className="font-semibold">MHWS:</span> {gridData.MHWS}</p>
                      <p><span className="font-semibold">MLWS:</span> {gridData.MLWS}</p>
                      <p><span className="font-semibold">HAT:</span> {gridData.HAT}</p>
                      <p><span className="font-semibold">LAT:</span> {gridData.LAT}</p>
                    </div>
                    <h2 className="text-xl font-bold text-blue-900 mb-4 mt-8">Coordinates</h2>
                    <div className="space-y-2">
                      <p><span className="font-semibold">Longitude:</span> {gridData.Longitude}</p>
                      <p><span className="font-semibold">Latitude:</span> {gridData.Latitude}</p>
                      <p><span className="font-semibold">X:</span> {gridData.X}</p>
                      <p><span className="font-semibold">Y:</span> {gridData.Y}</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-4">Datum Graph</h2>
                    <div className="relative h-[400px] w-full border-1 overflow-hidden" style={{
                      backgroundImage: `url(${datumBackground})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}>
                      <h2 className="absolute top-3 left-4 text-lg font-semibold z-20">
                        Image Visualization for Grid {gridData.GRID_ID}
                      </h2>
                      {/* Dynamic SVG scaling based on datum values */}
                      {(() => {
                        // Parse datum values as floats
                        const hat = parseFloat(gridData.HAT);
                        const mhws = parseFloat(gridData.MHWS);
                        const msl = parseFloat(gridData.MSL);
                        const mlws = parseFloat(gridData.MLWS);
                        const lat = parseFloat(gridData.LAT);
                        // Find min and max (ignore NaN)
                        const values = [hat, mhws, msl, mlws, lat].filter(v => !isNaN(v));
                        const minDatum = Math.min(...values);
                        const maxDatum = Math.max(...values);
                        // Add padding
                        const minY = minDatum - 0.1 * (maxDatum - minDatum);
                        const maxY = maxDatum + 0.1 * (maxDatum - minDatum);
                        // SVG area
                        const svgTop = 60;
                        const svgBottom = 340;
                        // Function to map datum value to SVG y
                        const yPos = v => {
                          if (isNaN(v)) return svgBottom;
                          return svgTop + (svgBottom - svgTop) * (1 - (v - minY) / (maxY - minY));
                        };
                        // Grid lines (5 steps)
                        const steps = 5;
                        const gridVals = Array.from({length: steps+1}, (_,i) => minY + (i*(maxY-minY)/steps));
                        // Prepare datum values and y positions
                        const datumArr = [
                          { key: 'HAT', value: hat, color: '#eab308', label: 'HAT' },
                          { key: 'MHWS', value: mhws, color: '#eab308', label: 'MHWS' },
                          { key: 'MSL', value: msl, color: '#eab308', label: 'MSL' },
                          { key: 'MLWS', value: mlws, color: '#eab308', label: 'MLWS' },
                          { key: 'LAT', value: lat, color: '#eab308', label: 'LAT' },
                        ].filter(d => !isNaN(d.value));
                        // Sort by value descending (so yang lebih tinggi di atas)
                        datumArr.sort((a, b) => b.value - a.value);
                        // Calculate y positions
                        const minDist = 26; // minimal vertical distance to avoid overlap
                        let visualDatum = datumArr.map((d) => ({ ...d, y: yPos(d.value) }));
                        // Adjust y positions to avoid overlap (shift down if needed)
                        for (let i = 1; i < visualDatum.length; i++) {
                          if (Math.abs(visualDatum[i].y - visualDatum[i-1].y) < minDist) {
                            visualDatum[i].y = visualDatum[i-1].y + minDist;
                          }
                        }
                        return (
                          <svg className="w-full h-full relative z-10 mt-10">
                            {/* Vertical axis and grid lines */}
                            <g>
                              {/* Y axis line */}
                              <line x1="70" y1={svgTop} x2="70" y2={svgBottom} stroke="#444" strokeWidth="2" />
                              {/* Horizontal grid lines and labels */}
                              {gridVals.map((val, i) => (
                                <g key={i}>
                                  <line x1="70" y1={yPos(val)} x2="250" y2={yPos(val)} stroke="#444" strokeWidth="1" opacity="0.5" />
                                  <text x="30" y={yPos(val)+4} className="fill-black text-xs font-bold">{val.toFixed(2)}</text>
                                </g>
                              ))}
                            </g>
                            {/* Titik kuning, garis putus-putus, dan label datum */}
                            <g>
                              {visualDatum.map((d) => (
                                <g key={d.key}>
                                  {/* Titik kuning di sumbu */}
                                  <circle cx="80" cy={d.y} r="5" fill="#f1e300" stroke="#fff" strokeWidth="1" />
                                  {/* Garis putus-putus merah ke kanan */}
                                  <line x1="88" y1={d.y} x2="180" y2={d.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
                                  {/* Label datum dan nilai di kanan, background putih dan shadow */}
                                  <rect x="185" y={d.y-19} width="105" height="28" rx="5" fill="#fff" opacity="0.9" filter="url(#shadow)" />
                                  <text x="190" y={d.y-3} className="text-xs font-bold" style={{fontWeight:'bold'}}>{d.label}: <tspan className="fill-gray-700">{Number(gridData[d.key]).toFixed(3)}m</tspan></text>
                                </g>
                              ))}
                              {/* SVG filter for shadow */}
                              <filter id="shadow" x="0" y="0" width="200%" height="200%">
                                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
                              </filter>
                            </g>
                            {/* Y-axis title */}
                            <text x="70" y={svgTop-20} className="text-xs font-bold" textAnchor="middle">Datum (m)</text>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900 mb-4">Map View</h2>
                    <div className="h-[400px] w-full rounded-lg border-1 overflow-hidden">
                      {mapData && (
                        <MapContainer
                          center={[gridData.Latitude, gridData.Longitude]}
                          zoom={10}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <GeoJSON 
                            data={mapData}
                            style={geoJSONStyle}
                          />
                          <Marker position={[gridData.Latitude, gridData.Longitude]}>
                            <Popup>
                              Grid {gridData.GRID_ID}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Datum; 
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function DatumCopyPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [userAccess, setUserAccess] = useState(null); // 'free', 'subscription', 'purchased'
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [purchasedGrids, setPurchasedGrids] = useState([]);
  const gridRefs = useRef({});
  const [searchParams] = useSearchParams();
  const gridIdFromUrl = searchParams.get('gridId');
  const navigate = useNavigate();

  // Check user access
  const checkUserAccess = async () => {
    console.log('checkUserAccess called.');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('checkUserAccess: No token found, setting access to free.');
        setUserAccess('free');
        setPurchasedGrids([]);
        return;
      }

      console.log('checkUserAccess: Token found. Attempting to fetch user access/purchased grids.');
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/user/access`;
      console.log('checkUserAccess: Fetching from URL:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

        if (!response.ok) {
        console.error('checkUserAccess: Fetch response not OK:', response.status);
        throw new Error('Failed to check user access');
        }

        const data = await response.json();
      console.log('checkUserAccess: Fetch successful, response data:', data);
      setUserAccess(data.access);
      if (data.purchasedGrids) {
        setPurchasedGrids(data.purchasedGrids);
        console.log('checkUserAccess: Purchased grids updated:', data.purchasedGrids);
      }
    } catch (err) {
      console.error('checkUserAccess: Error checking user access:', err);
      setUserAccess('free');
      setPurchasedGrids([]); // Default to empty array on error
    }
  };

  // Initial check and event listener setup
  useEffect(() => {
    checkUserAccess();

    // Add event listener for purchase updates
    const handlePurchaseUpdate = () => {
      console.log('Purchase state changed (Datum.jsx), refreshing purchased grids');
      checkUserAccess(); // Re-fetch user access and purchased grids
    };

    window.addEventListener('purchaseUpdate', handlePurchaseUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('purchaseUpdate', handlePurchaseUpdate);
    };
  }, []); // Dependency array kosong agar hanya berjalan sekali saat mount

  useEffect(() => {
    fetch('/data/datumvertikal.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(json => {
        // Proses data: pastikan nilai datum dan koordinat adalah angka
        const processedFeatures = json.features.map(feature => {
          const properties = { ...feature.properties };
          // Daftar kunci properti yang seharusnya berupa angka
          const numericKeys = ['MSL', 'MHWS', 'MLWS', 'HAT', 'LAT', 'Latitude', 'Longitude', 'X', 'Y'];
          
          numericKeys.forEach(key => {
            // Periksa apakah properti ada dan bukan null/undefined sebelum konversi
            if (properties[key] !== undefined && properties[key] !== null) {
              // Coba parse string menjadi float
              const parsedValue = parseFloat(properties[key]);
              // Tetapkan nilai yang diparse jika itu angka valid, jika tidak biarkan null/undefined atau nilai asli
              properties[key] = isNaN(parsedValue) ? properties[key] : parsedValue; // Keep original if NaN, or you could set to null
            }
          });
          
          return { ...feature, properties };
        });
        
        setData({ ...json, features: processedFeatures });
      })
      .catch(err => setError(err.message));
  }, []); // Dependency array kosong agar hanya berjalan sekali saat mount

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (data && gridIdFromUrl) {
      setSelected(gridIdFromUrl);
    }
  }, [data, gridIdFromUrl]);

  // Handle grid purchase
  const handlePurchase = async (gridId) => {
    try {
      console.log('handlePurchase called');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Attempting to fetch URL:', `${import.meta.env.VITE_API_URL}/api/user/purchase/grid`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/purchase/grid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gridId: String(gridId) }) // Ensure gridId is string
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Purchase response data:', data);

      if (response.ok && data.success) {
        console.log('Purchase successful');
        // Dispatch purchase update event
        window.dispatchEvent(new Event('purchaseUpdate'));
        setShowPurchaseModal(false);
        Swal.fire({
          icon: 'success',
          title: 'Purchase Successful',
          text: "You now have access to this grid's data",
          confirmButtonColor: '#2563eb'
        });
        // No need to explicitly checkUserAccess here, the event listener will do it
        } else {
        console.log('Purchase failed:', data.error);
        Swal.fire({
          icon: 'error',
          title: 'Purchase Failed',
          text: data.error || 'Failed to purchase grid',
          confirmButtonColor: '#2563eb'
        });
      }
    } catch (error) {
      console.error('Error during purchase:', error);
      Swal.fire({
        icon: 'error',
        title: 'Purchase Failed',
        text: 'An error occurred while processing your purchase',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  // Handle subscription
  const handleSubscribe = async (planType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to subscribe');
      }

      const data = await response.json();
      if (data.success) {
        setShowSubscriptionModal(false);
        checkUserAccess();
        alert('Subscription successful!');
      }
    } catch (err) {
      console.error('Error subscribing:', err);
      alert(err.message || 'Failed to subscribe. Please try again.');
      }
    };

  // Tambahkan fungsi untuk menangani klik tombol Buy Access
  const handleBuyAccessClick = (e, gridId) => {
    e.stopPropagation();
    console.log('handleBuyAccessClick called for gridId:', gridId);
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('handleBuyAccessClick: No token found, redirecting to login');
      navigate('/login');
      return;
    }
    setSelected(gridId);
    console.log('handleBuyAccessClick: Selected grid for purchase:', gridId);
    setShowPurchaseModal(true);
  };

  const gridList = data ? data.features.map(f => f.properties) : [];
  const filteredGrids = gridList
    .filter(g => String(g.GRID_ID).includes(search))
    .sort((a, b) => Number(a.GRID_ID) - Number(b.GRID_ID));
  const selectedGrid = gridList.find(g => String(g.GRID_ID) === String(selected));

  // Check if a grid is purchased
  const isGridPurchased = (gridId) => {
    const purchased = purchasedGrids.includes(String(gridId));
    return purchased;
  };

  // Datum keys and descriptions
  const datumKeys = [
    { key: 'MHWS', desc: 'Mean High Water Spring' },
    { key: 'MLWS', desc: 'Mean Low Water Spring' },
    { key: 'MSL', desc: 'Mean Sea Level' },
    { key: 'HAT', desc: 'Highest Astronomical Tide' },
    { key: 'LAT', desc: 'Lowest Astronomical Tide' },
  ];

  // Prepare datum values for SVG
  const svgDatum = [
    { label: 'HAT', key: 'HAT' },
    { label: 'MHWS', key: 'MHWS' },
    { label: 'MLWS', key: 'MLWS' },
    { label: 'MSL', key: 'MSL' },
    { label: 'LAT', key: 'LAT' },
  ].map(d => ({
    ...d,
    val: selectedGrid ? Number(selectedGrid[d.key]) : null
  })).filter(d => d.val !== null && !isNaN(d.val));
  // Sort by value descending (untuk urutan visual)
  svgDatum.sort((a, b) => b.val - a.val);

  useEffect(() => {
    if (gridRefs.current[selected]) {
      gridRefs.current[selected].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selected, filteredGrids]);

  function RecenterMap({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
      map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 px-18">
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2 tracking-wide mt-20">DATUM DATA</h1>
            <div className="text-gray-500 font-semibold">GRID SELECTION</div>
          </div>
          {userAccess === 'free' && (
            <Link
              to="/subscription"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Subscribe for Full Access
            </Link>
          )}
                    </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kiri: List grid */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col" style={{height: '500px'}}>
            <input
              type="text"
              placeholder="Search grid..."
              className="mb-4 px-4 py-2 border rounded focus:outline-none focus:ring w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex-1 overflow-y-auto border rounded">
              {filteredGrids.map(g => (
                <div
                  key={g.GRID_ID}
                  ref={el => gridRefs.current[g.GRID_ID] = el}
                  className={`flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-blue-50 ${String(selected) === String(g.GRID_ID) ? 'bg-blue-100' : ''}`}
                  onClick={() => setSelected(g.GRID_ID)}
                >
                  <span className="font-medium">Grid {String(g.GRID_ID).padStart(3, '0')}</span>
                  <div className="flex items-center space-x-2">
                    {isGridPurchased(g.GRID_ID) ? (
                      <span className="text-xs text-green-600 font-medium">Access Available</span>
                    ) : (
                      <button
                        onClick={(e) => handleBuyAccessClick(e, g.GRID_ID)}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Buy Access
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Tengah: Info grid dan tabel datum */}
          <div className="bg-white rounded-lg shadow p-6">
            {selectedGrid ? (
              <>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Grid {String(selectedGrid.GRID_ID).padStart(3, '0')} Datum Data</h2>
                <div className="mb-2">
                  <span className="font-semibold">Coordinates:</span> {selectedGrid.Longitude && selectedGrid.Latitude ? 
                    `${selectedGrid.Longitude.toFixed(4)}°, ${selectedGrid.Latitude.toFixed(4)}°` : 
                    'N/A'}<br />
                  <span className="font-semibold">Area:</span> {Number(selectedGrid.GRID_ID) <= 94 ? 'OSES' : 'ONWJ'}<br />
                  <span className="font-semibold">Datums:</span> {svgDatum.length}
                    </div>
                {userAccess === 'subscription' || isGridPurchased(selectedGrid.GRID_ID) ? (
                  <>
                    <table className="w-full text-sm mt-4 rounded-sm overflow-hidden shadow">
                      <thead>
                        <tr className="bg-blue-600 text-white font-bold">
                          <th className="px-4 py-2 text-left">Value</th>
                          <th className="px-4 py-2 text-left">Datum</th>
                          <th className="px-4 py-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datumKeys.map((d, index) => (
                          <tr key={d.key} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} border-b border-gray-200 last:border-b-0`}>
                            <td className="px-4 py-2 text-gray-700 font-medium">{selectedGrid && selectedGrid[d.key] !== undefined && selectedGrid[d.key] !== null ? `${Number(selectedGrid[d.key]).toFixed(3)} m` : '-'}</td>
                            <td className="px-4 py-2 text-gray-700">{d.key}</td>
                            <td className="px-4 py-2 text-gray-700">{d.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <a
                      href={`/datum-data?gridId=${selectedGrid.GRID_ID}`}
                      className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Go to DatumData
                    </a>
                  </>
                ) : (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">Purchase access to view detailed datum data for this grid.</p>
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Buy Access ($99.99)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-12">Please select a grid first</div>
            )}
          </div>
          {/* Kanan: Map View */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-blue-900 mb-4">Map View</h2>
            <div className="h-[400px] w-full rounded-lg border-1 overflow-hidden">
              {data && selectedGrid ? (
                <MapContainer
                  center={[selectedGrid.Latitude, selectedGrid.Longitude]}
                  zoom={10}
                  style={{ width: '100%', height: '100%' }}
                >
                  <RecenterMap lat={selectedGrid.Latitude} lng={selectedGrid.Longitude} />
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <GeoJSON 
                    data={data}
                    style={feature => {
                      const isSelected = String(feature.properties.GRID_ID) === String(selectedGrid.GRID_ID);
                      return {
                        color: isSelected ? '#ef4444' : '#2563eb',
                        weight: isSelected ? 2 : 1,
                        fillOpacity: isSelected ? 0.4 : 0.1,
                        fillColor: isSelected ? '#ef4444' : '#2563eb',
                      };
                    }}
                  />
                  <Marker position={[selectedGrid.Latitude, selectedGrid.Longitude]}>
                    <Popup>
                      Grid {selectedGrid.GRID_ID}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="text-gray-400 text-center py-12">Please select a grid first</div>
              )}
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Purchase Grid Access</h3>
              <p className="mb-4">Get lifetime access to Grid {selectedGrid?.GRID_ID} data for $99.99</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(selectedGrid?.GRID_ID)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Purchase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Choose Subscription Plan</h3>
              <div className="space-y-4">
                <div className="border p-4 rounded">
                  <h4 className="font-bold">Monthly Plan</h4>
                  <p className="text-gray-600">$29.99/month</p>
                  <button
                    onClick={() => handleSubscribe('monthly')}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    Subscribe Monthly
                  </button>
                </div>
                <div className="border p-4 rounded">
                  <h4 className="font-bold">Yearly Plan</h4>
                  <p className="text-gray-600">$299.99/year (Save 17%)</p>
                  <button
                    onClick={() => handleSubscribe('yearly')}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    Subscribe Yearly
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="mt-4 text-gray-600 hover:text-gray-800 w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
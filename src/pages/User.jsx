import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function UserPage() {
  const [userData, setUserData] = useState(null);
  const [purchasedGrids, setPurchasedGrids] = useState([]);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    // Redirect to home page
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        // Fetch user access data
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/access`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Gagal mengambil data user');
        }
        const data = await res.json();
        console.log('User access data:', data); // Debug log

        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserData({
          name: userData.name,
          email: userData.email,
          access: data.access,
          purchasedGrids: data.purchasedGrids || []
        });
        setPurchasedGrids(data.purchasedGrids || []);

        // Fetch grid data
        console.log('Fetching grid data...'); // Debug log
        const gridResponse = await fetch('/data/datumvertikal.geojson');
        if (!gridResponse.ok) {
          throw new Error('Failed to fetch grid data');
        }
        const gridData = await gridResponse.json();
        console.log('Grid data fetched:', gridData); // Debug log
        setGridData(gridData);

        // Filter purchased grids
        const purchasedFeatures = gridData.features.filter(feature => 
          data.purchasedGrids.includes(String(feature.properties.GRID_ID))
        );
        console.log('Purchased features:', purchasedFeatures); // Debug log

      } catch (err) {
        console.error('Error fetching user data:', err);
        const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserData({
          name: storedUserData.name || 'User',
          email: storedUserData.email || 'user@example.com',
          access: 'free',
          purchasedGrids: []
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

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
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Filter grid data untuk hanya menampilkan yang dibeli
  const purchasedGridFeatures = gridData?.features.filter(feature => 
    purchasedGrids.includes(String(feature.properties.GRID_ID))
  ) || [];

  console.log('Current purchasedGrids:', purchasedGrids); // Debug log
  console.log('Filtered purchasedGridFeatures:', purchasedGridFeatures); // Debug log

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">User Profile</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Full Name</p>
                <p className="font-semibold">{userData?.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{userData?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Access Level</p>
                <p className="font-semibold capitalize">{userData?.access || 'Free'}</p>
              </div>
              <div>
                <p className="text-gray-600">Purchased Grids</p>
                <p className="font-semibold">{purchasedGrids.length} grids</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Subscription Status</h2>
          {userData?.access === 'subscription' ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-700 font-semibold">Active Subscription</p>
              <p className="text-green-600">You have full access to all grid data</p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-700 font-semibold">No Active Subscription</p>
              <p className="text-yellow-600 mb-4">Subscribe to get full access to all grid data</p>
              <button
                onClick={() => navigate('/subscription')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Subscription Plans
              </button>
            </div>
          )}
        </div>

        {/* Purchased Grids Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Purchased Grids</h2>
          {purchasedGrids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Grid List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Grid List</h3>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {purchasedGridFeatures.map(feature => (
                    <div
                      key={feature.properties.GRID_ID}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">Grid {feature.properties.GRID_ID}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">MSL:</span> {feature.properties.MSL || 'N/A'} m
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Coordinates:</span> {feature.properties.Longitude && feature.properties.Latitude ? 
                                `${feature.properties.Longitude.toFixed(4)}°, ${feature.properties.Latitude.toFixed(4)}°` : 
                                'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Area:</span> {Number(feature.properties.GRID_ID) <= 94 ? 'OSES' : 'ONWJ'}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/datum-data?gridId=${feature.properties.GRID_ID}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Data
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map View */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Map View</h3>
                <div className="h-[400px] rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[-5.5, 107]}
                    zoom={8.3}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <GeoJSON 
                      data={{
                        type: 'FeatureCollection',
                        features: purchasedGridFeatures
                      }}
                      style={() => ({
                        color: '#2563eb',
                        weight: 2,
                        fillOpacity: 0.4,
                        fillColor: '#2563eb'
                      })}
                      onEachFeature={(feature, layer) => {
                        layer.bindPopup(`
                          <div class="p-2">
                            <p class="font-bold">Grid ${feature.properties.GRID_ID}</p>
                            <p class="text-sm">MSL: ${feature.properties.MSL || 'N/A'} m</p>
                            <p class="text-sm">Coordinates: ${feature.properties.Longitude && feature.properties.Latitude ? 
                              `${feature.properties.Longitude.toFixed(4)}°, ${feature.properties.Latitude.toFixed(4)}°` : 
                              'N/A'}</p>
                            <p class="text-sm">Area: ${Number(feature.properties.GRID_ID) <= 94 ? 'OSES' : 'ONWJ'}</p>
                          </div>
                        `);
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't purchased any grids yet</p>
              <button
                onClick={() => navigate('/services/datum')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Browse Grids
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
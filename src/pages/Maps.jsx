import { MapContainer, TileLayer, GeoJSON, Popup, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';

export default function MapsPage() {
  const [gridData, setGridData] = useState(null);
  const [selectedGrid, setSelectedGrid] = useState(null);
  const [error, setError] = useState(null);
  const [purchasedGrids, setPurchasedGrids] = useState([]);
  const [searchCoordinates, setSearchCoordinates] = useState({ lat: '', lon: '' });
  const [searchMarker, setSearchMarker] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const mapRef = useRef(null);
  const gridLayersRef = useRef({});
  const token = localStorage.getItem('token');
  const [currentBasemap, setCurrentBasemap] = useState('osm');
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);

  // Custom red marker icon
  const redMarkerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Basemap options
  const basemaps = {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors, OSDATUM'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, OSDATUM'
    },
    terrain: {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap, OSDATUM'
    },
    dark: {
      name: 'Dark Mode',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB, OSDATUM'
    }
  };

  // Function to change basemap
  const changeBasemap = (basemapKey) => {
    setCurrentBasemap(basemapKey);
    setShowBasemapMenu(false);
  };

  // Fetch user access and purchased grids
  const fetchUserAccess = async () => {
    try {
      if (!token) {
        console.log('No token found, setting purchasedGrids to empty array');
        setPurchasedGrids([]);
        return;
      }

      console.log('Fetching user access with token:', token.substring(0, 10) + '...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/access`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user access');
      }

      const data = await response.json();
      console.log('Received data from /api/user/access:', data);
      
      if (data.purchasedGrids) {
        console.log('Setting purchasedGrids to:', data.purchasedGrids);
        setPurchasedGrids(data.purchasedGrids);
      } else {
        console.log('No purchasedGrids in response data');
        setPurchasedGrids([]);
      }
    } catch (err) {
      console.error('Error fetching user access:', err);
      setPurchasedGrids([]); // Default to empty array on error
    }
  };

  useEffect(() => {
    console.log('Maps component mounted/updated, current token:', token ? 'exists' : 'none');
    fetchUserAccess();
    
    // Add event listener for auth state changes
    const handleAuthChange = () => {
      console.log('Auth state changed, refreshing purchased grids');
      fetchUserAccess();
    };

    // Add event listener for purchase updates
    const handlePurchaseUpdate = () => {
      console.log('Purchase state changed, refreshing purchased grids');
      fetchUserAccess();
    };
    
    window.addEventListener('authStateChange', handleAuthChange);
    window.addEventListener('purchaseUpdate', handlePurchaseUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('authStateChange', handleAuthChange);
      window.removeEventListener('purchaseUpdate', handlePurchaseUpdate);
    };
  }, [token]); // Add token as dependency

  useEffect(() => {
    // Fetch GeoJSON data from public folder
    fetch('/data/datumvertikal.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!data.features || data.features.length === 0) {
          throw new Error('No features found in GeoJSON data');
        }
        setGridData(data);
      })
      .catch(error => {
        setError(error.message);
      });
  }, []);

  // Style untuk GeoJSON
  const geoJSONStyle = (feature) => {
    const isSelected = selectedGrid === feature.properties.GRID_ID;
    return {
      color: isSelected ? '#1d4ed8' : '#2563eb',
      weight: isSelected ? 2 : 1,
      fillOpacity: isSelected ? 0.4 : 0.1,
      fillColor: '#2563eb'
    };
  };

  // Count available datums
  const countAvailableDatums = (properties) => {
    const datums = ['MSL', 'MHWS', 'MLWS', 'HAT', 'LAT'];
    return datums.filter(datum => properties[datum] !== undefined && properties[datum] !== null).length;
  };

  // On each feature
  const onEachFeature = (feature, layer) => {
    const gridId = feature.properties.GRID_ID;
    gridLayersRef.current[gridId] = layer;
    
    const msl = feature.properties.MSL || 'N/A';
    const availableDatums = countAvailableDatums(feature.properties);
    const gridIdString = String(gridId); // Ensure grid ID is a string for comparison
    
    // Create popup content using the CURRENT state of purchasedGrids
    const createPopupContent = (isPurchased) => `
      <div class="p-4">
        <h3 class="font-bold mb-2">Grid Information</h3>
        <p class="mb-2 font-medium">Grid ID: ${gridId}</p>
        <div class="space-y-1">
          <p class="mb-1 font-medium">MSL: ${msl}</p>
          <p class="mb-1 font-medium">Available Datums: ${availableDatums}/5</p>
          ${isPurchased ? 
            `<p class="text-sm text-green-600 font-semibold">Access Available</p>` :
            token ?
            `<p class="text-sm text-blue-600 font-semibold">Click "View Datum Information" to purchase access</p>` :
            `<p class="text-sm text-gray-600 font-semibold">Login to purchase access</p>`
          }
        </div>
        <p class="mb-4 mt-2 font-medium">Click the button below to view detailed datum information</p>
        <button 
          onclick="window.location.href='/services/datum?gridId=${gridId}'"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          View Datum Information
        </button>
      </div>
    `;

    // Initial popup content
    const isPurchasedInitially = purchasedGrids.includes(gridIdString);
    layer.bindPopup(createPopupContent(isPurchasedInitially));

    // Add click event (re-calculates content on click)
    layer.on('click', () => {
      setSelectedGrid(gridId);
      // Re-calculate and set popup content with the latest purchasedGrids state
      const isPurchasedOnOpen = purchasedGrids.includes(gridIdString);
      layer.setPopupContent(createPopupContent(isPurchasedOnOpen));
      layer.openPopup();
    });

    // Add hover effects
    layer.on('mouseover', () => {
      if (selectedGrid !== gridId) {
        layer.setStyle({
          fillOpacity: 0.4,
          weight: 2,
          color: '#1d4ed8'
        });
      }
    });

    layer.on('mouseout', () => {
      if (selectedGrid !== gridId) {
        layer.setStyle({
          fillOpacity: 0.1,
          weight: 1,
          color: '#2563eb'
        });
      }
    });
  };

  // Function to check if coordinates are within any grid
  const findGridAtCoordinates = (lat, lon) => {
    if (!gridData) return null;
    
    const point = L.latLng(lat, lon);
    
    return gridData.features.find(feature => {
      // Get coordinates from the feature
      const coordinates = feature.geometry.coordinates[0][0];
      
      // Create a polygon from the coordinates
      const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
      const polygon = L.polygon(latLngs);
      
      // Check if point is inside polygon
      const bounds = polygon.getBounds();
      const isInside = bounds.contains(point);
      
      return isInside;
    });
  };

  // Handle coordinate search
  const handleCoordinateSearch = (e) => {
    e.preventDefault();
    setSearchError(null);

    const lat = parseFloat(searchCoordinates.lat);
    const lon = parseFloat(searchCoordinates.lon);

    if (isNaN(lat) || isNaN(lon)) {
      setSearchError('Please enter valid coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setSearchError('Coordinates out of valid range');
      return;
    }

    // Remove existing marker if any
    if (searchMarker) {
      mapRef.current.removeLayer(searchMarker);
    }

    // Create marker
    const marker = L.marker([lat, lon], { icon: redMarkerIcon }).addTo(mapRef.current);
    
    // Find grid at coordinates
    const grid = findGridAtCoordinates(lat, lon);
    
    let popupContent;
    if (!grid) {
      popupContent = `
        <div class="p-4">
          <h3 class="font-bold mb-2 text-red-600">No Data Available</h3>
          <p class="mb-2 font-medium">Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
          <div class="space-y-1">
            <p class="text-sm text-red-600 font-semibold">OSDATUM does not have data for this area</p>
          </div>
        </div>
      `;
    } else {
      // Create popup content for grid area
      const gridId = grid.properties.GRID_ID;
      const msl = grid.properties.MSL || 'N/A';
      const availableDatums = countAvailableDatums(grid.properties);
      const gridIdString = String(gridId);
      const isPurchased = purchasedGrids.includes(gridIdString);

      popupContent = `
        <div class="p-4">
          <h3 class="font-bold mb-2">Grid Information</h3>
          <p class="mb-2 font-medium">Grid ID: ${gridId}</p>
          <div class="space-y-1">
            <p class="mb-1 font-medium">MSL: ${msl}</p>
            <p class="mb-1 font-medium">Available Datums: ${availableDatums}/5</p>
            ${isPurchased ? 
              `<p class="text-sm text-green-600 font-semibold">Access Available</p>` :
              token ?
              `<p class="text-sm text-blue-600 font-semibold">Click "View Datum Information" to purchase access</p>` :
              `<p class="text-sm text-gray-600 font-semibold">Login to purchase access</p>`
            }
          </div>
          <p class="mb-4 mt-2 font-medium">Click the button below to view detailed datum information</p>
          <button 
            onclick="window.location.href='/services/datum?gridId=${gridId}'"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            View Datum Information
          </button>
        </div>
      `;
    }

    marker.bindPopup(popupContent).openPopup();
    setSearchMarker(marker);
    
    // Center map on the marker
    mapRef.current.setView([lat, lon], 10);
  };

  // Function to get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSearchCoordinates({ lat: latitude, lon: longitude });
        
        // Center map on user's location
        mapRef.current.setView([latitude, longitude], 12);
        
        // Create marker for user's location
        if (searchMarker) {
          mapRef.current.removeLayer(searchMarker);
        }
        const marker = L.marker([latitude, longitude], { icon: redMarkerIcon }).addTo(mapRef.current);
        
        // Find grid at coordinates
        const grid = findGridAtCoordinates(latitude, longitude);
        let popupContent;
        
        if (!grid) {
          popupContent = `
            <div class="p-4">
              <h3 class="font-bold mb-2 text-red-600">No Data Available</h3>
              <p class="mb-2 font-medium">Your Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
              <div class="space-y-1">
                <p class="text-sm text-red-600 font-semibold">OSDATUM does not have data for this area</p>
              </div>
            </div>
          `;
        } else {
          const gridId = grid.properties.GRID_ID;
          const msl = grid.properties.MSL || 'N/A';
          const availableDatums = countAvailableDatums(grid.properties);
          const gridIdString = String(gridId);
          const isPurchased = purchasedGrids.includes(gridIdString);
          
          popupContent = `
            <div class="p-4">
              <h3 class="font-bold mb-2">Grid Information</h3>
              <p class="mb-2 font-medium">Grid ID: ${gridId}</p>
              <div class="space-y-1">
                <p class="mb-1 font-medium">MSL: ${msl}</p>
                <p class="mb-1 font-medium">Available Datums: ${availableDatums}/5</p>
                ${isPurchased ? 
                  `<p class="text-sm text-green-600 font-semibold">Access Available</p>` :
                  token ?
                  `<p class="text-sm text-blue-600 font-semibold">Click "View Datum Information" to purchase access</p>` :
                  `<p class="text-sm text-gray-600 font-semibold">Login to purchase access</p>`
                }
              </div>
              <p class="mb-4 mt-2 font-medium">Click the button below to view detailed datum information</p>
              <button 
                onclick="window.location.href='/services/datum?gridId=${gridId}'"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                View Datum Information
              </button>
            </div>
          `;
        }
        
        marker.bindPopup(popupContent).openPopup();
        setSearchMarker(marker);
      },
      () => {
        setSearchError('Unable to retrieve your location');
      }
    );
  };

  return (
    <div className="w-full h-screen pt-20 z-0">
      {/* Search Form */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 p-4 rounded-lg shadow-lg backdrop-blur-sm">
        <form onSubmit={handleCoordinateSearch} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={searchCoordinates.lat}
              onChange={(e) => setSearchCoordinates(prev => ({ ...prev, lat: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter latitude"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={searchCoordinates.lon}
              onChange={(e) => setSearchCoordinates(prev => ({ ...prev, lon: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter longitude"
            />
          </div>
          <button
            type="button"
            onClick={getUserLocation}
            className="bg-green-500 text-white px-2 py-2.5 rounded-md hover:bg-green-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            title="Get my location"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Search
          </button>
        </form>
        {searchError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
            {searchError}
          </div>
        )}
      </div>

      {/* Basemap Switcher */}
      <div className="absolute top-24 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className="bg-white/90 p-2 rounded-lg shadow-lg backdrop-blur-sm hover:bg-white transition-all duration-200"
            title="Change basemap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
          
          {showBasemapMenu && (
            <div className="absolute top-12 right-0 bg-white/90 rounded-lg shadow-lg backdrop-blur-sm p-2 min-w-[200px]">
              {Object.entries(basemaps).map(([key, basemap]) => (
                <button
                  key={key}
                  onClick={() => changeBasemap(key)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    currentBasemap === key 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {basemap.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-0 right-0 bg-red-500 text-white p-4 z-50">
          Error loading map data: {error}
        </div>
      )}
      <MapContainer
        center={[-5.5, 107]}
        zoom={8.3}
        style={{ width: '100%', height: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution={basemaps[currentBasemap].attribution}
          url={basemaps[currentBasemap].url}
        />
        {/* GeoJSON Grid */}
        {gridData && (
          <GeoJSON 
            key={purchasedGrids.length}
            data={gridData}
            style={geoJSONStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axiosInstance from '../config/axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to control map view
const MapController = ({ center, zoom, selectedRegion }) => {
    const map = useMap();
    
    useEffect(() => {
        if (center && zoom) {
            map.setView(center, zoom);
        }
    }, [map, center, zoom]);
    
    // Open popup for selected region
    useEffect(() => {
        if (selectedRegion && map) {
            // Find all markers and open popup for the selected region
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker) {
                    const marker = layer;
                    const markerPosition = marker.getLatLng();
                    if (markerPosition.lat === selectedRegion.latitude && 
                        markerPosition.lng === selectedRegion.longitude) {
                        setTimeout(() => {
                            marker.openPopup();
                        }, 300);
                    }
                }
            });
        }
    }, [map, selectedRegion]);
    
    return null;
};

const PotentialMapPage = () => {
    const [user, setUser] = useState(null);
    const [regions, setRegions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [mapCenter, setMapCenter] = useState([16.0, 108.0]);
    const [mapZoom, setMapZoom] = useState(6);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const companyToken = localStorage.getItem('company_token');
            
            if (!token && !companyToken) {
                window.location.href = '/login';
                return;
            }

            const userData = localStorage.getItem('user_data');
            const companyData = localStorage.getItem('company_data');
            
            if (userData) {
                setUser(JSON.parse(userData));
            } else if (companyData) {
                const companyUser = {
                    ...JSON.parse(companyData),
                    role: 'company',
                    full_name: JSON.parse(companyData).organization_name
                };
                setUser(companyUser);
            }

            await loadRegions();
            setLoading(false);
        };

        checkAuth();
    }, []);

    const loadRegions = async () => {
        try {
            const response = await axiosInstance.get('/regions', {
                params: {
                    limit: 1000 // Load many regions for the map
                }
            });
            setRegions(response.regions);
            
            // Set map center to the region with highest vegetation coverage
            if (response.regions && response.regions.length > 0) {
                const highestVegetationRegion = response.regions.reduce((prev, current) => 
                    (prev.vegetation_coverage > current.vegetation_coverage) ? prev : current
                );
                setMapCenter([highestVegetationRegion.latitude, highestVegetationRegion.longitude]);
                setMapZoom(8); // Zoom in a bit more
                setSelectedRegion(highestVegetationRegion);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
        }
    };



    const filteredRegions = regions.filter(region => 
        region.region_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRegionColor = (vegetationCoverage) => {
        if (vegetationCoverage >= 0.8) return '#10B981'; // Green
        if (vegetationCoverage >= 0.6) return '#F59E0B'; // Yellow  
        if (vegetationCoverage >= 0.4) return '#EF4444'; // Red
        return '#6B7280'; // Gray
    };

    // Create custom markers based on vegetation coverage
    const createCustomIcon = (vegetationCoverage) => {
        const color = getRegionColor(vegetationCoverage);
        return L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    // Function to handle clicking on a region in the list or on the map
    const handleRegionClick = (region) => {
        setSelectedRegion(region);
        setMapCenter([region.latitude, region.longitude]);
        setMapZoom(8); // Zoom in closer when clicking on a specific region
    };

    // Function to handle marker click on the map
    const handleMarkerClick = (region) => {
        handleRegionClick(region); // Use the same logic for centering and selecting
    };

    // Function to reset map to overview of Vietnam
    const handleResetView = () => {
        setMapCenter([16.0, 108.0]); // Center of Vietnam
        setMapZoom(10); // Overview zoom
        setSelectedRegion(null); // Clear selection
    };

    if (loading) {
        return (
            <Layout user={user}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={user}>
            <div className="space-y-6" style={{
                background: 'radial-gradient(ellipse 800px 600px at center, rgba(0, 0, 0, 0.02) 0%, transparent 50%)',
                position: 'relative'
            }}>
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Bản đồ tiềm năng</h1>
                        <p className="text-gray-600 mt-1">Khám phá các vùng đất có tiềm năng cao cho nông nghiệp carbon</p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm vùng..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-2 border-green-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Chú thích độ phủ thực vật</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-green-500"></div>
                            <span className="text-sm text-gray-700">Cao (≥80%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                            <span className="text-sm text-gray-700">Trung bình (60-80%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-700">Thấp (40-60%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                            <span className="text-sm text-gray-700">Rất thấp (&lt;40%)</span>
                        </div>
                    </div>
                </div>

                {/* Main Map - Full Width */}
                <div className="bg-white rounded-xl p-6 mb-6" style={{
                    boxShadow: '0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 20px 40px -8px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.08), 0 0 40px rgba(0, 0, 0, 0.06)'
                }}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Bản đồ các vùng tiềm năng</h3>
                            {selectedRegion && (
                                <p className="text-sm text-blue-600 mt-1">
                                    📍 Đang xem: <span className="font-medium">{selectedRegion.region_name}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleResetView}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Reset View</span>
                        </button>
                    </div>
                    
                    {/* Real Leaflet Map - Much Larger */}
                    <div className="h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 shadow-2xl" style={{ 
                        boxShadow: '0 50px 100px -20px rgba(0, 0, 0, 0.35), 0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 15px 30px -8px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(0, 0, 0, 0.05)' 
                    }}>
                        <MapContainer
                            center={[16.0, 108.0]} // Initial center
                            zoom={6} // Initial zoom
                            style={{ 
                                height: '100%', 
                                width: '100%', 
                                borderRadius: '8px', 
                                boxShadow: 'inset 0 8px 16px rgba(0, 0, 0, 0.2), inset 0 4px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.08), 0 0 20px rgba(0, 0, 0, 0.1)'
                            }}
                            className="z-0"
                        >
                            <MapController 
                                center={mapCenter} 
                                zoom={mapZoom} 
                                selectedRegion={selectedRegion}
                            />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            {/* Region Markers */}
                            {filteredRegions.map((region) => (
                                <Marker
                                    key={region.id}
                                    position={[region.latitude, region.longitude]}
                                    icon={createCustomIcon(region.vegetation_coverage)}
                                    eventHandlers={{
                                        click: () => handleMarkerClick(region),
                                    }}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="font-semibold text-gray-800 mb-2">{region.region_name}</h4>
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <p><span className="font-medium">ID:</span> {region.region_id}</p>
                                                <p><span className="font-medium">CHM:</span> {formatNumber(region.chm_m)} m</p>
                                                <p><span className="font-medium">Độ phủ thực vật:</span> {formatNumber(region.vegetation_coverage * 100)}%</p>
                                                <p><span className="font-medium">Diện tích:</span> {formatNumber(region.area_ha)} ha</p>
                                                <p><span className="font-medium">Polygon:</span> {region.polygon_points} điểm</p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Bottom Panels - Stats and Region List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Statistics Panel */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Thống kê tổng quan</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{regions.length}</div>
                                <div className="text-sm text-gray-600">Tổng số vùng</div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {formatNumber(regions.reduce((acc, r) => acc + r.chm_m, 0) / regions.length)}m
                                </div>
                                <div className="text-sm text-gray-600">CHM trung bình</div>
                            </div>
                            
                            <div className="bg-yellow-50 rounded-lg p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {formatNumber(regions.reduce((acc, r) => acc + r.vegetation_coverage, 0) / regions.length * 100)}%
                                </div>
                                <div className="text-sm text-gray-600">Độ phủ trung bình</div>
                            </div>
                        </div>
                    </div>

                    {/* Region List Panel */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Danh sách vùng tiềm năng cao</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            {filteredRegions
                                .sort((a, b) => b.vegetation_coverage - a.vegetation_coverage)
                                .slice(0, 10)
                                .map((region) => (
                                    <div
                                        key={region.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                            selectedRegion?.id === region.id 
                                                ? 'bg-blue-50 border-blue-300 shadow-md' 
                                                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleRegionClick(region)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className={`font-medium text-sm ${
                                                    selectedRegion?.id === region.id ? 'text-blue-800' : 'text-gray-800'
                                                }`}>
                                                    {region.region_name}
                                                </p>
                                                <p className="text-xs text-gray-500">ID: {region.region_id}</p>
                                                {selectedRegion?.id === region.id && (
                                                    <p className="text-xs text-blue-600 mt-1">📍 Đang xem trên bản đồ</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div 
                                                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                    style={{ backgroundColor: getRegionColor(region.vegetation_coverage) }}
                                                ></div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {formatNumber(region.vegetation_coverage * 100)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PotentialMapPage;

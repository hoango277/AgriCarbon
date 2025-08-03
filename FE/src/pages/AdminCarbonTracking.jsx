import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userAPI, carbonAPI } from '../services/api';
import Layout from '../components/Layout';

const AdminCarbonTracking = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmerId, setSelectedFarmerId] = useState('');
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [areas, setAreas] = useState([]);
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedArea, setSelectedArea] = useState(null);
    const [carbonData, setCarbonData] = useState(null);
    const [error, setError] = useState('');
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [loadingCarbon, setLoadingCarbon] = useState(false);

    useEffect(() => {
        checkAuthAndLoadData();
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'admin') {
                navigate('/');
                return;
            }
            setUser(userInfo);
            
            // Load farmers list
            const farmersData = await carbonAPI.getAllFarmers();
            setFarmers(farmersData);
            
            setLoading(false);
        } catch (error) {
            console.error('Auth error:', error);
            navigate('/login');
        }
    };

    const handleFarmerChange = async (farmerId) => {
        if (!farmerId) {
            setSelectedFarmerId('');
            setSelectedFarmer(null);
            setAreas([]);
            setSelectedAreaId('');
            setSelectedArea(null);
            setCarbonData(null);
            return;
        }

        setSelectedFarmerId(farmerId);
        setSelectedAreaId('');
        setSelectedArea(null);
        setCarbonData(null);
        setError('');
        setLoadingAreas(true);
        
        try {
            // Find selected farmer info
            const farmer = farmers.find(f => f.id === parseInt(farmerId));
            setSelectedFarmer(farmer);

            // Load farmer's areas
            const areasData = await carbonAPI.getAdminFarmerAreas(farmerId);
            setAreas(areasData);
        } catch (err) {
            setError('Không thể tải danh sách vùng đất của nông dân này: ' + (err.response?.data?.detail || err.message));
            setAreas([]);
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleAreaChange = async (areaId) => {
        if (!areaId) {
            setSelectedAreaId('');
            setSelectedArea(null);
            setCarbonData(null);
            return;
        }

        setSelectedAreaId(areaId);
        setError('');
        setLoadingCarbon(true);
        
        try {
            // Find selected area info
            const area = areas.find(a => a.id === parseInt(areaId));
            setSelectedArea(area);

            // Load carbon data for the selected area
            const data = await carbonAPI.getAreaCarbonSummary(areaId);
            setCarbonData(data);
        } catch (err) {
            setError('Không thể tải dữ liệu carbon cho vùng đất này: ' + (err.response?.data?.detail || err.message));
            setCarbonData(null);
        } finally {
            setLoadingCarbon(false);
        }
    };

    const formatTooltipValue = (value, name) => {
        if (name === 'carbon_credits') {
            return [`${value.toFixed(2)} tấn CO₂`, 'Tín chỉ Carbon'];
        }
        return [value, name];
    };

    const formatXAxisLabel = (tickItem) => {
        // Shorten week labels for mobile
        return tickItem.replace('Tuần ', 'T');
    };

    if (loading) {
        return (
            <Layout user={user}>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={user}>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Theo dõi Carbon Nông dân
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Xem dữ liệu carbon tracking của tất cả nông dân trong hệ thống
                </p>
            </div>

            {/* Farmer Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Chọn Nông dân
                </h2>
                
                {farmers.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p className="text-gray-500">Chưa có nông dân nào trong hệ thống</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select
                            value={selectedFarmerId}
                            onChange={(e) => handleFarmerChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loadingAreas}
                        >
                            <option value="">-- Chọn nông dân --</option>
                            {farmers.map((farmer) => (
                                <option key={farmer.id} value={farmer.id}>
                                    {farmer.full_name} - {farmer.phone_number}
                                </option>
                            ))}
                        </select>

                        {selectedFarmer && (
                            <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 p-6 rounded-2xl shadow-lg">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Thông tin Nông dân</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Họ tên:</span> {selectedFarmer.full_name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Số điện thoại:</span> {selectedFarmer.phone_number}
                                    </div>
                                    <div>
                                        <span className="font-medium">Số CCCD:</span> {selectedFarmer.cccd}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày sinh:</span> {selectedFarmer.birth_date ? new Date(selectedFarmer.birth_date).toLocaleDateString('vi-VN') : 'N/A'}
                                    </div>
                                    <div>
                                        <span className="font-medium">Giới tính:</span> {selectedFarmer.gender}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ngày đăng ký:</span> {selectedFarmer.created_at ? new Date(selectedFarmer.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <span className="font-medium">Địa chỉ hiện tại:</span> {selectedFarmer.current_address}
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <span className="font-medium">Quê quán:</span> {selectedFarmer.hometown}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Area Selection */}
            {selectedFarmerId && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6 mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                        Chọn Vùng Đất
                    </h2>
                    
                    {loadingAreas ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    ) : areas.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-gray-500">Nông dân này chưa có vùng đất nào được duyệt</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <select
                                value={selectedAreaId}
                                onChange={(e) => handleAreaChange(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                disabled={loadingCarbon}
                            >
                                <option value="">-- Chọn vùng đất --</option>
                                {areas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.area_name} ({area.area_size} ha) - {area.crop_type}
                                    </option>
                                ))}
                            </select>

                            {selectedArea && (
                                <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 p-6 rounded-2xl shadow-lg">
                                    <h3 className="text-lg font-semibold text-green-900 mb-3">Thông tin Vùng đất</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Tên vùng:</span> {selectedArea.area_name}
                                        </div>
                                        <div>
                                            <span className="font-medium">Diện tích:</span> {selectedArea.area_size} ha
                                        </div>
                                        <div>
                                            <span className="font-medium">Loại cây trồng:</span> {selectedArea.crop_type}
                                        </div>
                                        <div>
                                            <span className="font-medium">Số năm trồng:</span> {selectedArea.planting_years} năm
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Loading Carbon Data */}
            {loadingCarbon && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-6">
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mr-3"></div>
                        <span className="text-gray-600">Đang tải dữ liệu carbon...</span>
                    </div>
                </div>
            )}

            {/* Carbon Data Display */}
            {carbonData && !loadingCarbon && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tổng Carbon</p>
                                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                        {carbonData.total_carbon_credits.toFixed(2)} tấn
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Trung bình/tuần</p>
                                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                        {carbonData.average_weekly_credits.toFixed(2)} tấn
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Số tuần</p>
                                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                        {carbonData.total_weeks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Đo lần cuối</p>
                                    <p className="text-lg sm:text-xl font-semibold text-gray-900">
                                        {carbonData.latest_measurement 
                                            ? new Date(carbonData.latest_measurement).toLocaleDateString('vi-VN')
                                            : 'Chưa có'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                            Biểu đồ Tín chỉ Carbon theo Tuần
                        </h3>
                        
                        {carbonData.weekly_data && carbonData.weekly_data.length > 0 ? (
                            <div className="h-80 sm:h-96">
                               <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={carbonData.weekly_data}
                                        margin={{
                                            top: 5,
                                            right: 5,
                                            left: 5,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="week_label" 
                                            tick={{ fontSize: 12 }}
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                            tickFormatter={formatXAxisLabel}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12 }}
                                            label={{ 
                                                value: 'Tín chỉ Carbon (tấn CO₂)', 
                                                angle: -90, 
                                                position: 'insideLeft',
                                                offset: 10,
                                                style: { textAnchor: 'middle' },
                                                dx: 2
                                            }}
                                        />
                                        <Tooltip 
                                            formatter={formatTooltipValue}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{ 
                                                backgroundColor: '#f9fafb', 
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="carbon_credits" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: '#059669' }}
                                            name="Tín chỉ Carbon"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Chưa có dữ liệu carbon cho vùng đất này
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminCarbonTracking;
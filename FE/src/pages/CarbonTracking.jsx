import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { userAPI, carbonAPI } from '../services/api';
import Layout from '../components/Layout';

const CarbonTracking = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [areas, setAreas] = useState([]);
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [selectedArea, setSelectedArea] = useState(null);
    const [carbonData, setCarbonData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuthAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkAuthAndLoadData = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            if (userInfo.role !== 'farmer') {
                navigate('/');
                return;
            }
            setUser(userInfo);
            
            // Load farmer's approved areas
            const areasData = await carbonAPI.getFarmerAreas();
            setAreas(areasData);
            
            setLoading(false);
        } catch {
            navigate('/login');
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
        
        try {
            // Find selected area info
            const area = areas.find(a => a.id === parseInt(areaId));
            setSelectedArea(area);

            // Load carbon data for the selected area
            const data = await carbonAPI.getAreaCarbonSummary(areaId);
            setCarbonData(data);
        } catch (err) {
            setError('Không thể tải dữ liệu carbon cho vùng đất này: ' + err.response?.data?.detail);
            setCarbonData(null);
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
            <div className="max-w-6xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Theo dõi Tín chỉ Carbon
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                    Theo dõi lượng carbon được hấp thụ theo tuần của các vùng đất đã được duyệt
                </p>
            </div>

            {/* Area Selection */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Chọn Vùng Đất
                </h2>
                
                {areas.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chưa có vùng đất nào được duyệt
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Bạn cần có ít nhất một khai báo đã được admin duyệt để có thể theo dõi carbon.
                        </p>
                        <button
                            onClick={() => navigate('/crop-declaration')}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                        >
                            Tạo Khai Báo Mới
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <select
                            value={selectedAreaId}
                            onChange={(e) => handleAreaChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                <h3 className="font-semibold text-gray-900 mb-2">Thông tin vùng đất</h3>
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

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Carbon Data Display */}
            {carbonData && (
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
                        
                        {carbonData.weekly_data.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-500 mb-4">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có dữ liệu carbon
                                </h4>
                                <p className="text-gray-600">
                                    Dữ liệu carbon sẽ được cập nhật tự động bằng AI theo tuần.
                                </p>
                            </div>
                        ) : (
                            <div className="h-64 sm:h-80">
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
                        )}
                    </div>
                </div>
            )}
            </div>
        </Layout>
    );
};

export default CarbonTracking;
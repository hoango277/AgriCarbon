import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import Layout from '../components/Layout';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userInfo = await userAPI.getProfile();
            setUser(userInfo);
        } catch (error) {
            setError('Không thể tải thông tin người dùng');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <Layout user={user}>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout user={user}>
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={user}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
                    <p className="text-gray-600 mt-1">Xem và quản lý thông tin tài khoản của bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                            <div className="text-center">
                                {/* Avatar */}
                                <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-white text-2xl font-bold">
                                        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">{user?.full_name}</h2>
                                <p className="text-gray-600">{user?.phone_number}</p>
                                <p className="text-sm text-gray-500 mt-1">Tài khoản nông dân</p>
                                
                                {/* Action Button */}
                                <div className="mt-6">
                                    <Link
                                        to="/change-password"
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Đổi mật khẩu
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Information Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Chi tiết thông tin</h3>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Thông tin cá nhân</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.full_name || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {formatDate(user?.birth_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.gender || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Thông tin liên hệ</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.phone_number || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Số CCCD</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.cccd || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Information */}
                                    <div className="md:col-span-2">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Thông tin địa chỉ</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Quê quán</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.hometown || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nơi thường trú</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.current_address || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CCCD Information */}
                                    <div className="md:col-span-2">
                                        <h4 className="text-md font-semibold text-gray-900 mb-4">Thông tin CCCD</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Ngày cấp</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {formatDate(user?.issue_date)}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nơi cấp</label>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                                                    {user?.issue_place || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile; 
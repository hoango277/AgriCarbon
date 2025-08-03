import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children, user }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        // Load initial state from localStorage
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        // Save to localStorage
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Close mobile menu when navigating
    const handleMobileNavClick = () => {
        setMobileMenuOpen(false);
    };

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Trang chủ';
            case '/profile':
                return 'Thông tin cá nhân';
            case '/change-password':
                return 'Đổi mật khẩu';
            case '/crop-declaration':
                return 'Khai báo';
            case '/history':
                return 'Lịch sử';
            case '/carbon-tracking':
                return 'Theo dõi Carbon';
            case '/admin':
                return 'Admin Dashboard';
            case '/admin/carbon-tracking':
                return 'Theo dõi Carbon Nông dân';
            default:
                return 'Dashboard';
        }
    };

    const getMenuItems = () => {
        if (user?.role === 'admin') {
            return [
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    ),
                    label: 'Quản lý khai báo',
                    path: '/admin'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    ),
                    label: 'Theo dõi Carbon Nông dân',
                    path: '/admin/carbon-tracking'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ),
                    label: 'Thông tin cá nhân',
                    path: '/profile'
                }
            ];
        } else {
            return [
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    ),
                    label: 'Trang chủ',
                    path: '/'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    ),
                    label: 'Khai báo',
                    path: '/crop-declaration'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    label: 'Lịch sử',
                    path: '/history'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    ),
                    label: 'Theo dõi Carbon',
                    path: '/carbon-tracking'
                },
                {
                    icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ),
                    label: 'Thông tin cá nhân',
                    path: '/profile'
                }
            ];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header - Full Width */}
            <header className="bg-white shadow-lg border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 rounded-b-lg">
                <div className="flex items-center space-x-4 lg:space-x-6">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
                        <img 
                            src="/logo.jpg" 
                            alt="AgriCarbon" 
                            className="w-24 h-12 rounded-lg shadow-md mr-3 object-cover"
                        />
                    </Link>
                    
                    {/* Divider - Hidden on mobile */}
                    <div className="hidden lg:block h-6 w-px bg-gray-300"></div>
                    
                    {/* Page Title - Hidden on mobile */}
                    <h2 className="hidden lg:block text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
                </div>

                {/* User Menu */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                        {/* Avatar */}
                        <div className="w-8 h-8 bg-amber-600 rounded-full shadow-md flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        {/* User Info - Hidden on mobile */}
                        <div className="hidden lg:block text-left">
                            <p className="text-sm font-medium text-gray-700">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.phone_number}</p>
                        </div>
                        {/* Dropdown Arrow */}
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                                            {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-[60]">
                            <Link
                                to="/profile"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Thông tin cá nhân
                            </Link>
                            <Link
                                to="/change-password"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Đổi mật khẩu
                            </Link>
                            <hr className="my-1" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Content Area with Sidebar */}
            <div className="flex flex-1 relative">
                {/* Desktop Sidebar */}
                <div className={`hidden lg:flex bg-green-700 shadow-xl transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-col rounded-tr-2xl`}>
                    {/* Menu Items */}
                    <nav className="flex-1 pt-6 pb-4">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 mx-2 rounded-xl transition-colors duration-200 ${
                                        isActive 
                                            ? 'bg-white text-green-800 shadow-md font-medium' 
                                            : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <span className="ml-3 text-sm font-medium">{item.label}</span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Toggle Button */}
                    <div className="p-4">
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center p-2 text-green-100 hover:text-white hover:bg-green-600 rounded-xl transition-colors duration-200"
                        >
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            {!sidebarCollapsed && <span className="ml-2 text-sm">Thu gọn</span>}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar */}
                <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-green-700 shadow-xl transform transition-transform duration-300 flex flex-col rounded-tr-2xl ${
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-green-600">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center mr-3">
                                <span className="text-green-700 font-bold text-sm">A</span>
                            </div>
                            <h1 className="text-lg font-bold text-white">Menu</h1>
                        </div>
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-green-100 hover:text-white hover:bg-green-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 pt-6 pb-4">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={handleMobileNavClick}
                                                                className={`flex items-center px-4 py-3 mx-2 rounded-xl transition-colors duration-200 ${
                                isActive 
                                    ? 'bg-white text-green-800 shadow-md font-medium' 
                                    : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
                            }`}
                                >
                                    <div className="flex-shrink-0">
                                        {item.icon}
                                    </div>
                                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="border-t border-green-600 p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-amber-600 rounded-full shadow-md flex items-center justify-center mr-3">
                                <span className="text-white text-sm font-medium">
                                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">{user?.full_name || 'User'}</p>
                                <p className="text-xs text-green-200">{user?.phone_number}</p>
                            </div>
                        </div>
                        
                        <Link
                            to="/profile"
                            onClick={handleMobileNavClick}
                            className="flex items-center w-full px-3 py-2 text-sm text-green-100 hover:bg-green-600 hover:text-white rounded-xl mb-2"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Thông tin cá nhân
                        </Link>
                        
                        <Link
                            to="/change-password"
                            onClick={handleMobileNavClick}
                            className="flex items-center w-full px-3 py-2 text-sm text-green-100 hover:bg-green-600 hover:text-white rounded-xl mb-2"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Đổi mật khẩu
                        </Link>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm text-red-300 hover:bg-red-600 hover:text-white rounded-xl"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Đăng xuất
                        </button>
                    </div>
                </div>

                {/* Mobile Backdrop */}
                {mobileMenuOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={toggleMobileMenu}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-6">
                    {/* Mobile Page Title */}
                    <div className="lg:hidden mb-6">
                        <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 min-h-full">
                        {children}
                    </div>
                </main>
            </div>


        </div>
    );
};

export default Layout; 
import React, { useState, useEffect } from 'react';
import { Search, User, X, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const AdminHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setAdminName(user.name || 'Admin User');
        setAdminEmail(user.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    
    // Redirect to login page
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (adminName) {
      return adminName.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* Center Section - Logo for Mobile */}
            <div className="lg:hidden absolute left-1/2 transform -translate-x-1/2">
              <div className="w-14 h-10 rounded-md overflow-hidden border-2 border-gray-500">
                <img 
                  src={logo} 
                  alt="ShopCart Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Mobile Search Bar */}
            {searchOpen && (
              <div className="lg:hidden fixed top-0 left-0 right-0 bg-white px-4 py-3 border-b border-gray-200 z-50">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}

            {/* Right Section - User Profile with Dropdown */}
            <div className="flex items-center gap-3 relative">
              <button
                onClick={toggleUserDropdown}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {getUserInitials()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="font-medium text-sm lg:text-base flex items-center gap-1">
                      {adminName}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`} />
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {adminEmail || 'Administrator'}
                    </p>
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{adminName}</p>
                      <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
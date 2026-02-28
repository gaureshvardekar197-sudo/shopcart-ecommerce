import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  LogOut,
  Home,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Plus,
  Eye,
  Star
} from 'lucide-react';
import { adminMenu } from '../utils/constants';
import logo from '../../assets/logo.jpg';
import api from '../API/axios';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getIcon = (iconName) => {
    const icons = {
      LayoutDashboard: LayoutDashboard,
      Package: Package,
      Layers: Layers,
      ShoppingCart: ShoppingCart,
      Users: Users,
      Plus: Plus,
      Eye: Eye,
      Star: Star
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };
    // ✅ Logout with API
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('isLoggedIn');
  //   localStorage.removeItem('isAdmin');
  //   localStorage.removeItem('userEmail');
  //   navigate('/login');
  // };

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const isSubItemActive = (subItems) => {
    return subItems?.some(item => location.pathname === item.path) || false;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button - Only visible on mobile (< 1024px) */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* SIDEBAR - EXACT SAME AS YOUR DESKTOP CODE, only mobile visibility added */}
      <div className={`
        bg-white text-gray-800 h-screen flex flex-col fixed left-0 top-0 z-50 
        transition-all duration-300 border-r border-gray-200 
        ${collapsed ? 'w-20' : 'w-[272px]'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Mobile Close Button - Only visible on mobile */}
        <button
          onClick={closeMobileMenu}
          className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Logo Section - EXACT SAME AS YOUR CODE */}
        <div className="flex justify-center items-center py-1 border-b border-gray-200">
          <div className={`${collapsed ? 'w-16 h-16' : 'w-22 h-22'} rounded-xl flex items-center justify-center`}>
            <img 
              src={logo} 
              alt="Admin Logo" 
              className="w-[100px] h-full object-contain" 
            />
          </div>
        </div>

        {/* Scrollable Navigation Menu - EXACT SAME AS YOUR CODE */}
        <div className="flex-1  py-4">
          <nav className="px-4 space-y-1">
            {adminMenu.map((item) => (
              <div key={item.id}>
                {item.type === 'dropdown' ? (
                  <div className="mb-1">
                    <button
                      onClick={() => toggleDropdown(item.id)}
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-all duration-200 ${
                        openDropdown === item.id || isSubItemActive(item.subItems)
                          ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          openDropdown === item.id || isSubItemActive(item.subItems)
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {getIcon(item.icon)}
                        </div>
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </div>
                      {!collapsed && item.subItems && (
                        <span>
                          {openDropdown === item.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </span>
                      )}
                    </button>
                    
                    {/* Dropdown Items - ONLY ICONS ADDED, NO UI CHANGES */}
                    {openDropdown === item.id && !collapsed && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.id}
                            to={subItem.path}
                            onClick={closeMobileMenu}
                            className={({ isActive }) =>
                              `flex items-center gap-1 p-3 pl-6 rounded-lg transition-all duration-200 ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                {/* ONLY THIS LINE CHANGED - Added getIcon call */}
                                <div className={`p-1 rounded ${
                                  isActive ? 'text-white' : 'text-gray-400'
                                }`}>
                                  {getIcon(subItem.icon)}
                                </div>
                                <span>{subItem.title}</span>
                              </>
                            )}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }`
                    }
                  >
                    <div className={`p-2 rounded-lg ${
                      location.pathname === item.path
                        ? 'bg-white text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {getIcon(item.icon)}
                    </div>
                    {!collapsed && <span className="font-medium">{item.title}</span>}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Fixed Bottom Actions - EXACT SAME AS YOUR CODE */}
        <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
          <button 
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-200 w-full group"
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-red-100 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay - Only on mobile */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};

export default AdminSidebar;
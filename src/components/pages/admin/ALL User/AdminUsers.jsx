import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  Calendar,
  Search,
  User,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Package,
  TrendingUp,
  DollarSign,
  ChevronDown,
  Filter
} from 'lucide-react';
import { getUsers } from '../../../API/api-allUsers';
import Swal from 'sweetalert2';
import Pagination from "../../../Common/Pagination";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function for case-insensitive search
  const matchesSearch = (text, searchLower) => {
    if (!text) return false;
    return text.toString().toLowerCase().includes(searchLower);
  };

  // Format role for display
  const formatRole = (role) => {
    if (role === undefined || role === null) return 'user';
    
    if (role === 1 || role === "1" || role === "admin") {
      return 'admin';
    }
    
    if (role === 0 || role === "0" || role === "user") {
      return 'user';
    }
    
    return role.toString().toLowerCase();
  };

  // Check if user is admin
  const isAdmin = (role) => {
    const formattedRole = formatRole(role);
    return formattedRole === 'admin';
  };

  // Check if user is regular user
  const isUser = (role) => {
    const formattedRole = formatRole(role);
    return formattedRole === 'user';
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      
      let usersData = [];
      if (response && Array.isArray(response)) {
        usersData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      console.log('Users data:', usersData.map(u => ({ name: u.name, role: u.role, type: typeof u.role })));
      
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load',
        text: 'Could not load users. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply search filter only
  useEffect(() => {
    if (!users || users.length === 0) {
      setFilteredUsers([]);
      return;
    }

    let result = [...users];

    if (searchTerm && searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(user => {
        const formattedRole = formatRole(user.role);
        return (
          matchesSearch(user.name, searchLower) ||
          matchesSearch(user.email, searchLower) ||
          matchesSearch(user.phone, searchLower) ||
          matchesSearch(user.id?.toString(), searchLower) ||
          matchesSearch(formattedRole, searchLower)
        );
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm]);

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const tableElement = document.getElementById('users-table');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers();
    Swal.fire({
      icon: 'success',
      title: 'Refreshed',
      text: 'User list has been updated',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Handle delete user
  const handleDelete = (user) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-center">
          <p class="mb-3">You are about to delete user:</p>
          <p class="font-bold text-lg text-red-600">"${user.name}"</p>
          <p class="mt-3 text-sm text-gray-500">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `User "${user.name}" has been deleted.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

// Handle view user details - Attractive SweetAlert2 Modal
const handleView = (user) => {
  const formattedRole = formatRole(user.role);
  const isActive = user.status === 'Active' || user.status === 1 || user.status === true;
  
  Swal.fire({
    title: '<span style="font-size: 24px; font-weight: 600; color: #1f2937; display: flex; align-items: center; justify-content: center; gap: 8px;"><span style="background: #3b82f6; color: white; padding: 8px 16px; border-radius: 30px; font-size: 14px; font-weight: 500;">User Profile</span></span>',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 450px; margin: 0 auto;">
        <!-- Profile Card -->
        <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Cover Image -->
          <div style="height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
          
          <!-- Profile Info -->
          <div style="text-align: center; margin-top: -40px; padding: 0 20px 20px;">
            <!-- Avatar -->
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              <span style="font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                ${user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            
            <!-- Name and ID -->
            <h2 style="margin: 10px 0 5px; font-size: 22px; font-weight: 700; color: #1f2937;">${user.name}</h2>
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
              <span style="background: #f3f4f6; padding: 4px 12px; border-radius: 30px; font-size: 12px; color: #4b5563; font-weight: 500;">
                ID: #${user.id}
              </span>
              <span style="background: ${formattedRole === 'admin' ? '#ede9fe' : '#dbeafe'}; padding: 4px 12px; border-radius: 30px; font-size: 12px; color: ${formattedRole === 'admin' ? '#7c3aed' : '#2563eb'}; font-weight: 500;">
                ${formattedRole === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </div>

            <!-- Info Grid -->
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; text-align: left; background: #f9fafb; padding: 16px; border-radius: 12px;">
              <!-- Email -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; background: #dbeafe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Email Address</p>
                  <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">${user.email}</p>
                </div>
              </div>

              <!-- Phone -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; background: #dcfce7; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                    <line x1="12" y1="18" x2="12" y2="18"/>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Phone Number</p>
                  <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">${user.phone || 'Not provided'}</p>
                </div>
              </div>

              <!-- Joined Date -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; background: #fed7aa; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c2410c" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div style="flex: 1;">
                  <p style="margin: 0; font-size: 12px; color: #6b7280;">Joined Date</p>
                  <p style="margin: 2px 0 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                    ${user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </p>
                </div>
              </div>

              
                
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Close',
    confirmButtonColor: '#3b82f6',
    showCancelButton: false,
    showCloseButton: true,
    closeButtonHtml: '×',
    customClass: {
      popup: 'swal2-popup-custom',
      confirmButton: 'swal2-confirm-custom',
      closeButton: 'swal2-close-custom'
    },
    width: '500px',
    padding: '20px',
    background: '#ffffff',
    backdrop: 'rgba(0,0,0,0.4)',
    allowOutsideClick: true,
    allowEscapeKey: true
  });
};
  // Get counts for stats
  const totalUsers = users.length;
  const adminCount = users.filter(u => isAdmin(u.role)).length;
  const userCount = users.filter(u => isUser(u.role)).length;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Users</h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden xs:block">Manage system users</p>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1 sm:gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 sm:p-4 text-white shadow-lg">
            <div className="flex flex-col items-center sm:items-start">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-200 mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs lg:text-sm text-blue-100">Total</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 sm:p-4 text-white shadow-lg">
            <div className="flex flex-col items-center sm:items-start">
              <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-200 mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs lg:text-sm text-purple-100">Admins</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{adminCount}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2 sm:p-4 text-white shadow-lg">
            <div className="flex flex-col items-center sm:items-start">
              <User className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-200 mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs lg:text-sm text-green-100">Users</p>
              <p className="text-sm sm:text-lg lg:text-2xl font-bold">{userCount}</p>
            </div>
          </div>
        </div>

        {/* Search Bar - Only Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, ID, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search results count */}
          {searchTerm && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              Found {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div id="users-table" className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 lg:py-12 text-gray-500">
                      <Users className="w-8 h-8 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm lg:text-base">No users found</p>
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map((user) => {
                    const role = formatRole(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-md">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-sm lg:text-base text-gray-800">{user.name}</p>
                              <p className="text-xs text-gray-500">ID: #{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <p className="text-xs lg:text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <span className={`px-2 lg:px-3 py-1 text-xs font-medium rounded-full ${
                            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {role}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-gray-600">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                          <div className="flex gap-1 lg:gap-2">
                            <button onClick={() => handleView(user)} className="p-1.5 lg:p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                              <Eye className="w-3 h-3 lg:w-4 lg:h-4 text-gray-600" />
                            </button>
                            <button onClick={() => handleDelete(user)} className="p-1.5 lg:p-2 bg-red-100 rounded-lg hover:bg-red-200">
                              <Trash2 className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {getCurrentPageItems().map((user) => {
                  const role = formatRole(user.role);
                  return (
                    <div key={user.id} className="p-4 hover:bg-gray-50">
                      {/* User Header with Avatar and Actions */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{user.name}</h3>
                            <p className="text-xs text-gray-500">ID: #{user.id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleView(user)} className="p-2 bg-gray-100 rounded-lg">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => handleDelete(user)} className="p-2 bg-red-100 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* User Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm truncate">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm">{user.phone || 'No phone'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Role</p>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {role}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Joined</p>
                          <p className="text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > itemsPerPage && (
          <div className="mt-4 sm:mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
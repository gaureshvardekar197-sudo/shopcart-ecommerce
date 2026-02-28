import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Layers,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { getCategories, deleteCategory } from "../../../API/api-categories";
import Swal from 'sweetalert2';
import Pagination from "../../../Common/Pagination"; // Adjust path as needed

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 categories per page

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setCategories([]);
        setFilteredCategories([]);
        setLoading(false);
        return;
      }

      const response = await getCategories(token);
      
      if (response && response.data) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
        setFilteredCategories(response);
      }
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Load',
        text: 'Could not load categories. Please try again.',
        timer: 3000,
        showConfirmButton: true
      });
      
      setCategories([]);
      setFilteredCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Apply filters and reset to first page
  useEffect(() => {
    let result = [...categories];

    // Apply search
    if (searchTerm) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(category => 
        statusFilter === 'active' 
          ? (category.status === 1 || category.status === true)
          : (category.status === 0 || category.status === false)
      );
    }

    setFilteredCategories(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [categories, searchTerm, statusFilter]);

  // Get current page items
  const getCurrentPageItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of table smoothly
    window.scrollTo({
      top: document.getElementById('categories-table')?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  };

  // Delete handler with SweetAlert
  const handleDelete = (id, categoryName) => {
    Swal.fire({
      title: 'Are you sure?',
      html: `
        <div class="text-center">
          <p class="mb-3">You are about to delete category:</p>
          <p class="font-bold text-lg text-red-600">"${categoryName}"</p>
          <p class="mt-3 text-sm text-gray-500">This action cannot be undone!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#f8f9fa',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Show loading
          Swal.fire({
            title: 'Deleting...',
            html: 'Please wait while we delete the category',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
            background: '#f8f9fa'
          });

          const token = localStorage.getItem('token');
          await deleteCategory(token, id);
          
          // Close loading
          Swal.close();
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            html: `
              <div class="text-center">
                <p>Category <strong>"${categoryName}"</strong> has been deleted.</p>
              </div>
            `,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#f8f9fa'
          });
          
          // Refresh the list
          fetchCategories();
          
        } catch (error) {
          console.error("Delete error:", error.response?.data || error.message);
          
          // Close loading
          Swal.close();
          
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: error.response?.data?.message || 'Could not delete category. Please try again.',
            confirmButtonColor: '#d33',
            background: '#f8f9fa'
          });
        }
      }
    });
  };

  // Image URL helper
  const getImageUrl = (category) => {
    if (!category.image) {
      return "https://via.placeholder.com/48?text=Img";
    }
    
    if (category.image.startsWith('http')) {
      return category.image;
    }
    
    // Clean the path
    let imagePath = category.image.replace(/^public\//, '').replace(/^storage\//, '');
    
    // If it's just a filename, add categories folder
    if (!imagePath.includes('/')) {
      return `http://localhost:8000/storage/categories/${imagePath}`;
    }
    
    return `http://localhost:8000/storage/${imagePath}`;
  };

  // Get counts for stats boxes
  const totalCount = categories.length;
  const activeCount = categories.filter(c => c.status === 1 || c.status === true).length;
  const inactiveCount = categories.filter(c => c.status === 0 || c.status === false).length;
  const popularCount = categories.filter(c => c.popular === 1 || c.popular === true).length;

  // Calculate total pages
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categories</h1>
        <Link
          to="/admin/categories/new"
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FolderPlus className="w-5 h-5" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <p className="text-sm text-gray-500">Manage your categories</p>
          </div>
          <Link
            to="/admin/categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FolderPlus className="w-4 h-4" />
            Add Category
          </Link>
        </div>

        {/* Stats Boxes - 4 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {/* Total Box */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs lg:text-sm">Total</p>
                <p className="text-lg lg:text-2xl font-bold">{totalCount}</p>
              </div>
              <Layers className="w-6 h-6 lg:w-8 lg:h-8 text-blue-200" />
            </div>
          </div>

          {/* Active Box */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs lg:text-sm">Active</p>
                <p className="text-lg lg:text-2xl font-bold">{activeCount}</p>
              </div>
              <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-200" />
            </div>
          </div>

          {/* Inactive Box */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs lg:text-sm">Inactive</p>
                <p className="text-lg lg:text-2xl font-bold">{inactiveCount}</p>
              </div>
              <XCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-200" />
            </div>
          </div>

          {/* Popular Box */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 lg:p-4 text-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-xs lg:text-sm">Popular</p>
                <p className="text-lg lg:text-2xl font-bold">{popularCount}</p>
              </div>
              <Star className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div id="categories-table" className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Popular</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No categories found
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(category)}
                            alt={category.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/48?text=Img";
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-800">{category.name}</p>
                            <p className="text-sm text-gray-500">ID: #{category.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            category.status === 1 || category.status === true
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {category.status === 1 || category.status === true ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {category.popular === 1 || category.popular === true ? (
                          <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1 w-fit">
                            <Star className="w-3 h-3" /> Popular
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* View Button */}
                          <Link
                            to={`/admin/categories/${category.id}`}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            title="View category details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Link>
                          
                          {/* Edit Button */}
                          <Link
                            to={`/admin/categories/edit/${category.id}`}
                            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit category"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Link>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCategories.length}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
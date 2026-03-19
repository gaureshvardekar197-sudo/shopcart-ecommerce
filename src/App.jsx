import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Providers
import { CartProvider } from './components/context/CartContext';
import { WishlistProvider } from './components/context/WishlistContext'; // Add this import

// Public Pages
import Home from './components/pages/Home';
import CategoryProducts from './components/pages/CategoryProducts';
import Products from './components/pages/Products';
import ProductDetails from './components/pages/ProductDetails';
import Cart from './components/pages/Cart';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import About from './components/pages/About';
import Contact from './components/pages/Contact';
import Deals from './components/pages/Deals';
import Checkout from './components/pages/Checkout';
import Wishlist from './components/pages/Wishlist';
import OrderConfirmation from './components/pages/OrderConfirmation';
import MyOrders from './components/pages/MyOrders';
import MyAccount from './components/pages/MyAccount';
import OrderDetails from './components/pages/OrderDetails';
import ForgotPassword from './components/auth/ForgotPassword';
// import PaymentGateway from './components/pages/PaymentGateway';
// import EditOrder from './components/pages/admin/Order/EditOrder';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import AdminProducts from './components/pages/admin/product/IndexProducts';
import AdminOrders from './components/pages/admin/Order/AdminOrders';
import AdminUsers from './components/pages/admin/ALL User/AdminUsers';
import AdminCategories from './components/pages/admin/category/IndexCategories';
import AddCategory from './components/pages/admin/category/AddCategory';
import ShowCategory from './components/pages/admin/category/ShowCategory';
import AddProduct from './components/pages/admin/product/AddProduct';
import ShowProduct from './components/pages/admin/product/ShowProduct';
import EditProduct from './components/pages/admin/product/Editproduct';
import EditCategory from './components/pages/admin/category/EditCategory';
import ShowOrder from './components/pages/admin/Order/ShowOrder';
import AllReviews from './components/pages/admin/Product_Review/All Review';
import SingleReview from './components/pages/admin/Product_Review/SingleReview';
import CancellationRequests from './components/pages/admin/Order/cancellation-requests';
import ViewCancellationRequest from './components/pages/admin/Order/ViewCancelRequests'

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';


// Layout Wrapper for Public Pages
const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      {/* Wrap everything with both Providers */}
      <CartProvider>
        <WishlistProvider> {/* Add WishlistProvider here */}
          <ToastContainer
            position="bottom-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          <Routes>
            {/* ========== PUBLIC ROUTES ========== */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/products/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
            <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/my-orders" element={<PublicLayout><MyOrders /></PublicLayout>} />
            <Route path="/my-account" element={<PublicLayout><MyAccount/></PublicLayout>}/>
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/order-details/:id" element={<PublicLayout><OrderDetails /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/deals" element={<PublicLayout><Deals /></PublicLayout>} />
            <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
            <Route path="/category/:slug" element={<PublicLayout><CategoryProducts /></PublicLayout>} />
            {/* <Route path="/payment" element={<PublicLayout><PaymentGateway /></PublicLayout>} /> */}

            {/* ========== AUTH ROUTES ========== */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <PublicLayout><Login /></PublicLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <PublicLayout><Register /></PublicLayout>
                </PublicRoute>
              }
            />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <PublicLayout><ForgotPassword /></PublicLayout>
              </PublicRoute>
            } />

            {/* ========== ADMIN ROUTES ========== */}

            {/* Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Products Management */}
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminProducts />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id"
              element={
                <ProtectedRoute>
                  <ShowProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            {/* Categories Management */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminCategories />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/new"
              element={
                <ProtectedRoute>
                  <AddCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ShowCategory />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/edit/:id"
              element={
                <ProtectedRoute>
                  <EditCategory />
                </ProtectedRoute>
              }
            />

            {/* Orders Management */}
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ShowOrder />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/cancellation-requests"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <CancellationRequests />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
  path="/admin/cancellation-requests/:id"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <ViewCancellationRequest />
      </AdminLayout>
    </ProtectedRoute>
  }
/>
            {/* <Route
              path="/admin/orders/edit/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                   <EditOrder />
                  </AdminLayout>
                </ProtectedRoute>
              }
            /> */}
            {/* Users Management */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AdminUsers />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin index redirect */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Product_Review"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AllReviews />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/product_review/:id"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <SingleReview />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback - 404 Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WishlistProvider> {/* Close WishlistProvider */}
      </CartProvider>
    </Router>
  );
}

export default App;
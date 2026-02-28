// import React, { useState } from 'react';
// import AdminSidebar from '../../admin/AdminSidebar';
// import AdminHeader from '../../admin/AdminHeader';
// import { Save, Upload, Bell, Shield, Globe, CreditCard } from 'lucide-react';

// const AdminSettings = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [settings, setSettings] = useState({
//     storeName: 'Merce Store',
//     storeEmail: 'support@merceshop.com',
//     currency: 'USD',
//     timezone: 'UTC-5',
//     notifications: {
//       email: true,
//       orders: true,
//       promotions: false
//     }
//   });

//   const handleInputChange = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleNotificationChange = (field, value) => {
//     setSettings(prev => ({
//       ...prev,
//       notifications: {
//         ...prev.notifications,
//         [field]: value
//       }
//     }));
//   };

//   const handleSave = () => {
//     alert('Settings saved successfully!');
//     // In a real app, you would make an API call here
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="flex">
//         <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
//           <AdminSidebar />
//         </div>
        
//         <div className="flex-1">
//           <AdminHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
//           <main className="p-6">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
//                 <p className="text-gray-600">Manage your store settings and preferences</p>
//               </div>
//               <button 
//                 onClick={handleSave}
//                 className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Save className="w-5 h-5" />
//                 Save Changes
//               </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* General Settings */}
//               <div className="lg:col-span-2 space-y-6">
//                 {/* Store Information */}
//                 <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
//                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                     <Globe className="w-5 h-5" />
//                     Store Information
//                   </h2>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Store Name
//                       </label>
//                       <input
//                         type="text"
//                         value={settings.storeName}
//                         onChange={(e) => handleInputChange('storeName', e.target.value)}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Store Email
//                       </label>
//                       <input
//                         type="email"
//                         value={settings.storeEmail}
//                         onChange={(e) => handleInputChange('storeEmail', e.target.value)}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Currency
//                         </label>
//                         <select
//                           value={settings.currency}
//                           onChange={(e) => handleInputChange('currency', e.target.value)}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         >
//                           <option value="USD">USD ($)</option>
//                           <option value="EUR">EUR (€)</option>
//                           <option value="GBP">GBP (£)</option>
//                           <option value="INR">INR (₹)</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Timezone
//                         </label>
//                         <select
//                           value={settings.timezone}
//                           onChange={(e) => handleInputChange('timezone', e.target.value)}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         >
//                           <option value="UTC-5">UTC-5 (EST)</option>
//                           <option value="UTC">UTC (GMT)</option>
//                           <option value="UTC+1">UTC+1 (CET)</option>
//                           <option value="UTC+5:30">UTC+5:30 (IST)</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Logo Upload */}
//                 <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
//                   <h2 className="text-xl font-bold mb-4">Store Logo</h2>
//                   <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
//                     <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
//                       <span className="text-2xl">🛒</span>
//                     </div>
//                     <p className="text-gray-600 mb-4">Upload your store logo</p>
//                     <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
//                       <Upload className="w-4 h-4" />
//                       Upload Image
//                     </button>
//                     <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Sidebar Settings */}
//               <div className="space-y-6">
//                 {/* Notifications */}
//                 <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
//                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                     <Bell className="w-5 h-5" />
//                     Notifications
//                   </h2>
//                   <div className="space-y-3">
//                     <label className="flex items-center justify-between">
//                       <span className="text-gray-700">Email Notifications</span>
//                       <input
//                         type="checkbox"
//                         checked={settings.notifications.email}
//                         onChange={(e) => handleNotificationChange('email', e.target.checked)}
//                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                       />
//                     </label>
//                     <label className="flex items-center justify-between">
//                       <span className="text-gray-700">New Orders</span>
//                       <input
//                         type="checkbox"
//                         checked={settings.notifications.orders}
//                         onChange={(e) => handleNotificationChange('orders', e.target.checked)}
//                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                       />
//                     </label>
//                     <label className="flex items-center justify-between">
//                       <span className="text-gray-700">Promotions</span>
//                       <input
//                         type="checkbox"
//                         checked={settings.notifications.promotions}
//                         onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
//                         className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
//                       />
//                     </label>
//                   </div>
//                 </div>

//                 {/* Security */}
//                 <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
//                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                     <Shield className="w-5 h-5" />
//                     Security
//                   </h2>
//                   <div className="space-y-3">
//                     <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
//                       Change Password
//                     </button>
//                     <button className="w-full text-left px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
//                       Two-Factor Authentication
//                     </button>
//                     <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100">
//                       View Login History
//                     </button>
//                   </div>
//                 </div>

//                 {/* Billing */}
//                 <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
//                   <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//                     <CreditCard className="w-5 h-5" />
//                     Billing
//                   </h2>
//                   <div className="space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Current Plan</span>
//                       <span className="font-bold text-green-600">Pro Plan</span>
//                     </div>
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Next Billing</span>
//                       <span className="font-medium">Jan 30, 2024</span>
//                     </div>
//                     <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                       Upgrade Plan
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminSettings;
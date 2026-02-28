// import React from 'react';
// import AdminSidebar from './AdminSidebar';
// import AdminHeader from './AdminHeader';

// const AdminLayout = ({ children, title, description }) => {
//   return (
//     <div className="min-h-screen bg-gray-50 pt-10 pl-4">
//       <div className="flex">
//         {/* Fixed Sidebar */}
//         <AdminSidebar />
        
//         {/* Main Content Area */}
//         <div className="flex-1 lg:ml-[258px] ">
//           {/* Fixed Header with search and user info */}
//           <div className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white border-b border-gray-200">
//             <AdminHeader />
//           </div>
          
//           {/* Scrollable Content */}
//           <main className="pt-16 lg:pt-16 p-4 lg:p-6 min-h-screen admin-scrollbar">
//             {/* Page Header - Show only if title is provided */}
//             {(title || description) && (
//               <div className="mb-6">
//                 <div>
//                   {title && <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{title}</h1>}
//                   {description && <p className="text-gray-600 text-sm lg:text-base">{description}</p>}
//                 </div>
//               </div>
//             )}
            
//             {/* Page Content */}
//             {children}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, title, description }) => {
  return (
    <>
      {/* Fixed Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="lg:ml-[272px]"> {/* Match your sidebar width */}
        {/* Header - directly use AdminHeader without wrapper div */}
        <AdminHeader />
        
        {/* Scrollable Content - add padding top to account for header height */}
        <main className="p-4 lg:p-6 pt-5 min-h-screen">
          {/* Page Header */}
          {(title || description) && (
            <div className="mb-6">
              <div>
                {title && <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-2">{title}</h1>}
                {description && <p className="text-gray-600 text-sm lg:text-base">{description}</p>}
              </div>
            </div>
          )}
          
          {/* Page Content */}
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminLayout;
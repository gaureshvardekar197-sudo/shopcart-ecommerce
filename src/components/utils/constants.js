export const adminMenu = [
  {
    id: 1,
    title: "Dashboard",
    icon: "LayoutDashboard",
    path: "/admin/dashboard"
  },
  {
    id: 2,
    title: "Products",
    icon: "Package",
    type: "dropdown",
    subItems: [
      {
        id: 21,
        title: "Add New Product",   
        path: "/admin/products/new",
        icon: "Plus"
      },
      {
        id: 22,
        title: "View Products",
        path: "/admin/products",
        icon: "Eye"
      }
    ]
  },
  {
    id: 3,
    title: "Categories",
    icon: "Layers",
    type: "dropdown",
    subItems: [
      {
        id: 31,
        title: "Add New Category",
        path: "/admin/categories/new",
        icon: "Plus"
      },
      {
        id: 32,
        title: "View Categories",
        path: "/admin/categories",
        icon: "Eye"
      }
    ]
  },
  {
    id: 4,
    title: "Orders",
    icon: "ShoppingCart",
    type: "dropdown",
    subItems: [
      {
        id: 41,
        title: "All Orders",
        path: "/admin/orders",
        icon: "ShoppingBag"
      },
      {
        id: 42,
        title: "Cancellation Requests",
        path: "/admin/orders/cancellation-requests",
        icon: "AlertCircle",
        badge: "pending"
      }
    ]
  },
  {
    id: 5,
    title: "Users",
    icon: "Users",
    path: "/admin/users"
  },
  {
    id: 6,
    title: "User Review",
    icon: "Star", 
    path: "/admin/Product_Review"
  }
];
//   {
//     id: 6,
//     title: "Analytics",
//     icon: "BarChart3",
//     path: "/admin/analytics"
//   },
//   {
//     id: 7,
//     title: "Settings",
//     icon: "Settings",
//     path: "/admin/settings"
//   }
// ];

//  
//   {
//     id: 1,
//     title: "Total Revenue",
//     value: "₹54,231",
//     change: "+20.1%",
//     icon: "DollarSign",
//     color: "bg-green-500"
//   },
//   {
//     id: 2,
//     title: "Total Orders",
//     value: "2,543",
//     change: "+12.5%",
//     icon: "ShoppingCart",
//     color: "bg-blue-500"
//   },
//   {
//     id: 3,
//     title: "Products",
//     value: "1,245",
//     change: "+5.2%",
//     icon: "Package",
//     color: "bg-purple-500"
//   },
//   {
//     id: 4,
//     title: "Customers",
//     value: "8,542",
//     change: "+18.3%",
//     icon: "Users",
//     color: "bg-orange-500"
//   }
// ];

// export const recentOrders = [
//   { id: "#ORD001", customer: "John Doe", date: "2024-01-15", amount: "₹342", status: "Delivered" },
//   { id: "#ORD002", customer: "Jane Smith", date: "2024-01-14", amount: "₹524", status: "Processing" },
//   { id: "#ORD003", customer: "Robert Johnson", date: "2024-01-14", amount: "₹127", status: "Pending" },
//   { id: "#ORD004", customer: "Emily Davis", date: "2024-01-13", amount: "₹789", status: "Delivered" },
//   { id: "#ORD005", customer: "Michael Wilson", date: "2024-01-13", amount: "₹231", status: "Cancelled" }
// ];

// export const topProducts = [
//   { id: 1, name: "Wireless Headphones", sales: 234, revenue: "₹12,345" },
//   { id: 2, name: "Smart Watch", sales: 189, revenue: "₹9,876" },
//   { id: 3, name: "Laptop Stand", sales: 156, revenue: "₹7,543" },
//   { id: 4, name: "USB-C Hub", sales: 143, revenue: "₹6,789" },
//   { id: 5, name: "Mechanical Keyboard", sales: 128, revenue: "₹5,432" }
// ];
// import { Navigate } from "react-router-dom";

// const PublicRoute = ({ children }) => {
//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));

//   if (token && user) {
//     return Number(user.role) === 1
//       ? <Navigate to="/admin/dashboard" replace />
//       : <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default PublicRoute;
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    return Number(user.role) === 1
      ? <Navigate to="/admin/dashboard" replace />
      : <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
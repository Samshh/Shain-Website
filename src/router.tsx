import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "./routes/protected-layout";
import PublicLayout from "./routes/public-layout";
import Login from "./routes/public-layout/login";
import Admin from "./routes/protected-layout/admin";
import AdminDashboard from "./routes/protected-layout/admin/dashboard";
import BranchManager from "./routes/protected-layout/branch-manager";
import BranchManagerDashboard from "./routes/protected-layout/branch-manager/dashboard";
import AdminItem from "./routes/protected-layout/admin/item";
import AdminPayroll from "./routes/protected-layout/admin/payroll";
import AdminReport from "./routes/protected-layout/admin/report";
import AdminUsers from "./routes/protected-layout/admin/user";
import RegisterPage from "./routes/public-layout/register";
import BranchManagerItem from "./routes/protected-layout/branch-manager/item";
import BranchManagerPayroll from "./routes/protected-layout/branch-manager/payroll";
import BranchManagerReport from "./routes/protected-layout/branch-manager/report";
import BranchManagerProfile from "./routes/protected-layout/branch-manager/profile";
import AdminProfile from "./routes/protected-layout/admin/profile";

const Router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <Admin />,
        path: "admin",
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "items",
            element: <AdminItem />,
          },
          {
            path: "payroll",
            element: <AdminPayroll />,
          },
          {
            path: "reports",
            element: <AdminReport />,
          },
          {
            path: "users",
            element: <AdminUsers />,
          },
          {
            path: "profile",
            element: <AdminProfile />,
          },
        ],
      },
      {
        element: <BranchManager />,
        path: "branch-manager",
        children: [
          {
            index: true,
            element: <BranchManagerDashboard />,
          },
          {
            path: "items",
            element: <BranchManagerItem />,
          },
          {
            path: "payroll",
            element: <BranchManagerPayroll />,
          },
          {
            path: "reports",
            element: <BranchManagerReport />,
          },
          {
            path: "profile",
            element: <BranchManagerProfile />,
          },
        ],
      },
    ],
  },
]);

export default Router;

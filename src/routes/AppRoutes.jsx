// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import UsersPage from "../pages/Users/UsersPage";
import CallsPage from "../pages/Calls/CallsPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import CoinsPage from "../pages/Coins/CoinsPage";
import AdminsPage from "../pages/Admins/AdminsPage";
import Layout from "../components/Layout";
import WalletPage from "../pages/Wallets/WalletsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route → only for not-logged-in admins */}
      <Route path="/login" element={ <PublicRoute> <LoginPage /> </PublicRoute> }/>

      {/* Protected route → only for logged-in admins */}
      <Route path="/dashboard" element={ <ProtectedRoute> <Layout> <DashboardPage /> </Layout> </ProtectedRoute> }/>
      <Route path="/users" element={ <ProtectedRoute> <Layout> <UsersPage /> </Layout> </ProtectedRoute> }/>
      <Route path="/calls" element={ <ProtectedRoute> <Layout> <CallsPage /> </Layout> </ProtectedRoute> }/>
      <Route path="/reports" element={ <ProtectedRoute> <Layout> <ReportsPage /> </Layout> </ProtectedRoute> }/>      
      <Route path="/coins" element={ <ProtectedRoute> <Layout> <CoinsPage /> </Layout> </ProtectedRoute> }/>
      <Route path="/wallet" element={ <ProtectedRoute> <Layout> <WalletPage /> </Layout> </ProtectedRoute> }/>
      <Route path="/admins" element={ <ProtectedRoute> <Layout> <AdminsPage /> </Layout> </ProtectedRoute> }/>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;

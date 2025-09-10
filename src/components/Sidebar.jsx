// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { RxDashboard } from "react-icons/rx";
import { IoMdCall } from "react-icons/io";
import { FiUsers } from "react-icons/fi";
// Import React Icons
import {  FaChartBar, FaCoins, FaUserShield, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: RxDashboard },
    { name: "Users", path: "/users", icon: FiUsers },
    { name: "Calls", path: "/calls", icon: IoMdCall },
    { name: "Reports", path: "/reports", icon: FaChartBar },
    { name: "Coins", path: "/coins", icon: FaCoins },
    { name: "Admins", path: "/admins", icon: FaUserShield },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white text-gray-800 flex flex-col shadow-lg border-r border-gray-200">
      {/* App Title */}
      <div className="p-5 border-b border-gray-200">
        <div className="text-xl font-bold text-purple-700">FrndzOnDate</div>
        {admin?.name && (
          <div className="text-sm text-gray-500 mt-1">Hi, {admin.name}</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-purple-100 text-purple-800 font-medium shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="text-lg" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center font-semibold w-full gap-3 px-3 py-2.5 text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
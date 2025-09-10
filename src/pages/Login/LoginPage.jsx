// src/pages/Login/LoginPage.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { login as loginService } from "../../services/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginService(email, password);
      login(data);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 px-4"
      style={{
        background: `
          radial-gradient(circle at 20% 30%, rgba(124, 58, 237, 0.1) 0%, transparent 30%),
          radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.15) 0%, transparent 30%),
          linear-gradient(135deg, #f8f9ff 0%, #f3f0ff 100%)
        `,
      }}
      >
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md transition-all duration-300 transform hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">FrndzOnDate - Admin</h2>
          <p className="text-gray-500 mt-2">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          © 2025 FrndzOnDate
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
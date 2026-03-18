import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import {
  Users, Phone, Video, Coins, AlertCircle, Ban, Activity, IndianRupee,
  TrendingUp, Clock, Calendar, BarChart3, UserCheck, UserX, Zap, Eye
} from 'lucide-react';
import api from '../../services/api';
import { Refresh } from '@mui/icons-material';

const DashboardPage = () => {
  // Existing state
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState(null);
  const [calls, setCalls] = useState([]);
  const [callsMeta, setCallsMeta] = useState(null);
  const [topCallers, setTopCallers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState(null);
  const [revenueAllTime, setRevenueAllTime] = useState(0);
  const [offers, setOffers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportsMeta, setReportsMeta] = useState(null);
  const [walletSummary, setWalletSummary] = useState(null);

  // NEW: Additional API data
  const [callsOverTime, setCallsOverTime] = useState([]);
  const [growthData, setGrowthData] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        overviewRes,
        usersRes,
        callsRes,
        topCallersRes,
        ordersRes,
        offersRes,
        packagesRes,
        reportsRes,
        walletRes,
        // NEW APIs
        callsOverTimeRes,
        growthRes,
        engagementRes,
        realtimeRes
      ] = await Promise.all([
        api.get(`/admin/dashboard/overview`),
        api.get(`/admin/dashboard/users`),
        api.get(`/admin/dashboard/calls`),
        api.get(`/admin/dashboard/calls/top`),
        api.get(`/admin/dashboard/purchase-orders`),
        api.get(`/admin/dashboard/offers`),
        api.get(`/admin/dashboard/packages`),
        api.get(`/admin/dashboard/reports`),
        api.get(`/admin/dashboard/wallets/summary`),
        // NEW
        api.get(`/admin/dashboard/calls-over-time`),
        api.get(`/admin/dashboard/growth`),
        api.get(`/admin/dashboard/user-engagement`),
        api.get(`/admin/dashboard/realtime`)
      ]);

      setOverview(overviewRes.data);
      setUsers(usersRes.data.users);
      setUsersMeta(usersRes.data.meta);
      setCalls(callsRes.data.calls);
      setCallsMeta(callsRes.data.meta);
      setTopCallers(topCallersRes.data.results);
      setOrders(ordersRes.data.orders);
      setOrdersMeta(ordersRes.data.meta);
      setRevenueAllTime(ordersRes.data.revenueAllTime);
      setOffers(offersRes.data.offers);
      setPackages(packagesRes.data.packages);
      setReports(reportsRes.data.reports);
      setReportsMeta(reportsRes.data.meta);
      setWalletSummary(walletRes.data);

      // NEW
      setCallsOverTime(callsOverTimeRes.data);
      setGrowthData(growthRes.data);
      setEngagementData(engagementRes.data);
      setRealtimeData(realtimeRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-xl font-bold mb-2">Oops! Something went wrong</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAllData}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  // === Chart Data Preparation ===

  // Call Types
  const callTypeData = [
    { name: 'Audio Calls', value: overview.totalAudioCalls, color: '#8b5cf6' },
    { name: 'Video Calls', value: overview.totalVideoCalls, color: '#ec4899' }
  ];

  // User Status
  const activeUsers = overview.totalUsers - overview.bannedUsers - overview.deletedUsers;
  const userStatusData = [
    { name: 'Active', value: activeUsers, color: '#10b981' },
    { name: 'Banned', value: overview.bannedUsers, color: '#ef4444' },
    { name: 'Deleted', value: overview.deletedUsers, color: '#6b7280' }
  ];

  // Top Callers
  const topCallersChart = topCallers.map(caller => ({
    name: `User ${caller.userId}`,
    calls: parseInt(caller.callCount),
    duration: Math.round(parseInt(caller.totalDuration) / 60)
  }));

  // Revenue Data
  const revenueData = orders
    .filter(o => o.status === 'success' && o.completedAt)
    .reduce((acc, order) => {
      const date = new Date(order.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += order.amount;
        existing.orders += 1;
      } else {
        acc.push({ date, revenue: order.amount, orders: 1 });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Call Status
  const callStatusData = calls.reduce((acc, call) => {
    const status = call.status;
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);
  const statusColors = { 'ended': '#10b981', 'cancelled': '#f59e0b', 'rejected': '#ef4444', 'pending': '#3b82f6' };

  // User Growth
  const userGrowthData = users
    .reduce((acc, user) => {
      const date = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.users += 1;
      } else {
        acc.push({ date, users: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // === NEW: Calls Over Time (for Engagement tab)
  const callsOverTimeFormatted = callsOverTime.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Audio Calls': parseInt(item.audioCalls),
    'Video Calls': parseInt(item.videoCalls)
  }));

  // === NEW: User Growth by Day (from /growth)
  const growthByDay = growthData?.userGrowthByDay?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: parseInt(item.count)
  })) || [];

  // Stat Card Component
  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mt-1">{value}</h3>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}10` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  // Realtime Stats Mini Cards
  const RealtimeStat = ({ label, value, icon: Icon, color = '#6b7280' }) => (
    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
      <Icon className="w-6 h-6 mx-auto text-gray-500 mb-2" />
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Monitor performance, user activity, and revenue in real time.</p>
          </div>
          <button 
            onClick={fetchAllData}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Refresh className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-2 flex gap-2 overflow-x-auto">
          {['overview', 'analytics', 'engagement', 'calls', 'revenue'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 md:px-6 md:py-3 whitespace-nowrap rounded-lg font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard icon={Users} title="Total Users" value={overview.totalUsers} subtitle={`${overview.onlineUsers} online`} color="#3b82f6" />
              <StatCard icon={Phone} title="Total Calls" value={overview.totalCalls} subtitle={`${overview.totalAudioCalls} audio, ${overview.totalVideoCalls} video`} color="#8b5cf6" />
              <StatCard icon={Coins} title="Total Coins" value={overview.totalCoins.toLocaleString()}  ?? 0 subtitle={`${overview.usersWithWallets} wallets`} color="#f59e0b" />
              <StatCard icon={IndianRupee} title="Total Revenue" value={`₹${revenueAllTime.toLocaleString()}`} subtitle="All time" color="#10b981" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <StatCard icon={AlertCircle} title="Reports" value={overview.totalReports} subtitle={`${overview.pendingReports} pending`} color="#ef4444" />
              <StatCard icon={Ban} title="Banned Users" value={overview.bannedUsers} color="#dc2626" />
              <StatCard icon={Activity} title="Active Users" value={engagementData?.dailyActiveUsers || 0} subtitle={`${engagementData?.weeklyActiveUsers || 0} this week`} color="#06b6d4" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Phone className="w-5 h-5" /> Call Types</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={callTypeData} cx="50%" cy="50%" outerRadius={90} innerRadius={60} fill="#8884d8" dataKey="value" label>
                      {callTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Calls']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> User Status</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                      {userStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Top Callers</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCallersChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill="#ec4899" name="Total Calls" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="duration" fill="#8b5cf6" name="Duration (mins)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* === ANALYTICS TAB === */}
        {activeTab === 'analytics' && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Call Status</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={callStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label
                    >
                      {callStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold fill-gray-700"
                    >
                      {callStatusData.reduce((sum, item) => sum + item.value, 0)}
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">User Registrations</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Daily Orders</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#ec4899" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* === ENGAGEMENT TAB (NEW) === */}
        {activeTab === 'engagement' && (
          <>
            {/* Realtime Snapshot */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-sm p-5 mb-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5" /> Realtime Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <RealtimeStat label="Active Calls" value={realtimeData?.activeCallsNow || 0} icon={Phone} />
                <RealtimeStat label="Online Users" value={realtimeData?.onlineUsers || 0} icon={Users} />
                <RealtimeStat label="Calls Today" value={realtimeData?.callsToday || 0} icon={BarChart3} />
                <RealtimeStat label="New Users" value={realtimeData?.newUsersToday || 0} icon={UserCheck} />
                <RealtimeStat label="Revenue Today" value={`₹${realtimeData?.revenueToday || 0}`} icon={IndianRupee} />
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              <StatCard icon={UserCheck} title="New Users (Today)" value={growthData?.newUsersToday || 0} color="#10b981" />
              <StatCard icon={Calendar} title="This Week" value={growthData?.newUsersThisWeek || 0} color="#06b6d4" />
              <StatCard icon={TrendingUp} title="Growth Rate" value={`${growthData?.growthRate || 0}%`} subtitle="MoM" color="#8b5cf6" />
              <StatCard icon={UserX} title="Churn Rate" value={`${growthData?.churnRate || 0}%`} color="#f97316" />
            </div>

            {/* User Engagement */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <StatCard icon={Eye} title="Daily Active" value={engagementData?.dailyActiveUsers || 0} subtitle="24h" color="#3b82f6" />
              <StatCard icon={Eye} title="Weekly Active" value={engagementData?.weeklyActiveUsers || 0} subtitle="7 days" color="#8b5cf6" />
              <StatCard icon={Eye} title="Monthly Active" value={engagementData?.monthlyActiveUsers || 0} subtitle="30 days" color="#ec4899" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Calls Over Time */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Calls Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={callsOverTimeFormatted}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Audio Calls" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Video Calls" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Growth by Day */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">User Growth (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={growthByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* === CALLS & REVENUE TABS (unchanged logic, kept for completeness) === */}
        {activeTab === 'calls' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-sm">
                <Phone className="w-6 h-6 mb-2 opacity-90" />
                <h3 className="text-2xl font-bold">{overview.totalAudioCalls}</h3>
                <p className="text-purple-100 text-sm">Audio Calls</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-sm">
                <Video className="w-6 h-6 mb-2 opacity-90" />
                <h3 className="text-2xl font-bold">{overview.totalVideoCalls}</h3>
                <p className="text-pink-100 text-sm">Video Calls</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-sm">
                <Clock className="w-6 h-6 mb-2 opacity-90" />
                <h3 className="text-2xl font-bold">
                  {Math.round(topCallers.reduce((sum, c) => sum + parseInt(c.totalDuration), 0) / 60)}
                </h3>
                <p className="text-blue-100 text-sm">Total Minutes</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Top Performers</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={topCallersChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="calls" fill="#ec4899" barSize={15} name="Calls" />
                  <Line dataKey="duration" stroke="#8b5cf6" strokeWidth={3} name="Duration (mins)" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>    
          </>
        )}

        {activeTab === 'revenue' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Coin Packages</h2>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                      <div>
                        <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                        <p className="text-sm text-gray-600">{pkg.coins} coins</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">₹{pkg.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Active Offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.filter(o => o.isActive).map(offer => (
                  <div key={offer.id} className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{offer.name}</h3>
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Active</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {offer.type === 'bonus_coins' ? 'Bonus Coins' : 'Discount'}: {offer.value}%
                    </p>
                    <p className="text-xs text-gray-500">
                      Valid: {new Date(offer.validFrom).toLocaleDateString()} – {new Date(offer.validTo).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;




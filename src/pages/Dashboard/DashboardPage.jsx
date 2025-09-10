// src/pages/Dashboard/DashboardPage.jsx

const DashboardPage = () => {

  return (
    <div className="p-6">
      <div className="flex justify-start items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>        
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded">Total Users: 1200</div>
        <div className="bg-white p-4 shadow rounded">Active Calls: 45</div>
        <div className="bg-white p-4 shadow rounded">Banned Users: 12</div>
      </div>
    </div>
  );
};

export default DashboardPage;

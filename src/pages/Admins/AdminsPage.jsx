// src/pages/Admins/AdminsPage.jsx
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import api from "../../services/api";
import { Paper } from "@mui/material";
import { TbBolt, TbRotate } from "react-icons/tb";
import { MdDelete, MdEdit } from "react-icons/md";

const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/all");
      setAdmins(res.data.admins);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentAdmin = async () => {
    try {
      const res = await api.get("/admin/me"); // <-- You may need to implement this endpoint
      setCurrentAdmin(res.data.admin);
    } catch (err) {
      console.error("Failed to fetch current admin:", err);
      // Optionally redirect to login if unauthenticated
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchCurrentAdmin();
  }, []);

  // Open modal to add a new admin
  const openAddModal = () => {
    setModalMode("add");
    setSelectedAdmin(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin"
    });
    setShowModal(true);
  };

  // Open modal to update an admin
  const openUpdateModal = (admin) => {
    setModalMode("update");
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role
    });
    setShowModal(true);
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle soft delete
  const softDeleteAdmin = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to soft delete this admin.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/admin/${id}`);

        if (response.status === 200) {
          await fetchAdmins();
          Swal.fire('Deleted!', 'Admin has been soft deleted.', 'success');
        } else {
          Swal.fire('Error!', 'Unexpected response from server.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', err.response?.data?.message || 'Failed to delete admin', 'error');
      }
    }
  };

  // Handle hard delete
  const hardDeleteAdmin = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to permanently delete this admin.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/${id}/force`);
        fetchAdmins();
        Swal.fire('Deleted!', 'Admin has been permanently deleted.', 'success');
      } catch (err) {
        Swal.fire('Error!', err.response?.data?.message || 'Failed to delete admin', 'error');
      }
    }
  };

  // Handle restore
  const restoreAdmin = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to restore this admin.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1976d2',
    });

    if (result.isConfirmed) {
      try {
        const response = await api.post(`/admin/${id}/restore`);

        if (response.status === 200) {
          await fetchAdmins();
          Swal.fire('Restored!', 'Admin has been successfully restored.', 'success');
        } else {
          Swal.fire('Error!', 'Unexpected response from server.', 'error');
        }
      } catch (err) {
        Swal.fire('Error!', err.response?.data?.message || 'Failed to restore admin', 'error');
      }
    }
  };

  // Handle submit (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (modalMode === "add") {
        await api.post("/admin/add", formData);
        Swal.fire('Added!', 'Admin added successfully.', 'success');
      } else {
        await api.put(`/admin/${selectedAdmin.id}`, formData);
        Swal.fire('Updated!', 'Admin updated successfully.', 'success');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      Swal.fire('Error!', err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Name is required', 'warning');
      return false;
    }
    if (!formData.email.trim()) {
      Swal.fire('Validation Error', 'Email is required', 'warning');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      Swal.fire('Validation Error', 'Enter a valid email address', 'warning');
      return false;
    }
    if (modalMode === "add" && formData.password.trim().length < 6) {
      Swal.fire('Validation Error', 'Password must be at least 6 characters', 'warning');
      return false;
    }
    if (formData.role !== 'admin' && formData.role !== 'superadmin') {
      Swal.fire('Validation Error', 'Invalid role selected', 'warning');
      return false;
    }
    return true;
  };

  return (
    <div className="p-6 h-screen">
      <h1 className="text-2xl font-bold flex justify-center text-blue-950 mb-4">Admins Management</h1>

      <span className="flex justify-end mr-2">
        <button
          onClick={openAddModal}
          className="mb-4 bg-purple-200 text-blue-900 font-semibold px-4 py-2 rounded-lg"
        >
         + Add Admin
        </button>
      </span>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Styled Table using MUI Paper and matching UI */}
      <Paper
        elevation={3}
        sx={{ borderRadius: "16px", overflow: "hidden" }}
        className="bg-white shadow-lg"
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No admins found.</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-purple-100 text-blue-900 text-sm">
              <tr>
                <th className="py-2 px-3 text-left">S. No</th>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Role</th>            
                <th className="py-2 px-3 text-left">Created</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {admins.map((admin, index) => (
                <tr
                  key={admin.id}
                  className="border-b border-gray-100 hover:bg-gray-50 even:bg-white odd:bg-gray-25"
                >
                  <td className="py-2 px-3 font-medium text-gray-800">{index + 1}</td>
                  <td className="py-2 px-3">{admin.name || "—"}</td>
                  <td className="py-2 px-3 text-gray-700">{admin.email}</td>
                  <td className="py-2 px-3 text-gray-700 capitalize">{admin.role}</td>                  
                  <td className="py-2 px-3 text-gray-600">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => openUpdateModal(admin)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit Admin"
                    >
                      <MdEdit size={16} />
                    </button>

                    {admin.deletedAt ? (
                      currentAdmin?.role === 'superadmin' ? (
                        <button
                          onClick={() => restoreAdmin(admin.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Restore Admin"
                        >
                          <TbRotate size={16} />
                        </button>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed" title="Only superadmin can restore">
                          <TbRotate size={16} />
                        </span>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => softDeleteAdmin(admin.id)}
                          className="text-orange-500 hover:text-orange-600 transition"
                          title="Soft Delete"
                        >
                          <MdDelete size={16} />
                        </button>

                        <button
                          onClick={() => hardDeleteAdmin(admin.id)}
                          className="text-red-500 hover:text-red-600 transition"
                          title="Permanent Delete"
                        >
                          <TbBolt size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paper>

      {/* Modal (unchanged) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "Add Admin" : "Update Admin"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                  placeholder="Leave blank to keep unchanged"
                />
              </div>
              <div>
                <label className="block mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded"
                >
                  <option value="admin">Admin</option>
                  {/* <option value="superadmin">Superadmin</option> */}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
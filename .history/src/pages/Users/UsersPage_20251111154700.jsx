import { useEffect, useState } from "react";
import api from "../../services/api";
import { MdClose } from "react-icons/md";
import { AiOutlineEye, AiOutlineSearch } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdBlock, MdCheckCircle } from "react-icons/md";
import { TbBolt, TbRotate } from "react-icons/tb";
import { BiUserCheck, BiUserX } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Select, MenuItem, FormControl, InputLabel, Paper, TextField, Box, Typography, Chip } from "@mui/material";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUserData, setEditUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banData, setBanData] = useState({
    userId: null,
    reason: "",
    duration: "7",
  });

  const predefinedInterests = [
    'Travel',
    'Music',
    'Movies',
    'Cricket',
    'Cooking',
    'Foodie',
    'Fitness',
    'Yoga',
    'Dance',
    'Gaming',
    'Photography',
    'Tech',
    'Reading',
    'Memes',
    'OTT Binge',
    'Fashion',
    'Shopping',
    'Pets',
    'Adventure',
    'Coffee',
    'Art',
    'Podcasts',
    'K-Dramas',
    'Anime',
    'comics',
    'Astrology',
    'Cycling',
    'Football',
    'Chess',
    'Instruments',
    'Singing',
    'Public Speaking',
    'Content Creation',
    'Reels',
  ];

  const predefinedLanguages = [
    // Indian core
    'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 
    'Kannada', 'Odia', 'Malayalam', 'Punjabi', 'Assamese',
    'Maithili', 'Santali', 'Sindhi', 'Manipuri',

    // Global major
    'English', 'Spanish', 'French', 'Arabic', 'Chinese', 'Russian', 
    'Portuguese', 'German', 'Japanese', 'Korean', 'Italian', 'Turkish',
    'Vietnamese', 'Thai', 'Persian', 'Dutch', 'Greek',
    'Polish', 'Hebrew', 'Malay', 'Indonesian', 'Filipino',
  ];

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("admin/users", {
        params: {
          page,
          limit: 12, // Reduced for better fit
          status: status === "all" ? undefined : status,
          search: debouncedSearch || undefined,
        },
      });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status, debouncedSearch]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (isEditing && selectedUser) {
      setEditUserData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        gender: selectedUser.gender || "",
        dateOfBirth: selectedUser.dateOfBirth || "",
        city: selectedUser.city || "",
        bio: selectedUser.bio || "",
        interests: selectedUser.interests || [],
        languages: selectedUser.languages || []
      });
    }
  }, [isEditing, selectedUser]);

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: editUserData.name,
        email: editUserData.email,
        phone: editUserData.phone,
        gender: editUserData.gender,
        dateOfBirth: editUserData.dateOfBirth,
        city: editUserData.city,
        bio: editUserData.bio,
        interests: editUserData.interests,
        languages: editUserData.languages
      };

      await api.put(`admin/users/${selectedUser.id}`, payload);

      toast.success("Profile updated successfully.");

      setIsEditing(false);

      // Refresh user details
      const res = await api.get(`admin/users/${selectedUser.id}`);
      setSelectedUser(res.data);
      setEditUserData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        gender: res.data.gender || "",
        dateOfBirth: res.data.dateOfBirth || "",
        city: res.data.city || "",
        bio: res.data.bio || "",
        interests: res.data.interests || [],
        languages: res.data.languages || []
      });

      fetchUsers(); // Refresh the users table
    } catch (err) {
      toast.error("Failed to save profile.");
    }
  };

  const handleBanToggle = async (id, isBanned) => {
    if (isBanned) {
      // Unban flow — keep using Swal for simplicity (or replace later if needed)
      Swal.fire({
        title: "Unban User?",
        text: "Are you sure you want to unban this user?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, unban",
        confirmButtonColor: "#4CAF50",
        background: "#fff",
        customClass: { popup: "rounded-lg shadow-lg" },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.patch(`admin/users/${id}/unban`);
            toast.success("User unbanned successfully.");
            fetchUsers();
            if (selectedUser?.id === id) {
              const res = await api.get(`admin/users/${id}`);
              setSelectedUser(res.data);
            }
          } catch (err) {
            toast.error("Unban failed.");
          }
        }
      });
    } else {
      // Open custom ban modal
      setBanData({
        userId: id,
        reason: "",
        duration: "7",
      });
      setBanModalOpen(true);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Soft Delete User?",
      text: "The user can be restored later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#9e9e9e",
      background: "#fff",
      customClass: { popup: "rounded-lg shadow-lg" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`admin/users/${id}`);
          toast.success("User soft deleted.");
          fetchUsers();
          if (selectedUser?.id === id) setModalOpen(false);
        } catch (err) {
          toast.error("Delete failed.");
        }
      }
    });
  };

  const handleRestore = async (id) => {
    Swal.fire({
      title: "Restore User?",
      text: "This will restore the deleted user.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, restore",
      confirmButtonColor: "#4CAF50",
      background: "#fff",
      customClass: { popup: "rounded-lg shadow-lg" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`admin/users/${id}/restore`);
          toast.success("User restored.");
          fetchUsers();
          if (selectedUser?.id === id) {
            const res = await api.get(`admin/users/${id}`);
            setSelectedUser(res.data);
          }
        } catch (err) {
          toast.error("Restore failed.");
        }
      }
    });
  };

  const handleForceDelete = async (id) => {
    Swal.fire({
      title: "Permanently Delete?",
      text: "This action cannot be undone.",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, delete permanently",
      confirmButtonColor: "#c62828",
      background: "#fff",
      customClass: { popup: "rounded-lg shadow-lg" },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`admin/users/${id}/force`);
          toast.success("User permanently deleted.");
          fetchUsers();
          if (selectedUser?.id === id) setModalOpen(false);
        } catch (err) {
          toast.error("Permanent deletion failed.");
        }
      }
    });
  };

  const handleViewUser = async (id) => {
    try {
      const res = await api.get(`admin/users/${id}`);
      setSelectedUser(res.data);
      setEditUserData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        gender: res.data.gender || "",
        dateOfBirth: res.data.dateOfBirth || "",
        city: res.data.city || "",
        bio: res.data.bio || "",
        interests: res.data.interests || [],
        languages: res.data.languages || []
      });
      setModalOpen(true);
    } catch (err) {
      toast.error("Failed to load user details.");
    }
  };

  return (
    <div className="p-3 md:p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-950">Users Management</h1>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <FormControl
          size="small"
          sx={{
            minWidth: 180,
            bgcolor: "white",          
          }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            label="Status"
          >
            <MenuItem value="all">All Users</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
          </Select>
        </FormControl>

        <div className="flex w-full md:w-64 lg:w-80 relative">
          <input
            type="text"
            placeholder="Search by name/email/phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 w-full border-l border-t border-b rounded-l-lg focus:outline-none text-gray-700 pr-8"
          />

          {/* Clear button (shows only if search has value) */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 mr-2 hover:text-gray-600"
              title="Clear"
            >
              <MdClose size={16} />
            </button>
          )}

          <button
            className="px-3 py-2 bg-purple-50 text-purple-950 rounded-r-lg hover:bg-purple-100 border-t border-r border-b"
          >
            <AiOutlineSearch className="text-lg" />
          </button>
        </div>
      </div>

      {/* Table */}
      <Paper
        elevation={3}
        sx={{ borderRadius: "16px", overflow: "hidden" }}
        className="bg-white shadow-lg"
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No users found.</p>
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-purple-100 text-blue-900 text-sm">
              <tr>
                <th className="py-2 px-3 text-left">S. No</th>
                <th className="py-2 px-3 text-left">Name</th>
                <th className="py-2 px-3 text-left">User Name</th>
                <th className="py-2 px-3 text-left">City</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Created</th>
                <th className="py-2 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 hover:bg-gray-50 even:bg-white odd:bg-gray-25"
                >
                  <td className="py-2 px-3 font-medium text-gray-800">{(page - 1) * 12 + (index + 1)}</td>
                  <td className="py-2 px-3">{u.name || "—"}</td>
                  <td className="py-2 px-3 text-gray-700">{u.username}</td>
                  <td className="py-2 px-3 text-gray-700">{u.city}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        u.isBanned
                          ? "bg-red-100 text-red-800"
                          : u.deletedAt
                          ? "bg-gray-100 text-gray-700"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {u.isBanned ? "Banned" : u.deletedAt ? "Deleted" : "Active"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleViewUser(u.id)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="View Details"
                    >
                      <AiOutlineEye size={16} />
                    </button>

                    {u.deletedAt ? (
                      <button
                        onClick={() => handleRestore(u.id)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Restore User"
                      >
                        <TbRotate size={16} />
                      </button>
                    ) : (
                      <>          

                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-500 hover:text-red-600 transition"
                          title="Soft Delete"
                        >
                          <MdDelete size={16} />
                        </button>

                        <button
                          onClick={() => handleBanToggle(u.id, u.isBanned)}
                          className={`px-2 py-1 text-xs rounded font-medium flex items-center justify-center ${
                            u.isBanned ? " text-green-600" : " text-red-600"}`}
                        >
                          {u.isBanned ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
                        </button>
                        
                      </>
                    )}

                    {/* <button
                      onClick={() => handleForceDelete(u.id)}
                      className="text-gray-600 hover:text-red-700 transition"
                      title="Permanent Delete"
                    >
                      <TbBolt size={16} />
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Paper>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-5 space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                page === i + 1
                  ? "bg-purple-600 text-white shadow"
                  : "bg-white text-purple-600 hover:bg-purple-50"
              } border border-purple-100`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Ban User Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setBanModalOpen(false)}
              aria-label="Close"
            >
              <MdClose size={24} />
            </button>

            <h3 className="text-xl font-bold text-center text-blue-950 mb-4">Ban User</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ban Reason *</label>
                <textarea
                  value={banData.reason}
                  onChange={(e) => setBanData({ ...banData, reason: e.target.value })}
                  placeholder="Enter reason for banning this user..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows="4"
                />
                {!banData.reason.trim() && (
                  <p className="text-red-500 text-xs mt-1">Reason is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={banData.duration}
                  onChange={(e) => setBanData({ ...banData, duration: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="1">1 Day</option>
                  <option value="7">1 Week</option>
                  <option value="30">1 Month</option>
                  <option value="90">3 Months</option>
                  <option value="365">1 Year</option>
                  <option value="36500">100 Years (Permanent)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setBanModalOpen(false)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                  onClick={async () => {
                    if (!banData.reason.trim()) {
                      toast.error("Please enter a ban reason.");
                      return;
                    }

                    let bannedUntil = null;
                    const days = parseInt(banData.duration);
                    const date = new Date();
                    if (days !== 36500) {
                      date.setDate(date.getDate() + days);
                    } else {
                      date.setFullYear(date.getFullYear() + 100);
                    }
                    bannedUntil = date.toISOString();

                    try {
                      // 🔹 Step 1: Ban the user
                      await api.patch(`admin/users/${banData.userId}/ban`, {
                        banReason: banData.reason,
                        bannedUntil,
                      });

                      // 🔹 Step 2: Try sending the notification — don't fail the flow if it errors
                      try {
                        const notificationPayload = {
                          title: "Account Restricted",
                          body:
                            days === 36500
                              ? "Your account has been permanently banned due to policy violations."
                              : `Your account has been temporarily banned for ${days} days due to: ${banData.reason}.`,
                          data: {
                            type: "account_ban",
                            duration: days === 36500 ? "permanent" : `${days} days`,
                            reason: banData.reason,
                          },
                        };

                        await api.post("/notifications/send-to-users", {
                          userIds: [banData.userId],
                          ...notificationPayload,
                        });
                      } catch (notifyErr) {
                        console.warn("⚠️ Notification skipped due to FCM issue:", notifyErr.message);
                      }

                      // 🔹 Step 3: Refresh UI & show success
                      toast.success("User banned successfully.");
                      fetchUsers();
                      if (selectedUser?.id === banData.userId) {
                        const res = await api.get(`admin/users/${banData.userId}`);
                        setSelectedUser(res.data);
                      }
                      setBanModalOpen(false);
                    } catch (err) {
                      toast.error("Ban failed.");
                    }
                  }}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Ban User
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 bg-white rounded-full p-1 shadow"
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              <MdClose size={24} />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-950">User Profile</h2>

            {/* Profile Photo + Online Dot */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <img
                  src={selectedUser.photo || "/app_icon.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
                />
                {selectedUser.isOnline && (
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editUserData?.name || ""}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="mt-2 text-lg font-semibold text-center border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 w-full max-w-xs"
                />
              ) : (
                <>
                  <p className="mt-2 text-lg font-semibold">{selectedUser.name || "—"}</p>
                  <p className="text-gray-500 text-sm">@{selectedUser.username || "—"}</p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 mb-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 text-gray-500 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">            
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Basic Info</h3>
                {isEditing ? (
                  <>
                    <TextField
                      label="Email"
                      type="email"
                      value={editUserData?.email || ""}
                      onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />

                    <TextField
                      label="Phone"
                      type="text"
                      value={editUserData?.phone || ""}
                      onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />

                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        labelId="gender-label"
                        value={editUserData?.gender || ""}
                        onChange={(e) => setEditUserData({ ...editUserData, gender: e.target.value })}
                        label="Gender"
                      >
                        <MenuItem value="">—</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Date of Birth"
                      type="date"
                      value={editUserData?.dateOfBirth ? new Date(editUserData.dateOfBirth).toISOString().split('T')[0] : ""}
                      onChange={(e) => setEditUserData({ ...editUserData, dateOfBirth: e.target.value })}
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      variant="outlined"
                    />

                    <TextField
                      label="City"
                      type="text"
                      value={editUserData?.city || ""}
                      onChange={(e) => setEditUserData({ ...editUserData, city: e.target.value })}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />

                    <TextField
                      label="Bio"
                      multiline
                      rows={3}
                      value={editUserData?.bio || ""}
                      onChange={(e) => setEditUserData({ ...editUserData, bio: e.target.value })}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                    />

                    
                  </>
                ) : (
                  <>
                    <Typography variant="body2">
                      <strong>ID:</strong> {selectedUser.id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedUser.email || "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedUser.phone || "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {selectedUser.gender || "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>DOB:</strong> {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>City:</strong> {selectedUser.city || "—"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Bio:</strong> {selectedUser.bio || "—"}
                    </Typography>
                  </>
                )}
              </div>

              {/* Preferences */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Preferences</h3>
                {isEditing ? (
                  <>
                    {/* Interests */}
                    <FormControl fullWidth variant="outlined" margin="dense">
                      <InputLabel id="pref-interests-label">Interests</InputLabel>
                      <Select
                        labelId="pref-interests-label"
                        multiple
                        value={editUserData?.interests || []}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 8) {
                            setEditUserData({ ...editUserData, interests: value });
                          }
                        }}
                        renderValue={(selected) => selected.join(", ")}
                        label="Interests"
                      >
                        {predefinedInterests.map((interest) => (
                          <MenuItem
                            key={interest}
                            value={interest}
                            disabled={
                              editUserData?.interests?.length >= 8 &&
                              !editUserData.interests.includes(interest)
                            }
                          >
                            {interest}
                          </MenuItem>
                        ))}
                      </Select>
                      {editUserData?.interests?.length < 4 && (
                        <Typography variant="caption" color="error">
                          Please select at least 4 interests.
                        </Typography>
                      )}
                    </FormControl>

                    {/* Languages */}
                    <FormControl fullWidth variant="outlined" margin="dense">
                      <InputLabel id="pref-languages-label">Languages</InputLabel>
                      <Select
                        labelId="pref-languages-label"
                        multiple
                        value={editUserData?.languages || []}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 4) {
                            setEditUserData({ ...editUserData, languages: value });
                          }
                        }}
                        renderValue={(selected) => selected.join(", ")}
                        label="Languages"
                      >
                        {predefinedLanguages.map((language) => (
                          <MenuItem
                            key={language}
                            value={language}
                            disabled={
                              editUserData?.languages?.length >= 4 &&
                              !editUserData.languages.includes(language)
                            }
                          >
                            {language}
                          </MenuItem>
                        ))}
                      </Select>
                      {editUserData?.languages?.length < 1 && (
                        <Typography variant="caption" color="error">
                          Please select at least 1 language.
                        </Typography>
                      )}
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Interests:
                    </Typography>
                    {selectedUser.interests?.length ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedUser.interests.map((i) => (
                          <Chip
                            key={i}
                            label={i}
                            size="small"
                            sx={{ backgroundColor: "#e3f2fd", color: "#1976d2" }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        —
                      </Typography>
                    )}

                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                      gutterBottom
                    >
                      Languages:
                    </Typography>
                    {selectedUser.languages?.length ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selectedUser.languages.map((l) => (
                          <Chip
                            key={l}
                            label={l}
                            size="small"
                            sx={{ backgroundColor: "#e8f5e8", color: "#2e7d32" }}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        —
                      </Typography>
                    )}
                  </>
                )}
              </div>

              {/* Account Status */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">Account Status</h3>
                <p>
                  <span className="font-medium">Profile Complete:</span>{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedUser.isProfileComplete ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {selectedUser.isProfileComplete ? "Yes" : "No"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Banned:</span>{" "}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedUser.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}>
                    {selectedUser.isBanned ? "Yes" : "No"}
                  </span>
                </p>
                {selectedUser.isBanned && (
                  <>
                    <p><span className="font-medium">Reason:</span> <span className="italic">{selectedUser.banReason || "—"}</span></p>
                    <p><span className="font-medium">Banned Until:</span> {selectedUser.bannedUntil || "—"}</p>
                  </>
                )}
              </div>

              {/* System Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-blue-900 mb-2">System Info</h3>
                <p><span className="font-medium">Created:</span> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                <p><span className="font-medium">Updated:</span> {new Date(selectedUser.updatedAt).toLocaleString()}</p>
                {selectedUser.deletedAt && (
                  <p className="text-red-600">
                    <span className="font-medium">Deleted:</span> {new Date(selectedUser.deletedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>            

            {/* Sticky Footer Action Buttons */}
            <div className="mt-6 sticky bottom-0 bg-white py-3 flex flex-wrap gap-2 justify-center border-t">
              {selectedUser.deletedAt ? (
                <button
                  onClick={() => handleRestore(selectedUser.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1"
                >
                  <TbRotate size={16} /> Restore
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleBanToggle(selectedUser.id, selectedUser.isBanned)}
                    className={`px-4 py-2 rounded-lg text-white flex items-center gap-1 ${
                      selectedUser.isBanned
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {selectedUser.isBanned ? <BiUserCheck size={16} /> : <BiUserX size={16} />}
                    {selectedUser.isBanned ? "Unban User" : "Ban User"}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedUser.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"
                  >
                    <RiDeleteBin6Line size={16} /> Delete
                  </button>
                </>
              )}
              <button
                onClick={() => handleForceDelete(selectedUser.id)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-1"
              >
                <TbBolt size={16} /> Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover        
      />
    </div>
  );
};

export default UsersPage;
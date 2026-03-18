// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   IconButton,
//   MenuItem,
//   CircularProgress,
//   Tooltip,
// } from "@mui/material";
// import { Edit, Delete } from "@mui/icons-material";
// import Swal from "sweetalert2";
// import api from "../../../services/api";

// const CallRatesTab = () => {
//   const [rates, setRates] = useState([]);
//   const [form, setForm] = useState({ type: "", rate: "" });
//   const [editingId, setEditingId] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchRates = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/call-rates");
//       setRates(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//       Swal.fire("Error", "Failed to fetch call rates", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRates();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       if (editingId) {
//         await api.put(`/call-rates/${editingId}`, { rate: form.rate });
//         Swal.fire("Updated!", "Call rate updated successfully", "success");
//       } else {
//         await api.post("/call-rates", form);
//         Swal.fire("Added!", "Call rate created successfully", "success");
//       }
//       setForm({ type: "", rate: "" });
//       setEditingId(null);
//       fetchRates();
//     } catch (err) {
//       Swal.fire(
//         "Error",
//         err.response?.data?.message || "Failed to save call rate",
//         "error"
//       );
//     }
//   };

//   const handleEdit = (rate) => {
//     setEditingId(rate.id);
//     setForm({ type: rate.type, rate: rate.rate });
//   };

//   const handleDelete = async (id) => {
//     const confirm = await Swal.fire({
//       title: "Delete this rate?",
//       text: "This action cannot be undone.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//     });
//     if (!confirm.isConfirmed) return;

//     try {
//       await api.delete(`/call-rates/${id}`);
//       Swal.fire("Deleted!", "Call rate deleted successfully", "success");
//       fetchRates();
//     } catch (err) {
//       Swal.fire("Error", "Failed to delete rate", "error");
//     }
//   };

//   return (
//     <Box>
//       {/* Header */}
//       <Box className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-gray-700">Call Rates Management</h2>
//       </Box>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="flex gap-4 mb-6">
//         <TextField
//           label="Type"
//           select
//           value={form.type}
//           onChange={(e) => setForm({ ...form, type: e.target.value })}
//           disabled={editingId !== null}
//           required
//           sx={{ minWidth: 150 }}
//         >
//           <MenuItem value="">
//             <em>None</em>
//           </MenuItem>
//           <MenuItem value="audio">Audio</MenuItem>
//           <MenuItem value="video">Video</MenuItem>
//         </TextField>

//         <TextField
//           label="Rate (coins/min)"
//           type="number"
//           value={form.rate}
//           onChange={(e) => setForm({ ...form, rate: e.target.value })}
//           required
//         />

//         <Button type="submit" variant="contained" color="primary">
//           {editingId ? "Update" : "Add"}
//         </Button>
//       </form>

//       {/* Table */}
//       {loading ? (
//         <Box className="flex justify-center mt-10">
//           <CircularProgress />
//         </Box>
//       ) : rates.length === 0 ? (
//         <p className="text-gray-500 text-center mt-6">No call rates found.</p>
//       ) : (
//         <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
//                 <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Rate (coins/min)</th>
//                 <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 bg-white">
//               {rates.map((r, index) => (
//                 <tr key={r.id}>
//                   <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
//                   <td className="px-6 py-4 text-sm font-semibold text-gray-800">{r.type}</td>
//                   <td className="px-6 py-4 text-sm font-semibold text-gray-700">{r.rate}</td>
//                   <td className="px-6 py-4 text-right">
//                     <Tooltip title="Edit">
//                       <IconButton color="primary" onClick={() => handleEdit(r)}>
//                         <Edit />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Delete">
//                       <IconButton color="error" onClick={() => handleDelete(r.id)}>
//                         <Delete />
//                       </IconButton>
//                     </Tooltip>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </Box>
//   );
// };

// export default CallRatesTab;

// src/pages/Coins/components/CallRatesTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  MenuItem,
  CircularProgress,
  Tooltip,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Avatar,
} from "@mui/material";
import { Edit, Delete, Add, VideoCall, Call, Save, Close } from "@mui/icons-material";
import Swal from "sweetalert2";
import api from "../../../services/api";

const CallRatesTab = () => {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({ type: "", rate: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await api.get("/call-rates");
      setRates(res.data.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch call rates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/call-rates/${editingId}`, { rate: form.rate });
        Swal.fire("Updated!", "Call rate updated successfully", "success");
      } else {
        await api.post("/call-rates", form);
        Swal.fire("Added!", "Call rate created successfully", "success");
      }
      setForm({ type: "", rate: "" });
      setEditingId(null);
      fetchRates();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save call rate",
        "error"
      );
    }
  };

  const handleEdit = (rate) => {
    setEditingId(rate.id);
    setForm({ type: rate.type, rate: rate.rate });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ type: "", rate: "" });
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this rate?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/call-rates/${id}`);
      Swal.fire("Deleted!", "Call rate deleted successfully", "success");
      fetchRates();
    } catch (err) {
      Swal.fire("Error", "Failed to delete rate", "error");
    }
  };

  const getCallTypeIcon = (type) => {
    return type === 'video' ? <VideoCall /> : <Call />;
  };

  const getCallTypeColor = (type) => {
    return type === 'video' ? 'primary' : 'success';
  };

  return (
    <Box>
      {/* Add/Edit Form Card */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          border: '2px solid',
          borderColor: editingId ? 'warning.main' : 'primary.main',
          bgcolor: editingId ? 'warning.50' : 'primary.50'
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="600">
              {editingId ? 'Edit Call Rate' : 'Add New Call Rate'}
            </Typography>
            {editingId && (
              <Chip 
                label="Editing Mode" 
                color="warning" 
                size="small"
                onDelete={handleCancel}
                deleteIcon={<Close />}
              />
            )}
          </Box>

          <form onSubmit={handleSubmit}>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="flex-start">
              <TextField
                label="Call Type"
                select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                disabled={editingId !== null}
                required
                sx={{ minWidth: 200, bgcolor: 'white' }}
                size="medium"
              >
                <MenuItem value="">
                  <em>Select Type</em>
                </MenuItem>
                <MenuItem value="audio">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Call fontSize="small" color="success" />
                    Audio Call
                  </Box>
                </MenuItem>
                <MenuItem value="video">
                  <Box display="flex" alignItems="center" gap={1}>
                    <VideoCall fontSize="small" color="primary" />
                    Video Call
                  </Box>
                </MenuItem>
              </TextField>

              <TextField
                label="Rate (coins/min)"
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                required
                sx={{ minWidth: 200, bgcolor: 'white' }}
                size="medium"
                inputProps={{ min: 1, step: 1 }}
              />

              <Box display="flex" gap={1}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color={editingId ? "warning" : "primary"}
                  size="large"
                  startIcon={editingId ? <Save /> : <Add />}
                  sx={{ px: 3 }}
                >
                  {editingId ? "Update Rate" : "Add Rate"}
                </Button>
                
                {editingId && (
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    size="large"
                    onClick={handleCancel}
                    startIcon={<Close />}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Rates Table */}
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="600">
            Current Call Rates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage pricing for audio and video calls
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : rates.length === 0 ? (
          <Box py={8}>
            <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
              No call rates configured yet. Add your first rate using the form above.
            </Alert>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>#</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Call Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Rate per Minute</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((r, index) => (
                  <tr 
                    key={r.id}
                    style={{ 
                      backgroundColor: editingId === r.id ? '#fff3e0' : 'white',
                      borderBottom: '1px solid #e0e0e0'
                    }}
                  >
                    <td style={{ padding: '20px 16px' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {index + 1}
                      </Typography>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar 
                          sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: r.type === 'video' ? 'primary.light' : 'success.light',
                            color: '#fff'
                          }}
                        >
                          {getCallTypeIcon(r.type)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={600} textTransform="capitalize">
                            {r.type} Call
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.type === 'video' ? 'Video Communication' : 'Voice Communication'}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <Chip 
                        label={`${r.rate} coins/min`}
                        color={getCallTypeColor(r.type)}
                        sx={{ fontWeight: 600, fontSize: '0.9rem' }}
                      />
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                      <Tooltip title="Edit Rate">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleEdit(r)}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Rate">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(r.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CallRatesTab;
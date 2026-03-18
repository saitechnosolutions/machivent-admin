// src/pages/Calls/CallsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Pagination,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
} from "@mui/material";
import { Search, Call, Videocam, Visibility, Star, StarBorder } from "@mui/icons-material";
import api from "../../services/api";

const statusColors = {
  ended: "success",
  missed: "error",
  cancelled: "warning",
  rejected: "default",
  accepted: "info",
};

const StarRating = ({ rating = 0 }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rating ? (
        <Star key={i} sx={{ color: "#facc15", fontSize: 22 }} /> // yellow filled star
      ) : (
        <StarBorder key={i} sx={{ color: "#facc15", fontSize: 22 }} /> // outline
      )
    );
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

// map status => tailwind badge classes
const statusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "ended":
      return "text-green-700 bg-green-100";
    case "missed":
      return "text-red-700 bg-red-100";
    case "cancelled":
      return "text-yellow-700 bg-yellow-100";
    case "rejected":
      return "text-gray-700 bg-gray-200";
    case "accepted":
      return "text-blue-600 bg-blue-100";
    default:
      return "bg-gray-800 text-white";
  }
};

const formatDuration = (duration) =>
  duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : "-";

const CallsPage = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCall, setSelectedCall] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const limit = 10;

  // 🔹 Debounce timeout ref
  const [typingTimeout, setTypingTimeout] = useState(null);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const params = {
        limit,
        offset: (page - 1) * limit,
        search,
      };

      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.callType = typeFilter;

      const res = await api.get("/admin/call", { params });
      const { data, total } = res.data;
      setCalls(data || []);
      setTotalPages(Math.ceil((total || 1) / limit));
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Auto-fetch when filters change
  useEffect(() => {
    fetchCalls();
  }, [page, statusFilter, typeFilter]);

  // 🔹 Auto-fetch with debounce when typing search
  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setPage(1);
      fetchCalls();
    }, 500); // 500ms delay
    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleOpenModal = (call) => {
    setSelectedCall(call);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCall(null);
  };

  return (
    <div className="p-6 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <div className="bg-gray-50 px-6 py-5 flex justify-center items-center">
          <h1 className="text-2xl font-bold text-gray-800">Calls History</h1>
        </div>

        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          {/* Search */}
         <TextField
            size="small"
            variant="outlined"
            placeholder="Search by username"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Auto-search as user types
              if (e.target.value.trim() === "") fetchCalls();
            }}
            InputProps={{
              endAdornment: (
                <>
                  {search && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearch("");
                        fetchCalls(); // Refresh results when cleared
                      }}
                    >
                      ✕
                    </IconButton>
                  )}
                </>
              ),
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          {/* Status Filter */}
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ended">Ended</MenuItem>
            <MenuItem value="missed">Missed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
          </TextField>

          {/* Call Type Filter */}
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setPage(1);
              setTypeFilter(e.target.value);
            }}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="audio">Audio</MenuItem>
            <MenuItem value="video">Video</MenuItem>
          </TextField>

          {/* Manual Search Icon (optional, for UX) */}
          <Tooltip title="Search">
            <IconButton color="primary" onClick={() => fetchCalls()}>
              <Search />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={10}>
          <CircularProgress />
        </Box>
      ) : (
        // Outer rounded container
        <div className="rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Scrollable area: header will scroll together with rows */}
          <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
            <table className="min-w-full w-full table-auto">
              <thead>
                <tr className="bg-purple-100">
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">S. No</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Caller</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Receiver</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Type</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Status</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Duration</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Created</th>
                  <th className="text-left text-blue-900 font-bold text-sm px-4 py-3 border-b">Action</th>
                </tr>
              </thead>

              <tbody>
                {calls.length > 0 ? (
                  calls.map((call, index) => (
                    <tr
                      key={call.id}
                      className="bg-white hover:bg-purple-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-7 border-b align-top">
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* Caller */}
                      <td className="px-4 py-4 border-b align-top">
                        <div className="flex items-center gap-3">
                          <img
                            src={call.fromUser?.photo || "/app_icon.png"}
                            alt={call.fromUser?.name || "caller"}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {call.fromUser?.name || "Unknown"}
                            </span>                            
                          </div>
                        </div>
                      </td>

                      {/* Receiver */}
                      <td className="px-4 py-4 border-b align-top">
                        <div className="flex items-center gap-3">
                          <img
                            src={call.toUser?.photo || "/app_icon.png"}
                            alt={call.toUser?.name || "receiver"}
                            className="w-14 h-14 rounded-full object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {call.toUser?.name || "Unknown"}
                            </span>                            
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-7 border-b align-top">
                        <div className="flex items-center gap-2">
                          {call.callType === "video" ? <Videocam className="text-blue-700" /> : <Call className="text-blue-700" />}
                          <span className="text-sm text-gray-700 capitalize">{call.callType || "-"}</span>
                        </div>
                      </td>

                      {/* Status badge (custom) */}
                      <td className="px-4 py-7 border-b align-top">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${statusBadgeClass(
                            call.status
                          )}`}
                        >
                          {call.status || "-"}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-7 border-b align-top">
                        <span className="text-sm text-gray-700">
                          {formatDuration(call.duration)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-7 border-b align-top">
                        <span className="text-sm text-gray-700">
                          {call.createdAt ? new Date(call.createdAt ?? 0).toLocaleString() : "-"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-7 border-b align-top">
                        <button
                          onClick={() => handleOpenModal(call)}
                          className="p-1 rounded hover:bg-gray-100 transition"
                          aria-label="View details"
                        >
                          <Visibility />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-gray-500">
                      No call records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>

      {/* Custom Modal */}
      {modalOpen && selectedCall && (
        <div
          className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-purple-900 mb-4 text-center">
              Call Details
            </h2>

            <div className="flex justify-around items-center mb-6 flex-wrap gap-4">
              <UserCard user={selectedCall.fromUser} role="Caller" />
              <div className="text-3xl font-bold text-purple-900">→</div>
              <UserCard user={selectedCall.toUser} role="Receiver" />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <Detail label="Type" value={selectedCall.callType} />
              <Detail label="Status" value={selectedCall.status} />
              <Detail
                label="Duration"
                value={selectedCall.duration ? `${Math.floor(selectedCall.duration / 60)}m ${selectedCall.duration % 60}s` : "-"}                
              />
              <Detail label="Channel" value={selectedCall.channelName || "-"} />
              <Detail
                label="Started At"
                value={
                  selectedCall.startedAt
                    ? new Date(selectedCall.startedAt ?? 0).toLocaleString()
                    : "-"
                }
              />
              <Detail
                label="Ended At"
                value={
                  selectedCall.endedAt
                    ? new Date(selectedCall.endedAt ?? 0).toLocaleString()
                    : "-"
                }
              />
              {/* <div className="flex flex-col">
                <span className="text-sm text-gray-500">Caller Rating</span>
                {selectedCall.callerRating ? (
                  <StarRating rating={selectedCall.callerRating} />
                ) : (
                  <span className="text-gray-700">-</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Receiver Rating</span>
                {selectedCall.receiverRating ? (
                  <StarRating rating={selectedCall.receiverRating} />
                ) : (
                  <span className="text-gray-700">-</span>
                )}
              </div> */}

              {/* <Detail label="Caller Comment" value={selectedCall.callerComment || "-"} />
              <Detail label="Receiver Comment" value={selectedCall.receiverComment || "-"} /> */}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2 bg-purple-800 text-white rounded-xl hover:bg-purple-700 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🔹 Reusable detail item
const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

// 🔹 Reusable user card
const UserCard = ({ user, role }) => (
  <div className="flex flex-col items-center bg-purple-50 p-4 rounded-xl w-40 shadow-md">
    <img
      src={user?.photo || "/app_icon.png"}
      alt={role}
      className="w-20 h-20 rounded-full object-cover mb-2"
    />
    <h3 className="font-semibold text-gray-800 text-center">
      {user?.name || "-"}
    </h3>
    <span className="text-xs text-gray-500">ID: {user?.id || "-"}</span>
    <p className="text-sm text-purple-900">{role}</p>
  </div>
);

export default CallsPage;
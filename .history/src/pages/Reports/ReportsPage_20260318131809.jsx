// src/pages/Reports/ReportsPage.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import "react-datepicker/dist/react-datepicker.css";

  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
  }

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0); // ✅ new state for total count

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, startDate, endDate]);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get("/reports", {
          params: {
            page,
            limit,
            status: statusFilter,
            search: debouncedSearch,
            startDate: startDate ? startDate.toISOString().split("T")[0] : undefined,
            endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
          },
        });
        setReports(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
        Swal.fire("Error!", "Failed to load reports.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [page, limit, statusFilter, debouncedSearch, startDate, endDate]);

  // Handle status update
  const handleStatusChange = async (reportId, newStatus) => {
    try {
      // Update status in DB
      const res = await api.put(`/reports/${reportId}`, { status: newStatus });

      // Update UI instantly
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      Swal.fire("Updated!", "Report status has been updated.", "success");

      // ✅ Send notification to reporter
      try {
        // Find the updated report to get reporter info
        const updatedReport = reports.find((r) => r.id === reportId);
        if (updatedReport?.reporter?.id) {
          let title = "";
          let body = "";

          switch (newStatus) {
            case "reviewed":
              title = "Report Reviewed";
              body = "Your report has been reviewed by our team.";
              break;

            case "action_taken":
              title = "Action Taken";
              body = "We’ve taken appropriate action based on your report.";
              break;

            case "pending":
              title = "Report Pending";
              body = "Your report is awaiting review. Thank you for your patience.";
              break;

            default:
              title = "Report Update";
              body = "The status of your report has been updated.";
              break;
          }

          const notificationPayload = {
            title,
            body,
            data: {
              type: "report_update",
              reportId: String(reportId),
              newStatus,
            },
          };

          await api.post("/notifications/send-to-users", {
            userIds: [updatedReport.reporter.id],
            ...notificationPayload,
          });
        }

      } catch (notifyErr) {
        console.warn("Notification failed:", notifyErr);
        Swal.fire({
          icon: "info",
          title: "Status updated, but notification failed",
          text: notifyErr.response?.data?.error || "Couldn't send notification",
          confirmButtonColor: "#1976d2",
        });
      }
    } catch (error) {
      console.error("Failed to update report:", error);
      Swal.fire("Error!", "Failed to update report.", "error");
    }
  };

  // Handle delete
  const handleDelete = async (reportId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9370DB",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/reports/${reportId}`);
        setReports((prevReports) =>
          prevReports.filter((report) => report.id !== reportId)
        );
        Swal.fire("Deleted!", "The report has been deleted.", "success");
      } catch (error) {
        console.error("Failed to delete report:", error);
        Swal.fire("Error!", "Failed to delete report.", "error");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-5 flex justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          User Reports
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 px-6 py-4  flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reviewed">Reviewed</MenuItem>
              <MenuItem value="action_taken">Action Taken</MenuItem>
            </Select>
          </FormControl>
          
          <input
            type="text"
            placeholder="Search by user, reporter, or reason..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
          />

          <div className="flex space-x-2 items-center">
            {/* Start Date */}
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
            />

            {/* End Date */}
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
            />

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg border border-gray-300 transition"
            >
              Clear
            </button>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-purple-700">Loading reports...</div>
              </div>
            ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.827-6.08-2.147M12 6V4m0 2a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              <p className="text-lg">No reports found.</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 border border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Reported User
                      </label>
                      <p className="text-gray-800 font-medium">
                        {report.reported?.name || "—"}{" "}
                        {report.reported?.id && (
                          <span className="text-gray-500 text-sm">(ID: {report.reported.id})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Reporter
                      </label>
                      <p className="text-gray-800 font-medium">
                        {report.reporter?.name || "—"}{" "}
                        {report.reporter?.id && (
                          <span className="text-gray-500 text-sm">(ID: {report.reporter.id})</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Reason
                      </label>
                      <p className="text-gray-800">{report.reason || "—"}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Created
                      </label>
                      <p className="text-gray-600">
                        {new Date(report.createdAt).toLocaleString() ?? 0}
                      </p>
                    </div>
                  </div>

                  {report.description && (
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Description
                      </label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                        {report.description}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id={`status-label-${report.id}`}>Status</InputLabel>
                        <Select
                          labelId={`status-label-${report.id}`}
                          value={report.status}
                          label="Status"
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="reviewed">Reviewed</MenuItem>
                          <MenuItem value="action_taken">Action Taken</MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <button
                      onClick={() => handleDelete(report.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                    >
                      Delete Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center mt-8 pb-6">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              variant="outlined"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#4B5563", // text-gray-700
                  borderRadius: "8px",
                },
                "& .Mui-selected": {
                  backgroundColor: "#9370DB !important", // purple-500
                  color: "white !important",
                },
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

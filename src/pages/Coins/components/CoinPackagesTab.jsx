// src/pages/Coins/components/CoinPackagesTab.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Box, Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import PackageModal from "./PackageModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CoinPackagesTab = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/packages/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setPackages(res.data.data || res.data.packages || res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Package?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/packages/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      Swal.fire("Deleted!", "Package has been removed.", "success");
      fetchPackages();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete package", "error");
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Coin Packages</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          Add Package
        </Button>
      </Box>

      {/* Table Section */}
      {loading ? (
        <Box className="flex justify-center mt-10">
          <CircularProgress />
        </Box>
      ) : packages.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No packages found.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Coins</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Price (₹)</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {packages.map((pkg, index) => (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{pkg.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{pkg.coins}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{pkg.price}</td>
                  <td className="px-6 py-4 text-right">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditData(pkg);
                          setModalOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(pkg.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <PackageModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editData={editData}
          refresh={fetchPackages}
        />
      )}
    </Box>
  );
};

export default CoinPackagesTab;

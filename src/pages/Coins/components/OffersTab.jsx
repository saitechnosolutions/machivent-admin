// src/pages/Coins/components/OffersTab.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Box, Button, CircularProgress, IconButton, Tooltip, Chip } from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import OfferModal from "./OfferModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const OffersTab = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/offer/list`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      setOffers(res.data.data || res.data.offers || res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch offers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Offer?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/offer/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      Swal.fire("Deleted!", "Offer has been removed.", "success");
      fetchOffers();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete offer", "error");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <Box>
      {/* Header */}
      <Box className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Offers</h2>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          Add Offer
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box className="flex justify-center mt-10">
          <CircularProgress />
        </Box>
      ) : offers.length === 0 ? (
        <p className="text-gray-500 text-center mt-6">No offers found.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Target</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Validity</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {offers.map((offer, index) => (
                <tr key={offer.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{offer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <Chip
                      label={offer.type.replace("_", " ")}
                      color={offer.type === "bonus_coins" ? "success" : "info"}
                      size="small"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{offer.value}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {offer.targetType === "global" ? "Global" : "Specific Users"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(offer.validFrom).toLocaleDateString()} -{" "}
                    {new Date(offer.validTo).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditData(offer);
                          setModalOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(offer.id)}>
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

      {modalOpen && (
        <OfferModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editData={editData}
          refresh={fetchOffers}
        />
      )}
    </Box>
  );
};

export default OffersTab;

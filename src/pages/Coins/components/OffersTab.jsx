// src/pages/Coins/components/OffersTab.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Typography,
  Alert,
  Avatar
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  Public,
  People,
  CalendarToday,
  Discount
} from "@mui/icons-material";
import OfferModal from "./OfferModal";
import api from "../../../services/api";
import dayjs from "dayjs";

const OffersTab = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/offer/list");
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
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/offer/${id}`);
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

  const getOfferTypeLabel = (type) => {
    return type === "bonus_coins" ? "Bonus Coins" : "Call Rate Discount";
  };

  const getOfferTypeColor = (type) => {
    return type === "bonus_coins" ? "success" : "info";
  };

  const isOfferActive = (offer) => {
    const now = new Date();
    const validFrom = new Date(offer.validFrom);
    const validTo = new Date(offer.validTo);
    return now >= validFrom && now <= validTo && offer.isActive;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="600">
            Promotional Offers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage special offers for users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          sx={{ px: 3, borderRadius: 2 }}
        >
          Create Offer
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={48} />
        </Box>
      ) : offers.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 2, p: 8 }}>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>No offers available</Typography>
            <Typography variant="body2">
              Create promotional offers to boost user engagement and purchases.
            </Typography>
          </Alert>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="600">
              All Offers
            </Typography>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>#</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Offer Details</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Type & Value</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Target</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Validity Period</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer, index) => {
                  const active = isOfferActive(offer);
                  return (
                    <tr
                      key={offer.id}
                      style={{
                        backgroundColor: 'white',
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
                              width: 48,
                              height: 48,
                              bgcolor: offer.type === 'bonus_coins' ? 'success.light' : 'info.light',
                              color: '#fff'
                            }}
                          >
                            {offer.type === 'bonus_coins' ? <LocalOffer /> : <Discount />}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {offer.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {offer.id}
                            </Typography>
                          </Box>
                        </Box>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <Box>
                          <Chip
                            label={getOfferTypeLabel(offer.type)}
                            color={getOfferTypeColor(offer.type)}
                            size="small"
                            sx={{ mb: 0.5 }}
                          />
                          <Typography variant="h6" fontWeight="700" color="primary.main">
                            {offer.value}%
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {offer.targetType === "global" ? (
                            <>
                              <Public fontSize="small" color="primary" />
                              <Typography variant="body2">Global</Typography>
                            </>
                          ) : (
                            <>
                              <People fontSize="small" color="action" />
                              <Typography variant="body2">Selected Users</Typography>
                            </>
                          )}
                        </Box>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Start:
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={500}>
                          {dayjs(offer.validFrom).format('MMM DD, YYYY')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          End: {dayjs(offer.validTo).format('MMM DD, YYYY')}
                        </Typography>
                      </td>
                      <td style={{ padding: '20px 16px' }}>
                        <Chip
                          label={active ? "Active" : "Inactive"}
                          color={active ? "success" : "default"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                        <Tooltip title="Edit Offer">
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
                        <Tooltip title="Delete Offer">
                          <IconButton color="error" onClick={() => handleDelete(offer.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
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
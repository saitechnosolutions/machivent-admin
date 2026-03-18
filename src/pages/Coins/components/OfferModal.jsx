// src/pages/Coins/components/OfferModal.jsx
import React, { useState, useEffect } from "react";
import { Autocomplete } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  InputAdornment,
  Divider,
  Alert,
  Chip
} from "@mui/material";
import {
  LocalOffer,
  Percent,
  Public,
  People,
  CalendarToday,
  Close,
  Save
} from "@mui/icons-material";
import Swal from "sweetalert2";
import api from "../../../services/api";

const OfferModal = ({ open, onClose, editData, refresh }) => {
  const [form, setForm] = useState({
    name: editData?.name || "",
    type: editData?.type || "bonus_coins",
    value: editData?.value || "",
    targetType: editData?.targetType || "global",
    userIds: editData?.assignedUsers?.map((u) => u.userId).join(",") || "",
    validFrom: editData?.validFrom?.split("T")[0] || "",
    validTo: editData?.validTo?.split("T")[0] || "",
    isActive: editData?.isActive ?? true,
  });
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(
    editData?.assignedUsers?.map((u) => ({ id: u.userId, name: u.name })) || []
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/dashboard/users");
        const validUsers = (res.data.users || []).filter((u) => !u.isBanned);
        setUsers(validUsers);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load users", "error");
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.value || !form.validFrom || !form.validTo)
      return Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please fill all required fields",
        didOpen: (popup) => {
          popup.style.zIndex = 99999;
          const backdrop = document.querySelector('.swal2-container');
          if (backdrop) backdrop.style.zIndex = 99998;
        },
      });

    if (Number(form.value) <= 0 || Number(form.value) > 100) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid value",
        text: "Value must be between 1 and 100 percent",
        didOpen: (popup) => {
          popup.style.zIndex = 99999;
          const backdrop = document.querySelector('.swal2-container');
          if (backdrop) backdrop.style.zIndex = 99998;
        },
      });
    }

    if (new Date(form.validFrom) > new Date(form.validTo)) {
      // return Swal.fire("Invalid dates", "Start date must be before end date", "warning");
      return Swal.fire({
        icon: "warning",
        title: "Invalid dates",
        text: "Start date must be before end date",
        didOpen: (popup) => {
          popup.style.zIndex = 99999;
          const backdrop = document.querySelector('.swal2-container');
          if (backdrop) backdrop.style.zIndex = 99998;
        },
      });
    }

    try {
      const payload = {
        name: form.name,
        type: form.type,
        value: Number(form.value),
        targetType: form.targetType,
        validFrom: form.validFrom,
        validTo: form.validTo,
        isActive: form.isActive,
        userIds:
          form.targetType === "selected_users"
            ? selectedUsers.map((u) => u.id)
            : [],
      };

      let response;
      if (editData) {
        response = await api.put(`/offer/${editData.id}`, payload);
        Swal.fire("Updated!", "Offer updated successfully", "success");
      } else {
        response = await api.post("/offer", payload);
        Swal.fire("Created!", "Offer created successfully", "success");
      }

      // 🔥 Send notification ONLY when creating a new offer
      if (!editData) {
        try {
          const notificationPayload = {
            title: "New Offer Available!",
            body:
              form.type === "bonus_coins"
                ? `Get up to ${form.value}% bonus coins — available now!`
                : `Enjoy a ${form.value}% discount on call rates!`,
            data: {
              type: "offer",
              offerName: String(form.name),
              offerType: String(form.type),
              offerId: String(response.data?.offer?.id || editData?.id),
            },
          };

          if (form.targetType === "selected_users") {
            await api.post("/notifications/send-to-users", {
              userIds: payload.userIds,
              ...notificationPayload,
            });
          } else {
            await api.post("/notifications/broadcast", notificationPayload);
          }
        } catch (notifyErr) {
          console.warn("Notification failed:", notifyErr);
          Swal.fire({
            icon: "info",
            title: "Offer saved, but notification failed",
            text: notifyErr.response?.data?.error || "Couldn't send notification",
            confirmButtonColor: "#1976d2",
          });
        }
      }

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to save offer", "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <LocalOffer />
          <Box>
            <Typography variant="h6" fontWeight="600">
              {editData ? "Edit Promotional Offer" : "Create New Offer"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {editData ? "Update offer details" : "Set up a promotional offer for users"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Offer Name */}
          <TextField
            label="Offer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., New Year Special, Summer Bonus"
            fullWidth
            required
            sx={{
              '& .MuiInputLabel-root': {
                mt: 0.7,
              },
            }}  
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOffer color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Offer Type & Value */}
          <Box display="flex" gap={2}>
            <TextField
              label="Offer Type"
              name="type"
              value={form.type}
              onChange={handleChange}
              select
              fullWidth
              required
            >
              <MenuItem value="bonus_coins">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="Bonus" color="success" size="small" />
                  Bonus Coins
                </Box>
              </MenuItem>
              <MenuItem value="discount_call_rate">
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip label="Discount" color="info" size="small" />
                  Call Rate Discount
                </Box>
              </MenuItem>
            </TextField>

            <TextField
              label={form.type === "bonus_coins" ? "Bonus Percentage" : "Discount Percentage"}
              name="value"
              type="number"
              value={form.value}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1, max: 100, step: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Percent color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="body2" color="text.secondary">%</Typography>
                  </InputAdornment>
                ),
              }}
              helperText="Enter value between 1-100"
            />
          </Box>

          <Divider />

          {/* Target Type */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={form.targetType === "global"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      targetType: e.target.checked ? "global" : "selected_users",
                    })
                  }
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {form.targetType === "global" ? (
                    <>
                      <Public fontSize="small" color="primary" />
                      <Typography variant="body1" fontWeight={500}>
                        Global Offer (All Users)
                      </Typography>
                    </>
                  ) : (
                    <>
                      <People fontSize="small" color="action" />
                      <Typography variant="body1" fontWeight={500}>
                        Selected Users Only
                      </Typography>
                    </>
                  )}
                </Box>
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block', mt: 0.5 }}>
              {form.targetType === "global" 
                ? "This offer will be available to all users"
                : "This offer will only be available to specific users"}
            </Typography>
          </Box>

          {/* User IDs Field */}
          {form.targetType === "selected_users" && (
            <Alert severity="warning" sx={{ borderRadius: 2, bgcolor: 'white' }}>
              <Autocomplete
                multiple
                options={users}
                value={selectedUsers}
                onChange={(e, newValue) => setSelectedUsers(newValue)}
                getOptionLabel={(option) => `${option.name || option.username} (ID: ${option.id})`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Users"
                    placeholder="Search and select users"
                    helperText="Only non-banned users are listed"
                  />
                )}
              />
            </Alert>
          )}

          <Divider />

          {/* Validity Period */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarToday fontSize="small" color="primary" />
              <Typography variant="body1" fontWeight={600}>
                Validity Period
              </Typography>
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                label="Start Date"
                name="validFrom"
                type="date"
                value={form.validFrom}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date"
                name="validTo"
                type="date"
                value={form.validTo}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          {/* Active Status */}
          <Box 
            sx={{ 
              bgcolor: form.isActive ? 'success.50' : 'grey.100', 
              p: 2, 
              borderRadius: 2,
              border: '1px solid',
              borderColor: form.isActive ? 'success.main' : 'grey.300'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight={600}>
                    Offer Status: {form.isActive ? "Active" : "Inactive"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {form.isActive 
                      ? "Users can see and use this offer"
                      : "Offer is hidden from users"}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Preview */}
          {form.name && form.value && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2" fontWeight="600" gutterBottom>
                Offer Preview
              </Typography>
              <Typography variant="body2">
                <strong>{form.name}</strong> - {form.value}% {form.type === "bonus_coins" ? "bonus coins" : "call rate discount"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Available to: {form.targetType === "global" ? "All users" : "Selected users"}
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Close />}
          sx={{ px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Save />}
          sx={{ px: 3 }}
        >
          {editData ? "Update Offer" : "Create Offer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OfferModal;
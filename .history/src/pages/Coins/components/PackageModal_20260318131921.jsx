// src/pages/Coins/components/PackageModal.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  Divider,
  Alert
} from "@mui/material";
import { 
  AccountBalanceWallet, 
  CurrencyRupee, 
  Label,
  Close,
  Save
} from "@mui/icons-material";
import Swal from "sweetalert2";
import api from "../../../services/api";

const PackageModal = ({ open, onClose, editData, refresh }) => {
  const [form, setForm] = useState({
    name: editData?.name || "",
    coins: editData?.coins || "",
    price: editData?.price || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.coins || !form.price)
      // return Swal.fire("Missing fields", "Name, coins, and price are required", "warning");
      return Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Name, coins, and price are required",
        didOpen: (popup) => {
          popup.style.zIndex = 99999;
          const backdrop = document.querySelector('.swal2-container');
          if (backdrop) backdrop.style.zIndex = 99998;
        },
      });

    if (Number(form.coins) <= 0 || Number(form.price) <= 0) {
      // return Swal.fire("Invalid values", "Coins and price must be greater than zero", "warning");
      return Swal.fire({
        icon: "warning",
        title: "Invalid values",
        text: "Coins and price must be greater than zero",
        didOpen: (popup) => {
          popup.style.zIndex = 99999;
          const backdrop = document.querySelector('.swal2-container');
          if (backdrop) backdrop.style.zIndex = 99998;
        },
      });
    }

    try {
      let response;

      if (editData) {
        response = await api.put(`/packages/${editData.id}`, form);
        Swal.fire("Updated!", "Package updated successfully", "success");
      } else {
        response = await api.post("/packages", form);
        Swal.fire("Created!", "Package added successfully", "success");
      }

      // 🔥 Broadcast notification ONLY on creation (not on update)
      if (!editData) {
        try {
          const packageData = response.data?.package;
          const notificationPayload = {
            title: "New Coin Package Available!",
            body: `${form.name} — Get ${form.coins} coins for ₹${form.price}. Check it out now!`,
            data: {
              type: "package",
              packageName: String(form.name),
              packageId: String(packageData?.id),
            },
          };

          await api.post("/notifications/broadcast", notificationPayload);
        } catch (notifyErr) {
          console.warn("Notification failed:", notifyErr);
          Swal.fire({
            icon: "info",
            title: "Package saved, but notification failed",
            text: notifyErr.response?.data?.error || "Couldn't send notification",
            confirmButtonColor: "#1976d2",
          });
        }
      }

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Failed to save package", "error");
    }
  };

  const pricePerCoin = form.coins && form.price 
    ? (Number(form.price) / Number(form.coins)).toFixed(2)
    : 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AccountBalanceWallet />
          <Box>
            <Typography variant="h6" fontWeight="600">
              {editData ? "Edit Coin Package" : "Create New Package"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {editData ? "Update package details" : "Add a new coin package for users"}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 3 }}>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Package Name */}
          <TextField
            label="Package Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g., Starter Pack, Premium Pack"
            fullWidth
            required
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': {
                mt: 0.7,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Label color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Coins */}
          <TextField
            label="Number of Coins"
            name="coins"
            value={form.coins}
            onChange={handleChange}
            type="number"
            placeholder="e.g., 100, 500, 1000"
            fullWidth
            required
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalanceWallet color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Total coins included in this package"
          />

          {/* Price */}
          <TextField
            label="Package Price"
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            placeholder="e.g., 99, 499, 999"
            fullWidth
            required
            inputProps={{ min: 1, step: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CurrencyRupee color="action" />
                </InputAdornment>
              ),
            }}
            helperText="Price in Indian Rupees (₹)"
          />

          {/* Value Preview */}
          {pricePerCoin > 0 && (
            <>
              <Divider />
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  Package Value
                </Typography>
                <Typography variant="body2">
                  Price per coin: <strong>₹{pricePerCoin}</strong>
                </Typography>
                <Typography variant="body2">
                  Total coins: <strong>{Number(form.coins ?? 0).toLocaleString()}</strong>
                </Typography>
                <Typography variant="body2">
                  Package price: <strong>₹{Number(form.price ?? 0).toLocaleString()  ?? 0}</strong>
                </Typography>
              </Alert>
            </>
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
          {editData ? "Update Package" : "Create Package"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackageModal;
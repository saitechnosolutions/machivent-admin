import React, { useState } from "react";
import {
  Box,
  Modal,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const OfferModal = ({ open, onClose, editData, refresh }) => {
  const [form, setForm] = useState({
    name: editData?.name || "",
    type: editData?.type || "bonus_coins",
    value: editData?.value || "",
    targetType: editData?.targetType || "global",
    userIds:
      editData?.assignedUsers?.map((u) => u.userId).join(",") || "",
    validFrom: editData?.validFrom?.split("T")[0] || "",
    validTo: editData?.validTo?.split("T")[0] || "",
    isActive: editData?.isActive ?? true,
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.value || !form.validFrom || !form.validTo)
      return Swal.fire("Missing fields", "Please fill all required fields", "warning");

    try {
      const token = localStorage.getItem("accessToken");

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
            ? form.userIds
                .split(",")
                .map((id) => parseInt(id.trim()))
                .filter((id) => !isNaN(id))
            : [],
      };

      if (editData) {
        await axios.put(`${API_URL}/offer/${editData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Updated!", "Offer updated successfully", "success");
      } else {
        await axios.post(`${API_URL}/offer`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Created!", "Offer created successfully", "success");
      }

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save offer", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="bg-white p-6 rounded-xl shadow-lg"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          {editData ? "Edit Offer" : "Add Offer"}
        </h2>

        <div className="space-y-4">
          <TextField
            label="Offer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Offer Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            select
            fullWidth
          >
            <MenuItem value="bonus_coins">Bonus Coins</MenuItem>
            <MenuItem value="discount_call_rate">Discount Call Rate</MenuItem>
          </TextField>

          <TextField
            label={form.type === "bonus_coins" ? "Bonus Coins" : "Discount %"}
            name="value"
            type="number"
            value={form.value}
            onChange={handleChange}
            fullWidth
          />

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
              />
            }
            label="Global Offer"
          />

          {form.targetType === "selected_users" && (
            <TextField
              label="User IDs (comma-separated)"
              name="userIds"
              value={form.userIds}
              onChange={handleChange}
              helperText="Enter comma-separated user IDs to assign this offer"
              fullWidth
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Start Date"
              name="validFrom"
              type="date"
              value={form.validFrom}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              name="validTo"
              type="date"
              value={form.validTo}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editData ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default OfferModal;

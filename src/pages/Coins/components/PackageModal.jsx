// src/pages/Coins/components/PackageModal.jsx
import React, { useState } from "react";
import { Box, Modal, TextField, Button } from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PackageModal = ({ open, onClose, editData, refresh }) => {
  const [form, setForm] = useState({
    name: editData?.name || "",
    coins: editData?.coins || "",
    price: editData?.price || "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.coins || !form.price)
      return Swal.fire("Missing fields", "Name, coins, and price are required", "warning");

    try {
      const token = localStorage.getItem("accessToken");
      if (editData) {
        await axios.put(`${API_URL}/packages/${editData.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Updated!", "Package updated successfully", "success");
      } else {
        await axios.post(`${API_URL}/packages`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("Created!", "Package added successfully", "success");
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save package", "error");
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
          width: 400,
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          {editData ? "Edit Package" : "Add Package"}
        </h2>

        <div className="space-y-4">
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Coins"
            name="coins"
            value={form.coins}
            onChange={handleChange}
            type="number"
            fullWidth
          />
          <TextField
            label="Price (₹)"
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            fullWidth
          />

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

export default PackageModal;

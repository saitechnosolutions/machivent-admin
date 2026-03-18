// src/pages/Coins/components/CoinPackagesTab.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { 
  Box, 
  Button, 
  CircularProgress, 
  IconButton, 
  Tooltip,
  Paper,
  Typography,
  Alert,
  Chip,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { 
  Add, 
  Edit, 
  Delete, 
  AccountBalanceWallet,
  TrendingUp 
} from "@mui/icons-material";
import PackageModal from "./PackageModal";
import api from "../../../services/api";

const CoinPackagesTab = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/packages/list");
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
      confirmButtonColor: '#d33',
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/packages/${id}`);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight="600">
            Coin Packages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage purchasable coin packages for users
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
          Add Package
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={48} />
        </Box>
      ) : packages.length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 2, p: 8 }}>
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>No packages available</Typography>
            <Typography variant="body2">
              Create your first coin package to allow users to purchase coins.
            </Typography>
          </Alert>
        </Paper>
      ) : (
        <>
          {/* Card Grid View */}
          <Grid container spacing={3} mb={4}>
            {packages.map((pkg) => {
              const pricePerCoin = (pkg.price / pkg.coins).toFixed(2);
              return (
                <Grid item xs={12} sm={6} md={4} key={pkg.id}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'primary.light',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Package Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box 
                          sx={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          <AccountBalanceWallet fontSize="large" />
                        </Box>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="Edit Package">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditData(pkg);
                                setModalOpen(true);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Package">
                            <IconButton 
                              size="small"
                              color="error" 
                              onClick={() => handleDelete(pkg.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Package Name */}
                      <Typography variant="h5" fontWeight="700" gutterBottom>
                        {pkg.name}
                      </Typography>

                      {/* Coins */}
                      <Box display="flex" alignItems="baseline" gap={1} mb={2}>
                        <Typography variant="h3" fontWeight="800" color="primary.main">
                          {pkg.coins ).toLocaleString()}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          coins
                        </Typography>
                      </Box>

                      {/* Price */}
                      <Box 
                        sx={{ 
                          bgcolor: 'grey.100', 
                          borderRadius: 2, 
                          p: 2,
                          mb: 2
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Package Price
                        </Typography>
                        <Typography variant="h5" fontWeight="700" color="success.main">
                          {formatCurrency(pkg.price)}
                        </Typography>
                      </Box>

                      {/* Value indicator */}
                      <Box display="flex" alignItems="center" gap={1}>
                        <TrendingUp fontSize="small" color="success" />
                        <Typography variant="caption" color="text.secondary">
                          ₹{pricePerCoin} per coin
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Table View */}
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="600">
                Package Details
              </Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>#</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Package Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Coins</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Price</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: '#666' }}>Value</th>
                    <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: '#666' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg, index) => {
                    const pricePerCoin = (pkg.price / pkg.coins).toFixed(2);
                    return (
                      <tr 
                        key={pkg.id}
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
                          <Typography variant="body1" fontWeight={600}>
                            {pkg.name}
                          </Typography>
                        </td>
                        <td style={{ padding: '20px 16px' }}>
                          <Chip 
                            label={`${pkg.coins.toLocaleString() ?? 0} coins`}
                            color="primary"
                            variant="outlined"
                          />
                        </td>
                        <td style={{ padding: '20px 16px' }}>
                          <Typography variant="body1" fontWeight={600} color="success.main">
                            {formatCurrency(pkg.price)}
                          </Typography>
                        </td>
                        <td style={{ padding: '20px 16px' }}>
                          <Typography variant="body2" color="text.secondary">
                            ₹{pricePerCoin} per coin
                          </Typography>
                        </td>
                        <td style={{ padding: '20px 16px', textAlign: 'right' }}>
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
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Paper>
        </>
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
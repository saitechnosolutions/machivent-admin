// src/pages/Admin/WalletsPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, Table, TableHead,
  TableRow, TableCell, TableBody, TablePagination, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, MenuItem, Select, InputLabel, 
  FormControl, Chip, Avatar, Divider, Alert, CircularProgress, Tabs, Tab,
  Card, CardContent, InputAdornment, Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import api, { baseURL } from '../../services/api'; 
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

export default function WalletsPage() {
  // Summary
  const [summary, setSummary] = useState({ totalCoins: 0, usersWithWallets: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(false);

  // Users table
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');

  // Transactions modal
  const [txOpen, setTxOpen] = useState(false);
  const [txUser, setTxUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  // Adjust modal
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustUser, setAdjustUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustType, setAdjustType] = useState('credit');
  const [adjustNote, setAdjustNote] = useState('');

  // Purchase orders
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [orderLimit, setOrderLimit] = useState(25);
  const [orderFilter, setOrderFilter] = useState({ status: '', search: '' });
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Auto-apply search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Auto-apply order filters with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrderPage(0);
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [orderFilter.status, orderFilter.search]);

  useEffect(() => { fetchUsers(); }, [page, limit]);
  useEffect(() => { fetchOrders(); }, [orderPage, orderLimit]);
  useEffect(() => { fetchSummary(); }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get('/wallet/all-wallets', { params: { page: page + 1, limit, search } });
      setUsers(res.data.users || []);
      setUsersTotal(res.data.total || 0);
      if (res.data.summary) setSummary(prev => ({ ...prev, ...res.data.summary }));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch user wallets',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    try {
      const res = await api.get('/wallet/all-wallets', { params: { page: 1, limit: 1 }});
      if (res.data.summary) setSummary({ ...summary, ...res.data.summary });
      const ordersRes = await api.get('/purchase-orders/list-all', { params: { page: 1, limit: 1 }});
      if (ordersRes.data.summary) setSummary(prev => ({ ...prev, totalRevenue: ordersRes.data.summary.totalRevenue }));
    } catch (err) { 
      console.error(err);
    }
  }

  async function fetchUserTransactions(user) {
    try {
      setTxLoading(true);
      const res = await api.get(`/wallet/wallets/${user.id}/transactions`, { params: { page: 1, limit: 200 }});
      setTransactions(res.data.transactions || []);
    } catch (err) { 
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch transactions',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    setTxLoading(false);
  }

  function openTransactions(user) {
    setTxUser(user);
    setTxOpen(true);
    fetchUserTransactions(user);
  }

  function closeTransactions() {
    setTxOpen(false);
    setTxUser(null);
    setTransactions([]);
  }

  function openAdjust(user) {
    setAdjustUser(user);
    setAdjustOpen(true);
    setAdjustAmount(0);
    setAdjustNote('');
    setAdjustType('credit');
  }

  async function submitAdjust() {
  if (!adjustUser) return;
  
  const amount = Number(adjustAmount);
  if (!amount || amount === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid Amount',
      text: 'Please enter a non-zero amount',
      confirmButtonColor: '#1976d2',
    });
    return;
  }

  try {
    const payload = {
      userId: adjustUser.id,
      amount: adjustType === 'credit' ? Math.abs(amount) : -Math.abs(amount),
      description: adjustNote,
    };

    const res = await api.post('/wallet/admin-adjust', payload);

    setAdjustOpen(false);

    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: `Wallet balance ${adjustType === 'credit' ? 'credited' : 'debited'} successfully`,
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });

    // 🔔 Send notification to the affected user
    try {
      const notificationPayload = {
        title: adjustType === 'credit' ? 'Coins Added!' : 'Coins Deducted!',
        body:
          adjustType === 'credit'
            ? `Your wallet has been credited with ${Math.abs(amount)} coins.`
            : `Your wallet has been debited by ${Math.abs(amount)} coins.`,
        data: {
          type: 'wallet_adjustment',
          amount: String(amount),
          adjustmentType: adjustType,
          description: adjustNote || '',
        },
      };

      await api.post('/notifications/send-to-users', {
        userIds: [adjustUser.id],
        ...notificationPayload,
      });
    } catch (notifyErr) {
      console.warn('Notification failed:', notifyErr);
      Swal.fire({
        icon: 'info',
        title: 'Adjustment done, but notification failed',
        text: notifyErr.response?.data?.error || "Couldn't send notification",
        confirmButtonColor: '#1976d2',
      });
    }

    // Refresh related data
    fetchUsers();
    fetchSummary();
    if (txUser && txUser.id === adjustUser.id) fetchUserTransactions(adjustUser);
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Adjustment Failed',
      text: err.response?.data?.error || 'Failed to adjust wallet balance',
      confirmButtonColor: '#1976d2',
      didOpen: (popup) => {
        popup.style.zIndex = 99999;
        const backdrop = document.querySelector('.swal2-container');
        if (backdrop) backdrop.style.zIndex = 99998;
      },
    });
  }
}

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders/list-all', { 
        params: { page: orderPage + 1, limit: orderLimit, status: orderFilter.status, search: orderFilter.search }
      });
      setOrders(res.data.orders || []);
      setOrdersTotal(res.data.total || 0);
      if (res.data.summary && res.data.summary.totalRevenue !== undefined) {
        setSummary(prev => ({ ...prev, totalRevenue: res.data.summary.totalRevenue }));
      }
    } catch (err) { 
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch purchase orders',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
    finally { setLoading(false); }
  }

  async function refundOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    
    const result = await Swal.fire({
      title: 'Confirm Refund',
      html: `
        <div style="text-align: left;">
          <p><strong>Order ID:</strong> ${order?.razorpayOrderId || orderId}</p>
          <p><strong>User:</strong> ${order?.User?.name || 'Unknown'}</p>
          <p><strong>Amount:</strong> ${formatCurrency(order?.amount || 0)}</p>
          <p><strong>Coins:</strong> ${order?.coins || 0} ${order?.bonusCoins > 0 ? `(+${order.bonusCoins} bonus)` : ''}</p>
          <p style="color: #d32f2f; margin-top: 10px;"><strong>Warning:</strong> This will deduct coins from the user's wallet.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#666',
      confirmButtonText: 'Yes, refund order',
      cancelButtonText: 'Cancel',
      input: 'textarea',
      inputPlaceholder: 'Enter refund reason (optional)',
      inputAttributes: {
        'aria-label': 'Refund reason'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/purchase-orders/${orderId}/refund`, { 
        reason: result.value || 'Admin refund' 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Refunded!',
        text: 'Order has been refunded successfully',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
      
      fetchOrders();
      fetchUsers();
      fetchSummary();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Refund Failed',
        text: err.response?.data?.error || 'Failed to refund order',
        confirmButtonColor: '#1976d2',
      });
    }
  }

  async function handleRefreshData() {
      fetchSummary();
      fetchUsers();
      fetchOrders();  
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      success: 'success',
      failed: 'error',
      refunded: 'default'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', height: 'calc(107vh - 64px)', overflowY: 'auto', overflowX: 'hidden', }}> 
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="700" gutterBottom>
            Wallet Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor user wallets, transactions, and purchase orders
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton 
            onClick={handleRefreshData}
            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }}}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Coins in System
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {summary.totalCoins?.toLocaleString()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccountBalanceWalletIcon fontSize="large" />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Active circulation</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Users with Wallets
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {summary.usersWithWallets?.toLocaleString() ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PeopleIcon fontSize="large" />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Active users with wallets</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="700">
                    {formatCurrency(summary.totalRevenue ?? 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AttachMoneyIcon fontSize="large" />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" mt={2}>
                <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">Lifetime earnings</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="User Wallets" />
          <Tab label="Purchase Orders" />
        </Tabs>
      </Paper>

      {/* Users Table */}
      {activeTab === 0 && (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <TextField 
                size="small" 
                placeholder="Search by name, email, or ID" 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)}
                sx={{ minWidth: 300, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {search && `Searching for "${search}"...`}
              </Typography>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>S.No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Wallet Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u, index) => (
                    <TableRow 
                      key={u.id}
                      sx={{ '&:hover': { bgcolor: 'grey.50' }}}
                    >
                      <TableCell>{page * limit + index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}
                            src={u.photo ? `${baseURL}/${u.photo.replace(/^\/+/, '')}` : ''}
                            alt={u.name || 'User'}
                          >
                            {u.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {u.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {u.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{u.email || u.phone || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${u.wallet?.balance || 0} coins`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {u.wallet ? dayjs(u.wallet.updatedAt).format('MMM DD, YYYY HH:mm') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Transactions">
                          <IconButton 
                            size="small" 
                            onClick={()=>openTransactions(u)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Adjust Balance">
                          <IconButton 
                            size="small" 
                            onClick={()=>openAdjust(u)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider />
              <TablePagination
                component="div"
                count={usersTotal}
                page={page}
                onPageChange={(e, p)=>{ setPage(p); }}
                rowsPerPage={limit}
                onRowsPerPageChange={(e)=>{ setLimit(parseInt(e.target.value)); setPage(0); }}
              />
            </>
          )}
        </Paper>
      )}

      {/* Purchase Orders Table */}
      {activeTab === 1 && (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
              <FormControl size="small" sx={{ minWidth: 160, bgcolor: 'white' }}>
                <InputLabel>Status</InputLabel>
                <Select 
                  label="Status" 
                  value={orderFilter.status} 
                  onChange={(e)=>setOrderFilter({...orderFilter, status: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>

              <TextField 
                size="small" 
                placeholder="Search user email/name" 
                value={orderFilter.search} 
                onChange={(e)=>setOrderFilter({...orderFilter, search: e.target.value})}
                sx={{ minWidth: 250, bgcolor: 'white' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {(orderFilter.status || orderFilter.search) && 'Filters applied automatically'}
              </Typography>
            </Box>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={6}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Package</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Coins</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(o => (
                    <TableRow 
                      key={o.id}
                      sx={{ '&:hover': { bgcolor: 'grey.50' }}}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {o.razorpayOrderId || o.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {o.User ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {o.User.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {o.User.email}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            User ID: {o.userId}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {o.CoinPackage ? o.CoinPackage.name : `Package ${o.packageId}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(o.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="body2" fontWeight={600}>
                            {o.coins}
                          </Typography>
                          {o.bonusCoins > 0 && (
                            <Chip 
                              label={`+${o.bonusCoins}`} 
                              size="small" 
                              color="success" 
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={o.status.toUpperCase()} 
                          color={getStatusColor(o.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {dayjs(o.createdAt).format('MMM DD, YYYY HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {o.status === 'success' && (
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={()=>refundOrder(o.id)} 
                            startIcon={<ReplayIcon />}
                            sx={{ borderRadius: 1.5 }}
                          >
                            Refund
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Divider />
              <TablePagination
                component="div"
                count={ordersTotal}
                page={orderPage}
                onPageChange={(e, p)=> setOrderPage(p)}
                rowsPerPage={orderLimit}
                onRowsPerPageChange={(e)=>{ setOrderLimit(parseInt(e.target.value)); setOrderPage(0); }}
              />
            </>
          )}
        </Paper>
      )}

      {/* Transactions Modal */}
      <Dialog open={txOpen} onClose={closeTransactions} fullWidth maxWidth="lg">
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalanceWalletIcon />
            <Box>
              <Typography variant="h6">Transaction History</Typography>
              {txUser && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {txUser.name} ({txUser.email || txUser.phone})
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {txLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={6}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No transactions found for this user.</Alert>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Balance After</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        #{tx.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={tx.type} 
                        size="small"
                        color={tx.type === 'credit' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={tx.amount > 0 ? 'success.main' : 'error.main'}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {tx.balanceAfter}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tx.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(tx.createdAt).format('MMM DD, YYYY HH:mm')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeTransactions} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Balance Modal */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            <Box>
              <Typography variant="h6">Adjust Wallet Balance</Typography>
              {adjustUser && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {adjustUser.name} ({adjustUser.email || adjustUser.phone || 'No contact'})
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select 
                value={adjustType} 
                onChange={(e)=>setAdjustType(e.target.value)} 
                label="Transaction Type"
              >
                <MenuItem value="credit">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    Credit (Add Coins)
                  </Box>
                </MenuItem>
                <MenuItem value="debit">
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon fontSize="small" color="error" sx={{ transform: 'rotate(180deg)' }} />
                    Debit (Deduct Coins)
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Amount (coins)" 
              type="number" 
              value={adjustAmount} 
              onChange={(e)=>setAdjustAmount(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWalletIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField 
              label="Note / Description" 
              value={adjustNote} 
              onChange={(e)=>setAdjustNote(e.target.value)} 
              multiline 
              rows={3}
              fullWidth
              placeholder="Enter reason for adjustment..."
            />

            {adjustUser && adjustUser.wallet && (
              <Alert severity="info">
                Current Balance: <strong>{adjustUser.wallet.balance} coins</strong>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setAdjustOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button variant="contained" onClick={submitAdjust} color="primary">
            Submit Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
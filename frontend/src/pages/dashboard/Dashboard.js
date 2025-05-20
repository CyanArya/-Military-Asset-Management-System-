import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets } from '../../store/slices/assetSlice';
import { fetchBases } from '../../store/slices/baseSlice';
import { fetchTransfers } from '../../store/slices/transferSlice';
import { fetchPurchases } from '../../store/slices/purchaseSlice';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Inventory, LocationOn, SwapHoriz, ShoppingCart } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ color: `${color}.main` }}>{icon}</Box>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { assets } = useSelector((state) => state.assets);
  const { bases } = useSelector((state) => state.bases);
  const { transfers } = useSelector((state) => state.transfers);
  const { purchases } = useSelector((state) => state.purchases);

  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchBases());
    dispatch(fetchTransfers());
    dispatch(fetchPurchases());
  }, [dispatch]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={assets.length}
            icon={<Inventory />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Military Bases"
            value={bases.length}
            icon={<LocationOn />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Transfers"
            value={transfers.filter(t => t.status === 'PENDING').length}
            icon={<SwapHoriz />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Purchases"
            value={purchases.filter(p => p.status === 'PENDING').length}
            icon={<ShoppingCart />}
            color="error"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
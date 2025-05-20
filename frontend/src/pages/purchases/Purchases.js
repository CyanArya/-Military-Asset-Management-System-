import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPurchases, createPurchase, updatePurchase, approvePurchase, rejectPurchase } from '../../store/slices/purchaseSlice';
import { fetchBases } from '../../store/slices/baseSlice';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

const Purchases = () => {
  const dispatch = useDispatch();
  const { purchases, loading } = useSelector((state) => state.purchases);
  const { bases } = useSelector((state) => state.bases);
  const [open, setOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    quantity: 1,
    unitPrice: 0,
    baseId: '',
  });

  useEffect(() => {
    dispatch(fetchPurchases());
    dispatch(fetchBases());
  }, [dispatch]);

  const handleOpen = (purchase = null) => {
    if (purchase) {
      setSelectedPurchase(purchase);
      setFormData({
        date: new Date(purchase.date).toISOString().split('T')[0],
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice,
        baseId: purchase.baseId,
      });
    } else {
      setSelectedPurchase(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        quantity: 1,
        unitPrice: 0,
        baseId: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedPurchase(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const purchaseData = {
      ...formData,
      totalAmount: formData.quantity * formData.unitPrice,
    };
    if (selectedPurchase) {
      await dispatch(updatePurchase({ id: selectedPurchase.id, purchaseData }));
    } else {
      await dispatch(createPurchase(purchaseData));
    }
    handleClose();
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this purchase?')) {
      await dispatch(approvePurchase(id));
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this purchase?')) {
      await dispatch(rejectPurchase(id));
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Purchases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          New Purchase
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Base</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {bases.find((base) => base.id === purchase.baseId)?.name}
                </TableCell>
                <TableCell>{purchase.quantity}</TableCell>
                <TableCell>${purchase.unitPrice.toFixed(2)}</TableCell>
                <TableCell>${purchase.totalAmount.toFixed(2)}</TableCell>
                <TableCell>{purchase.status}</TableCell>
                <TableCell>
                  {purchase.status === 'PENDING' && (
                    <>
                      <IconButton onClick={() => handleApprove(purchase.id)}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton onClick={() => handleReject(purchase.id)}>
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedPurchase ? 'Edit Purchase' : 'New Purchase'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              type="date"
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Unit Price"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              select
              label="Base"
              name="baseId"
              value={formData.baseId}
              onChange={handleChange}
              margin="normal"
              required
            >
              {bases.map((base) => (
                <MenuItem key={base.id} value={base.id}>
                  {base.name}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Purchases; 
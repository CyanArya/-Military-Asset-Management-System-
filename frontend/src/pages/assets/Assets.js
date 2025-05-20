import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../../store/slices/assetSlice';
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
  MenuItem,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const assetTypes = [
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'WEAPON', label: 'Weapon' },
  { value: 'AMMUNITION', label: 'Ammunition' },
  { value: 'OTHER', label: 'Other' },
];

const assetStatuses = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'EXPENDED', label: 'Expended' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
];

const Assets = () => {
  const dispatch = useDispatch();
  const { assets, loading } = useSelector((state) => state.assets);
  const { bases } = useSelector((state) => state.bases);
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    serialNumber: '',
    type: 'VEHICLE',
    name: '',
    description: '',
    status: 'AVAILABLE',
    baseId: '',
  });

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  const handleOpen = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData({
        serialNumber: asset.serialNumber,
        type: asset.type,
        name: asset.name,
        description: asset.description || '',
        status: asset.status,
        baseId: asset.baseId,
      });
    } else {
      setSelectedAsset(null);
      setFormData({
        serialNumber: '',
        type: 'VEHICLE',
        name: '',
        description: '',
        status: 'AVAILABLE',
        baseId: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAsset(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAsset) {
      await dispatch(updateAsset({ id: selectedAsset.id, assetData: formData }));
    } else {
      await dispatch(createAsset(formData));
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await dispatch(deleteAsset(id));
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Assets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Asset
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Base</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.serialNumber}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{asset.status}</TableCell>
                <TableCell>
                  {bases.find((base) => base.id === asset.baseId)?.name}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(asset)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(asset.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Serial Number"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              margin="normal"
              required
            >
              {assetTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
              required
            >
              {assetStatuses.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
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

export default Assets; 
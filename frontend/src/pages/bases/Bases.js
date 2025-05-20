import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBases, createBase, updateBase, deleteBase } from '../../store/slices/baseSlice';
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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Bases = () => {
  const dispatch = useDispatch();
  const { bases, loading } = useSelector((state) => state.bases);
  const [open, setOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  useEffect(() => {
    dispatch(fetchBases());
  }, [dispatch]);

  const handleOpen = (base = null) => {
    if (base) {
      setSelectedBase(base);
      setFormData({
        name: base.name,
        location: base.location,
      });
    } else {
      setSelectedBase(null);
      setFormData({
        name: '',
        location: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedBase(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedBase) {
      await dispatch(updateBase({ id: selectedBase.id, baseData: formData }));
    } else {
      await dispatch(createBase(formData));
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this base?')) {
      await dispatch(deleteBase(id));
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Military Bases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Base
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bases.map((base) => (
              <TableRow key={base.id}>
                <TableCell>{base.name}</TableCell>
                <TableCell>{base.location}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(base)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(base.id)}>
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
          {selectedBase ? 'Edit Base' : 'Add New Base'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
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
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              required
            />
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

export default Bases; 
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../store/slices/authSlice';
import { Box, TextField, Button, Typography, Paper, Alert, MenuItem } from '@mui/material';

const roles = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'BASE_COMMANDER', label: 'Base Commander' },
  { value: 'LOGISTICS_OFFICER', label: 'Logistics Officer' },
];

function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'LOGISTICS_OFFICER',
    baseId: '',
  });
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate baseId if role is BASE_COMMANDER
    if (formData.role === 'BASE_COMMANDER') {
      if (!isUUID(formData.baseId)) {
        setLocalError('Base ID must be a valid UUID.');
        return;
      }
    }
    // Only send baseId if role is BASE_COMMANDER
    const payload = { ...formData };
    if (formData.role !== 'BASE_COMMANDER') {
      delete payload.baseId;
    }
    const result = await dispatch(register(payload));
    if (!result.error) {
      navigate('/login');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Military Asset Management
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center">
          Register
        </Typography>
        {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string'
            ? error
            : error?.errors?.map((e, i) => <div key={i}>{e.msg}</div>)}
        </Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            margin="normal"
            required
          >
            {roles.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {formData.role === 'BASE_COMMANDER' && (
            <TextField
              fullWidth
              label="Base ID (UUID)"
              name="baseId"
              value={formData.baseId}
              onChange={handleChange}
              margin="normal"
              required
            />
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Register; 
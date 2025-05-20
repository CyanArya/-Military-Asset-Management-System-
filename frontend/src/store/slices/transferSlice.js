import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks
export const fetchTransfers = createAsyncThunk(
  'transfers/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/transfers');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createTransfer = createAsyncThunk(
  'transfers/create',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/transfers', transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTransfer = createAsyncThunk(
  'transfers/update',
  async ({ id, transferData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axiosInstance.put(`/transfers/${id}`, transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approveTransfer = createAsyncThunk(
  'transfers/approve',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/transfers/${id}/approve`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectTransfer = createAsyncThunk(
  'transfers/reject',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axiosInstance.put(`/transfers/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  transfers: [],
  loading: false,
  error: null,
  selectedTransfer: null,
};

const transferSlice = createSlice({
  name: 'transfers',
  initialState,
  reducers: {
    setSelectedTransfer: (state, action) => {
      state.selectedTransfer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transfers
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false;
        state.transfers = action.payload;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch transfers';
      })
      // Create Transfer
      .addCase(createTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.transfers.push(action.payload);
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create transfer';
      })
      // Update Transfer
      .addCase(updateTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransfer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transfers.findIndex(transfer => transfer.id === action.payload.id);
        if (index !== -1) {
          state.transfers[index] = action.payload;
        }
      })
      .addCase(updateTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update transfer';
      })
      // Approve Transfer
      .addCase(approveTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTransfer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transfers.findIndex(transfer => transfer.id === action.payload.id);
        if (index !== -1) {
          state.transfers[index] = action.payload;
        }
      })
      .addCase(approveTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve transfer';
      })
      // Reject Transfer
      .addCase(rejectTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTransfer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transfers.findIndex(transfer => transfer.id === action.payload.id);
        if (index !== -1) {
          state.transfers[index] = action.payload;
        }
      })
      .addCase(rejectTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reject transfer';
      });
  },
});

export const { setSelectedTransfer, clearError } = transferSlice.actions;
export default transferSlice.reducer; 
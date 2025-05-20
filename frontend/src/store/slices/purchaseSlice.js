import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks
export const fetchPurchases = createAsyncThunk(
  'purchases/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPurchase = createAsyncThunk(
  'purchases/create',
  async (purchaseData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/purchases`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updatePurchase = createAsyncThunk(
  'purchases/update',
  async ({ id, purchaseData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/purchases/${id}`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const approvePurchase = createAsyncThunk(
  'purchases/approve',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/purchases/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const rejectPurchase = createAsyncThunk(
  'purchases/reject',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/purchases/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  purchases: [],
  loading: false,
  error: null,
  selectedPurchase: null,
};

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    setSelectedPurchase: (state, action) => {
      state.selectedPurchase = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch purchases';
      })
      // Create Purchase
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.push(action.payload);
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create purchase';
      })
      // Update Purchase
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update purchase';
      })
      // Approve Purchase
      .addCase(approvePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(approvePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve purchase';
      })
      // Reject Purchase
      .addCase(rejectPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectPurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
      })
      .addCase(rejectPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reject purchase';
      });
  },
});

export const { setSelectedPurchase, clearError } = purchaseSlice.actions;
export default purchaseSlice.reducer; 
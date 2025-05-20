import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Async thunks
export const fetchBases = createAsyncThunk(
  'bases/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/bases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBase = createAsyncThunk(
  'bases/create',
  async (baseData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/bases`, baseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBase = createAsyncThunk(
  'bases/update',
  async ({ id, baseData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(`${API_URL}/bases/${id}`, baseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteBase = createAsyncThunk(
  'bases/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/bases/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  bases: [],
  loading: false,
  error: null,
  selectedBase: null,
};

const baseSlice = createSlice({
  name: 'bases',
  initialState,
  reducers: {
    setSelectedBase: (state, action) => {
      state.selectedBase = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Bases
      .addCase(fetchBases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBases.fulfilled, (state, action) => {
        state.loading = false;
        state.bases = action.payload;
      })
      .addCase(fetchBases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch bases';
      })
      // Create Base
      .addCase(createBase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBase.fulfilled, (state, action) => {
        state.loading = false;
        state.bases.push(action.payload);
      })
      .addCase(createBase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create base';
      })
      // Update Base
      .addCase(updateBase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bases.findIndex(base => base.id === action.payload.id);
        if (index !== -1) {
          state.bases[index] = action.payload;
        }
      })
      .addCase(updateBase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update base';
      })
      // Delete Base
      .addCase(deleteBase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBase.fulfilled, (state, action) => {
        state.loading = false;
        state.bases = state.bases.filter(base => base.id !== action.payload);
      })
      .addCase(deleteBase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete base';
      });
  },
});

export const { setSelectedBase, clearError } = baseSlice.actions;
export default baseSlice.reducer; 
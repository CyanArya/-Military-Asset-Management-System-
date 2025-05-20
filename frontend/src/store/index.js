import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import assetReducer from './slices/assetSlice';
import transferReducer from './slices/transferSlice';
import purchaseReducer from './slices/purchaseSlice';
import baseReducer from './slices/baseSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetReducer,
    transfers: transferReducer,
    purchases: purchaseReducer,
    bases: baseReducer,
  },
});

export default store; 
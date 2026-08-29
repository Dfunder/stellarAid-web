'use client';

import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from './slices/apiSlice';
import authReducer from '../features/auth/authSlice';
import twoFactorReducer from '../features/twoFactor/twoFactorSlice';
import sessionsReducer from '../features/sessions/sessionsSlice';
import campaignsReducer from '../features/campaigns/campaignsSlice';
import donationsReducer from '../features/donations/donationsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import adminReducer from '../features/admin/adminSlice';
import bookmarksReducer from '../features/bookmarks/bookmarksSlice';
import errorsReducer from '../features/errors/errorSlice';
import artistsReducer from '../features/artists/artistsSlice';
import portfoliosReducer from '../features/portfolios/portfoliosSlice';
import servicesReducer from '../features/services/servicesSlice';
import matchingReducer from '../features/matching/matchingSlice';

import competitionsReducer from '../features/competitions/competitionsSlice';

const rootReducer = combineReducers({
  api: apiReducer,
  auth: authReducer,
  twoFactor: twoFactorReducer,
  sessions: sessionsReducer,
  campaigns: campaignsReducer,
  donations: donationsReducer,
  dashboard: dashboardReducer,
  admin: adminReducer,
  bookmarks: bookmarksReducer,
  errors: errorsReducer,
  artists: artistsReducer,
  portfolios: portfoliosReducer,
  services: servicesReducer,
  matching: matchingReducer,
  competitions: competitionsReducer,
});

export default rootReducer;

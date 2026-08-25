## Summary

This PR addresses 4 issues related to auth persistence, email verification, commission status sync, and escrow payment safety.

### Changes

**Redux State Persistence Issue (#493)**
- Installed redux-persist package
- Configured persistReducer with localStorage whitelist for auth slice
- Added PersistGate with loading spinner in ReduxProvider
- Auth state now persists across page refreshes - no more re-login required

**Email Verification Link Expiration (#495)**
- Added 60-second rate limiting cooldown to resend button
- Cooldown timer displayed on button ("Resend in 45s")
- Prevents spam/resend abuse with clear user feedback
- Toast notification warns when rate limit is hit

**Commission Status Mismatch (#494)**
- Created useCommissionStatus hook with real-time WebSocket updates
- Subscribes to 'commission_status_updated' events via Socket.io
- Status updates reflected immediately without manual refresh
- Includes refetch capability for manual refresh

**Commission Payment Escrow Lock (#491)**
- Added rollback mechanism for incomplete escrow transactions
- Calls /api/payments/:id/rollback on signing cancellation or confirmation failure
- Multi-step status indicators (initiating, signing, confirming, rolling_back)
- Better error messages for each failure point
- Payment state properly cleaned up on close

Closes #491
Closes #493
Closes #494
Closes #495

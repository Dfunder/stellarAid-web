## Summary

This PR implements four payment flow features:

### Implemented Features

1. **Payment Success and Failure Screens** (#713)
   - Success screen with tx hash, receipt link, deliverables CTA
   - Failure screen with reason categories (rejected, insufficient funds, network, timeout)
   - Retry path preserving the checkout session
   - Confetti/celebration honoring reduced-motion
   - Themed and responsive

2. **Transaction Status Polling** (#712)
   - Poll backend/Horizon with exponential backoff until confirmed
   - UI states: submitted → confirming → confirmed / failed
   - Cap polling with a "still processing" handoff screen
   - Confirmation updates UI without user refresh

3. **Transaction Signing Flow** (#711)
   - Request transaction XDR from backend (payment or escrow invoke)
   - Open wallet signing prompt with clear instructions
   - Handle user rejection and timeout gracefully
   - Show signed-transaction submission state
   - Wallet popup guidance shown for first-time payers

4. **Payment Summary and Fee Breakdown** (#710)
   - Line items: artwork price, platform fee, estimated network fee, total
   - Escrow notice explaining funds release conditions
   - Amounts rendered with correct precision per asset
   - Fee changes after quote update are re-confirmed by the user

### Components Added

- `src/features/payments/PaymentResultScreen.tsx` - Success/failure screens with confetti
- `src/features/payments/TransactionStatusPolling.tsx` - Real-time transaction status polling
- `src/features/payments/TransactionSigningFlow.tsx` - Wallet signing flow with error handling
- `src/features/payments/PaymentSummaryAndFeeBreakdown.tsx` - Transparent fee breakdown

### Routes Added

- `/payment/result` - Payment result screen (protected)

### Closes

Closes #713, #712, #711, #710
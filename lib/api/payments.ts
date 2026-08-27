import api from '@/app/services/api';

export function initiateEscrow(data: {
  commissionId: string;
  amount: number;
  asset: string;
  destination: string;
  milestoneId?: string; // Add milestone support
}) {
  return api.post('/payments/escrow', data).then((r) => r.data);
}

// New function to initiate escrow specifically for a milestone
export function initiateMilestoneEscrow(data: {
  commissionId: string;
  milestoneId: string;
  amount: number;
  asset: string;
  destination: string;
}) {
  return api.post('/payments/milestones/escrow', data).then((r) => r.data);
}

export function confirmPayment(transactionId: string, stellarTxHash: string) {
  return api.post(`/payments/${transactionId}/confirm`, { stellarTxHash }).then((r) => r.data);
}

// New function to confirm milestone payment release
export function confirmMilestoneRelease(milestoneId: string, transactionId: string, stellarTxHash: string) {
  return api.post(`/payments/milestones/${milestoneId}/release`, { transactionId, stellarTxHash }).then((r) => r.data);
}

// New function to get all payments for a specific milestone
export function getMilestonePayments(milestoneId: string) {
  return api.get(`/payments/milestones/${milestoneId}`).then((r) => r.data);
}

export function getPaymentHistory(params?: { commissionId?: string; milestoneId?: string }) {
  return api.get('/payments', { params }).then((r) => r.data);
}

// New function to release funds for a completed milestone
export function releaseMilestoneFunds(milestoneId: string) {
  return api.post(`/payments/milestones/${milestoneId}/release`, {}).then((r) => r.data);
}
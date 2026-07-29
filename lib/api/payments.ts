import api from '@/app/services/api';

export function initiateEscrow(data: {
  commissionId: string;
  amount: number;
  asset: string;
  destination: string;
}) {
  return api.post('/payments/escrow', data).then((r) => r.data);
}

export function confirmPayment(transactionId: string, stellarTxHash: string) {
  return api.post(`/payments/${transactionId}/confirm`, { stellarTxHash }).then((r) => r.data);
}

export function getPaymentHistory(params?: { commissionId?: string }) {
  return api.get('/payments', { params }).then((r) => r.data);
}

import { useEffect, useState, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { getCommissions, type CommissionItem, type CommissionStatus } from '@/lib/api/commissions';

interface UseCommissionStatusOptions {
  role?: 'artist' | 'client';
  status?: string;
  enableRealtime?: boolean;
}

export function useCommissionStatus(options: UseCommissionStatusOptions = {}) {
  const { role, status, enableRealtime = true } = options;
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCommissions({ status, role });
      setCommissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  }, [status, role]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  useEffect(() => {
    if (!enableRealtime) return;

    const socket = getSocket();
    if (!socket) return;

    const handleStatusUpdate = (payload: { commissionId: string; status: CommissionStatus; updatedAt: string }) => {
      setCommissions((prev) =>
        prev.map((commission) =>
          commission.id === payload.commissionId
            ? { ...commission, status: payload.status }
            : commission
        )
      );
    };

    socket.on('commission_status_updated', handleStatusUpdate);

    return () => {
      socket.off('commission_status_updated', handleStatusUpdate);
    };
  }, [enableRealtime]);

  return { commissions, loading, error, refetch: fetchCommissions };
}

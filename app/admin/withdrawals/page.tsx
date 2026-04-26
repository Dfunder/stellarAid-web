"use client";

import { useEffect, useState } from "react";

type Withdrawal = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  projectId: string;
  projectName: string;
  requestDate: string;
  processedDate?: string;
  transactionHash?: string;
  rejectionReason?: string;
  stellarAddress?: string;
};

const PAGE_SIZE = 10;

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filtered, setFiltered] = useState<Withdrawal[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);

  // 🔹 Fetch withdrawals
  const fetchWithdrawals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/withdrawals");
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      const data = await res.json();
      setWithdrawals(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // 🔹 Search + Filters
  useEffect(() => {
    let temp = [...withdrawals];

    if (search) {
      temp = temp.filter(
        (w) =>
          w.creatorName.toLowerCase().includes(search.toLowerCase()) ||
          w.creatorEmail.toLowerCase().includes(search.toLowerCase()) ||
          w.projectName.toLowerCase().includes(search.toLowerCase()) ||
          w.transactionHash?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter) {
      temp = temp.filter((w) => w.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      temp = temp.filter((w) => {
        const requestDate = new Date(w.requestDate);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }

    setFiltered(temp);
    setPage(1);
  }, [search, statusFilter, dateFilter, withdrawals]);

  // 🔹 Pagination
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // 🔹 Actions
  const approveWithdrawal = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to approve withdrawal");
      await fetchWithdrawals();
    } catch (err) {
      console.error("Failed to approve withdrawal", err);
      alert("Failed to approve withdrawal");
    }
  };

  const rejectWithdrawal = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject withdrawal");
      await fetchWithdrawals();
      setShowRejectionModal(false);
      setRejectionReason("");
      setRejectingWithdrawalId(null);
    } catch (err) {
      console.error("Failed to reject withdrawal", err);
      alert("Failed to reject withdrawal");
    }
  };

  const completeWithdrawal = async (id: string, transactionHash: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/complete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionHash }),
      });
      if (!res.ok) throw new Error("Failed to complete withdrawal");
      await fetchWithdrawals();
    } catch (err) {
      console.error("Failed to complete withdrawal", err);
      alert("Failed to complete withdrawal");
    }
  };

  const openRejectionModal = (id: string) => {
    setRejectingWithdrawalId(id);
    setShowRejectionModal(true);
  };

  const getStellarExplorerUrl = (hash: string) => {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Withdrawal Management</h1>

      {/* 🔍 Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search withdrawals..."
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setDateFilter(e.target.value)}
          value={dateFilter}
        />
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium">{withdrawal.creatorName}</div>
                    <div className="text-sm text-gray-500">{withdrawal.creatorEmail}</div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{withdrawal.projectName}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="font-medium">
                    {withdrawal.amount} {withdrawal.currency}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                  {withdrawal.rejectionReason && (
                    <div className="text-xs text-red-600 mt-1">{withdrawal.rejectionReason}</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {new Date(withdrawal.requestDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {withdrawal.transactionHash ? (
                    <a
                      href={getStellarExplorerUrl(withdrawal.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View on Stellar
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedWithdrawal(withdrawal)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      View
                    </button>

                    {withdrawal.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => approveWithdrawal(withdrawal.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectionModal(withdrawal.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {withdrawal.status === "APPROVED" && (
                      <button
                        onClick={() => {
                          const hash = prompt("Enter transaction hash:");
                          if (hash) completeWithdrawal(withdrawal.id, hash);
                        }}
                        className="text-purple-600 hover:text-purple-800"
                        title="Complete with Transaction Hash"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages} ({filtered.length} withdrawals)
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* 🧾 Withdrawal Detail Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Withdrawal Details</h2>

            <div className="space-y-3">
              <p><b>Creator:</b> {selectedWithdrawal.creatorName}</p>
              <p><b>Email:</b> {selectedWithdrawal.creatorEmail}</p>
              <p><b>Project:</b> {selectedWithdrawal.projectName}</p>
              <p><b>Amount:</b> {selectedWithdrawal.amount} {selectedWithdrawal.currency}</p>
              <p><b>Status:</b> {selectedWithdrawal.status}</p>
              <p>
                <b>Request Date:</b>{" "}
                {new Date(selectedWithdrawal.requestDate).toLocaleString()}
              </p>
              {selectedWithdrawal.processedDate && (
                <p>
                  <b>Processed Date:</b>{" "}
                  {new Date(selectedWithdrawal.processedDate).toLocaleString()}
                </p>
              )}
              {selectedWithdrawal.transactionHash && (
                <div>
                  <b>Transaction Hash:</b>
                  <div className="text-sm text-blue-600 break-all">
                    {selectedWithdrawal.transactionHash}
                  </div>
                  <a
                    href={getStellarExplorerUrl(selectedWithdrawal.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View on Stellar Explorer
                  </a>
                </div>
              )}
              {selectedWithdrawal.stellarAddress && (
                <p><b>Stellar Address:</b> {selectedWithdrawal.stellarAddress}</p>
              )}
              {selectedWithdrawal.rejectionReason && (
                <p><b>Rejection Reason:</b> {selectedWithdrawal.rejectionReason}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setSelectedWithdrawal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚫 Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Reject Withdrawal</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                className="w-full border p-2 rounded"
                rows={4}
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason("");
                  setRejectingWithdrawalId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (rejectingWithdrawalId && rejectionReason.trim()) {
                    rejectWithdrawal(rejectingWithdrawalId, rejectionReason.trim());
                  }
                }}
                disabled={!rejectionReason.trim()}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

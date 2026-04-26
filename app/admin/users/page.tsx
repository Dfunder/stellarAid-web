"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  isSuspended?: boolean;
};

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Search + Filters
  useEffect(() => {
    let temp = [...users];

    if (search) {
      temp = temp.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter) {
      temp = temp.filter((u) => u.role === roleFilter);
    }

    if (kycFilter) {
      temp = temp.filter((u) => u.kycStatus === kycFilter);
    }

    setFiltered(temp);
    setPage(1);
  }, [search, roleFilter, kycFilter, users]);

  // 🔹 Pagination
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // 🔹 Actions
  const updateRole = async (id: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role");
    }
  };

  const updateKyc = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/kyc`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update KYC");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update KYC", err);
      alert("Failed to update KYC status");
    }
  };

  const suspendUser = async (id: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to suspend user");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to suspend user", err);
      alert("Failed to suspend user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { 
        method: "DELETE" 
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user");
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
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      {/* 🔍 Search & Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Search users..."
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setRoleFilter(e.target.value)}
          value={roleFilter}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="CREATOR">Creator</option>
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setKycFilter(e.target.value)}
          value={kycFilter}
        >
          <option value="">All KYC</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{user.email}</td>

                {/* Role */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>

                {/* KYC */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.kycStatus}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateKyc(user.id, "APPROVED")}
                        className="text-green-600 hover:text-green-800"
                        title="Approve KYC"
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => updateKyc(user.id, "REJECTED")}
                        className="text-red-600 hover:text-red-800"
                        title="Reject KYC"
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      View
                    </button>

                    <button
                      onClick={() => suspendUser(user.id)}
                      className="text-yellow-600 hover:text-yellow-800"
                      title="Suspend User"
                    >
                      Suspend
                    </button>

                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete User"
                    >
                      Delete
                    </button>
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
            Page {page} of {totalPages} ({filtered.length} users)
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

      {/* 🧾 User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h2 className="text-lg font-bold mb-4">User Details</h2>

            <div className="space-y-3">
              <p><b>Name:</b> {selectedUser.name}</p>
              <p><b>Email:</b> {selectedUser.email}</p>
              <p><b>Role:</b> {selectedUser.role}</p>
              <p><b>KYC Status:</b> {selectedUser.kycStatus}</p>
              <p><b>Suspended:</b> {selectedUser.isSuspended ? 'Yes' : 'No'}</p>
              <p>
                <b>Created:</b>{" "}
                {new Date(selectedUser.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

const PAGE_SIZE = 5;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [kycFilter, setKycFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/admin/users");
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
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
    await fetch(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const updateKyc = async (id: string, status: string) => {
    await fetch(`/admin/users/${id}/kyc`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    fetchUsers();
  };

  const suspendUser = async (id: string) => {
    await fetch(`/admin/users/${id}/suspend`, { method: "PUT" });
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    await fetch(`/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* 🔍 Search & Filters */}
      <div className="flex gap-3 mb-4">
        <input
          placeholder="Search users..."
          className="border p-2 rounded w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>

        <select
          className="border p-2 rounded"
          onChange={(e) => setKycFilter(e.target.value)}
        >
          <option value="">All KYC</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* 📊 Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>KYC</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((user) => (
            <tr key={user.id} className="border-t text-center">
              <td>{user.name}</td>
              <td>{user.email}</td>

              {/* Role */}
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>

              {/* KYC */}
              <td>
                {user.kycStatus}
                <div className="flex gap-1 justify-center">
                  <button
                    onClick={() => updateKyc(user.id, "APPROVED")}
                    className="text-green-600"
                  >
                    ✔
                  </button>
                  <button
                    onClick={() => updateKyc(user.id, "REJECTED")}
                    className="text-red-600"
                  >
                    ✖
                  </button>
                </div>
              </td>

              <td>{new Date(user.createdAt).toLocaleDateString()}</td>

              {/* Actions */}
              <td className="flex gap-2 justify-center">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="text-blue-600"
                >
                  View
                </button>

                <button
                  onClick={() => suspendUser(user.id)}
                  className="text-yellow-600"
                >
                  Suspend
                </button>

                <button
                  onClick={() => deleteUser(user.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* 🧾 Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-2">User Details</h2>

            <p><b>Name:</b> {selectedUser.name}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Role:</b> {selectedUser.role}</p>
            <p><b>KYC:</b> {selectedUser.kycStatus}</p>
            <p>
              <b>Created:</b>{" "}
              {new Date(selectedUser.createdAt).toLocaleString()}
            </p>

            <button
              className="mt-4 bg-black text-white px-4 py-2 rounded"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
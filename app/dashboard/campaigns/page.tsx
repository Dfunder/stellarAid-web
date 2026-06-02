'use client';

import React, { useState } from 'react';
import { Plus, Eye, Edit3, Trash2, TrendingUp, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function CreatorCampaignsManagement() {
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: "Clean Water Initiative in Northern Ghana",
      status: "Active",
      raised: 12450,
      target: 25000,
      donors: 87,
      endDate: "2026-07-15",
      progress: 49.8,
    },
    {
      id: 2,
      title: "Solar Panels for Rural Schools",
      status: "Draft",
      raised: 3200,
      target: 15000,
      donors: 24,
      endDate: "2026-08-30",
      progress: 21.3,
    },
  ]);

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">My Campaigns</h1>
          <p className="text-gray-500 mt-2">Manage and track all your fundraising campaigns</p>
        </div>

        <Link
          href="/campaigns/create"
          className="flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-medium transition"
        >
          <Plus size={20} />
          Create New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-neutral-200 rounded-3xl p-6">
          <p className="text-sm text-neutral-500">Total Raised</p>
          <p className="text-4xl font-bold mt-3">${totalRaised.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-3xl p-6">
          <p className="text-sm text-neutral-500">Active Campaigns</p>
          <p className="text-4xl font-bold mt-3">{campaigns.filter(c => c.status === "Active").length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-3xl p-6">
          <p className="text-sm text-neutral-500">Total Donors</p>
          <p className="text-4xl font-bold mt-3">{campaigns.reduce((sum, c) => sum + c.donors, 0)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-3xl p-6">
          <p className="text-sm text-neutral-500">Avg. Completion</p>
          <p className="text-4xl font-bold mt-3">35%</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">All My Campaigns</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-sm text-neutral-500">
                <th className="p-6">Campaign</th>
                <th className="p-6">Status</th>
                <th className="p-6">Raised</th>
                <th className="p-6">Progress</th>
                <th className="p-6">Donors</th>
                <th className="p-6">End Date</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-neutral-50 transition">
                  <td className="p-6 font-medium max-w-xs">{campaign.title}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                      ${campaign.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-6 font-mono">
                    ${campaign.raised.toLocaleString()} <span className="text-neutral-400">/ ${campaign.target.toLocaleString()}</span>
                  </td>
                  <td className="p-6">
                    <div className="w-24 bg-neutral-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-neutral-400" />
                      {campaign.donors}
                    </div>
                  </td>
                  <td className="p-6 text-neutral-500">{campaign.endDate}</td>
                  <td className="p-6">
                    <div className="flex gap-3 justify-center">
                      <button className="p-2 hover:bg-neutral-100 rounded-xl" title="View">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-neutral-100 rounded-xl" title="Edit">
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-xl" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type CampaignStatus = "pending" | "approved" | "rejected";

interface Creator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  totalCampaigns: number;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  category: string;
  status: CampaignStatus;
  createdAt: string;
  deadline: string;
  coverImage: string;
  creator: Creator;
  tags: string[];
  updates: number;
  backers: number;
}

type FilterTab = "all" | CampaignStatus;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "c1",
    title: "Clean Water Initiative for Rural Communities",
    description:
      "We aim to provide clean, safe drinking water to over 5,000 families in remote rural areas through solar-powered filtration systems. This project will reduce waterborne diseases by an estimated 70% and free children from daily water-fetching duties, allowing them to attend school.",
    goalAmount: 120000,
    raisedAmount: 45000,
    category: "Humanitarian",
    status: "pending",
    createdAt: "2025-04-10T09:23:00Z",
    deadline: "2025-07-01T00:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=800&q=80",
    creator: {
      id: "u1",
      name: "Amara Okafor",
      email: "amara.okafor@example.com",
      avatar: "https://i.pravatar.cc/150?img=47",
      joinedDate: "2023-01-15",
      totalCampaigns: 3,
    },
    tags: ["water", "sustainability", "rural", "health"],
    updates: 2,
    backers: 134,
  },
  {
    id: "c2",
    title: "Youth Tech Academy — Lagos Chapter",
    description:
      "Launch a free coding bootcamp for 200 underprivileged youth aged 14–22 in Lagos. Curriculum covers web development, mobile apps, and AI fundamentals. Graduates receive job placement support with our network of 50+ partner companies.",
    goalAmount: 80000,
    raisedAmount: 80000,
    category: "Education",
    status: "pending",
    createdAt: "2025-04-12T14:00:00Z",
    deadline: "2025-06-15T00:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
    creator: {
      id: "u2",
      name: "Chidi Eze",
      email: "chidi.eze@example.com",
      avatar: "https://i.pravatar.cc/150?img=12",
      joinedDate: "2022-08-20",
      totalCampaigns: 1,
    },
    tags: ["education", "tech", "youth", "Lagos"],
    updates: 5,
    backers: 312,
  },
  {
    id: "c3",
    title: "Reforestation of the Sahel Belt",
    description:
      "Plant 1 million indigenous trees across the Sahel to combat desertification and restore biodiversity. We partner with local farming communities who are trained as land stewards, creating sustainable income while healing the land.",
    goalAmount: 200000,
    raisedAmount: 67000,
    category: "Environment",
    status: "approved",
    createdAt: "2025-03-28T11:10:00Z",
    deadline: "2025-08-30T00:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    creator: {
      id: "u3",
      name: "Fatima Al-Hassan",
      email: "fatima.alhassan@example.com",
      avatar: "https://i.pravatar.cc/150?img=5",
      joinedDate: "2021-11-02",
      totalCampaigns: 6,
    },
    tags: ["environment", "trees", "Sahel", "biodiversity"],
    updates: 8,
    backers: 891,
  },
  {
    id: "c4",
    title: "Mobile Clinic for Nomadic Communities",
    description:
      "Deploy two fully equipped mobile medical clinics to serve nomadic populations in Northern Kenya who have no access to healthcare. Each clinic will serve approximately 400 patients per month.",
    goalAmount: 150000,
    raisedAmount: 12000,
    category: "Healthcare",
    status: "rejected",
    createdAt: "2025-04-01T08:45:00Z",
    deadline: "2025-07-20T00:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
    creator: {
      id: "u4",
      name: "Dr. Samuel Mwangi",
      email: "s.mwangi@example.com",
      avatar: "https://i.pravatar.cc/150?img=33",
      joinedDate: "2023-06-10",
      totalCampaigns: 2,
    },
    tags: ["healthcare", "mobile", "Kenya", "nomadic"],
    updates: 0,
    backers: 28,
  },
  {
    id: "c5",
    title: "Women's Cooperative — Textile Arts Revival",
    description:
      "Revive traditional Kente and Ankara textile arts by training 300 women artisans and connecting them to global markets via an e-commerce platform. Each artisan earns a living wage while preserving cultural heritage.",
    goalAmount: 55000,
    raisedAmount: 22000,
    category: "Economic Empowerment",
    status: "pending",
    createdAt: "2025-04-15T16:30:00Z",
    deadline: "2025-09-01T00:00:00Z",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    creator: {
      id: "u5",
      name: "Ngozi Adeyemi",
      email: "ngozi.adeyemi@example.com",
      avatar: "https://i.pravatar.cc/150?img=9",
      joinedDate: "2024-02-14",
      totalCampaigns: 1,
    },
    tags: ["women", "artisan", "culture", "economy"],
    updates: 1,
    backers: 77,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const progressPct = (raised: number, goal: number) =>
  Math.min(100, Math.round((raised / goal) * 100));

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CampaignStatus }) {
  const map: Record<CampaignStatus, { bg: string; text: string; dot: string; label: string }> = {
    pending:  { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-400",  label: "Pending" },
    approved: { bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-400",label: "Approved" },
    rejected: { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-400",    label: "Rejected" },
  };
  const { bg, text, dot, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ─── Campaign Card ────────────────────────────────────────────────────────────

function CampaignCard({
  campaign,
  selected,
  onSelect,
  onReview,
  onQuickApprove,
  onQuickReject,
}: {
  campaign: Campaign;
  selected: boolean;
  onSelect: (id: string) => void;
  onReview: (campaign: Campaign) => void;
  onQuickApprove: (id: string) => void;
  onQuickReject: (campaign: Campaign) => void;
}) {
  const pct = progressPct(campaign.raisedAmount, campaign.goalAmount);

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden
        ${selected ? "border-indigo-400 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300 hover:shadow-md"}`}
    >
      {/* Checkbox */}
      {campaign.status === "pending" && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(campaign.id)}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      )}

      {/* Cover */}
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 right-2">
          <StatusBadge status={campaign.status} />
        </div>
        <span className="absolute bottom-2 left-3 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {campaign.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">{campaign.title}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-3">{campaign.description}</p>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">{fmt(campaign.raisedAmount)} raised</span>
            <span className="font-semibold text-slate-700">{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">Goal: {fmt(campaign.goalAmount)}</p>
        </div>

        {/* Creator */}
        <div className="flex items-center gap-2 py-2 border-t border-slate-100">
          <img src={campaign.creator.avatar} alt={campaign.creator.name} className="w-6 h-6 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">{campaign.creator.name}</p>
            <p className="text-xs text-slate-400">{campaign.creator.totalCampaigns} campaigns</p>
          </div>
          <span className="text-xs text-slate-400">{fmtDate(campaign.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onReview(campaign)}
            className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
          >
            Full Review
          </button>
          {campaign.status === "pending" && (
            <>
              <button
                onClick={() => onQuickApprove(campaign.id)}
                className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => onQuickReject(campaign)}
                className="flex-1 text-xs font-medium py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
              >
                ✕ Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  campaign,
  onClose,
  onApprove,
  onReject,
}: {
  campaign: Campaign;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const pct = progressPct(campaign.raisedAmount, campaign.goalAmount);

  const handleReject = () => {
    if (!reason.trim()) {
      setReasonError("Rejection reason is required.");
      return;
    }
    onReject(campaign.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest">Campaign Review</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{campaign.title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={campaign.status} />
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover */}
          <div className="rounded-xl overflow-hidden h-52">
            <img src={campaign.coverImage} alt={campaign.title} className="w-full h-full object-cover" />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Goal", value: fmt(campaign.goalAmount) },
              { label: "Raised", value: fmt(campaign.raisedAmount) },
              { label: "Progress", value: `${pct}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                <p className="font-bold text-slate-900 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Campaign Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{campaign.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {campaign.tags.map((tag) => (
              <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>

          {/* Creator info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Campaign Creator</h4>
            <div className="flex items-center gap-3">
              <img src={campaign.creator.avatar} alt={campaign.creator.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow" />
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{campaign.creator.name}</p>
                <p className="text-sm text-slate-500">{campaign.creator.email}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Joined {fmtDate(campaign.creator.joinedDate)}</p>
                <p className="font-medium text-slate-600">{campaign.creator.totalCampaigns} campaigns</p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Category", value: campaign.category },
              { label: "Deadline", value: fmtDate(campaign.deadline) },
              { label: "Backers", value: campaign.backers.toString() },
              { label: "Updates", value: campaign.updates.toString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          {/* Rejection form */}
          {rejecting && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason <span className="text-red-500">*</span></h4>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setReasonError(""); }}
                placeholder="Explain clearly why this campaign is being rejected. This message will be sent to the creator."
                rows={4}
                className={`w-full text-sm rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 
                  ${reasonError ? "border-red-400 bg-red-50" : "border-red-200 bg-white"}`}
              />
              {reasonError && <p className="text-xs text-red-600 mt-1">{reasonError}</p>}
              <p className="text-xs text-red-500 mt-1">The creator will be notified via email with this reason.</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {campaign.status === "pending" && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex gap-3">
            {!rejecting ? (
              <>
                <button
                  onClick={() => onApprove(campaign.id)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-emerald-200"
                >
                  ✓ Approve Campaign
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-sm transition-colors"
                >
                  ✕ Reject Campaign
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setRejecting(false); setReason(""); setReasonError(""); }}
                  className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-red-200"
                >
                  Confirm Rejection & Notify Creator
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rejection Quick Modal ─────────────────────────────────────────────────────

function QuickRejectModal({
  campaign,
  onClose,
  onConfirm,
}: {
  campaign: Campaign;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) { setError("Rejection reason is required."); return; }
    onConfirm(campaign.id, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-lg flex-shrink-0">✕</div>
          <div>
            <h3 className="font-bold text-slate-900">Reject Campaign</h3>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{campaign.title}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Provide a clear reason for the creator..."
            rows={4}
            className={`w-full text-sm rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400
              ${error ? "border-red-400" : "border-slate-200"}`}
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          <p className="text-xs text-slate-400 mt-1">Creator will be notified by email.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors">
            Confirm & Notify
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }: { message: string; type: "success" | "error"; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignReviewPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviewingCampaign, setReviewingCampaign] = useState<Campaign | null>(null);
  const [quickRejectCampaign, setQuickRejectCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");
  const [bulkRejectError, setBulkRejectError] = useState("");

  // Counts
  const counts = {
    all: campaigns.length,
    pending: campaigns.filter((c) => c.status === "pending").length,
    approved: campaigns.filter((c) => c.status === "approved").length,
    rejected: campaigns.filter((c) => c.status === "rejected").length,
  };

  // Filtered list
  const visible = campaigns.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.creator.name.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Notify helper (stub — replace with real API call)
  const notifyCreator = (campaign: Campaign, decision: "approved" | "rejected", reason?: string) => {
    console.log(`[Notification] Sending "${decision}" email to ${campaign.creator.email}`, reason ?? "");
  };

  const approveCampaign = useCallback((id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c))
    );
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) notifyCreator(campaign, "approved");
    setReviewingCampaign(null);
    setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    showToast("Campaign approved. Creator has been notified.");
  }, [campaigns]);

  const rejectCampaign = useCallback((id: string, reason: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c))
    );
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) notifyCreator(campaign, "rejected", reason);
    setReviewingCampaign(null);
    setQuickRejectCampaign(null);
    setSelectedIds((s) => { const n = new Set(s); n.delete(id); return n; });
    showToast("Campaign rejected. Creator has been notified.");
  }, [campaigns]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllPending = () => {
    const pendingVisible = visible.filter((c) => c.status === "pending").map((c) => c.id);
    setSelectedIds(new Set(pendingVisible));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkApprove = () => {
    selectedIds.forEach((id) => {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "approved" } : c)));
      const campaign = campaigns.find((c) => c.id === id);
      if (campaign) notifyCreator(campaign, "approved");
    });
    showToast(`${selectedIds.size} campaigns approved. Creators notified.`);
    clearSelection();
  };

  const bulkReject = () => {
    if (!bulkRejectReason.trim()) { setBulkRejectError("Rejection reason is required."); return; }
    selectedIds.forEach((id) => {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)));
      const campaign = campaigns.find((c) => c.id === id);
      if (campaign) notifyCreator(campaign, "rejected", bulkRejectReason);
    });
    showToast(`${selectedIds.size} campaigns rejected. Creators notified.`);
    clearSelection();
    setBulkRejecting(false);
    setBulkRejectReason("");
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">StellarAid Admin</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campaign Reviews</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Stats pills */}
            {counts.pending > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {counts.pending} pending review
              </span>
            )}
            <span className="text-sm text-slate-400">{counts.approved} approved · {counts.rejected} rejected</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Filters + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilter(key); clearSelection(); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${filter === key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                {label}
                <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5
                  ${filter === key ? "bg-indigo-500 text-indigo-100" : "bg-slate-100 text-slate-500"}`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-48">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, creator, category…"
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-indigo-700">{selectedIds.size} selected</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={bulkApprove}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                ✓ Approve All Selected
              </button>
              <button
                onClick={() => setBulkRejecting(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
              >
                ✕ Reject All Selected
              </button>
              <button
                onClick={selectAllPending}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
              >
                Select All Pending
              </button>
              <button
                onClick={clearSelection}
                className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Bulk reject reason */}
            {bulkRejecting && (
              <div className="w-full mt-2 space-y-2">
                <label className="text-xs font-semibold text-red-700 block">
                  Bulk Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bulkRejectReason}
                  onChange={(e) => { setBulkRejectReason(e.target.value); setBulkRejectError(""); }}
                  placeholder="Reason applied to all selected campaigns…"
                  rows={2}
                  className={`w-full text-sm rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400
                    ${bulkRejectError ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"}`}
                />
                {bulkRejectError && <p className="text-xs text-red-600">{bulkRejectError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setBulkRejecting(false); setBulkRejectReason(""); }} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button onClick={bulkReject} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white">Confirm Bulk Reject</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        {visible.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-4xl mb-3">🗂</p>
            <p className="font-medium text-slate-600">No campaigns found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                selected={selectedIds.has(campaign.id)}
                onSelect={toggleSelect}
                onReview={setReviewingCampaign}
                onQuickApprove={approveCampaign}
                onQuickReject={setQuickRejectCampaign}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {reviewingCampaign && (
        <ReviewModal
          campaign={reviewingCampaign}
          onClose={() => setReviewingCampaign(null)}
          onApprove={approveCampaign}
          onReject={rejectCampaign}
        />
      )}

      {quickRejectCampaign && (
        <QuickRejectModal
          campaign={quickRejectCampaign}
          onClose={() => setQuickRejectCampaign(null)}
          onConfirm={rejectCampaign}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
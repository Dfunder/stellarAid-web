'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDraftManager } from '@/hooks/useDraftManager';
import { FileText, Trash2, ArrowRight, Clock, Plus } from 'lucide-react';

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DraftsPage() {
  const router = useRouter();
  const { drafts, deleteDraft } = useDraftManager();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleResume(draftId: string) {
    router.push(`/dashboard/projects/create?draft=${draftId}`);
  }

  function handleDelete(id: string) {
    deleteDraft(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Drafts</h1>
          <p className="text-gray-500 mt-1">Resume where you left off.</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/projects/create')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No drafts yet.</p>
          <p className="text-gray-400 text-sm mt-1">Start a new project and it will auto-save here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Card key={draft.id} className="p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-blue-50 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{draft.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">
                        Step {draft.currentStep + 1} of 4
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(draft.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {confirmDeleteId === draft.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(draft.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmDeleteId(draft.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete draft"
                        aria-label="Delete draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Button
                        size="sm"
                        onClick={() => handleResume(draft.id)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Resume <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

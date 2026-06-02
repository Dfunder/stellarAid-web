
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface ProjectDraft {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  formData: Record<string, unknown>;
}

type SaveStatus =
  | 'idle'
  | 'saving'
  | 'saved'
  | 'error';

interface UseDraftManagerReturn {
  drafts: ProjectDraft[];
  activeDraftId: string | null;
  lastSaved: Date | null;
  saveStatus: SaveStatus;
  loading: boolean;
  error: string | null;
  saveDraft: (
    formData: Record<string, unknown>,
    currentStep: number
  ) => Promise<string | null>;
  deleteDraft: (id: string) => Promise<void>;
  getDraft: (id: string) => ProjectDraft | null;
  scheduleAutoSave: (
    formData: Record<string, unknown>,
    currentStep: number
  ) => void;
  stopAutoSave: () => void;
}

const STORAGE_KEY = 'project_drafts';
const AUTO_SAVE_INTERVAL_MS = 30_000;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function loadDraftsFromStorage(): ProjectDraft[] {
  if (!isBrowser()) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load drafts from localStorage:', error);
    return [];
  }
}

function persistDraftsToStorage(drafts: ProjectDraft[]) {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Failed to persist drafts:', error);
  }
}

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`API Error (${response.status}): ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    return null;
  }
}

async function saveDraftToAPI(
  draft: ProjectDraft
): Promise<ProjectDraft | null> {
  return apiRequest<ProjectDraft>('/api/drafts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(draft),
  });
}

async function fetchDraftsFromAPI(): Promise<ProjectDraft[]> {
  const result = await apiRequest<ProjectDraft[]>('/api/drafts');
  return result ?? [];
}

async function deleteDraftFromAPI(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/drafts/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to delete draft:', error);
    return false;
  }
}

export function useDraftManager(
  initialDraftId?: string
): UseDraftManagerReturn {
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(
    initialDraftId ?? null
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const pendingDataRef = useRef<{
    formData: Record<string, unknown>;
    currentStep: number;
  } | null>(null);

  // Load drafts on mount
  useEffect(() => {
    async function initializeDrafts() {
      setLoading(true);

      try {
        const apiDrafts = await fetchDraftsFromAPI();

        if (apiDrafts.length > 0) {
          setDrafts(apiDrafts);
          persistDraftsToStorage(apiDrafts);
        } else {
          const localDrafts = loadDraftsFromStorage();
          setDrafts(localDrafts);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load drafts.');
      } finally {
        setLoading(false);
      }
    }

    void initializeDrafts();
  }, []);

  const saveDraft = useCallback(
    async (
      formData: Record<string, unknown>,
      currentStep: number
    ): Promise<string | null> => {
      try {
        setSaveStatus('saving');
        setError(null);

        const now = new Date().toISOString();

        const id =
          activeDraftId ??
          `draft_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;

        const title =
          typeof formData.title === 'string' &&
          formData.title.trim().length > 0
            ? formData.title
            : 'Untitled Draft';

        const existingDraft = drafts.find((d) => d.id === id);

        const updatedDraft: ProjectDraft = {
          id,
          title,
          createdAt: existingDraft?.createdAt ?? now,
          updatedAt: now,
          currentStep,
          formData,
        };

        // Update local state immediately (optimistic update)
        setDrafts((prev) => {
          const exists = prev.some((d) => d.id === id);

          const updated = exists
            ? prev.map((d) => (d.id === id ? updatedDraft : d))
            : [updatedDraft, ...prev];

          persistDraftsToStorage(updated);

          return updated;
        });

        setActiveDraftId(id);
        setLastSaved(new Date());

        // Background API sync
        const apiResult = await saveDraftToAPI(updatedDraft);

        if (!apiResult) {
          console.warn('Saved locally but API sync failed.');
        }

        setSaveStatus('saved');

        return id;
      } catch (err) {
        console.error(err);
        setSaveStatus('error');
        setError('Failed to save draft.');
        return null;
      }
    },
    [activeDraftId, drafts]
  );

  const deleteDraft = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);

        // Optimistic removal
        setDrafts((prev) => {
          const updated = prev.filter((d) => d.id !== id);
          persistDraftsToStorage(updated);
          return updated;
        });

        if (activeDraftId === id) {
          setActiveDraftId(null);
        }

        await deleteDraftFromAPI(id);
      } catch (err) {
        console.error(err);
        setError('Failed to delete draft.');
      }
    },
    [activeDraftId]
  );

  const getDraft = useCallback(
    (id: string): ProjectDraft | null => {
      return drafts.find((d) => d.id === id) ?? null;
    },
    [drafts]
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  const scheduleAutoSave = useCallback(
    (
      formData: Record<string, unknown>,
      currentStep: number
    ) => {
      pendingDataRef.current = {
        formData,
        currentStep,
      };

      // Prevent duplicate timers
      if (autoSaveTimerRef.current) return;

      autoSaveTimerRef.current = setInterval(() => {
        if (pendingDataRef.current) {
          void saveDraft(
            pendingDataRef.current.formData,
            pendingDataRef.current.currentStep
          );
        }
      }, AUTO_SAVE_INTERVAL_MS);
    },
    [saveDraft]
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      stopAutoSave();
    };
  }, [stopAutoSave]);

  // Auto-clear "saved" status after a few seconds
  useEffect(() => {
    if (saveStatus !== 'saved') return;

    const timeout = setTimeout(() => {
      setSaveStatus('idle');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [saveStatus]);

  return {
    drafts,
    activeDraftId,
    lastSaved,
    saveStatus,
    loading,
    error,
    saveDraft,
    deleteDraft,
    getDraft,
    scheduleAutoSave,
    stopAutoSave,
  };
}


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

const STORAGE_KEY = 'project_drafts';
const AUTO_SAVE_INTERVAL_MS = 30_000;

function loadDrafts(): ProjectDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function persistDrafts(drafts: ProjectDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

async function saveDraftToAPI(
  id: string,
  title: string,
  formData: Record<string, unknown>,
  currentStep: number
): Promise<ProjectDraft | null> {
  try {
    const response = await fetch('/api/drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        title,
        formData,
        currentStep,
      }),
    });

    if (!response.ok) {
      console.error('API error:', response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving draft to API:', error);
    return null;
  }
}

async function deleteDraftFromAPI(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/drafts/${id}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting draft from API:', error);
    return false;
  }
}

async function fetchDraftsFromAPI(): Promise<ProjectDraft[]> {
  try {
    const response = await fetch('/api/drafts');
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching drafts from API:', error);
    return [];
  }
}

export function useDraftManager(draftId?: string) {
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(draftId ?? null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingDataRef = useRef<{ formData: Record<string, unknown>; currentStep: number } | null>(null);

  // Load drafts from API on mount
  useEffect(() => {
    const loadDrafts = async () => {
      const apiDrafts = await fetchDraftsFromAPI();
      if (apiDrafts.length > 0) {
        setDrafts(apiDrafts);
      } else {
        // Fallback to localStorage
        setDrafts(loadDrafts());
      }
    };
    loadDrafts();
  }, []);

  const saveDraft = useCallback(
    async (formData: Record<string, unknown>, currentStep: number): Promise<string> => {
      setSaveStatus('saving');
      const now = new Date().toISOString();
      const id = activeDraftId ?? `draft_${Date.now()}`;
      const title = (formData.title as string) || 'Untitled Draft';

      // Try to save to API first
      const apiResult = await saveDraftToAPI(id, title, formData, currentStep);

      if (apiResult) {
        // API save successful
        const all = loadDrafts();
        const existing = all.findIndex((d) => d.id === id);

        const updated: ProjectDraft = {
          id,
          title,
          createdAt: existing >= 0 ? (all[existing]?.createdAt ?? now) : now,
          updatedAt: now,
          currentStep,
          formData,
        };

        if (existing >= 0) {
          all[existing] = updated;
        } else {
          all.unshift(updated);
        }

        persistDrafts(all);
        setDrafts(all);
        setActiveDraftId(id);
        setLastSaved(new Date());
        setSaveStatus('saved');
        return id;
      } else {
        // Fallback to localStorage if API fails
        const all = loadDrafts();
        const existing = all.findIndex((d) => d.id === id);

        const updated: ProjectDraft = {
          id,
          title,
          createdAt: existing >= 0 ? (all[existing]?.createdAt ?? now) : now,
          updatedAt: now,
          currentStep,
          formData,
        };

        if (existing >= 0) {
          all[existing] = updated;
        } else {
          all.unshift(updated);
        }

        persistDrafts(all);
        setDrafts(all);
        setActiveDraftId(id);
        setLastSaved(new Date());
        setSaveStatus('saved');
        return id;
      }
    },
    [activeDraftId]
  );

  const deleteDraft = useCallback(async (id: string) => {
    // Try API first
    await deleteDraftFromAPI(id);

    // Also delete from localStorage
    const all = loadDrafts().filter((d) => d.id !== id);
    persistDrafts(all);
    setDrafts(all);
    if (activeDraftId === id) setActiveDraftId(null);
  }, [activeDraftId]);

  const getDraft = useCallback((id: string): ProjectDraft | null => {
    return loadDrafts().find((d) => d.id === id) ?? null;
  }, []);

  // Schedule auto-save every 30 seconds when data changes
  const scheduleAutoSave = useCallback(
    (formData: Record<string, unknown>, currentStep: number) => {
      pendingDataRef.current = { formData, currentStep };
      if (!autoSaveTimerRef.current) {
        autoSaveTimerRef.current = setInterval(() => {
          if (pendingDataRef.current) {
            saveDraft(pendingDataRef.current.formData, pendingDataRef.current.currentStep);
          }
        }, AUTO_SAVE_INTERVAL_MS);
      }
    },
    [saveDraft]
  );

  const stopAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => stopAutoSave(), [stopAutoSave]);

  return {
    drafts,
    activeDraftId,
    lastSaved,
    saveStatus,
    saveDraft,
    deleteDraft,
    getDraft,
    scheduleAutoSave,
    stopAutoSave,
  };
}

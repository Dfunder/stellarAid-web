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

export function useDraftManager(draftId?: string) {
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(draftId ?? null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingDataRef = useRef<{ formData: Record<string, unknown>; currentStep: number } | null>(null);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const saveDraft = useCallback(
    (formData: Record<string, unknown>, currentStep: number): string => {
      setSaveStatus('saving');
      const all = loadDrafts();
      const now = new Date().toISOString();
      const id = activeDraftId ?? `draft_${Date.now()}`;

      const existing = all.findIndex((d) => d.id === id);
      const title = (formData.title as string) || 'Untitled Draft';

      const updated: ProjectDraft = {
        id,
        title,
        createdAt: existing >= 0 ? all[existing].createdAt : now,
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
    },
    [activeDraftId]
  );

  const deleteDraft = useCallback((id: string) => {
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

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Pencil, Trash2, Plus } from 'lucide-react';
import { useNotificationStore } from '@/store';
import { updatesApi } from '@/lib/api/updates';
import type { Update } from '@/types/api';

interface UpdateTimelineProps {
  campaignId: string;
}

export function UpdateTimeline({ campaignId }: UpdateTimelineProps) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const sortedUpdates = useMemo(
    () => [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [updates]
  );

  useEffect(() => {
    let mounted = true;

    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        const response = await updatesApi.getUpdates(campaignId);
        if (mounted) {
          setUpdates(response.data);
        }
      } catch (fetchError) {
        console.error('Unable to fetch updates:', fetchError);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUpdates();

    return () => {
      mounted = false;
    };
  }, [campaignId]);

  const clearForm = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setImageUrls([]);
    setEditId(null);
    setError(null);
  };

  const handleAddImage = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      return;
    }

    setImageUrls((current) => [...current, trimmed]);
    setImageUrl('');
  };

  const handleRemoveImage = (url: string) => {
    setImageUrls((current) => current.filter((item) => item !== url));
  };

  const handleEdit = (update: Update) => {
    setEditId(update.id);
    setTitle(update.title);
    setContent(update.content);
    setImageUrls(update.imageUrls ?? []);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (updateId: string) => {
    setIsSubmitting(true);
    try {
      await updatesApi.deleteUpdate(campaignId, updateId);
      setUpdates((current) => current.filter((item) => item.id !== updateId));
    } catch (deleteError) {
      console.error('Failed to delete update:', deleteError);
      setError('Unable to delete update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and content.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editId) {
        const response = await updatesApi.updateUpdate(campaignId, editId, {
          title: title.trim(),
          content: content.trim(),
          imageUrls
        });

        setUpdates((current) =>
          current.map((item) => (item.id === editId ? response.data : item))
        );
      } else {
        const response = await updatesApi.postUpdate(campaignId, {
          title: title.trim(),
          content: content.trim(),
          imageUrls
        });

        setUpdates((current) => [response.data, ...current]);
        addNotification({
          type: 'campaign_update',
          title: 'New campaign update',
          message: `A new update was posted for campaign ${campaignId}: ${response.data.title}`,
          read: false,
          link: `/creator`
        });
      }

      clearForm();
    } catch (submitError) {
      console.error('Unable to save update:', submitError);
      setError('Something went wrong while saving your update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Campaign Updates</h2>
          <p className="mt-1 text-sm text-slate-500">Publish progress reports, photos, and milestone notes for your campaign.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
          <Bell className="h-4 w-4" />
          {updates.length} update{updates.length === 1 ? '' : 's'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Update title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter a title for this update"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Image URL</span>
            <div className="flex gap-2">
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="Paste an image URL"
                className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center gap-2 rounded-3xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Content</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            placeholder="Share what’s new with your campaign..."
            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
        </label>

        {imageUrls.length > 0 && (
          <div className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Preview images</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {imageUrls.map((url) => (
                <div key={url} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white">
                  <img src={url} alt="Update preview" loading="lazy" className="h-28 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white opacity-80 transition hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {editId ? 'Save Update' : 'Post Update'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-5">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading updates...</p>
        ) : sortedUpdates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No updates posted yet. Create the first campaign update to keep followers informed.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedUpdates.map((update) => (
              <div key={update.id} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <span className="h-3 w-3 rounded-full bg-sky-600" />
                  <span className="mt-2 h-full w-px bg-slate-200" />
                </div>
                <div className="flex-1 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{update.title}</h3>
                      <p className="text-sm text-slate-500">{new Date(update.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(update)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(update.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">{update.content}</p>

                  {update.imageUrls?.length ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {update.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt={update.title}
                          loading="lazy"
                          className="h-40 w-full rounded-3xl object-cover border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateTimeline;

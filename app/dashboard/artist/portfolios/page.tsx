'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectPortfolios, selectPortfoliosLoading } from '@/app/features/portfolios/portfoliosSelectors';
import { fetchMyPortfolios, deletePortfolio, togglePortfolioStatus } from '@/app/features/portfolios/portfoliosThunks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Button from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Plus, Edit, Trash2, Eye, EyeOff, Image, FolderOpen } from 'lucide-react';

export default function PortfolioManagementPage() {
  const dispatch = useAppDispatch();
  const portfolios = useAppSelector(selectPortfolios);
  const loading = useAppSelector(selectPortfoliosLoading);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyPortfolios());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) return;
    setDeletingId(id);
    await dispatch(deletePortfolio(id));
    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'draft' | 'published') => {
    setTogglingId(id);
    await dispatch(togglePortfolioStatus({ id, currentStatus }));
    setTogglingId(null);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Portfolios</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your portfolio collections
            </p>
          </div>
          <Link href="/dashboard/artist/portfolios/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Portfolio
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && portfolios.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
              >
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && portfolios.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              No portfolios yet
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 max-w-md mx-auto mb-6">
              Create your first portfolio to showcase your work to potential clients.
            </p>
            <Link href="/dashboard/artist/portfolios/new">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Create Your First Portfolio
              </Button>
            </Link>
          </div>
        )}

        {/* Portfolio List */}
        {portfolios.length > 0 && (
          <div className="space-y-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cover Image */}
                  <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                    {portfolio.coverImage ? (
                      <img
                        src={portfolio.coverImage}
                        alt={portfolio.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8 text-neutral-300 dark:text-neutral-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                          {portfolio.title}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {portfolio.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                            portfolio.status === 'published'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {portfolio.status === 'published' ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          {portfolio.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                      <span>{portfolio.category || 'Uncategorized'}</span>
                      <span>·</span>
                      <span>{portfolio.items?.length || 0} items</span>
                      <span>·</span>
                      <span>
                        Updated{' '}
                        {new Date(portfolio.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Tags */}
                    {portfolio.tags && portfolio.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {portfolio.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <Link href={`/dashboard/artist/portfolios/${portfolio.id}/edit`}>
                        <Button variant="ghost" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(portfolio.id, portfolio.status)}
                        disabled={togglingId === portfolio.id}
                        isLoading={togglingId === portfolio.id}
                        leftIcon={
                          portfolio.status === 'published' ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {portfolio.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(portfolio.id)}
                        disabled={deletingId === portfolio.id}
                        isLoading={deletingId === portfolio.id}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

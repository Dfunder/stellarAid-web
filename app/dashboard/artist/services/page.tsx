'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectServices, selectServicesLoading } from '@/app/features/services/servicesSelectors';
import { fetchMyServices, deleteService, toggleServiceStatus } from '@/app/features/services/servicesThunks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Button from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Plus, Edit, Trash2, Eye, EyeOff, Briefcase, Clock, RefreshCw, DollarSign } from 'lucide-react';

export default function ServiceManagementPage() {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectServices);
  const loading = useAppSelector(selectServicesLoading);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMyServices());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    setDeletingId(id);
    await dispatch(deleteService(id));
    setDeletingId(null);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'draft' | 'published' | 'inactive') => {
    if (currentStatus === 'draft') {
      // Publish draft directly
      setTogglingId(id);
      await dispatch(toggleServiceStatus({ id, currentStatus }));
      setTogglingId(null);
      return;
    }
    setTogglingId(id);
    await dispatch(toggleServiceStatus({ id, currentStatus }));
    setTogglingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
            <Eye className="w-3 h-3" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            <EyeOff className="w-3 h-3" />
            Inactive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            <EyeOff className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Services</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your creative services and offerings
            </p>
          </div>
          <Link href="/dashboard/artist/services/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add New Service
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && services.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton className="w-full sm:w-28 h-28 rounded-xl flex-shrink-0" />
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
        {!loading && services.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-neutral-400" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              No services yet
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 max-w-md mx-auto mb-6">
              Create your first service to start receiving orders from clients.
            </p>
            <Link href="/dashboard/artist/services/new">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
                Create Your First Service
              </Button>
            </Link>
          </div>
        )}

        {/* Service List */}
        {services.length > 0 && (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cover / Icon */}
                  <div className="w-full sm:w-28 h-28 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                          {service.title}
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">{getStatusBadge(service.status)}</div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                        {service.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        {service.price} USDC
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {service.deliveryDays}d
                      </span>
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" />
                        {service.revisions} revisions
                      </span>
                      <span>·</span>
                      <span>
                        Updated{' '}
                        {new Date(service.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Features preview */}
                    {service.features && service.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {service.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                        {service.features.length > 3 && (
                          <span className="px-2 py-0.5 text-neutral-400 dark:text-neutral-500 text-xs">
                            +{service.features.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                      <Link href={`/dashboard/artist/services/${service.id}/edit`}>
                        <Button variant="ghost" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(service.id, service.status)}
                        disabled={togglingId === service.id}
                        isLoading={togglingId === service.id}
                        leftIcon={
                          service.status === 'published' ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {service.status === 'published' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                        isLoading={deletingId === service.id}
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

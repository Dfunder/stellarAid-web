'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectServices, selectServicesLoading } from '@/app/features/services/servicesSelectors';
import { fetchServices } from '@/app/features/services/servicesThunks';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Briefcase, Clock, RefreshCw, DollarSign } from 'lucide-react';

interface ServicesTabProps {
  artistId: string;
}

export default function ServicesTab({ artistId }: ServicesTabProps) {
  const dispatch = useAppDispatch();
  const services = useAppSelector(selectServices);
  const loading = useAppSelector(selectServicesLoading);

  useEffect(() => {
    dispatch(fetchServices({ artistId }));
  }, [artistId, dispatch]);

  if (loading && services.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <Skeleton className="h-32 w-full rounded-xl mb-4" />
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          No services yet
        </h3>
        <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-sm mx-auto">
          This artist hasn&apos;t published any services yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/marketplace/services/${service.id}`}
          className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 transition-all"
        >
          <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center p-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white text-center line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
              {service.title}
            </h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4">
              {service.description}
            </p>
            <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {service.deliveryDays}d
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" />
                {service.revisions}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <span className="text-xs text-neutral-400">Starting at</span>
              <span className="font-bold text-primary-700 dark:text-primary-400">
                {service.price} USDC
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

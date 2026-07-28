'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { selectCurrentService } from '@/app/features/services/servicesSelectors';
import { fetchServiceById } from '@/app/features/services/servicesThunks';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { Skeleton } from '@/app/components/ui/Skeleton';
import Button from '@/app/components/ui/Button';
import ServiceForm from '../../components/ServiceForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditServicePage() {
  const params = useParams();
  const serviceId = params.id as string;
  const dispatch = useAppDispatch();
  const service = useAppSelector(selectCurrentService);
  const [isLoadingService, setIsLoadingService] = useState(true);

  useEffect(() => {
    if (serviceId) {
      setIsLoadingService(true);
      dispatch(fetchServiceById(serviceId)).finally(() => setIsLoadingService(false));
    }
  }, [serviceId, dispatch]);

  if (isLoadingService) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl space-y-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[500px] w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!service && !isLoadingService) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl">
          <Link
            href="/dashboard/artist/services"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              Service Not Found
            </h2>
            <p className="text-neutral-400 dark:text-neutral-500 mb-6">
              The service you&apos;re trying to edit doesn&apos;t exist or has been deleted.
            </p>
            <Link href="/dashboard/artist/services">
              <Button variant="primary">Back to Services</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <ServiceForm mode="edit" initialService={service} />;
}

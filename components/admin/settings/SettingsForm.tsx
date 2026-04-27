import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export interface PlatformSettings {
  minGoal: number;
  platformFee: number;
  maxDuration: number;
  lastModified?: string;
  modifiedBy?: string;
}

const schema = yup.object().shape({
  minGoal: yup.number().required('Minimum goal is required').min(1, 'Minimum goal must be at least 1'),
  platformFee: yup.number().required('Platform fee is required').min(0, 'Fee cannot be negative').max(100, 'Fee cannot exceed 100%'),
  maxDuration: yup.number().required('Max duration is required').min(1, 'Duration must be at least 1 day').max(365, 'Max duration cannot exceed 365 days'),
});

interface SettingsFormProps {
  initialData: PlatformSettings;
  onSubmit: (data: PlatformSettings) => void;
  isLoading?: boolean;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PlatformSettings>({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Minimum Donation Goal (USD)
            </label>
            <Input
              type="number"
              {...register('minGoal')}
              error={errors.minGoal?.message}
              placeholder="e.g. 500"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum amount required for a project to be published.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Platform Fee (%)
            </label>
            <Input
              type="number"
              step="0.1"
              {...register('platformFee')}
              error={errors.platformFee?.message}
              placeholder="e.g. 2.5"
            />
            <p className="text-xs text-gray-500 mt-1">Percentage taken from each successful donation.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Maximum Project Duration (Days)
            </label>
            <Input
              type="number"
              {...register('maxDuration')}
              error={errors.maxDuration?.message}
              placeholder="e.g. 60"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum number of days a project can remain active.</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Audit Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Last Modified</span>
              <span className="font-medium text-gray-900">{initialData.lastModified || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Modified By</span>
              <span className="font-medium text-gray-900">{initialData.modifiedBy || 'System'}</span>
            </div>
            <div className="pt-4 mt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">
                * All changes are logged and will be applied globally to all new and existing projects where applicable.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
        <Button
          type="submit"
          disabled={!isDirty || isLoading}
          variant="primary"
          className="min-w-[140px]"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset(initialData)}
          disabled={!isDirty || isLoading}
        >
          Discard Changes
        </Button>
      </div>
    </form>
  );
};

import React from 'react';
import { Input } from '@/components/ui/Input';

export type ReportType = 'users' | 'projects' | 'donations' | 'withdrawals';

interface ReportFiltersProps {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  reportType,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  filters,
  onFilterChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        {/* Report Specific Filters */}
        {reportType === 'users' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.role || ''}
              onChange={(e) => onFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="creator">Creator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        {reportType === 'projects' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="funded">Funded</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {reportType === 'donations' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={filters.asset || ''}
              onChange={(e) => onFilterChange('asset', e.target.value)}
            >
              <option value="">All Assets</option>
              <option value="USDC">USDC</option>
              <option value="XLM">XLM</option>
            </select>
          </div>
        )}

        {reportType === 'withdrawals' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={filters.minAmount || ''}
              onChange={(e) => onFilterChange('minAmount', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

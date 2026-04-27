'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Users, Globe, DollarSign, Wallet, Search } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { ReportFilters, ReportType } from '@/components/admin/reports/ReportFilters';
import { ReportPreviewTable } from '@/components/admin/reports/ReportPreviewTable';
import { ExportButton } from '@/components/admin/reports/ExportButton';

// Mock data generation functions
const generateMockUsers = () => Array.from({ length: 10 }, (_, i) => ({
  id: `USR-${100 + i}`,
  name: ['Alice Smith', 'Bob Johnson', 'Charlie Brown', 'Diana Prince', 'Edward Norton'][i % 5],
  email: `user${i}@example.com`,
  role: ['user', 'creator', 'admin'][i % 3],
  status: 'active',
  joinedDate: `2026-0${1 + (i % 4)}-${10 + i}`,
}));

const generateMockProjects = () => Array.from({ length: 10 }, (_, i) => ({
  id: `PRJ-${200 + i}`,
  title: `Stellar Project ${i + 1}`,
  creator: `Creator ${i % 3 + 1}`,
  status: ['pending', 'active', 'funded', 'closed'][i % 4],
  goal: 5000 + (i * 1000),
  raised: 2500 + (i * 500),
  startDate: `2026-0${1 + (i % 4)}-${10 + i}`,
}));

const generateMockDonations = () => Array.from({ length: 10 }, (_, i) => ({
  id: `DON-${300 + i}`,
  donor: `Donor ${i % 5 + 1}`,
  project: `Project ${i % 3 + 1}`,
  amount: 50 + (i * 25),
  asset: i % 2 === 0 ? 'USDC' : 'XLM',
  date: `2026-0${1 + (i % 4)}-${10 + i}`,
  txHash: `0x${Math.random().toString(16).slice(2, 10)}...`,
}));

const generateMockWithdrawals = () => Array.from({ length: 10 }, (_, i) => ({
  id: `WTH-${400 + i}`,
  project: `Project ${i % 3 + 1}`,
  amount: 1000 + (i * 200),
  asset: 'USDC',
  status: 'completed',
  date: `2026-0${1 + (i % 4)}-${10 + i}`,
  recipient: `G${Math.random().toString(36).slice(2, 15).toUpperCase()}`,
}));

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('donations');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      let data: any[] = [];
      switch (reportType) {
        case 'users': data = generateMockUsers(); break;
        case 'projects': data = generateMockProjects(); break;
        case 'donations': data = generateMockDonations(); break;
        case 'withdrawals': data = generateMockWithdrawals(); break;
      }
      setReportData(data);
      setIsLoading(false);
    }, 800);
  };

  // Initial report generation
  useEffect(() => {
    generateReport();
  }, [reportType]);

  const columns = useMemo(() => {
    switch (reportType) {
      case 'users':
        return [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role' },
          { key: 'joinedDate', label: 'Joined Date' },
        ];
      case 'projects':
        return [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'creator', label: 'Creator' },
          { key: 'status', label: 'Status' },
          { key: 'goal', label: 'Goal', format: (val: number) => `$${val.toLocaleString()}` },
          { key: 'raised', label: 'Raised', format: (val: number) => `$${val.toLocaleString()}` },
        ];
      case 'donations':
        return [
          { key: 'id', label: 'ID' },
          { key: 'donor', label: 'Donor' },
          { key: 'project', label: 'Project' },
          { key: 'amount', label: 'Amount' },
          { key: 'asset', label: 'Asset' },
          { key: 'date', label: 'Date' },
        ];
      case 'withdrawals':
        return [
          { key: 'id', label: 'ID' },
          { key: 'project', label: 'Project' },
          { key: 'amount', label: 'Amount', format: (val: number) => `$${val.toLocaleString()}` },
          { key: 'status', label: 'Status' },
          { key: 'date', label: 'Date' },
          { key: 'recipient', label: 'Recipient' },
        ];
      default:
        return [];
    }
  }, [reportType]);

  const exportHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    columns.forEach(col => {
      headers[col.key] = col.label;
    });
    return headers;
  }, [columns]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileBarChart className="text-blue-600 w-8 h-8" />
            Platform Reports
          </h1>
          <p className="text-gray-500 mt-1">Generate and export platform data for audit and analysis.</p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg">
          {(['donations', 'projects', 'users', 'withdrawals'] as ReportType[]).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                reportType === type
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Volume" value={124500} type="currency" icon={<DollarSign />} iconBg="bg-green-100" />
        <StatCard title="Active Users" value={1240} type="count" icon={<Users />} iconBg="bg-blue-100" />
        <StatCard title="Open Projects" value={45} type="count" icon={<Globe />} iconBg="bg-purple-100" />
        <StatCard title="Pending Withdrawals" value={8} type="count" icon={<Wallet />} iconBg="bg-amber-100" />
      </div>

      {/* Filters */}
      <ReportFilters
        reportType={reportType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Actions & Preview */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">Report Preview</h2>
          <div className="flex items-center gap-3">
            <Button onClick={generateReport} disabled={isLoading} className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Update Preview</span>
            </Button>
            <ExportButton
              data={reportData}
              filename={`${reportType}_report`}
              headers={exportHeaders}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="p-6">
          <ReportPreviewTable
            data={reportData}
            columns={columns}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-10 p-6 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-sm">
        <p className="font-semibold mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Transparency & Blockchain Data
        </p>
        <p>
          All reports reflect on-chain data from the Stellar network. Exported CSVs include transaction hashes where applicable for verification on Stellar Expert or other block explorers.
        </p>
      </div>
    </div>
  );
}

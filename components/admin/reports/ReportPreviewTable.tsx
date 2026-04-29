import React from 'react';
import type { CsvRow, CsvValue } from '@/utils/csvExport';

interface ReportColumn {
  key: string;
  label: string;
  format?: (value: CsvValue) => string;
}

interface ReportPreviewTableProps {
  data: CsvRow[];
  columns: ReportColumn[];
  isLoading?: boolean;
}

export const ReportPreviewTable: React.FC<ReportPreviewTableProps> = ({
  data,
  columns,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Generating report preview...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No data found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

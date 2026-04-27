import React from 'react';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExport';

interface ExportButtonProps {
  data: any[];
  filename: string;
  headers?: Record<string, string>;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  headers,
  disabled = false,
}) => {
  const handleExport = () => {
    exportToCSV(data, filename, headers);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={disabled || !data || data.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      <span>Export to CSV</span>
    </Button>
  );
};

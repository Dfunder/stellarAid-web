/**
 * Converts an array of objects to a CSV string and triggers a browser download.
 * 
 * @param data Array of objects to export
 * @param filename Name of the file to download (without .csv extension)
 * @param headers Optional custom headers mapping { [dataKey]: 'Header Label' }
 */
export function exportToCSV(
  data: any[],
  filename: string,
  headers?: Record<string, string>
) {
  if (!data || data.length === 0) {
    console.error('No data provided for CSV export');
    return;
  }

  // Get keys from the first object if headers are not provided
  const keys = Object.keys(data[0]);
  const headerLabels = headers ? Object.values(headers) : keys;
  const dataKeys = headers ? Object.keys(headers) : keys;

  // Create CSV rows
  const csvRows = [];

  // Add header row
  csvRows.push(headerLabels.join(','));

  // Add data rows
  for (const row of data) {
    const values = dataKeys.map(key => {
      const val = row[key];
      // Handle null/undefined
      if (val === null || val === undefined) return '';
      
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(val).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }

  // Combine rows into a single string
  const csvContent = csvRows.join('\n');

  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

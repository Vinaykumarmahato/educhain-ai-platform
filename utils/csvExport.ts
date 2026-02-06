
/**
 * Utility to export an array of objects to a CSV file.
 * @param data Array of objects to export
 * @param filename Desired name of the file
 * @param columns Mapping of object keys to CSV headers { key: "Header Name" }
 */
export const downloadCSV = (data: any[], filename: string, columns: Record<string, string>) => {
  const headers = Object.values(columns);
  const keys = Object.keys(columns);

  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = keys.map(key => {
      let val = row[key];
      // Handle nested properties or formatting if needed
      if (val === undefined || val === null) val = '';
      
      // Escape double quotes and wrap in quotes to handle commas within values
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

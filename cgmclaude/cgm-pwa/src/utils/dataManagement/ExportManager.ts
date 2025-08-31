import { db } from '../../core/database/database';

export const exportDataToCsv = async () => {
  try {
    const children = await db.children.toArray();
    const measurements = await db.measurements.toArray();

    if (children.length === 0) {
      alert("No data to export.");
      return;
    }

    // Create a map for easy lookup
    const childrenMap = new Map(children.map(c => [c.id, c]));

    const headers = [
      'ChildID', 'ChildName', 'DateOfBirth', 'Sex',
      'MeasurementID', 'MeasurementDate', 'AgeInDays',
      'Weight_kg', 'Height_cm', 'MUAC_cm',
      'WAZ', 'HAZ'
    ];

    const rows = measurements.map(m => {
      const child = childrenMap.get(m.childId);
      const rowData = [
        child?.id || '',
        child?.name || 'N/A',
        child ? new Date(child.dateOfBirth).toLocaleDateString() : 'N/A',
        child?.sex || 'N/A',
        m.id || '',
        new Date(m.measurementDate).toLocaleDateString(),
        m.ageInDays,
        m.anthropometry.weight?.value || '',
        m.anthropometry.height?.value || '',
        m.anthropometry.muac?.value || '',
        m.calculatedIndicators.waz?.value.toFixed(2) || '',
        m.calculatedIndicators.haz?.value.toFixed(2) || ''
      ];
      // Handle commas in names by wrapping in quotes
      return rowData.map(d => `"${d}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `cgm_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

  } catch (error) {
    console.error("Failed to export data:", error);
    alert("Error exporting data.");
  }
};

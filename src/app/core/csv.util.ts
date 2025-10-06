export function exportCsv(filename: string, rows: any[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const esc = (v: any) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => esc(r[h])).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

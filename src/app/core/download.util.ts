export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type: type + ';charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

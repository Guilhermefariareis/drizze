// Util para converter datas em formatos variados para ISO (YYYY-MM-DD)
// Exemplos:
// - "18/04/1994" → "1994-04-18"
// - "04/18/1994" → "1994-04-18"
// - "1994-04-18" → "1994-04-18"

function isValidDate(year: number, month: number, day: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function parseToISO(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Já em ISO
  const isoMatch = raw.match(/^\d{4}-\d{2}-\d{2}$/);
  if (isoMatch) {
    const [y, m, d] = raw.split('-').map(Number);
    return isValidDate(y, m, d) ? raw : null;
  }

  // Normalizar delimitadores para '/'
  const normalized = raw.replace(/[\.\-]/g, '/');
  const parts = normalized.split('/');
  if (parts.length !== 3) {
    // Tentar Date.parse como último recurso
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const d = dt.getDate();
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
  }

  let p1 = parts[0].replace(/\D/g, '');
  let p2 = parts[1].replace(/\D/g, '');
  let p3 = parts[2].replace(/\D/g, '');

  if (!(p1 && p2 && p3)) return null;

  let day: number;
  let month: number;
  let year: number;

  // Se terceiro é ano (4 dígitos)
  if (p3.length === 4) {
    year = Number(p3);
    const n1 = Number(p1);
    const n2 = Number(p2);
    // Heurística: se p1 > 12 então é dd/mm/yyyy, se p2 > 12 então é mm/dd/yyyy, senão padrão BR dd/mm/yyyy
    if (n1 > 12) {
      day = n1; month = n2;
    } else if (n2 > 12) {
      month = n1; day = n2;
    } else {
      day = n1; month = n2;
    }
  } else if (p1.length === 4) {
    // yyyy/mm/dd
    year = Number(p1);
    month = Number(p2);
    day = Number(p3);
  } else {
    // Ambíguo: tentar Date.parse
    const dt = new Date(normalized);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = dt.getMonth() + 1;
      const d = dt.getDate();
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
  }

  if (!isValidDate(year, month, day)) return null;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return iso;
}

export default parseToISO;
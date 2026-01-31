export const jsonToCsv = (rows, columns) => {
    if (!rows || rows.length === 0) return '';
    const cols = columns || Object.keys(rows[0]);
    const escape = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
    };
    const header = cols.join(',');
    const lines = rows.map(r => cols.map(c => escape(r[c])).join(','));
    return [header, ...lines].join('\n');
};

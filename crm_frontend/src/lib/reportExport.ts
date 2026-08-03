import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";

export type ExportColumn = {
  key: string;
  label: string;
};

function cellValue(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(name: string) {
  return name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "report";
}

/** CSV with UTF-8 BOM for Excel compatibility. */
export function exportReportCsv(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  metaLines: string[] = []
) {
  const lines: string[] = [];
  lines.push(`"${title.replace(/"/g, '""')}"`);
  for (const m of metaLines) {
    lines.push(`"${m.replace(/"/g, '""')}"`);
  }
  lines.push("");
  lines.push(columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(","));
  for (const row of rows) {
    lines.push(
      columns
        .map((c) => `"${cellValue(row, c.key).replace(/"/g, '""')}"`)
        .join(",")
    );
  }
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, `${slugify(title)}.csv`);
}

export function exportReportExcel(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  metaLines: string[] = []
) {
  const sheetRows: (string | number)[][] = [];
  sheetRows.push([title]);
  for (const m of metaLines) sheetRows.push([m]);
  sheetRows.push([]);
  sheetRows.push(columns.map((c) => c.label));
  for (const row of rows) {
    sheetRows.push(columns.map((c) => {
      const v = row[c.key];
      if (typeof v === "number") return v;
      return cellValue(row, c.key);
    }));
  }
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${slugify(title)}.xlsx`);
}

export function exportReportPdf(
  title: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[],
  metaLines: string[] = []
) {
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let y = 16;

  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(80);
  for (const m of metaLines) {
    doc.text(m, margin, y);
    y += 5;
  }
  doc.setTextColor(0);
  y += 4;

  const usable = pageWidth - margin * 2;
  const colWidth = usable / Math.max(columns.length, 1);
  const headerH = 7;
  const rowH = 6;

  const drawHeader = () => {
    doc.setFillColor(30, 58, 95);
    doc.rect(margin, y, usable, headerH, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    columns.forEach((c, i) => {
      doc.text(c.label, margin + i * colWidth + 1.5, y + 4.5, {
        maxWidth: colWidth - 2,
      });
    });
    doc.setTextColor(0);
    y += headerH;
  };

  drawHeader();

  doc.setFontSize(7.5);
  for (const row of rows) {
    if (y > doc.internal.pageSize.getHeight() - 14) {
      doc.addPage();
      y = 16;
      drawHeader();
      doc.setFontSize(7.5);
    }
    columns.forEach((c, i) => {
      const text = cellValue(row, c.key);
      doc.text(text.slice(0, 48), margin + i * colWidth + 1.5, y + 4, {
        maxWidth: colWidth - 2,
      });
    });
    y += rowH;
  }

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    `Generated ${new Date().toLocaleString()} · Postcard CRM`,
    margin,
    doc.internal.pageSize.getHeight() - 8
  );

  doc.save(`${slugify(title)}.pdf`);
}

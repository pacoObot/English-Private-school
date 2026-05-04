import type { ReactNode } from "react";

type DataTableProps = {
  headers: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
};

export function DataTable({ headers, rows, emptyMessage = "Sem dados para apresentar." }: DataTableProps) {
  if (!rows.length) {
    return <div className="border-t border-slate-100 p-6 text-sm font-bold text-slate-400">{emptyMessage}</div>;
  }

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] text-left">
        <thead className="bg-slate-50/70">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="transition-colors hover:bg-slate-50/70">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-6 py-4 text-sm font-bold text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="grid gap-3 p-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
                <span className="max-w-[42%] text-[10px] font-black uppercase tracking-widest text-slate-400">{headers[cellIndex]}</span>
                <span className="min-w-0 flex-1 text-right text-sm font-bold text-slate-700">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

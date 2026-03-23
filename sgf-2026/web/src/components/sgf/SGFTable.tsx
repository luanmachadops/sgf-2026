import React from 'react';

export interface SGFTableColumn<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

export interface SGFTableProps<T> {
  columns: SGFTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function SGFTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum dado disponível',
}: SGFTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white rounded-[var(--sgf-card-radius)] overflow-hidden">
        <div className="p-[var(--sgf-space-8)]">
          <div className="h-8 bg-slate-100 rounded-[var(--sgf-radius-md)] animate-pulse mb-[var(--sgf-space-4)]" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-[var(--sgf-radius-md)] animate-pulse mb-[var(--sgf-space-2)]" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[var(--sgf-card-radius)] overflow-hidden p-[var(--sgf-space-12)]">
        <div className="text-center">
          <p className="text-slate-400 text-[var(--sgf-text-lg)]">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--sgf-card-radius)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[var(--sgf-text-2xs)] uppercase font-[var(--sgf-font-black)] text-slate-400 tracking-[0.15em]">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-[var(--sgf-table-cell-padding-x)] py-[var(--sgf-space-5)] ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                className={`hover:bg-slate-50/40 transition-all duration-[var(--sgf-transition-fast)] group ${onRowClick ? 'cursor-pointer' : ''
                  }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-[var(--sgf-table-cell-padding-x)] py-[var(--sgf-table-cell-padding-y)] ${column.className || ''}`}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : String(row[column.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';

export type ResourceTableProps = {
  title: string;
  data: Array<Record<string, unknown>>;
  emptyMessage?: string;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return JSON.stringify(value, null, 2);
}

export const ResourceTable: React.FC<ResourceTableProps> = ({
  title,
  data,
  emptyMessage = 'No data available.',
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <section className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className="pill">{data.length}</span>
      </div>
      {data.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={`${row.id ?? row.name ?? index}` as string}>
                  {columns.map((column) => (
                    <td key={column}>
                      <span className="cell">
                        {formatValue(row[column])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

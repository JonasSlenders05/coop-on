import React from 'react';

type StatusCardProps = {
  label: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning' | 'info';
};

export const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  tone = 'default',
}) => {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
};

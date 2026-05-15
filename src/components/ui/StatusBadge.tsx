import React from 'react';
import { Badge } from './Badge';
import { STATUSES } from '@/lib/data';
import { MovStatus } from '@/types';

interface StatusBadgeProps {
  status: MovStatus;
}

const colorMap: Record<string, 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'gray'> = {
  green: 'green',
  amber: 'amber',
  red: 'red',
  blue: 'blue',
  violet: 'violet',
  gray: 'gray',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const info = STATUSES[status];
  return (
    <Badge color={colorMap[info.color]} dot>
      {info.label}
    </Badge>
  );
}

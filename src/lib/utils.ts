import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, currency: string = '¥'): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'N/A';
  }
  const locale = currency === '₹' ? 'en-IN' : 'en-US';
  return `${currency}${amount.toLocaleString(locale)}`;
}

export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return 'N/A';
  }
  return `${val.toFixed(1)}%`;
}

export function generateTeamUsername(teamName: string): string {
  return (
    'team_' +
    teamName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) +
    '_' +
    Math.floor(100 + Math.random() * 900)
  );
}

export function convertToCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const headerLine = headers.map(escapeCsv).join(',');
  const rowLines = rows.map((r) => r.map(escapeCsv).join(','));
  return [headerLine, ...rowLines].join('\n');
}

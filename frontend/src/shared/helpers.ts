export function formatBRL(value: number | ''): string {
  if (value === '' || value === 0) return '';
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function digitsToNumber(digits: string): number | '' {
  if (!digits) return '';
  return parseInt(digits, 10) / 100;
}
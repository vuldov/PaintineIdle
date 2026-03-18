import type Decimal from 'decimal.js'
import { formatNumber } from '@/lib/formatNumber'

interface NumberDisplayProps {
  value: Decimal
  className?: string
}

export function NumberDisplay({ value, className = '' }: NumberDisplayProps) {
  return <span className={`tabular-nums ${className}`}>{formatNumber(value)}</span>
}

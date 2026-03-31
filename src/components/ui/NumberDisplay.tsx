import type Decimal from 'decimal.js'
import { formatNumber } from '@/lib/formatNumber'

interface NumberDisplayProps {
  value: Decimal
  className?: string
  integer?: boolean
}

export function NumberDisplay({ value, className = '', integer = false }: NumberDisplayProps) {
  return <span className={`tabular-nums ${className}`}>{formatNumber(value, { integer })}</span>
}

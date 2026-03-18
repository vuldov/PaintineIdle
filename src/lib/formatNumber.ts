import Decimal from 'decimal.js'

/**
 * Suffixes pour les grands nombres.
 * Convention française : Md = Milliard, B = Billion, etc.
 */
const SUFFIXES = [
  '',    // < 1 000
  'K',   // 10^3
  'M',   // 10^6
  'Md',  // 10^9
  'B',   // 10^12
  'T',   // 10^15
  'Qa',  // 10^18
  'Qi',  // 10^21
  'Sx',  // 10^24
  'Sp',  // 10^27
  'Oc',  // 10^30
  'No',  // 10^33
  'Dc',  // 10^36
]

/**
 * Formate un Decimal pour l'affichage dans l'UI.
 *
 * - Nombres < 1 000 : affichage entier avec espaces fines (convention FR)
 * - Nombres de 1 000 à 10^39 : suffixe abrégé avec 2 décimales (virgule)
 * - Au-delà : notation scientifique
 *
 * @example
 * formatNumber(new Decimal(1234))       // "1 234"
 * formatNumber(new Decimal(1234567))    // "1,23M"
 * formatNumber(new Decimal("1e15"))     // "1,00T"
 */
export function formatNumber(n: Decimal): string {
  // Cas négatif
  if (n.isNeg()) {
    return `-${formatNumber(n.abs())}`
  }

  // Cas zéro
  if (n.isZero()) {
    return '0'
  }

  // Nombres très petits (< 1)
  if (n.lt(1)) {
    return n.toFixed(2).replace('.', ',')
  }

  // Nombres < 1 000 : affichage avec 2 décimales si non entier, entier sinon
  if (n.lt(1_000)) {
    if (n.eq(n.floor())) {
      return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F')
    }
    return n.toFixed(2).replace('.', ',').replace(/0+$/, '').replace(/,$/, '')
  }

  // Trouver le bon suffixe
  const exponent = Decimal.log10(n).floor().toNumber()
  const suffixIndex = Math.floor(exponent / 3)

  if (suffixIndex < SUFFIXES.length) {
    const divisor = new Decimal(10).pow(suffixIndex * 3)
    const value = n.div(divisor)
    const formatted = value.toFixed(2).replace('.', ',')
    return `${formatted}${SUFFIXES[suffixIndex]}`
  }

  // Au-delà des suffixes : notation scientifique
  const mantissa = n.div(new Decimal(10).pow(exponent))
  return `${mantissa.toFixed(2).replace('.', ',')}e${exponent}`
}

interface GameEmojiProps {
  value: string
  className?: string
}

/**
 * Renders an emoji — either as text or as an inline image.
 * Convention: if the i18n emoji value starts with `/`, it's treated as an image path.
 */
export function GameEmoji({ value, className }: GameEmojiProps) {
  if (value.startsWith('/')) {
    return (
      <img
        src={value}
        alt=""
        className={`inline-block ${className ?? ''}`}
        style={{ height: '1.2em', width: 'auto', verticalAlign: 'middle' }}
      />
    )
  }
  if (className) return <span className={className}>{value}</span>
  return <>{value}</>
}

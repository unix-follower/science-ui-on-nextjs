export function dot(x1: number, y1: number, x2: number, y2: number) {
  return x1 * x2 + y1 * y2
}

export function distance(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy)
}

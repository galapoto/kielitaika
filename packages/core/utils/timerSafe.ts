export function createSafeInterval(fn: () => void, ms: number) {
  const id = setInterval(fn, ms);

  return () => clearInterval(id);
}

export function createSafeTimeout(fn: () => void, ms: number) {
  const id = setTimeout(fn, ms);

  return () => clearTimeout(id);
}

export function createSafeInterval(fn: () => void, ms: number) {
  const id = setInterval(fn, ms);

  return () => clearInterval(id);
}

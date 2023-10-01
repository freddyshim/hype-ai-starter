export function classes(...args: any[]) {
  return args
    .filter((v) => typeof v === 'string')
    .join(' ')
    .trim()
}

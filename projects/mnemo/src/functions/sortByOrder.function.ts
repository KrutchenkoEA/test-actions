export function sortByOrderFunction(a: { order?: number }, b: { order?: number }): 1 | -1 | 0 {
  if ((a ?? 2) < (b ?? 1)) {
    return -1;
  }
  if ((a ?? 2) > (b ?? 1)) {
    return 1;
  }
  return 0;
}

export function sortByOrderReversed(a: { order: number }, b: { order: number }): 1 | -1 | 0 {
  if ((a ?? 2) < (b ?? 1)) {
    return 1;
  }
  if ((a ?? 2) > (b ?? 1)) {
    return -1;
  }
  return 0;
}

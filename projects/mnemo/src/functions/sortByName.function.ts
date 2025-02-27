export function sortByNameFunction(a: { name: string }, b: { name: string }): 1 | -1 | 0 {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return -1;
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return 1;
  }
  return 0;
}

export function sortByNameReversed(a: { name: string }, b: { name: string }): 1 | -1 | 0 {
  if (a.name.toLowerCase() < b.name.toLowerCase()) {
    return 1;
  }
  if (a.name.toLowerCase() > b.name.toLowerCase()) {
    return -1;
  }
  return 0;
}

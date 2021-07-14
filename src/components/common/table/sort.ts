export function descendingComparator<T>(
  a: T,
  b: T,
  orderBy: keyof T
): 1 | -1 | 0 {
  const bValue = b[orderBy] ?? '';
  const aValue = a[orderBy] ?? '';
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }

  return 0;
}

export type Order = 'asc' | 'desc';

export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
  sorting: (a: any, b: any, orderBy: any) => 1 | -1 | 0
): (
  a: { [key in Key]?: string | number | [] },
  b: { [key in Key]?: string | number | [] }
) => number {
  return order === 'desc'
    ? (a, b) => sorting(a, b, orderBy)
    : (a, b) => -sorting(a, b, orderBy);
}

export function stableSort<T>(
  array: T[],
  comparator: (a: T, b: T) => number
): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }

    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
}

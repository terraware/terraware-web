export const isAfter = (dateString1: string | undefined, dateString2: string | undefined): boolean => {
  if (dateString1 === undefined || dateString2 === undefined) {
    return false;
  }

  const date1 = new Date(dateString1).getTime();
  const date2 = new Date(dateString2).getTime();

  return date1 > date2;
};

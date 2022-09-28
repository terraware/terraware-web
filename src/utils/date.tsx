import { getDateDisplayValue } from '@terraware/web-components/utils';
export default getDateDisplayValue;

export const getTodaysDateFormatted = () => {
  return getDateDisplayValue(Date.now());
};

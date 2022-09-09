import { getDateDisplayValue } from '@terraware/web-components/utils';
import moment from 'moment';
export default getDateDisplayValue;

export const getTodaysDateFormatted = () => {
  return moment().format('YYYY-MM-DD');
};

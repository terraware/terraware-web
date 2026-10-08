import { DateTime } from 'luxon';

import strings from 'src/strings';

export type ObservationDateErrors = {
  startDateError?: string;
  endDateError?: string;
};

const getObservationDateErrors = (startDate?: string, endDate?: string): ObservationDateErrors => {
  if (!startDate || !endDate) {
    return {
      startDateError: startDate ? undefined : strings.REQUIRED_FIELD,
      endDateError: endDate ? undefined : strings.REQUIRED_FIELD,
    };
  }

  const today = DateTime.now().startOf('day');
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (start < today.toMillis() || start > today.plus({ years: 1 }).toMillis()) {
    return { startDateError: strings.INVALID_DATE };
  }
  if (end <= start || end > DateTime.fromMillis(start).plus({ months: 2 }).toMillis()) {
    return { endDateError: strings.INVALID_DATE };
  }
  return {};
};

export default getObservationDateErrors;

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
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  if (start < today || start > today.plus({ years: 1 })) {
    return { startDateError: strings.INVALID_DATE };
  }
  if (end <= start || end > start.plus({ months: 2 })) {
    return { endDateError: strings.INVALID_DATE };
  }
  return {};
};

export default getObservationDateErrors;

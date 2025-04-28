import { useMemo } from 'react';

import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';

interface FormattedNumberProps {
  value: number;
}

export default function FormattedNumber({ value }: FormattedNumberProps) {
  const user = useUser().user;
  const numberFormatter = useNumberFormatter();
  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [user?.locale, numberFormatter]);

  return numericFormatter.format(value);
}

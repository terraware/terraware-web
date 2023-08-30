import { useMemo } from 'react';
import { useUser } from 'src/providers';
import { useSupportedLocales } from 'src/strings/locales';
import { useNumberFormatter } from 'src/utils/useNumber';

interface FormattedNumberProps {
  value: number;
}

export default function FormattedNumber({ value }: FormattedNumberProps) {
  const user = useUser().user;
  const numberFormatter = useNumberFormatter();
  const supportedLocales = useSupportedLocales();
  const numericFormatter = useMemo(
    () => numberFormatter(user?.locale, supportedLocales),
    [user?.locale, numberFormatter, supportedLocales]
  );

  return numericFormatter.format(value);
}

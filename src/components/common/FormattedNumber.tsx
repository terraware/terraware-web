import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

interface FormattedNumberProps {
  value: number;
}

export default function FormattedNumber({ value }: FormattedNumberProps) {
  const user = useUser().user;
  const numberFormatter = useNumberFormatter(user?.locale);

  return numberFormatter.format(value);
}

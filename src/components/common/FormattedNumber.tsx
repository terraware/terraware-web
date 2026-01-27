import { useNumberFormatter } from 'src/utils/useNumberFormatter';

interface FormattedNumberProps {
  value: number;
}

export default function FormattedNumber({ value }: FormattedNumberProps) {
  const numberFormatter = useNumberFormatter();

  return numberFormatter.format(value);
}

import { useNumberFormatter } from 'src/utils/useNumberFormatter';

interface FormattedNumberProps {
  value: number;
  decimals?: number;
}

export default function FormattedNumber({ value, decimals }: FormattedNumberProps) {
  const numberFormatter = useNumberFormatter();

  return numberFormatter.format(value, decimals !== undefined ? { decimals } : undefined);
}

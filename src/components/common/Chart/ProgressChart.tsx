import { LinearProgress, useTheme } from '@mui/material';

export type ProgressChartProps = {
  value: number;
  target: number;
};

export default function ProgressChart({ value, target }: ProgressChartProps): JSX.Element {
  const theme = useTheme();

  const percentage = (100 * value) / target;

  return (
    <LinearProgress
      variant='determinate'
      value={percentage < 100 ? percentage : 100}
      valueBuffer={100}
      sx={{
        height: '32px',
        borderRadius: '4px',
        backgroundColor: theme.palette.TwClrBaseGray100,
        '& span': { backgroundColor: theme.palette.TwClrBgBrand },
      }}
    />
  );
}

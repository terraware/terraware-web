import { LinearProgress, useTheme } from '@mui/material';
type ProgressChartProps = {
  value: number;
  target: number;
};

export default function ProgressChart({ value, target }: ProgressChartProps): JSX.Element {
  const theme = useTheme();

  return (
    <LinearProgress
      variant='determinate'
      value={value}
      valueBuffer={target}
      sx={{
        height: '32px',
        borderRadius: '4px',
        backgroundColor: theme.palette.TwClrBaseGray100,
        '& span': { backgroundColor: theme.palette.TwClrBgBrand },
      }}
    />
  );
}

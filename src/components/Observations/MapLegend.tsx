import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

export type MapLegendItem = {
  borderColor: string;
  fillColor: string;
  label: string;
};

export type MapLegendProps = {
  title: string;
  items: MapLegendItem[];
};

export default function MapLegend({ title, items }: MapLegendProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <Box
      display='flex'
      justifyItems='flex-start'
      flexWrap='wrap'
      sx={{
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '8px',
        padding: theme.spacing(2),
        rowGap: theme.spacing(2),
      }}
    >
      <Typography
        fontSize='14px'
        fontWeight={600}
        width={isMobile ? '100%' : undefined}
        marginRight={isMobile ? 0 : theme.spacing(4)}
      >
        {title}
      </Typography>
      {items.map((item) => (
        <LabeledSwatch key={item.label} borderColor={item.borderColor} fillColor={item.fillColor} label={item.label} />
      ))}
    </Box>
  );
}

type LabeledSwatchProps = MapLegendItem;

function LabeledSwatch({ borderColor, fillColor, label }: LabeledSwatchProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' alignItems='center' marginRight={theme.spacing(3)}>
      <Box
        sx={{
          border: `2px solid ${borderColor}`,
          backgroundColor: fillColor,
          height: '8px',
          width: '24px',
          marginRight: theme.spacing(1),
        }}
      />
      <Typography fontSize='12px' fontWeight={400}>
        {label}
      </Typography>
    </Box>
  );
}

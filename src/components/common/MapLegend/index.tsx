import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

type MapLegendItem = {
  borderColor: string;
  fillColor: string;
  label: string;
  fillPatternUrl?: string;
  opacity?: number;
  height?: string;
};

export type MapLegendGroup = {
  title: string;
  items: MapLegendItem[];
};

type MapLegendProps = {
  legends: MapLegendGroup[];
};

export default function MapLegend({ legends }: MapLegendProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <Box
      display='flex'
      justifyItems='flex-start'
      flexDirection='column'
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
      borderRadius='8px'
      padding={theme.spacing(2)}
      rowGap={theme.spacing(3)}
    >
      {legends.map((legend) => (
        <Grid container key={legend.title} spacing={2} columns={8}>
          <Grid item xs={isMobile ? 8 : 1}>
            <Typography
              fontSize='14px'
              fontWeight={600}
              width={isMobile ? '100%' : undefined}
              marginRight={isMobile ? 0 : theme.spacing(4)}
            >
              {legend.title}
            </Typography>
          </Grid>
          {legend.items.map((item) => (
            <Grid item xs={isMobile ? 4 : 1} key={`${legend.title}-${item.label}`}>
              <LabeledSwatch {...item} />
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
}

type LabeledSwatchProps = MapLegendItem;

function LabeledSwatch({
  borderColor,
  fillColor,
  label,
  fillPatternUrl,
  opacity,
  height,
}: LabeledSwatchProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box display='flex' alignItems='center'>
      <Box
        sx={{
          border: `2px solid ${borderColor}`,
          backgroundColor: fillColor,
          backgroundImage: fillPatternUrl ? `url("${fillPatternUrl}")` : undefined,
          backgroundRepeat: 'repeat',
          opacity,
          height: height ? height : '8px',
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

import { useTheme, Box, Typography } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { SpeciesInventorySummary } from 'src/api/types/inventory';

interface InventorySummaryProps {
  summary: SpeciesInventorySummary;
}

export default function InventorySummary(props: InventorySummaryProps): JSX.Element {
  const { summary } = props;
  const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity, nurseries, lossRate, totalWithdrawn } =
    summary;

  const theme = useTheme();

  const { isMobile } = useDeviceInfo();

  const data = [
    {
      label: strings.GERMINATING_QUANTITY,
      value: germinatingQuantity,
      tooltip: '',
    },
    {
      label: strings.NOT_READY_QUANTITY,
      value: notReadyQuantity,
      tooltip: '',
    },
    {
      label: strings.READY_QUANTITY,
      value: readyQuantity,
      tooltip: '',
    },
    {
      label: strings.TOTAL_QUANTITY,
      value: totalQuantity,
      tooltip: '',
    },
    {
      label: strings.TOTAL_WITHDRAWN,
      value: totalWithdrawn,
      tooltip: '',
    },
    {
      label: strings.LOSS_RATE,
      value: lossRate,
      tooltip: '',
    },
    {
      label: strings.NURSERIES,
      value: nurseries.map((i) => i.name).join(', '),
      tooltip: '',
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#F2F4F5',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        padding: theme.spacing(3),
        alignItems: 'flex-start',
        borderRadius: theme.spacing(2),
        alignSelf: 'stretch',
        flexGrow: 0,
        marginBottom: theme.spacing(3),
        justifyContent: 'space-between',
      }}
    >
      {data.map((datum) => (
        <Box
          key={datum.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginRight: isMobile ? 0 : theme.spacing(2),
            marginBottom: isMobile ? theme.spacing(2) : 0,
          }}
        >
          <Typography
            sx={{
              marginBottom: theme.spacing(isMobile ? 1 : 2),
              fontSize: '14px',
              fontWeight: 400,
              color: '#5C6B6C',
            }}
          >
            {datum.label}
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#3A4445',
            }}
          >
            {datum.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

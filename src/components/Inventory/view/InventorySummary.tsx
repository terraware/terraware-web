import { useTheme, Box, Typography } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { SpeciesInventory } from 'src/api/inventory/search';

interface InventorySummaryProps {
  inventory: SpeciesInventory;
}

export default function InventorySummary(props: InventorySummaryProps): JSX.Element {
  const { inventory } = props;
  const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity, facilityInventories } = inventory;

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
      value: 'TBD',
      tooltip: '',
    },
    {
      label: strings.LOSS_RATE,
      value: 'TBD',
      tooltip: '',
    },
    {
      label: strings.NURSERIES,
      value: facilityInventories?.map((i) => i.facility_name).join(', '),
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

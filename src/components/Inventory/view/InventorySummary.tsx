import { useCallback, useEffect, useState } from 'react';
import { useTheme, Box, Typography } from '@mui/material';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { SpeciesInventorySummary } from 'src/api/types/inventory';
import { getSummary } from 'src/api/inventory/inventory';
import useSnackbar from 'src/utils/useSnackbar';
import _ from 'lodash';
import { IconTooltip } from '@terraware/web-components';

interface InventorySummaryProps {
  speciesId: number;
  modified: number;
}

export default function InventorySummary(props: InventorySummaryProps): JSX.Element {
  const { speciesId, modified } = props;
  const [summary, setSummary] = useState<SpeciesInventorySummary>();

  const theme = useTheme();
  const snackbar = useSnackbar();
  const { isMobile } = useDeviceInfo();

  const reloadData = useCallback(() => {
    const populateSummary = async () => {
      const response = await getSummary(speciesId);
      if (response.requestSucceeded === false) {
        snackbar.toastError(response.error);
      } else if (!_.isEqual(response.summary, summary)) {
        setSummary(response.summary || undefined);
      }
    };

    if (speciesId !== undefined) {
      populateSummary();
    } else {
      setSummary(undefined);
    }
  }, [speciesId, summary, snackbar]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData, modified]);

  const getData = () => {
    if (!summary) {
      return [];
    }
    const { germinatingQuantity, notReadyQuantity, readyQuantity, totalQuantity, nurseries, lossRate, totalWithdrawn } =
      summary;

    return [
      {
        label: strings.GERMINATING_QUANTITY,
        value: germinatingQuantity,
        tooltipTitle: strings.TOOLTIP_GERMINATING_QUANTITY,
      },
      {
        label: strings.NOT_READY_QUANTITY,
        value: notReadyQuantity,
        tooltipTitle: strings.TOOLTIP_NOT_READY_QUANTITY,
      },
      {
        label: strings.READY_QUANTITY,
        value: readyQuantity,
        tooltipTitle: strings.TOOLTIP_READY_QUANTITY,
      },
      {
        label: strings.TOTAL_QUANTITY,
        value: totalQuantity,
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
      },
      {
        label: strings.TOTAL_WITHDRAWN,
        value: totalWithdrawn,
        tooltipTitle: strings.TOOLTIP_TOTAL_QUANTITY,
      },
      {
        label: strings.LOSS_RATE,
        value: lossRate,
        tooltipTitle: '',
      },
      {
        label: strings.NURSERIES,
        value: nurseries.map((i) => i.name).join(', '),
        tooltipTitle: '',
      },
    ];
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
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
      {getData().map((datum) => (
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
              color: theme.palette.TwClrTxtSecondary,
              '& svg': {
                fill: theme.palette.TwClrTxtSecondary,
              },
            }}
          >
            {datum.label} {datum.tooltipTitle && <IconTooltip title={datum.tooltipTitle} />}
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: theme.palette.TwClrTxt,
            }}
          >
            {datum.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

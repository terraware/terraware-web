import { Box, Theme, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';
import { selectSubzoneSpeciesPopulations } from 'src/redux/features/tracking/sitePopulationSelector';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { makeStyles } from '@mui/styles';
import Link from 'src/components/common/Link';
import { requestUpdatePlantingCompleted } from 'src/redux/features/plantings/plantingsAsyncThunks';
import { selectUpdatePlantingCompleted } from 'src/redux/features/plantings/plantingsSelectors';
import useSnackbar from 'src/utils/useSnackbar';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useOrganization } from 'src/providers';

const useStyles = makeStyles((theme: Theme) => ({
  speciesList: {
    margin: 0,
    paddingLeft: theme.spacing(3),
  },
  withdrawalHistoryLink: {
    textAlign: 'left',
    fontSize: '16px',
    fontWeight: 400,
    marginTop: theme.spacing(3),
  },
}));

type PlantingProgressMapDialogProps = {
  id: number;
  name: string;
  plantingComplete: boolean;
};

export default function PlantingProgressMapDialog({
  id,
  name,
  plantingComplete,
}: PlantingProgressMapDialogProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const org = useOrganization();
  const species = useAppSelector((state) => selectSubzoneSpeciesPopulations(state, id));
  const totalPlants = useMemo(() => {
    return Object.values(species).reduce((prev, curr) => prev + curr, 0);
  }, [species]);
  const [dispatching, setDispatching] = useState(false);
  const [requestId, setRequestId] = useState<string>('');
  const updateStatus = useAppSelector((state) => selectUpdatePlantingCompleted(state, requestId));
  const snackbar = useSnackbar();

  useEffect(() => {
    if (updateStatus) {
      if (updateStatus.status === 'error') {
        snackbar.toastError(strings.GENERIC_ERROR);
      }
      // refresh planting site data to get new completed state for subzone
      dispatch(requestPlantingSites(org.selectedOrganization.id));
      setDispatching(false);
    }
  }, [updateStatus, dispatch, snackbar, org]);

  const updatePlantingComplete = useCallback(() => {
    // TODO: warn if undoing planting complete will erase statistics
    const request = dispatch(
      requestUpdatePlantingCompleted({
        subzoneId: id,
        planting: {
          plantingCompleted: !plantingComplete,
        },
      })
    );
    setRequestId(request.requestId);
    setDispatching(true);
  }, [dispatch, id, plantingComplete]);

  const getWithdrawalHistoryLink = () => {
    // TODO: update link with correct destination, i.e. withdrawal history page filtered to this subzone
    return <Link className={classes.withdrawalHistoryLink}>{strings.SEE_WITHDRAWAL_HISTORY}</Link>;
  };

  return (
    <Box borderRadius='8px' display='flex' flexDirection='column'>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing(3),
        }}
      >
        <Typography fontSize='16px' fontWeight={600}>
          {name}
        </Typography>
        <Typography fontSize='16px' fontWeight={400}>
          <FormattedNumber value={totalPlants} />
          &nbsp;{strings.SEEDLINGS_SENT}
        </Typography>
        <ul className={classes.speciesList}>
          {Object.keys(species).map((speciesName) => (
            <li key={speciesName}>
              <Typography fontSize='16px' fontWeight={400}>
                <FormattedNumber value={species[speciesName]} />
                &nbsp;{speciesName}
              </Typography>
            </li>
          ))}
        </ul>
        {getWithdrawalHistoryLink()}
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
          borderRadius: '0 0 8px 8px',
          borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          display: 'flex',
          justifyContent: 'flex-end',
          padding: theme.spacing(2, 3),
        }}
      >
        <Button
          onClick={updatePlantingComplete}
          label={plantingComplete ? strings.UNDO_PLANTING_COMPLETE : strings.SET_PLANTING_COMPLETE}
          type={plantingComplete ? 'passive' : 'productive'}
          disabled={dispatching}
        />
      </Box>
    </Box>
  );
}

import { Box, Theme, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useMemo } from 'react';
import strings from 'src/strings';
import { selectSubzoneSpeciesPopulations } from 'src/redux/features/tracking/sitePopulationSelector';
import { useAppSelector } from 'src/redux/store';
import FormattedNumber from 'src/components/common/FormattedNumber';
import { makeStyles } from '@mui/styles';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';

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
  subzoneName: string;
  siteId: number;
  plantingComplete: boolean;
  onUpdatePlantingComplete: (id: number, val: boolean) => void;
  busy: boolean;
};

export default function PlantingProgressMapDialog({
  id,
  subzoneName,
  siteId,
  plantingComplete,
  onUpdatePlantingComplete,
  busy,
}: PlantingProgressMapDialogProps): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const species = useAppSelector((state) => selectSubzoneSpeciesPopulations(state, id));
  const totalPlants = useMemo(() => {
    return Object.values(species).reduce((prev, curr) => prev + curr, 0);
  }, [species]);

  const getWithdrawalHistoryLink = () => {
    const siteUrl = APP_PATHS.NURSERY_SITE_WITHDRAWALS.replace(':plantingSiteId', siteId.toString());
    const filterParam = `subzoneName=${encodeURIComponent(subzoneName)}`;
    const url = `${siteUrl}?tab=withdrawal_history&${filterParam}`;
    return (
      <Link className={classes.withdrawalHistoryLink} to={url}>
        {strings.SEE_WITHDRAWAL_HISTORY}
      </Link>
    );
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
          {subzoneName}
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
          onClick={() => onUpdatePlantingComplete(id, !plantingComplete)}
          label={plantingComplete ? strings.UNDO_PLANTING_COMPLETE : strings.SET_PLANTING_COMPLETE}
          type={plantingComplete ? 'passive' : 'productive'}
          disabled={busy}
        />
      </Box>
    </Box>
  );
}

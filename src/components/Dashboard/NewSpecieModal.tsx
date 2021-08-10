import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { putPlant } from '../../api/plants';
import { postSpecies } from '../../api/species';
import { postSpeciesName } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import { plantsByFeatureIdSelector } from '../../state/selectors/plantsPlanted';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import { plantsPlantedFilteredSelector } from '../../state/selectors/plantsPlantedFiltered';
import sessionSelector from '../../state/selectors/session';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import speciesNamesSelector from '../../state/selectors/speciesNames';
import speciesNamesBySpeciesIdSelector from '../../state/selectors/speciesNamesBySpeciesId';
import strings from '../../strings';
import useForm from '../../utils/useForm';
import { PlantForTable } from '../AllPlants';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';
import TextField from '../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
    deleteSpecies: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
      borderWidth: 1,
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (snackbarMessage?: string) => void;
  value?: PlantForTable;
  onDelete?: () => void;
}

const initPlant = (plant?: PlantForTable): PlantForTable => {
  return plant
    ? {
        ...plant,
        speciesId: plant.speciesId ?? 0,
      }
    : {};
};

export default function NewSpecieModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord] = useForm<PlantForTable>(initPlant(props.value));

  const speciesNames = useRecoilValue(speciesNamesSelector);
  const plantsByFeature = useRecoilValue(plantsByFeatureIdSelector);
  const session = useRecoilValue(sessionSelector);
  const speciesNamesBySpeciesId = useRecoilValue(
    speciesNamesBySpeciesIdSelector
  );
  const resetPlantsPlantedFeatures = useResetRecoilState(
    plantsPlantedFeaturesSelector
  );
  const resetPlantsPlantedFiltered = useResetRecoilState(
    plantsPlantedFilteredSelector
  );
  const resetSpeciesForChart = useResetRecoilState(speciesForChartSelector);
  const resetSpeciesNames = useResetRecoilState(speciesNamesSelector);

  React.useEffect(() => {
    if (props.open) {
      setRecord(initPlant(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initPlant(props.value));
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleOk = async () => {
    let snackbarMessage = '';
    if (session && plantsByFeature && record.featureId) {
      const previousPlant = plantsByFeature[record.featureId];
      if (record.speciesId !== undefined) {
        const newPlant = {
          ...previousPlant,
          species_id: record.speciesId !== 0 ? record.speciesId : undefined,
        };
        await putPlant(session, record.featureId, newPlant);
      } else if (record.species) {
        const newSpecies = await postSpecies({}, session);
        if (newSpecies.id) {
          const newPlant = { ...previousPlant, species_id: newSpecies.id };
          const newSpeciesName: SpeciesName = {
            name: record.species,
            species_id: newSpecies.id,
          };
          await postSpeciesName(newSpeciesName, session);
          await putPlant(session, record.featureId, newPlant);
          resetSpeciesNames();
        }
      }
      resetPlantsPlantedFeatures();
      resetSpeciesForChart();
      resetPlantsPlantedFiltered();
      snackbarMessage = strings.SNACKBAR_MSG_CHANGES_SAVED;
    }
    onClose(snackbarMessage);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpecieId = parseInt(event.target.value, 10);
    const newRecord = {
      ...record,
      speciesId: newSpecieId,
      species: speciesNamesBySpeciesId[newSpecieId]
        ? speciesNamesBySpeciesId[newSpecieId].name
        : undefined,
    };

    setRecord(newRecord);
  };

  const onChangeTextField = (id: string, value: unknown) => {
    const newRecord = {
      ...record,
      [id]: value,
      speciesId: undefined,
    };

    setRecord(newRecord);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>{strings.EDIT_SPECIES}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Typography variant='body1'>{strings.PHOTO}</Typography>
            </Grid>
            <Grid item xs={12}>
              <img
                alt='Specie'
                src={record.photo}
                style={{ maxHeight: '100px', display: 'block' }}
                id='feature-image'
              />
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid item xs={12}>
              <Typography variant='body1'>{strings.NOTES}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2'>{record.notes}</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1'>
              {strings.EXISTING_SPECIES_MSG}
            </Typography>
            <FormControl component='fieldset' className={classes.container}>
              <RadioGroup
                aria-label='species'
                name='species'
                value={record.speciesId}
                onChange={handleChange}
              >
                {speciesNames?.map((species) => (
                  <FormControlLabel
                    id={species.name}
                    key={species.id}
                    value={species.species_id}
                    control={<Radio />}
                    label={species.name}
                  />
                ))}
                <FormControlLabel
                  id='Other'
                  key={-1}
                  value={0}
                  control={<Radio />}
                  label={strings.OTHER}
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component='p' variant='subtitle2'>
              OR
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12} id='new-specie-section'>
            <TextField
              id='species'
              value={record.speciesId ? '' : record.species}
              onChange={onChangeTextField}
              label={strings.CREATE_NEW_SPECIES}
              aria-label='Species Name'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            {props.value && props.onDelete && (
              <Chip
                id='delete-specie'
                className={classes.deleteSpecies}
                label={strings.DELETE}
                clickable
                onClick={handleDelete}
                variant='outlined'
              />
            )}
          </Box>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveSpecie'
              className={classes.submit}
              label={strings.SAVE}
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

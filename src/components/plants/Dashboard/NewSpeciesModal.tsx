import {
  Box,
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
import { putPlant } from '../../../api/plants/plants';
import { postSpecies } from '../../../api/seeds/species';
import { plantsByFeatureIdSelector } from '../../../state/selectors/plants';
import { plantsFeaturesSelector } from '../../../state/selectors/plantsFeatures';
import { plantsFilteredSelector } from '../../../state/selectors/plantsFiltered';
import speciesSelector from '../../../state/selectors/species';
import speciesByIdSelector from '../../../state/selectors/speciesById';
import speciesForChartSelector from '../../../state/selectors/speciesForChart';
import strings from '../../../strings';
import { SpeciesType } from '../../../types/SpeciesType';
import useForm from '../../../utils/useForm';
import Button from '../../common/button/Button';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';
import { PlantForTable } from '../AllPlants';
import PlantPhoto from './PlantPhoto';

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
    spacing: {
      marginRight: theme.spacing(2),
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
  return plant ? { ...plant, speciesId: plant.speciesId ?? 0 } : {};
};

export default function NewSpeciesModalWrapper(props: Props): JSX.Element {
  return (
    <React.Suspense fallback={strings.LOADING}>
      <NewSpeciesModal {...props} />
    </React.Suspense>
  );
}

function NewSpeciesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onDelete } = props;
  const [record, setRecord] = useForm<PlantForTable>(initPlant(props.value));

  const plantsByFeature = useRecoilValue(plantsByFeatureIdSelector);
  const resetplantsFeatures = useResetRecoilState(plantsFeaturesSelector);
  const resetplantsFiltered = useResetRecoilState(plantsFilteredSelector);
  const resetSpeciesForChart = useResetRecoilState(speciesForChartSelector);
  const resetSpecies = useResetRecoilState(speciesSelector);

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
    if (plantsByFeature && record.featureId) {
      const previousPlant = plantsByFeature[record.featureId];
      if (record.speciesId !== undefined) {
        const newPlant = {
          ...previousPlant,
          speciesId: record.speciesId !== 0 ? record.speciesId : undefined,
        };
        await putPlant(record.featureId, newPlant);
        onClose(strings.SNACKBAR_MSG_CHANGES_SAVED);

        resetplantsFeatures();
        resetSpeciesForChart();
        resetplantsFiltered();
      } else if (record.species) {
        const newSpeciesData: SpeciesType = { name: record.species };
        const newSpecies = await postSpecies(newSpeciesData);
        const newPlant = { ...previousPlant, speciesId: newSpecies.id };

        await putPlant(record.featureId, newPlant);
        onClose(strings.SNACKBAR_MSG_CHANGES_SAVED);

        resetSpecies();
        resetplantsFeatures();
        resetSpeciesForChart();
        resetplantsFiltered();
      }
    } else {
      onClose('');
    }
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
        <NewSpeciesModalContent record={record} setRecord={setRecord} />
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            {props.value && props.onDelete && (
              <Button
                onClick={handleDelete}
                id='delete-species'
                label={strings.DELETE}
                type='destructive'
                priority='secondary'
              />
            )}
          </Box>
          <Box>
            <Button
              onClick={handleCancel}
              id='cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button onClick={handleOk} id='saveSpecies' label={strings.SAVE} />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

interface ContentProps {
  record: PlantForTable;
  setRecord: (record: PlantForTable) => void;
}

function NewSpeciesModalContent(props: ContentProps): JSX.Element {
  const classes = useStyles();

  const species = useRecoilValue(speciesSelector);
  const speciesById = useRecoilValue(speciesByIdSelector);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeciesId = parseInt(event.target.value, 10);
    const newRecord = {
      ...props.record,
      speciesId: newSpeciesId,
      species: speciesById[newSpeciesId]
        ? speciesById[newSpeciesId].name
        : undefined,
    };

    props.setRecord(newRecord);
  };

  const onChangeTextField = (id: string, value: unknown) => {
    const newRecord = {
      ...props.record,
      [id]: value,
      speciesId: undefined,
    };

    props.setRecord(newRecord);
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <Typography variant='body1'>{strings.PHOTO}</Typography>
          </Grid>
          <Grid item xs={12}>
            <PlantPhoto featureId={props.record.featureId} />
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid item xs={12}>
            <Typography variant='body1'>{strings.NOTES}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2'>{props.record.notes}</Typography>
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
              value={props.record.speciesId}
              onChange={handleChange}
            >
              {species?.map((sp) => (
                <FormControlLabel
                  id={sp.name}
                  key={sp.id}
                  value={sp.id}
                  control={<Radio />}
                  label={sp.name}
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
            {strings.OR}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12} id='new-species-section'>
          <TextField
            id='species'
            value={props.record.speciesId ? '' : props.record.species}
            onChange={onChangeTextField}
            label={strings.CREATE_NEW_SPECIES}
            aria-label='Species Name'
          />
        </Grid>
      </Grid>
    </>
  );
}

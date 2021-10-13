import MomentUtils from '@date-io/moment';
import {
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Typography
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import React, { Suspense } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from 'recoil';
import { getPhotoEndpoint, postAccession } from 'src/api/seeds/accession';
import { updateSpecies } from 'src/api/seeds/species';
import { Accession, AccessionPostRequestBody } from 'src/api/types/accessions';
import snackbarAtom from 'src/state/atoms/snackbar';
import { facilityIdSelector } from 'src/state/selectors/seeds/facility';
import searchSelector from 'src/state/selectors/seeds/search';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import Divisor from '../../common/Divisor';
import Dropdown from '../../common/Dropdown';
import Note from '../../common/Note';
import TextArea from '../../common/TextArea';
import TextField from '../../common/TextField';
import FooterButtons from '../accession/FooterButtons';
import PageHeader from '../PageHeader';
import { AccessionDates } from './AccessionDates';
import EditSpeciesModal from './EditSpeciesModal';
import MainCollector from './MainCollectorDropdown';
import NurseryButtons from './NurseryButtons';
import SecondaryCollectors from './SecondaryCollectors';
import Species from './SpeciesDropdown';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
    },
    closeIcon: {
      backgroundColor: theme.palette.common.white,
    },
    right: {
      marginLeft: 'auto',
    },
    listItem: {
      marginBottom: theme.spacing(1),
    },
    photoLink: {
      marginBottom: theme.spacing(1),
      color: theme.palette.neutral[800],
      textDecoration: 'underline',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export default function NewAccessionWrapper(): JSX.Element {
  const [accessionId, setAccessionId] = React.useState<number>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const resetSearch = useResetRecoilState(searchSelector);
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();
  const facilityId = useRecoilValue(facilityIdSelector);

  const onSubmit = async (record: AccessionPostRequestBody) => {
    try {
      const newAccessionId = await postAccession(record);
      resetSearch();
      setAccessionId(newAccessionId);
      setSnackbar({ type: 'success', msg: strings.ACCESSION_SAVED });
    } catch (ex) {
      setSnackbar({
        type: 'delete',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  if (accessionId) {
    return (
      <Redirect
        to={getLocation(
          `/accessions/${accessionId}/seed-collection`,
          location
        )}
      />
    );
  }

  return (
    <main>
      <PageHeader
        title={strings.NEW_ACCESSION}
        subtitle={strings.NEW_ACCESSION_DESCRIPTION}
        rightComponent={
          <Fab
            id='closenewAccession'
            size='small'
            aria-label='close'
            className={classes.closeIcon}
            onClick={() => {
              history.goBack();
            }}
          >
            <CloseIcon />
          </Fab>
        }
      />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <AccessionForm
              accession={{
                facilityId,
                receivedDate: moment().format('YYYY-MM-DD'),
              }}
              onSubmit={onSubmit}
            />
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </main>
  );
}

interface Props<T extends AccessionPostRequestBody> {
  updating?: boolean;
  photoFilenames?: string[];
  accession: T;
  onSubmit: (record: T) => void;
}

export type FieldError = {
  id: string;
  msg: string;
};
export function AccessionForm<T extends AccessionPostRequestBody>({
  updating,
  photoFilenames,
  accession,
  onSubmit,
}: Props<T>): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [errors, setErrors] = React.useState<FieldError[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [editSpeciesModalOpen, setEditSpeciesModalOpen] = React.useState(false);
  const [newSpeciesSelected, setNewSpeciesSelected] = React.useState(false);
  const [isSendingToNursery, setIsSendingToNursery] = React.useState(false);
  const [isSentToNursery, setIsSentToNursery] = React.useState(false);
  const [canSendToNursery, setCanSendToNursery] = React.useState(false);

  React.useEffect(() => {
    setRecord(accession);
    if (isSaving) {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
    }
    if (isSendingToNursery) {
      setIsSendingToNursery(false);
      setIsSentToNursery(true);
      setTimeout(() => setIsSentToNursery(false), 1000);
    }
    if ((accession as unknown as Accession).nurseryStartDate) {
      setCanSendToNursery(false);
    } else {
      setCanSendToNursery(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accession]);

  React.useEffect(() => {
    if (accession !== record) {
      setIsEditing(true);
    }
  }, [accession, record]);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
  };

  const beforeSubmit = () => {
    if (updating && accession.species !== record.species && newSpeciesSelected) {
      setEditSpeciesModalOpen(true);
    } else {
      onSubmitHandler();
    }
  };

  const onSubmitHandler = () => {
    setIsEditing(false);
    setIsSaving(true);
    setTimeout(() => onSubmit(record), 1000);
  };

  const onSendToNurseryHandler = () => {
    const newRecord = {
      ...record,
      nurseryStartDate: moment().format('YYYY-MM-DD'),
    };
    setIsSendingToNursery(true);
    setTimeout(() => onSubmit(newRecord), 1000);
  };

  const onUndoSendToNursery = () => {
    const newRecord = {
      ...record,
      nurseryStartDate: undefined,
    };
    onSubmit(newRecord);
  };

  const OnNumberOfTreesChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (Number(value) < 0) {
      if (errorIndex < 0) {
        newErrors.push({
          id,
          msg: strings.NO_NEGATIVE_NUMBERS,
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setErrors(newErrors);
    onChange(id, value);
  };

  const getErrorText = (id: string) => {
    const error = errors.find((_error) => _error.id === id);

    return error ? error.msg : '';
  };

  const refreshErrors = (newErrors: FieldError[]) => {
    const previousErrors = [...errors];
    previousErrors.forEach((error, index) => {
      if (error.id === 'collectedDate' || error.id === 'receivedDate') {
        if (newErrors.findIndex((error2) => error2.id === error.id) < 0) {
          previousErrors.splice(index, 1);
        }
      }
    });

    const combinedErrors = [...previousErrors, ...newErrors].filter(
      (error, index, self) =>
        index ===
        self.findIndex(
          (otherError) =>
            otherError.id === error.id && otherError.msg === error.msg
        )
    );
    setErrors(combinedErrors);
  };

  const onCloseEditSpeciesModal = () => {
    setEditSpeciesModalOpen(false);
    onSubmitHandler();
  };

  const closeModalAndUpdateSpecies = () => {
    const speciesId = (record as unknown as Accession).speciesId;
    if (speciesId && record.species) {
      updateSpecies({ id: speciesId, name: record.species });
    }
    onCloseEditSpeciesModal();
  };

  const onSpeciesChanged = (id: string, value: unknown, isNew: boolean) => {
    setNewSpeciesSelected(isNew);
    onChange(id, value);
  };

  return (
    <>
      {updating && (
        <EditSpeciesModal
          open={editSpeciesModalOpen}
          onClose={onCloseEditSpeciesModal}
          onOk={closeModalAndUpdateSpecies}
        />
      )}
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Paper className={classes.paper}>
          <Typography variant='h6' className={classes.bold}>
            {strings.SEED_COLLECTION}
          </Typography>
          <Typography component='p'>
            {strings.SEED_COLLECTION_DESCRIPTION}
          </Typography>
          <Divisor />
          <Grid container spacing={4}>
            <Suspense
              fallback={
                <Grid item xs={4}>
                  <CircularProgress />
                </Grid>
              }
            >
              <Grid item xs={4}>
                <Species species={record.species} onChange={onSpeciesChanged} />
              </Grid>
            </Suspense>
            <Grid item xs={4}>
              <TextField
                id='family'
                value={record.family}
                onChange={onChange}
                label={strings.FAMILY}
              />
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4}>
              <TextField
                id='numberOfTrees'
                value={record.numberOfTrees}
                onChange={OnNumberOfTreesChange}
                type='number'
                label={strings.NUMBER_OF_TREES}
                min={0}
                helperText={getErrorText('numberOfTrees')}
                error={getErrorText('numberOfTrees') ? true : false}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='founderId'
                value={record.founderId}
                onChange={onChange}
                label={strings.FOUNDER_ID}
              />
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4}>
              <Dropdown
                id='endangered'
                label={strings.ENDANGERED}
                selected={record.endangered}
                values={[
                  { label: strings.YES, value: 'Yes' },
                  { label: strings.NO, value: 'No' },
                  { label: strings.UNSURE, value: 'Unsure' },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={4}>
              <Dropdown
                id='rare'
                label={strings.RARE}
                selected={record.rare}
                values={[
                  { label: strings.YES, value: 'Yes' },
                  { label: strings.NO, value: 'No' },
                  { label: strings.UNSURE, value: 'Unsure' },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4}>
              <Dropdown
                id='sourcePlantOrigin'
                label={strings.WILD_OUTPLANT}
                selected={record.sourcePlantOrigin}
                values={[
                  { label: strings.WILD, value: 'Wild' },
                  { label: strings.OUTPLANT, value: 'Outplant' },
                ]}
                onChange={onChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextArea
                id='fieldNotes'
                value={record.fieldNotes}
                onChange={onChange}
                label={strings.FIELD_NOTES}
                placeholder={strings.FIELD_NOTES_PLACEHOLDER}
              />
            </Grid>
          </Grid>
          <Divisor />
          <Suspense
            fallback={
              <Grid item xs={12}>
                <CircularProgress />
              </Grid>
            }
          >
            <AccessionDates
              collectedDate={record.collectedDate}
              receivedDate={record.receivedDate}
              refreshErrors={refreshErrors}
              onChange={onChange}
              disabled={accession.deviceInfo !== undefined}
            />
          </Suspense>
          <Divisor />
          <Grid container spacing={4}>
            <Suspense
              fallback={
                <Grid item xs={4}>
                  <CircularProgress />
                </Grid>
              }
            >
              <Grid item xs={4}>
                <MainCollector
                  onChange={onChange}
                  mainCollector={record.primaryCollector}
                />
              </Grid>
            </Suspense>
            <Grid item xs={4}>
              <SecondaryCollectors
                id='secondaryCollectors'
                secondaryCollectors={record.secondaryCollectors}
                onChange={onChange}
              />
            </Grid>
          </Grid>
          <Divisor />
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <TextField
                id='siteLocation'
                value={record.siteLocation}
                onChange={onChange}
                label={strings.SITE}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                id='landowner'
                value={record.landowner}
                onChange={onChange}
                label={strings.LANDOWNER}
              />
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={12}>
              <TextArea
                id='environmentalNotes'
                value={record.environmentalNotes}
                onChange={onChange}
                label={strings.ENVIRONMENTAL_NOTES}
                placeholder={strings.ENVIRONMENTAL_NOTES_PLACEHOLDER}
              />
            </Grid>
          </Grid>
          <Divisor />
          {!updating && <Note>{strings.NEW_ACCESSION_INFO}</Note>}
          {updating && (
            <Grid container spacing={4}>
              <Grid item xs={3}>
                <Typography
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {strings.BAG_IDS}
                </Typography>
                {record.bagNumbers?.map((bag, index) => (
                  <Typography
                    id={`bag${index}`}
                    key={index}
                    component='p'
                    variant='body1'
                    className={classes.listItem}
                  >
                    {bag}
                  </Typography>
                ))}
              </Grid>
              <Grid item xs={5}>
                <Typography
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {strings.PHOTOS}
                </Typography>
                {photoFilenames?.map((photo, index) => (
                  <Link
                    id={`photo-${index}`}
                    key={index}
                    target='_blank'
                    href={getPhotoEndpoint(
                      (record as unknown as Accession).id,
                      photo
                    )}
                  >
                    <Typography
                      component='p'
                      variant='body1'
                      className={classes.photoLink}
                    >
                      {photo}
                    </Typography>
                  </Link>
                ))}
              </Grid>
              <Grid item xs={4}>
                <Typography
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {strings.GEOLOCATIONS}
                </Typography>
                {record.geolocations?.map((geolocation, index) => (
                  <Typography
                    id={`location${index}`}
                    key={index}
                    component='p'
                    variant='body1'
                    className={classes.listItem}
                  >
                    {`${geolocation.latitude}, ${geolocation.longitude}`}
                  </Typography>
                ))}
              </Grid>
            </Grid>
          )}
          <Divisor />
          <Grid container spacing={4}>
            {updating && (
              <Grid item>
                <NurseryButtons
                  isSendingToNursery={isSendingToNursery}
                  isSentToNursery={isSentToNursery}
                  onSubmitHandler={onSendToNurseryHandler}
                  handleCancel={onUndoSendToNursery}
                  canSendToNursery={canSendToNursery}
                />
              </Grid>
            )}
            <Grid item className={classes.right}>
              <FooterButtons
                errors={errors.length > 0}
                updating={updating}
                isEditing={isEditing}
                isSaving={isSaving}
                isSaved={isSaved}
                nextStepTo='processing-drying'
                nextStep={strings.NEXT_PROCESSING_AND_DRYING}
                onSubmitHandler={beforeSubmit}
                handleCancel={handleCancel}
              />
            </Grid>
          </Grid>
        </Paper>
      </MuiPickersUtilsProvider>
    </>
  );
}

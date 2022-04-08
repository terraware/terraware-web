import MomentUtils from '@date-io/moment';
import { CircularProgress, Container, Grid, Link, Typography } from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import moment from 'moment';
import React, { Suspense, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { checkIn, getPhotoEndpoint, postAccession } from 'src/api/seeds/accession';
import { Accession, AccessionPostRequestBody } from 'src/api/types/accessions';
import { seedsDatabaseSelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import snackbarAtom from 'src/state/snackbar';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
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
import CheckInButtons from './CheckInButtons';
import MainCollector from './MainCollectorDropdown';
import NurseryButtons from './NurseryButtons';
import SecondaryCollectors from './SecondaryCollectors';
import Species from './SpeciesDropdown';
import { APP_PATHS } from '../../../constants';
import TfMain from 'src/components/common/TfMain';
import PanelTitle from 'src/components/PanelTitle';
import MainPaper from 'src/components/MainPaper';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      padding: '32px 0',
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

type NewAccessionProps = {
  organization: ServerOrganization;
};

export default function NewAccessionWrapper(props: NewAccessionProps): JSX.Element {
  const { organization } = props;
  const [accessionId, setAccessionId] = useState<number>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();
  const selectedOrgInfoDatabase = useRecoilValue(seedsDatabaseSelectedOrgInfo);

  const onSubmit = async (record: AccessionPostRequestBody) => {
    try {
      const newAccessionId = await postAccession(record);
      setAccessionId(newAccessionId);
      setSnackbar({ priority: 'success', msg: strings.ACCESSION_SAVED, type: 'toast' });
    } catch (ex) {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  const onCheckIn = async (id: number) => {
    try {
      await checkIn(id);
      setSnackbar({ priority: 'success', msg: strings.ACCESSION_SAVED, type: 'toast' });
    } catch (ex) {
      setSnackbar({
        type: 'toast',
        priority: 'critical',
        msg: strings.SAVE_ACCESSION_ERROR,
      });
    }
  };

  if (accessionId) {
    return (
      <Redirect
        to={getLocation(
          APP_PATHS.ACCESSIONS_ITEM_SEED_COLLECTION.replace(':accessionId', accessionId.toString()),
          location
        )}
      />
    );
  }

  if (selectedOrgInfoDatabase.selectedFacility?.id === undefined) {
    return <CircularProgress id={`new-accession-facilityid-spinner`} />;
  }

  return (
    <TfMain>
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
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1} />
          <Grid item xs={10}>
            <AccessionForm
              accession={{
                facilityId: selectedOrgInfoDatabase.selectedFacility?.id,
                receivedDate: moment().format('YYYY-MM-DD'),
              }}
              organization={organization}
              onSubmit={onSubmit}
              onCheckIn={onCheckIn}
            />
          </Grid>
          <Grid item xs={1} />
        </Grid>
      </Container>
    </TfMain>
  );
}

interface Props<T extends AccessionPostRequestBody> {
  updating?: boolean;
  photoFilenames?: string[];
  accession: T;
  organization?: ServerOrganization;
  onSubmit: (record: T) => void;
  onCheckIn: (id: number) => void;
}

export type FieldError = {
  id: string;
  msg: string;
};
export function AccessionForm<T extends AccessionPostRequestBody>({
  updating,
  photoFilenames,
  accession,
  organization,
  onSubmit,
  onCheckIn,
}: Props<T>): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSendingToNursery, setIsSendingToNursery] = useState(false);
  const [isSentToNursery, setIsSentToNursery] = useState(false);
  const [canSendToNursery, setCanSendToNursery] = useState(false);
  const [isPendingCheckIn, setIsPendingCheckIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    if (updating) {
      setRecord(accession);
    }
    if ((accession as unknown as Accession).state === 'Awaiting Check-In') {
      setIsPendingCheckIn(true);
    } else {
      setIsPendingCheckIn(false);
    }
    if (isCheckingIn) {
      setIsCheckingIn(false);
      setIsCheckedIn(true);
      setTimeout(() => setIsCheckedIn(false), 1000);
    }
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

  useEffect(() => {
    if (accession !== record) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [accession, record]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
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

  const onCheckInHandler = () => {
    setIsCheckingIn(true);
    setTimeout(() => onCheckIn((accession as unknown as Accession).id), 1000);
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
        index === self.findIndex((otherError) => otherError.id === error.id && otherError.msg === error.msg)
    );
    setErrors(combinedErrors);
  };

  const showCheckIn = isPendingCheckIn || isCheckedIn;

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <MainPaper>
        <PanelTitle title={strings.SEED_COLLECTION} />
        <Typography component='p'>{strings.SEED_COLLECTION_DESCRIPTION}</Typography>
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
              <Species
                selectedSpecies={record.species}
                organization={organization}
                onChange={onChange}
                disabled={isPendingCheckIn}
              />
            </Grid>
          </Suspense>
          <Grid item xs={4}>
            <TextField
              id='family'
              value={record.family}
              onChange={onChange}
              label={strings.FAMILY}
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='founderId'
              value={record.founderId}
              onChange={onChange}
              label={strings.FOUNDER_ID}
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
            />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              id='fieldNotes'
              value={record.fieldNotes}
              onChange={onChange}
              label={strings.FIELD_NOTES}
              placeholder={strings.FIELD_NOTES_PLACEHOLDER}
              disabled={isPendingCheckIn}
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
            disabled={accession.deviceInfo !== undefined || isPendingCheckIn}
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
                facilityId={accession.facilityId!}
                onChange={onChange}
                mainCollector={record.primaryCollector}
                disabled={isPendingCheckIn}
              />
            </Grid>
          </Suspense>
          <Grid item xs={4}>
            <SecondaryCollectors
              id='secondaryCollectors'
              secondaryCollectors={record.secondaryCollectors}
              onChange={onChange}
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='landowner'
              value={record.landowner}
              onChange={onChange}
              label={strings.LANDOWNER}
              disabled={isPendingCheckIn}
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
              disabled={isPendingCheckIn}
            />
          </Grid>
        </Grid>
        <Divisor />
        {!updating && <Note>{strings.NEW_ACCESSION_INFO}</Note>}
        {updating && (
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <Typography component='p' variant='body2' className={classes.listItem}>
                {strings.BAG_IDS}
              </Typography>
              {record.bagNumbers?.map((bag, index) => (
                <Typography id={`bag${index}`} key={index} component='p' variant='body1' className={classes.listItem}>
                  {bag}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={5}>
              <Typography component='p' variant='body2' className={classes.listItem}>
                {strings.PHOTOS}
              </Typography>
              {photoFilenames?.map((photo, index) => (
                <Link
                  id={`photo-${index}`}
                  key={index}
                  target='_blank'
                  href={getPhotoEndpoint((record as unknown as Accession).id, photo)}
                >
                  <Typography component='p' variant='body1' className={classes.photoLink}>
                    {photo}
                  </Typography>
                </Link>
              ))}
            </Grid>
            <Grid item xs={4}>
              <Typography component='p' variant='body2' className={classes.listItem}>
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
          {!showCheckIn && updating && (
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
            {showCheckIn ? (
              <CheckInButtons
                isCheckedIn={isCheckedIn}
                isCheckingIn={isCheckingIn}
                pendingCheckIn={isPendingCheckIn}
                onSubmitHandler={onCheckInHandler}
              />
            ) : (
              <FooterButtons
                errors={errors.length > 0}
                updating={updating}
                isEditing={isEditing}
                isSaving={isSaving}
                isSaved={isSaved}
                nextStepTo='processing-drying'
                nextStep={strings.NEXT_PROCESSING_AND_DRYING}
                onSubmitHandler={onSubmitHandler}
                handleCancel={handleCancel}
              />
            )}
          </Grid>
        </Grid>
      </MainPaper>
    </MuiPickersUtilsProvider>
  );
}

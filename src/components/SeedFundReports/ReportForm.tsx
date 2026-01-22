import React, { type JSX, useCallback, useEffect, useState } from 'react';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { Checkbox, Textfield } from '@terraware/web-components';

import LocationSection from 'src/components/SeedFundReports/LocationSelection';
import ViewPhotos from 'src/components/SeedFundReports/ViewPhotos';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import SelectPhotos from 'src/components/common/Photos/SelectPhotos';
import { useOrganization } from 'src/providers';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestPlantingSitesSearchResults } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch } from 'src/redux/store';
import SeedFundReportService from 'src/services/SeedFundReportService';
import strings from 'src/strings';
import { Report, ReportNursery, ReportPlantingSite } from 'src/types/Report';
import { ReportSeedBank } from 'src/types/Report';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const MAX_PHOTOS = 30;

export type ReportFormProps = {
  editable: boolean;
  draftReport: Report;
  onChange?: (report: Report) => void;
  onUpdateReport?: (field: string, value: any) => void;
  allSeedbanks?: ReportSeedBank[];
  allNurseries?: ReportNursery[];
  allPlantingSites?: ReportPlantingSite[];
  onUpdateLocation?: (
    index: number,
    field: string,
    value: any,
    location: 'seedBanks' | 'nurseries' | 'plantingSites'
  ) => void;
  onUpdateWorkers?: (
    index: number,
    workersField: string,
    value: any,
    location: 'seedBanks' | 'nurseries' | 'plantingSites'
  ) => void;
  onPhotosChanged?: (photos: File[]) => void;
  onPhotoRemove?: (id: number) => void;
  validate?: boolean;
};

export default function ReportForm(props: ReportFormProps): JSX.Element {
  const {
    editable,
    draftReport,
    onUpdateReport,
    allSeedbanks,
    allNurseries,
    allPlantingSites,
    onUpdateLocation,
    onUpdateWorkers,
    onPhotosChanged,
    onPhotoRemove,
    validate,
  } = props;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { isMobile, isTablet } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();

  const [summaryOfProgress, setSummaryOfProgress] = useState(draftReport.summaryOfProgress ?? '');
  const [projectNotes, setProjectNotes] = useState(draftReport.notes ?? '');
  const [photoCount, setPhotoCount] = useState(0);

  const infoCardStyle = {
    padding: 0,
  };

  const sectionStyles = {
    padding: 0,
    marginLeft: theme.spacing(3),
    borderBottom: `solid 1px ${theme.palette.TwClrBrdrTertiary}`,
  };

  // We check the project name because a project can be deleted, and if that happens the ID will not be present
  const isProjectReport = !!draftReport.projectName;

  useEffect(() => {
    const getPhotoCount = async () => {
      const photoListResponse = await SeedFundReportService.getReportPhotos(draftReport.id);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotoCount(0);
      } else {
        setPhotoCount(photoListResponse.photos?.length ?? 0);
      }
    };

    void getPhotoCount();
  }, [draftReport.id]);

  const handleAddRemoveLocation = useCallback(
    (selected: boolean, index: number, location: 'seedBanks' | 'nurseries' | 'plantingSites') => {
      if (onUpdateLocation) {
        onUpdateLocation(index, 'selected', selected, location);
      }
    },
    [onUpdateLocation]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestObservations(selectedOrganization.id));
      void dispatch(requestObservationsResults(selectedOrganization.id));
      void dispatch(requestPlantings(selectedOrganization.id));
      void dispatch(requestPlantingSitesSearchResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile || isTablet ? 12 : 8);

  const LocationCheckbox = useCallback(
    (
      name: string,
      selected: boolean,
      id: string,
      index: number,
      location: 'seedBanks' | 'nurseries' | 'plantingSites'
    ) => {
      if (isProjectReport) {
        return <Typography variant={'h6'}>{name}</Typography>;
      }

      return (
        <Checkbox
          id={id}
          disabled={!editable}
          name={name}
          label={name}
          value={selected}
          onChange={(value) => handleAddRemoveLocation(value, index, location)}
        />
      );
    },
    [isProjectReport, editable, handleAddRemoveLocation]
  );

  return (
    <Grid
      container
      spacing={theme.spacing(3)}
      borderRadius={theme.spacing(3)}
      padding={theme.spacing(0, 3, 3, 0)}
      margin={0}
      width='fit-content'
      sx={{
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PROJECT_INFORMATION}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <OverviewItemCard
          isEditable={false}
          title={strings.ORGANIZATION}
          contents={draftReport.organizationName ?? ''}
          sx={infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.SEED_BANKS}
          contents={`${draftReport?.seedBanks?.filter((sb) => sb.selected)?.length}` || '0'}
          sx={infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.NURSERIES}
          contents={`${draftReport?.nurseries?.filter((n) => n.selected)?.length}` || '0'}
          sx={infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.PLANTING_SITES}
          contents={`${draftReport?.plantingSites?.filter((ps) => ps.selected)?.length}` || '0'}
          sx={infoCardStyle}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={strings.SUMMARY_OF_PROGRESS_REQUIRED}
          placeholder={strings.SUMMARY_OF_PROGRESS_DESCRIPTION}
          id='summary-of-progress'
          type='textarea'
          display={!editable}
          preserveNewlines={true}
          value={summaryOfProgress}
          onChange={(value) => {
            setSummaryOfProgress(value as string);
            if (onUpdateReport) {
              onUpdateReport('summaryOfProgress', value);
            }
          }}
          errorText={validate && !draftReport.summaryOfProgress ? strings.REQUIRED_FIELD : ''}
          tooltipTitle={strings.REPORT_SUMMARY_OF_PROGRESS_INFO}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={strings.PROJECT_NOTES}
          id='notes'
          type='textarea'
          display={!editable}
          preserveNewlines={true}
          value={projectNotes}
          onChange={(value) => {
            setProjectNotes(value as string);
            if (onUpdateReport) {
              onUpdateReport('notes', value);
            }
          }}
        />
        {editable && (
          <Typography
            color={theme.palette.TwClrTxtSecondary}
            fontSize='14px'
            fontWeight={400}
            marginTop={theme.spacing(0.5)}
          >
            {strings.NOTE_ANY_ISSUES}
          </Typography>
        )}
        <Grid item xs={12}>
          <Typography fontSize='20px' fontWeight={600} marginTop={4}>
            {strings.PROJECT_PHOTOS}
          </Typography>
        </Grid>
        <ViewPhotos
          reportId={draftReport.id}
          onPhotoRemove={(id) => {
            setPhotoCount(photoCount - 1);
            if (onPhotoRemove) {
              onPhotoRemove(id);
            }
          }}
          editable={editable}
        />
        {editable && onPhotosChanged && (
          <Container maxWidth={false}>
            <SelectPhotos
              onPhotosChanged={onPhotosChanged}
              multipleSelection={true}
              maxPhotos={MAX_PHOTOS - photoCount}
              description={
                strings.PHOTOS_TO_UPLOAD +
                ' ' +
                strings.formatString(strings.PHOTOS_TO_UPLOAD_LIMIT, MAX_PHOTOS - photoCount).toString() +
                ':'
              }
            />
          </Container>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.SEED_BANKS}
        </Typography>
      </Grid>
      <Grid container>
        {allSeedbanks ? (
          allSeedbanks.map((seedbank, index) => (
            <Grid key={index} container spacing={theme.spacing(3)} margin={0}>
              {index !== 0 && <Grid item xs={12} sx={sectionStyles} />}
              <Grid item xs={12}>
                {LocationCheckbox(seedbank.name, seedbank.selected, `seedbank-${index}`, index, 'seedBanks')}
              </Grid>
              {seedbank.selected && (
                <LocationSection
                  editable={editable}
                  location={seedbank}
                  onUpdateLocation={(field, value) =>
                    onUpdateLocation && onUpdateLocation(index, field, value, 'seedBanks')
                  }
                  onUpdateWorkers={(field, value) =>
                    onUpdateWorkers && onUpdateWorkers(index, field, value, 'seedBanks')
                  }
                  locationType='seedBank'
                  validate={validate}
                  projectName={draftReport.projectName}
                />
              )}
            </Grid>
          ))
        ) : (
          <Typography marginLeft={theme.spacing(3)}>{strings.REPORT_NO_SEEDBANKS}</Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.NURSERIES}
        </Typography>
      </Grid>
      <Grid container>
        {allNurseries ? (
          allNurseries.map((nursery, index) => (
            <Grid key={index} container spacing={theme.spacing(3)} margin={0}>
              {index !== 0 && <Grid item xs={12} sx={sectionStyles} />}
              <Grid item xs={12}>
                {LocationCheckbox(nursery.name, nursery.selected, `nursery-${index}`, index, 'nurseries')}
              </Grid>
              {nursery.selected && (
                <LocationSection
                  editable={editable}
                  location={nursery}
                  onUpdateLocation={(field, value) =>
                    onUpdateLocation && onUpdateLocation(index, field, value, 'nurseries')
                  }
                  onUpdateWorkers={(field, value) =>
                    onUpdateWorkers && onUpdateWorkers(index, field, value, 'nurseries')
                  }
                  locationType='nursery'
                  validate={validate}
                  projectName={draftReport.projectName}
                />
              )}
            </Grid>
          ))
        ) : (
          <Typography marginLeft={theme.spacing(3)}>{strings.REPORT_NO_NURSERIES}</Typography>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PLANTING_SITES}
        </Typography>
      </Grid>
      <Grid container>
        {allPlantingSites ? (
          allPlantingSites.map((plantingSite, index) => (
            <Grid key={index} container spacing={theme.spacing(3)} margin={0}>
              {index !== 0 && <Grid item xs={12} sx={sectionStyles} />}
              <Grid item xs={12}>
                {LocationCheckbox(
                  plantingSite.name,
                  plantingSite.selected,
                  `planting-site-${index}`,
                  index,
                  'plantingSites'
                )}
              </Grid>
              {plantingSite.selected && (
                <LocationSection
                  editable={editable}
                  location={plantingSite}
                  onUpdateLocation={(field, value) =>
                    onUpdateLocation && onUpdateLocation(index, field, value, 'plantingSites')
                  }
                  onUpdateWorkers={(field, value) =>
                    onUpdateWorkers && onUpdateWorkers(index, field, value, 'plantingSites')
                  }
                  locationType='plantingSite'
                  validate={validate}
                />
              )}
            </Grid>
          ))
        ) : (
          <Typography marginLeft={theme.spacing(3)}>{strings.REPORT_NO_PLANTING_SITES}</Typography>
        )}
      </Grid>
    </Grid>
  );
}

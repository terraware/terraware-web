import React, { useState } from 'react';
import { Container, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Checkbox, Textfield } from '@terraware/web-components';
import { Report } from 'src/types/Report';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';
import ViewPhotos from './ViewPhotos';
import SelectPhotos from '../common/SelectPhotos';
import { ReportSeedBank } from 'src/types/Report';
import { makeStyles } from '@mui/styles';
import SeedbankSection from './SeedbankSection';

const DEBOUNCE_TIME_MS = 500;

const useStyles = makeStyles((theme: Theme) => ({
  infoCardStyle: {
    padding: 0,
  },
  section: {
    padding: 0,
    marginLeft: theme.spacing(3),
    borderBottom: `solid 1px ${theme.palette.TwClrBrdrTertiary}`,
  },
}));

export type ReportFormProps = {
  editable: boolean;
  draftReport: Report;
  onChange?: (report: Report) => void;
  onUpdateReport?: (field: string, value: any) => void;
  allSeedbanks?: ReportSeedBank[];
  onUpdateSeedbank?: (seedbankIndex: number, seedbankField: string, value: any) => void;
  onUpdateSeedbankWorkers?: (seedbankIndex: number, workersField: string, value: any) => void;
  onPhotosChanged?: (photos: File[]) => void;
};

export default function ReportForm(props: ReportFormProps): JSX.Element {
  const {
    editable,
    draftReport,
    onUpdateReport,
    allSeedbanks,
    onUpdateSeedbank,
    onUpdateSeedbankWorkers,
    onPhotosChanged,
  } = props;
  const theme = useTheme();
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();

  const [summaryOfProgress, setSummaryOfProgress] = useState(draftReport.summaryOfProgress ?? '');
  useDebounce(summaryOfProgress, DEBOUNCE_TIME_MS, (value) => {
    if (onUpdateReport) {
      onUpdateReport('summaryOfProgress', value);
    }
  });

  const [projectNotes, setProjectNotes] = useState(draftReport.notes ?? '');
  useDebounce(projectNotes, DEBOUNCE_TIME_MS, (value) => {
    if (onUpdateReport) {
      onUpdateReport('notes', value);
    }
  });

  const handleAddRemoveSeedbank = (selected: boolean, index: number) => {
    if (onUpdateSeedbank) {
      onUpdateSeedbank(index, 'selected', selected);
    }
  };

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile ? 12 : 8);

  return (
    <Grid
      container
      spacing={theme.spacing(3)}
      borderRadius={theme.spacing(3)}
      padding={theme.spacing(0, 3, 3, 0)}
      marginLeft={0}
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
          className={classes.infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.SEED_BANKS}
          contents={`${draftReport.totalSeedBanks}` ?? '0'}
          className={classes.infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.NURSERIES}
          contents={`${draftReport.totalNurseries}` ?? '0'}
          className={classes.infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <OverviewItemCard
          isEditable={false}
          title={strings.PLANTING_SITES}
          contents={`${draftReport.totalPlantingSites}` ?? '0'}
          className={classes.infoCardStyle}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={strings.SUMMARY_OF_PROGRESS}
          placeholder={strings.SUMMARY_OF_PROGRESS_DESCRIPTION}
          id='summary'
          type='textarea'
          disabled={!editable}
          value={summaryOfProgress}
          onChange={(value) => setSummaryOfProgress(value as string)}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={strings.PROJECT_NOTES}
          id='notes'
          type='textarea'
          disabled={!editable}
          value={projectNotes}
          onChange={(value) => setProjectNotes(value as string)}
        />
        <Typography
          color={theme.palette.TwClrTxtSecondary}
          fontSize='14px'
          fontWeight={400}
          marginTop={theme.spacing(0.5)}
        >
          {strings.NOTE_ANY_ISSUES}
        </Typography>
        <Grid item xs={12}>
          <Typography fontSize='20px' fontWeight={600} marginTop={4}>
            {strings.PROJECT_PHOTOS}
          </Typography>
        </Grid>
        <ViewPhotos reportId={draftReport.id} />
        {editable && onPhotosChanged && (
          <Container maxWidth={false}>
            <SelectPhotos onPhotosChanged={onPhotosChanged} multipleSelection={true} />
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
              {index !== 0 && <Grid item xs={12} className={classes.section} />}
              <Grid item xs={12}>
                <Checkbox
                  id={seedbank.id.toString()}
                  disabled={!editable}
                  name={seedbank.name}
                  label={seedbank.name}
                  value={seedbank.selected}
                  onChange={(value) => handleAddRemoveSeedbank(value, index)}
                />
              </Grid>
              {seedbank.selected && (
                <SeedbankSection
                  editable={editable}
                  seedbank={seedbank}
                  onUpdateSeedbank={(field, value) => onUpdateSeedbank && onUpdateSeedbank(index, field, value)}
                  onUpdateSeedbankWorkers={(field, value) =>
                    onUpdateSeedbankWorkers && onUpdateSeedbankWorkers(index, field, value)
                  }
                />
              )}
            </Grid>
          ))
        ) : (
          <Typography marginLeft={theme.spacing(3)}>{strings.REPORT_NO_SEEDBANKS}</Typography>
        )}
      </Grid>
    </Grid>
  );
}

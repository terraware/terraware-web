import { Grid, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import { Accession2 } from 'src/api/accessions2/accession';
import strings from 'src/strings';
import { ViabilityTest } from 'src/api/types/accessions';
import { getFullTestType } from 'src/utils/viabilityTest';
import ObservationsChart from './ObservationsChart';
import { useDeviceInfo } from '@terraware/web-components/utils';

export interface ViewViabilityTestModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  viabilityTest: ViabilityTest;
  onEdit: () => void;
}

export default function ViewViabilityTestModal(props: ViewViabilityTestModalProps): JSX.Element {
  const { onClose, open, viabilityTest, onEdit } = props;
  const { isMobile } = useDeviceInfo();

  const onCloseHandler = () => {
    onClose();
  };

  const openEdit = () => {
    onEdit();
  };

  const titleStyle = {
    color: '#859799',
  };

  const smallColumn = isMobile ? 6 : 4;
  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.formatString(strings.VIABILITY_TEST_NUMBER, viabilityTest?.id.toString()) as string}
      size='large'
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left' color={'#000000'} fontSize='14px'>
        <Grid item xs={12} display='flex'>
          <Grid xs={6}>
            <Typography fontSize='20px'>
              {strings.TEST} #{viabilityTest.id}
            </Typography>
            <Typography fontSize='14px'>
              {strings.VIABILITY_RESULT}: {viabilityTest.endDate ? strings.COMPLETE : strings.PENDING}
            </Typography>
          </Grid>
          <Grid xs={6} textAlign='right'>
            <Button label={strings.EDIT} onClick={() => openEdit()} />
          </Grid>
        </Grid>
        <Grid item xs={12} display='flex'>
          <Grid xs={smallColumn}>
            <Grid xs={12} sx={titleStyle}>
              {strings.TEST_METHOD}
            </Grid>
            <Grid xs={12}>{getFullTestType(viabilityTest.testType)}</Grid>
          </Grid>
          <Grid xs={smallColumn}>
            <Grid xs={12} sx={titleStyle}>
              {strings.SEED_TYPE}
            </Grid>
            <Grid xs={12}>{viabilityTest.seedType}</Grid>
          </Grid>
          {!isMobile && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.SUBSTRATE}
              </Grid>
              <Grid xs={12}>{viabilityTest.substrate}</Grid>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} display='flex'>
          {isMobile && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.SUBSTRATE}
              </Grid>
              <Grid xs={12}>{viabilityTest.substrate}</Grid>
            </Grid>
          )}
          <Grid xs={smallColumn}>
            <Grid xs={12} sx={titleStyle}>
              {strings.TREATMENT}
            </Grid>
            <Grid xs={12}>{viabilityTest.treatment}</Grid>
          </Grid>
          {!isMobile && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          )}
        </Grid>
        {isMobile && (
          <Grid item xs={12} display='flex'>
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sx={{ background: '#F2F4F5', borderRadius: '16px', padding: 2, marginTop: 2, marginLeft: 1 }}
        >
          <Grid xs={12} display='flex'>
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.START_DATE}
              </Grid>
              <Grid xs={12}>{viabilityTest.startDate}</Grid>
            </Grid>
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.NUMBER_OF_SEEDS_TESTED}
              </Grid>
              <Grid xs={12}>{viabilityTest.seedsTested}</Grid>
            </Grid>
          </Grid>
          {viabilityTest.testResults?.map((testResult, index) => {
            return (
              <Grid xs={12} key={`observation-${index}`} display='flex' paddingTop={1}>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.CHECK_DATE}
                  </Grid>
                  <Grid xs={12}>{testResult.recordingDate}</Grid>
                </Grid>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.NUMBER_OF_SEEDS_GERMINATED}
                  </Grid>
                  <Grid xs={12}>{testResult.seedsGerminated}</Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        {viabilityTest.testResults && viabilityTest.testResults.length > 0 ? (
          <Grid item xs={12}>
            <ObservationsChart observations={viabilityTest.testResults} />
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <Grid xs={12} sx={titleStyle}>
            {strings.NOTES}
          </Grid>
          <Grid xs={12}>{viabilityTest.notes}</Grid>
        </Grid>
      </Grid>
    </DialogBox>
  );
}

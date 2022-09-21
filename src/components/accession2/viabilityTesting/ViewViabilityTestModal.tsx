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
  selectedTest: ViabilityTest;
  setNewViabilityTestOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTest: React.Dispatch<React.SetStateAction<ViabilityTest | undefined>>;
}

export default function ViewViabilityTestModal(props: ViewViabilityTestModalProps): JSX.Element {
  const { onClose, open, selectedTest, setNewViabilityTestOpened, setSelectedTest } = props;
  const { isMobile } = useDeviceInfo();

  const onCloseHandler = () => {
    setSelectedTest(undefined);
    onClose();
  };

  const openEdit = () => {
    onClose();
    setNewViabilityTestOpened(true);
  };

  const titleStyle = {
    color: '#859799',
  };

  const smallColumn = isMobile ? 6 : 4;
  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.formatString(strings.VIABILITY_TEST_NUMBER, selectedTest?.id.toString()) as string}
      size='large'
      scrolled={true}
    >
      <Grid container item xs={12} spacing={2} textAlign='left' color={'#000000'} fontSize='14px'>
        <Grid item xs={12} display='flex'>
          <Grid xs={6}>
            <Typography fontSize='20px'>
              {strings.TEST} #{selectedTest.id}
            </Typography>
            <Typography fontSize='14px'>
              {strings.VIABILITY_RESULT}: {selectedTest.endDate ? strings.COMPLETE : strings.PENDING}
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
            <Grid xs={12}>{getFullTestType(selectedTest.testType)}</Grid>
          </Grid>
          <Grid xs={smallColumn}>
            <Grid xs={12} sx={titleStyle}>
              {strings.SEED_TYPE}
            </Grid>
            <Grid xs={12}>{selectedTest.seedType}</Grid>
          </Grid>
          {!isMobile && selectedTest.testType === 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{selectedTest.withdrawnByName}</Grid>
            </Grid>
          )}
          {!isMobile && selectedTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.SUBSTRATE}
              </Grid>
              <Grid xs={12}>{selectedTest.substrate}</Grid>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} display='flex'>
          {isMobile && selectedTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.SUBSTRATE}
              </Grid>
              <Grid xs={12}>{selectedTest.substrate}</Grid>
            </Grid>
          )}
          {selectedTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.TREATMENT}
              </Grid>
              <Grid xs={12}>{selectedTest.treatment}</Grid>
            </Grid>
          )}
          {!isMobile && selectedTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{selectedTest.withdrawnByName}</Grid>
            </Grid>
          )}
        </Grid>
        {isMobile && (
          <Grid item xs={12} display='flex'>
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{selectedTest.withdrawnByName}</Grid>
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
              <Grid xs={12}>{selectedTest.startDate}</Grid>
            </Grid>
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {selectedTest.testType === 'Cut' ? strings.NUMBER_OF_SEEDS_FILLED : strings.NUMBER_OF_SEEDS_TESTED}
              </Grid>
              <Grid xs={12}>
                {selectedTest.testType === 'Cut' ? selectedTest.seedsFilled : selectedTest.seedsTested}
              </Grid>
            </Grid>
          </Grid>
          {selectedTest.testType === 'Cut' && (
            <>
              <Grid xs={12} display='flex' paddingTop={2}>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.NUMBER_OF_SEEDS_COMPROMISED}
                  </Grid>
                  <Grid xs={12}>{selectedTest.seedsCompromised}</Grid>
                </Grid>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.NUMBER_OF_SEEDS_EMPTY}
                  </Grid>
                  <Grid xs={12}>{selectedTest.seedsEmpty}</Grid>
                </Grid>
              </Grid>
              <Grid xs={12} paddingTop={2}>
                <Grid xs={12} sx={titleStyle}>
                  #{strings.TOTAL_SEEDS_TESTED}
                </Grid>
                <Grid xs={12}>{selectedTest.seedsTested}</Grid>
              </Grid>
            </>
          )}
          {selectedTest.testResults?.map((testResult, index) => {
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
        {selectedTest.testResults && selectedTest.testResults.length > 0 ? (
          <Grid item xs={12}>
            <ObservationsChart observations={selectedTest.testResults} />
          </Grid>
        ) : null}
        <Grid item xs={12}>
          <Grid xs={12} sx={titleStyle}>
            {strings.NOTES}
          </Grid>
          <Grid xs={12}>{selectedTest.notes}</Grid>
        </Grid>
      </Grid>
    </DialogBox>
  );
}

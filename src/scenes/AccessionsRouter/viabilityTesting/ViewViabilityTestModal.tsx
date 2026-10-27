import React, { type JSX } from 'react';
import { useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, DialogBox, IconTooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import TooltipLearnMoreModal, {
  LearnMoreLink,
  LearnMoreModalContentSeedType,
  LearnMoreModalContentSubstrate,
  LearnMoreModalContentTreatment,
  TooltipLearnMoreModalData,
} from 'src/components/TooltipLearnMoreModal';
import strings from 'src/strings';
import { ViabilityTest } from 'src/types/Accession';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import { getFullTestType } from 'src/utils/viabilityTest';

import DeleteViabilityTestModal from './DeleteViabilityTestModal';
import ObservationsChart from './ObservationsChart';

export interface ViewViabilityTestModalProps {
  open: boolean;
  isEditable: boolean;
  onClose: () => void;
  viabilityTest: ViabilityTest;
  onEdit: () => void;
}

export default function ViewViabilityTestModal(props: ViewViabilityTestModalProps): JSX.Element {
  const theme = useTheme();
  const { onClose, open, isEditable, viabilityTest, onEdit } = props;
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();
  const numberFormatter = useNumberFormatter();

  const [tooltipLearnMoreModalOpen, setTooltipLearnMoreModalOpen] = useState(false);
  const [tooltipLearnMoreModalData, setTooltipLearnMoreModalData] = useState<TooltipLearnMoreModalData | undefined>(
    undefined
  );
  const openTooltipLearnMoreModal = (data: TooltipLearnMoreModalData) => {
    setTooltipLearnMoreModalData(data);
    setTooltipLearnMoreModalOpen(true);
  };
  const handleTooltipLearnMoreModalClose = () => {
    setTooltipLearnMoreModalOpen(false);
  };

  const onCloseHandler = () => {
    onClose();
  };

  const openEdit = () => {
    onEdit();
  };

  const titleStyle = {
    color: theme.palette.TwClrTxtSecondary,
  };

  const smallColumn = isMobile ? 6 : 4;

  if (openDeleteModal) {
    return (
      <DeleteViabilityTestModal
        open={openDeleteModal}
        viabilityTest={viabilityTest}
        onCancel={() => setOpenDeleteModal(false)}
        onDone={() => {
          onCloseHandler();
        }}
      />
    );
  }

  return (
    <DialogBox
      onClose={onCloseHandler}
      open={open}
      title={strings.formatString(strings.VIABILITY_TEST_NUMBER, viabilityTest?.id.toString()) as string}
      size='large'
      scrolled={true}
    >
      <TooltipLearnMoreModal
        content={tooltipLearnMoreModalData?.content}
        onClose={handleTooltipLearnMoreModalClose}
        open={tooltipLearnMoreModalOpen}
        title={tooltipLearnMoreModalData?.title}
      />
      <Grid container spacing={2} textAlign='left' color={theme.palette.TwClrTxt} fontSize='14px' size={12}>
        <Grid container spacing={0} display='flex' size={12}>
          <Grid size={isEditable ? 6 : 12}>
            <Typography fontSize='20px'>
              {strings.TEST} #{viabilityTest.id}
            </Typography>
            <Typography fontSize='14px'>
              {strings.VIABILITY_RESULT}: {viabilityTest.endDate ? strings.COMPLETE : strings.PENDING}
            </Typography>
          </Grid>
          {isEditable ? (
            <Grid textAlign='right' size={6}>
              <Box marginRight={1} display='inline-block'>
                <Button
                  type='passive'
                  priority='secondary'
                  label={isMobile ? '' : strings.DELETE}
                  icon='iconTrashCan'
                  onClick={() => setOpenDeleteModal(true)}
                />
              </Box>
              <Button label={isMobile ? '' : strings.EDIT} icon='iconEdit' onClick={() => openEdit()} />
            </Grid>
          ) : null}
        </Grid>
        <Grid container spacing={0} display='flex' size={12}>
          <Grid size={smallColumn}>
            <Grid sx={titleStyle} size={12}>
              {strings.TEST_METHOD}
            </Grid>
            <Grid size={12}>{getFullTestType(viabilityTest.testType)}</Grid>
          </Grid>
          <Grid size={smallColumn}>
            <Grid sx={titleStyle} size={12}>
              {strings.SEED_TYPE}
              <IconTooltip
                title={
                  <>
                    {strings.TOOLTIP_VIABILITY_TEST_SEED_TYPE}
                    <LearnMoreLink
                      onClick={() =>
                        openTooltipLearnMoreModal({
                          title: strings.SEED_TYPE,
                          content: <LearnMoreModalContentSeedType />,
                        })
                      }
                    />
                  </>
                }
              />
            </Grid>
            <Grid size={12}>{viabilityTest.seedType}</Grid>
          </Grid>
          {!isMobile && viabilityTest.testType === 'Cut' && (
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.STAFF}
              </Grid>
              <Grid size={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          )}
          {!isMobile && viabilityTest.testType !== 'Cut' && (
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.TREATMENT}
                <IconTooltip
                  title={
                    <>
                      {strings.TOOLTIP_VIABILITY_TEST_TREATMENT}
                      <LearnMoreLink
                        onClick={() =>
                          openTooltipLearnMoreModal({
                            title: strings.TREATMENT,
                            content: <LearnMoreModalContentTreatment />,
                          })
                        }
                      />
                    </>
                  }
                />
              </Grid>
              <Grid size={12}>{viabilityTest.treatment}</Grid>
            </Grid>
          )}
        </Grid>
        <Grid container spacing={0} display='flex' size={12}>
          {isMobile && viabilityTest.testType !== 'Cut' && (
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.TREATMENT}
                <IconTooltip
                  title={
                    <>
                      {strings.TOOLTIP_VIABILITY_TEST_TREATMENT}
                      <LearnMoreLink
                        onClick={() =>
                          openTooltipLearnMoreModal({
                            title: strings.TREATMENT,
                            content: <LearnMoreModalContentTreatment />,
                          })
                        }
                      />
                    </>
                  }
                />
              </Grid>
              <Grid size={12}>{viabilityTest.treatment}</Grid>
            </Grid>
          )}
          {viabilityTest.testType !== 'Cut' && (
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.SUBSTRATE}
                <IconTooltip
                  title={
                    <>
                      {strings.TOOLTIP_VIABILITY_TEST_SUBSTRATE}
                      <LearnMoreLink
                        onClick={() =>
                          openTooltipLearnMoreModal({
                            title: strings.SUBSTRATE,
                            content: <LearnMoreModalContentSubstrate />,
                          })
                        }
                      />
                    </>
                  }
                />
              </Grid>
              <Grid size={12}>{viabilityTest.substrate}</Grid>
            </Grid>
          )}
          {!isMobile && viabilityTest.testType !== 'Cut' && (
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.STAFF}
              </Grid>
              <Grid size={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          )}
        </Grid>
        {isMobile && (
          <Grid container spacing={0} display='flex' size={12}>
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.STAFF}
              </Grid>
              <Grid size={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          </Grid>
        )}
        {viabilityTest.substrateNotes && (
          <Grid size={12}>
            <Grid sx={titleStyle} size={12}>
              {strings.SUBSTRATE_NOTES}
            </Grid>
            <Grid sx={{ whiteSpace: 'pre-wrap' }} size={12}>
              {viabilityTest.substrateNotes}
            </Grid>
          </Grid>
        )}
        <Grid
          sx={{
            background: theme.palette.TwClrBgSecondary,
            borderRadius: '16px',
            padding: 2,
            marginTop: 2,
            marginLeft: 1,
          }}
          size={12}
        >
          <Grid container spacing={0} display='flex' size={12}>
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {strings.START_DATE}
              </Grid>
              <Grid size={12}>{viabilityTest.startDate}</Grid>
            </Grid>
            <Grid size={smallColumn}>
              <Grid sx={titleStyle} size={12}>
                {viabilityTest.testType === 'Cut' ? strings.NUMBER_OF_SEEDS_FILLED_V2 : strings.NUMBER_OF_SEEDS_TESTED}
              </Grid>
              <Grid size={12}>
                {numberFormatter.format(
                  viabilityTest.testType === 'Cut' ? viabilityTest.seedsFilled : viabilityTest.seedsTested
                )}
              </Grid>
            </Grid>
          </Grid>
          {viabilityTest.testType === 'Cut' && (
            <>
              <Grid container spacing={0} display='flex' paddingTop={2} size={12}>
                <Grid size={smallColumn}>
                  <Grid sx={titleStyle} size={12}>
                    {strings.NUMBER_OF_SEEDS_COMPROMISED_V2}
                  </Grid>
                  <Grid size={12}>{numberFormatter.format(viabilityTest.seedsCompromised)}</Grid>
                </Grid>
                <Grid size={smallColumn}>
                  <Grid sx={titleStyle} size={12}>
                    {strings.NUMBER_OF_SEEDS_EMPTY_V2}
                  </Grid>
                  <Grid size={12}>{numberFormatter.format(viabilityTest.seedsEmpty)}</Grid>
                </Grid>
              </Grid>
              <Grid paddingTop={2} size={12}>
                <Grid sx={titleStyle} size={12}>
                  #{strings.TOTAL_SEEDS_TESTED}
                </Grid>
                <Grid size={12}>{numberFormatter.format(viabilityTest.seedsTested)}</Grid>
              </Grid>
            </>
          )}
          {viabilityTest.testResults?.map((testResult, index) => {
            return (
              <Grid key={`observation-${index}`} container spacing={0} display='flex' paddingTop={1} size={12}>
                <Grid size={smallColumn}>
                  <Grid sx={titleStyle} size={12}>
                    {strings.CHECK_DATE}
                  </Grid>
                  <Grid size={12}>{testResult.recordingDate}</Grid>
                </Grid>
                <Grid size={smallColumn}>
                  <Grid sx={titleStyle} size={12}>
                    {strings.NUMBER_OF_SEEDS_GERMINATED}
                  </Grid>
                  <Grid size={12}>{numberFormatter.format(testResult.seedsGerminated)}</Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        {viabilityTest.testResults && viabilityTest.testResults.length > 0 ? (
          <Grid size={12}>
            <ObservationsChart observations={viabilityTest.testResults} />
          </Grid>
        ) : null}
        <Grid size={12}>
          <Grid sx={titleStyle} size={12}>
            {strings.NOTES}
          </Grid>
          <Grid size={12}>{viabilityTest.notes}</Grid>
        </Grid>
      </Grid>
    </DialogBox>
  );
}

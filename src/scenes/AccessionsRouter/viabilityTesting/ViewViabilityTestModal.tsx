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
import { Accession } from 'src/types/Accession';
import { ViabilityTest } from 'src/types/Accession';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';
import { getFullTestType } from 'src/utils/viabilityTest';

import DeleteViabilityTestModal from './DeleteViabilityTestModal';
import ObservationsChart from './ObservationsChart';

export interface ViewViabilityTestModalProps {
  open: boolean;
  accession: Accession;
  isEditable: boolean;
  onClose: () => void;
  viabilityTest: ViabilityTest;
  onEdit: () => void;
  reload: () => void;
}

export default function ViewViabilityTestModal(props: ViewViabilityTestModalProps): JSX.Element {
  const theme = useTheme();
  const { onClose, open, accession, isEditable, viabilityTest, onEdit, reload } = props;
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
        accession={accession}
        viabilityTest={viabilityTest}
        onCancel={() => setOpenDeleteModal(false)}
        onDone={() => {
          reload();
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
      <Grid container item xs={12} spacing={2} textAlign='left' color={theme.palette.TwClrTxt} fontSize='14px'>
        <Grid item xs={12} display='flex'>
          <Grid xs={isEditable ? 6 : 12}>
            <Typography fontSize='20px'>
              {strings.TEST} #{viabilityTest.id}
            </Typography>
            <Typography fontSize='14px'>
              {strings.VIABILITY_RESULT}: {viabilityTest.endDate ? strings.COMPLETE : strings.PENDING}
            </Typography>
          </Grid>
          {isEditable ? (
            <Grid xs={6} textAlign='right'>
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
            <Grid xs={12}>{viabilityTest.seedType}</Grid>
          </Grid>
          {!isMobile && viabilityTest.testType === 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
                {strings.STAFF}
              </Grid>
              <Grid xs={12}>{viabilityTest.withdrawnByName}</Grid>
            </Grid>
          )}
          {!isMobile && viabilityTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
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
              <Grid xs={12}>{viabilityTest.substrate}</Grid>
            </Grid>
          )}
        </Grid>
        <Grid item xs={12} display='flex'>
          {isMobile && viabilityTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
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
              <Grid xs={12}>{viabilityTest.substrate}</Grid>
            </Grid>
          )}
          {viabilityTest.testType !== 'Cut' && (
            <Grid xs={smallColumn}>
              <Grid xs={12} sx={titleStyle}>
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
              <Grid xs={12}>{viabilityTest.treatment}</Grid>
            </Grid>
          )}
          {!isMobile && viabilityTest.testType !== 'Cut' && (
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
          sx={{
            background: theme.palette.TwClrBgSecondary,
            borderRadius: '16px',
            padding: 2,
            marginTop: 2,
            marginLeft: 1,
          }}
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
                {viabilityTest.testType === 'Cut' ? strings.NUMBER_OF_SEEDS_FILLED_V2 : strings.NUMBER_OF_SEEDS_TESTED}
              </Grid>
              <Grid xs={12}>
                {numberFormatter.format(
                  viabilityTest.testType === 'Cut' ? viabilityTest.seedsFilled : viabilityTest.seedsTested
                )}
              </Grid>
            </Grid>
          </Grid>
          {viabilityTest.testType === 'Cut' && (
            <>
              <Grid xs={12} display='flex' paddingTop={2}>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.NUMBER_OF_SEEDS_COMPROMISED_V2}
                  </Grid>
                  <Grid xs={12}>{numberFormatter.format(viabilityTest.seedsCompromised)}</Grid>
                </Grid>
                <Grid xs={smallColumn}>
                  <Grid xs={12} sx={titleStyle}>
                    {strings.NUMBER_OF_SEEDS_EMPTY_V2}
                  </Grid>
                  <Grid xs={12}>{numberFormatter.format(viabilityTest.seedsEmpty)}</Grid>
                </Grid>
              </Grid>
              <Grid xs={12} paddingTop={2}>
                <Grid xs={12} sx={titleStyle}>
                  #{strings.TOTAL_SEEDS_TESTED}
                </Grid>
                <Grid xs={12}>{numberFormatter.format(viabilityTest.seedsTested)}</Grid>
              </Grid>
            </>
          )}
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
                  <Grid xs={12}>{numberFormatter.format(testResult.seedsGerminated)}</Grid>
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

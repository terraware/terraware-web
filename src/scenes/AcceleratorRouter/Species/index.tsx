import React, { type JSX, useCallback, useMemo, useState } from 'react';

import { Box, Grid, GridProps, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import RejectDialog from 'src/components/AcceleratorDeliverableView/RejectDialog';
import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import InternalComment from 'src/components/DeliverableView/InternalComment';
import Page from 'src/components/Page';
import Checkbox from 'src/components/common/Checkbox';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useParticipantProjectSpeciesData } from 'src/providers/ParticipantProject/ParticipantProjectSpeciesContext';
import { useLocalization, useProject } from 'src/providers/hooks';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApproveDeliverableDialog from '../Deliverables/ApproveDeliverableDialog';
import RejectedBox from './RejectedBox';

export default function SpeciesDetailView(): JSX.Element {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { goToParticipantProjectSpeciesEdit } = useNavigateTo();
  const { isMobile } = useDeviceInfo();
  const { projectId } = useProject();
  const { currentParticipantProjectSpecies, currentSpecies, isBusy, participantProjectSpeciesId, update } =
    useParticipantProjectSpeciesData();
  const { currentDeliverable, deliverableId } = useDeliverableData();

  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);

  const gridSize = useMemo(() => {
    if (isMobile) {
      return 12;
    }
    return 4;
  }, [isMobile]);

  const approveHandler = () => {
    if (currentParticipantProjectSpecies) {
      update(undefined, {
        ...currentParticipantProjectSpecies,
        submissionStatus: 'Approved',
      });
    }

    setShowApproveDialog(false);
  };

  const rejectHandler = (feedback: string) => {
    if (currentParticipantProjectSpecies) {
      update(undefined, {
        ...currentParticipantProjectSpecies,
        feedback,
        submissionStatus: 'Rejected',
      });
    }

    setShowRejectDialog(false);
  };

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'edit': {
          goToParticipantProjectSpeciesEdit(deliverableId, projectId, participantProjectSpeciesId);
        }
      }
    },
    [deliverableId, goToParticipantProjectSpeciesEdit, participantProjectSpeciesId, projectId]
  );

  const onUpdateInternalComment = useCallback(
    (internalComment: string) => {
      if (currentParticipantProjectSpecies) {
        update(undefined, {
          ...currentParticipantProjectSpecies,
          internalComment,
        });
      }
    },
    [currentParticipantProjectSpecies, update]
  );

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.EDIT,
              value: 'edit',
            },
          ]
        : [],
    [activeLocale]
  );

  const actions = useMemo(() => {
    if (!(currentParticipantProjectSpecies && activeLocale)) {
      return null;
    }

    return (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        <Button
          disabled={currentParticipantProjectSpecies.submissionStatus === 'Rejected'}
          id='rejectDeliverable'
          label={strings.REQUEST_UPDATE_ACTION}
          priority='secondary'
          onClick={() => void setShowRejectDialog(true)}
          size='medium'
          type='destructive'
        />
        <Button
          disabled={currentParticipantProjectSpecies.submissionStatus === 'Approved'}
          id='approveDeliverable'
          label={strings.APPROVE}
          onClick={() => void setShowApproveDialog(true)}
          size='medium'
        />
        <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
      </Box>
    );
  }, [activeLocale, currentParticipantProjectSpecies, onOptionItemClick, optionItems, theme]);

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.DELIVERABLES,
              to: APP_PATHS.ACCELERATOR_DELIVERABLES,
            },
            {
              name: currentDeliverable?.name || '',
              to: `/${deliverableId}/submissions/${projectId}`,
            },
          ]
        : [],
    [activeLocale, currentDeliverable?.name, deliverableId, projectId]
  );

  const GridItemWrapper = useCallback(
    ({ children, props }: { children: JSX.Element; props?: GridProps }) => (
      <Grid item xs={gridSize} {...props} minHeight={'64px'} paddingBottom={theme.spacing(2)}>
        {children}
      </Grid>
    ),
    [gridSize, theme]
  );

  return (
    <>
      {showApproveDialog && (
        <ApproveDeliverableDialog
          approveMessage={strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_SPECIES}
          onClose={() => setShowApproveDialog(false)}
          onSubmit={approveHandler}
          deliverableType={currentDeliverable?.type || 'Species'}
        />
      )}
      {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectHandler} />}

      {(isBusy || !currentSpecies || !currentParticipantProjectSpecies) && <BusySpinner withSkrim={true} />}

      {currentParticipantProjectSpecies && currentSpecies && (
        <Page
          title={
            <Box
              margin={theme.spacing(3)}
              alignItems='center'
              justifyContent='space-between'
              display='flex'
              flexDirection='row'
            >
              <Box display='flex' flexDirection='column'>
                <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
                  {strings.formatString(strings.DELIVERABLE_PROJECT, currentDeliverable?.projectName ?? '')}
                </Typography>
                <Typography
                  fontSize='24px'
                  lineHeight='32px'
                  fontWeight={600}
                  color={theme.palette.TwClrTxt}
                  margin={theme.spacing(1, 0)}
                >
                  {currentSpecies.scientificName}
                </Typography>
              </Box>
            </Box>
          }
          rightComponent={actions}
          crumbs={crumbs}
        >
          {currentParticipantProjectSpecies.submissionStatus === 'Rejected' && (
            <RejectedBox participantProjectSpecies={currentParticipantProjectSpecies} onSubmit={rejectHandler} />
          )}

          <Grid container padding={theme.spacing(0, 0, 4, 0)}>
            <Grid
              container
              sx={{
                backgroundColor: theme.palette.TwClrBg,
                borderRadius: '32px 32px 0 0',
                padding: theme.spacing(3),
                margin: 0,
              }}
            >
              {currentParticipantProjectSpecies && (
                <Box display='flex' flexDirection='column' width='100%'>
                  <Box
                    border={`1px solid ${theme.palette.TwClrBaseGray100}`}
                    borderRadius='8px'
                    marginBottom='16px'
                    padding='16px'
                  >
                    <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
                      <DeliverableStatusBadge status={currentParticipantProjectSpecies.submissionStatus} />
                    </div>

                    {currentDeliverable && (
                      <InternalComment entity={currentParticipantProjectSpecies} update={onUpdateInternalComment} />
                    )}
                  </Box>
                </Box>
              )}
              <GridItemWrapper>
                <TextField
                  label={strings.NATIVE_NON_NATIVE}
                  id='speciesNativeCategory'
                  type='text'
                  value={currentParticipantProjectSpecies.speciesNativeCategory}
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper props={{ xs: 12 }}>
                <TextField
                  label={strings.RATIONALE}
                  id='rationale'
                  type='text'
                  value={currentParticipantProjectSpecies.rationale}
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  label={strings.SCIENTIFIC_NAME}
                  id='scientificName'
                  type='text'
                  value={currentSpecies.scientificName}
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  label={strings.COMMON_NAME}
                  id='commonName'
                  type='text'
                  value={currentSpecies.commonName}
                  tooltipTitle={strings.TOOLTIP_TIME_ZONE_NURSERY}
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'family'}
                  label={strings.FAMILY}
                  value={currentSpecies.familyName}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'conservationCategory'}
                  label={strings.CONSERVATION_CATEGORY}
                  value={currentSpecies.conservationCategory}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'growthForms'}
                  label={strings.GROWTH_FORM}
                  value={currentSpecies.growthForms?.join(', ')}
                  type='text'
                  aria-label='date-picker'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <Checkbox
                  id='Rare'
                  name='rare'
                  label={strings.RARE}
                  disabled={true}
                  onChange={() => {
                    return;
                  }}
                  value={currentSpecies.rare}
                  sx={{ display: 'block' }}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'nativeEcosystem'}
                  label={strings.NATIVE_ECOSYSTEM}
                  value={currentSpecies.nativeEcosystem}
                  type='text'
                  display={true}
                  required
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'nativeEcosystem'}
                  label={strings.NATIVE_ECOSYSTEM}
                  value={currentSpecies.nativeEcosystem}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'successionalGroup'}
                  label={strings.SUCCESSIONAL_GROUP}
                  value={currentSpecies.successionalGroups?.join(', ')}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'ecosystemType'}
                  label={strings.ECOSYSTEM_TYPE}
                  value={currentSpecies.ecosystemTypes?.join(', ')}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'ecologicalRoleKnown'}
                  label={strings.ECOLOGICAL_ROLE_KNOWN}
                  value={currentSpecies.ecologicalRoleKnown}
                  type='text'
                  display={true}
                  tooltipTitle={strings.ECOLOGICAL_ROLE_KNOWN_TOOLTIP}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'localUsesKnown'}
                  label={strings.LOCAL_USES_KNOWN}
                  value={currentSpecies.localUsesKnown}
                  type='text'
                  display={true}
                  tooltipTitle={strings.LOCAL_USES_KNOWN_TOOLTIP}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'seedStorageBehavior'}
                  label={strings.SEED_STORAGE_BEHAVIOR}
                  value={currentSpecies.seedStorageBehavior}
                  type='text'
                  display={true}
                />
              </GridItemWrapper>
              <GridItemWrapper>
                <TextField
                  id={'plantMaterialSourcingMethod'}
                  label={strings.PLANT_MATERIAL_SOURCING_METHOD}
                  value={currentSpecies.plantMaterialSourcingMethods?.join(', ')}
                  type='text'
                  display={true}
                  tooltipTitle={
                    <>
                      <ul style={{ paddingLeft: '16px' }}>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_COLLECTION_AND_GERMINATION}</li>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEED_PURCHASE_AND_GERMINATION}</li>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_MANGROVE_PROPAGULES}</li>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_VEGETATIVE_PROPAGATION}</li>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_WILDLING_HARVEST}</li>
                        <li>{strings.PLANT_MATERIAL_SOURCING_METHOD_TOOLTIP_SEEDLING_PURCHASE}</li>
                      </ul>
                    </>
                  }
                />
              </GridItemWrapper>
              <GridItemWrapper props={{ xs: isMobile ? 12 : 8 }}>
                <TextField
                  id={'otherFacts'}
                  label={strings.OTHER_FACTS}
                  value={currentSpecies.otherFacts}
                  type='textarea'
                  display={true}
                />
              </GridItemWrapper>
            </Grid>

            <Grid
              container
              sx={{
                backgroundColor: theme.palette.TwClrBg,
                borderRadius: '0 0 32px 32px',
                padding: theme.spacing(3),
                margin: 0,
              }}
            >
              <Grid
                sx={{ borderTop: `1px solid ${theme.palette.TwClrBaseGray100}` }}
                container
                padding={theme.spacing(0, 0, 4, 0)}
              >
                <Grid
                  container
                  sx={{
                    backgroundColor: theme.palette.TwClrBg,
                    borderRadius: '32px',
                    paddingTop: theme.spacing(3),
                    margin: 0,
                  }}
                >
                  <Grid item xs={12} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <Typography fontSize={'20px'} fontWeight={600} lineHeight={'28px'}>
                      {strings.ADDITIONAL_SPECIES_DATA}
                    </Typography>
                  </Grid>

                  <Grid item xs={5} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.HEIGHT_AT_MATURITY}
                      id='heightAtMaturityValue'
                      type='text'
                      value={currentSpecies.heightAtMaturityValue}
                      display={true}
                    />
                  </Grid>
                  <Grid item xs={7} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.REFERENCE}
                      id='heightAtMaturitySource'
                      type='text'
                      value={currentSpecies.heightAtMaturitySource}
                      display={true}
                    />
                  </Grid>

                  <Grid item xs={5} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.DIAMETER_AT_BREAST_HEIGHT}
                      id='dbhValue'
                      type='text'
                      value={currentSpecies.dbhValue}
                      display={true}
                    />
                  </Grid>
                  <Grid item xs={7} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.REFERENCE}
                      id='dbhSource'
                      type='text'
                      value={currentSpecies.dbhSource}
                      display={true}
                    />
                  </Grid>

                  <Grid item xs={5} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.AVERAGE_WOOD_DENSITY}
                      id='averageWoodDensity'
                      type='text'
                      value={currentSpecies.averageWoodDensity}
                      display={true}
                    />
                  </Grid>
                  <Grid item xs={7} paddingBottom={theme.spacing(2)} minHeight={'64px'}>
                    <TextField
                      label={strings.WOOD_DENSITY_LEVEL}
                      id='woodDensityLevel'
                      type='text'
                      value={currentSpecies.woodDensityLevel}
                      display={true}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Page>
      )}
    </>
  );
}

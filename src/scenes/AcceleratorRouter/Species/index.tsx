import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DropdownItem } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import { Crumb } from 'src/components/BreadCrumbs';
import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import InternalComment from 'src/components/DeliverableView/InternalComment';
import Page from 'src/components/Page';
import PageSnackbar from 'src/components/PageSnackbar';
import Checkbox from 'src/components/common/Checkbox';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useParticipantProjectSpeciesData } from 'src/providers/ParticipantProject/ParticipantProjectSpeciesContext';
import { useLocalization, useOrganization, useProject } from 'src/providers/hooks';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesUpdateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ApproveDeliverableDialog from '../Deliverables/ApproveDeliverableDialog';
import RejectDialog from '../Deliverables/RejectDialog';
import RejectedBox from './RejectedBox';

const useStyles = makeStyles((theme: Theme) => ({
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
  },
  blockCheckbox: {
    display: 'block',
  },
}));

export default function SpeciesDetailView(): JSX.Element {
  const theme = useTheme();
  const classes = useStyles();
  const [species, setSpecies] = useState<Species>();
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const { currentParticipantProjectSpecies, currentDeliverable, reload } = useParticipantProjectSpeciesData();
  const [showApproveDialog, setShowApproveDialog] = useState<boolean>(false);
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const { projectId } = useProject();
  const { activeLocale } = useLocalization();
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectSpeciesUpdateRequest(requestId));

  useEffect(() => {
    if (result?.status === 'success') {
      reload();
    }
  }, [result]);

  const setStatus = useCallback(
    (status: DeliverableStatusType) => {
      if (currentParticipantProjectSpecies) {
        dispatch(
          requestUpdateParticipantProjectSpecies({
            participantProjectSpecies: {
              id: currentParticipantProjectSpecies.id || -1,
              speciesId: species?.id || -1,
              projectId: projectId,
              submissionStatus: status,
            },
          })
        );
      }
    },
    [currentParticipantProjectSpecies]
  );

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    const getSpecies = async () => {
      const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpecies(speciesResponse.species);
      } else {
        navigate(APP_PATHS.SPECIES);
      }
    };
    if (selectedOrganization) {
      getSpecies();
    }
  }, [speciesId, selectedOrganization, navigate]);

  const approveHandler = () => {
    if (currentParticipantProjectSpecies?.id) {
      const request = dispatch(
        requestUpdateParticipantProjectSpecies({
          participantProjectSpecies: {
            id: currentParticipantProjectSpecies?.id || -1,
            speciesId: species?.id || -1,
            projectId: projectId,
            submissionStatus: 'Approved',
          },
        })
      );
      setRequestId(request.requestId);
      setShowApproveDialog(false);
    }
  };

  const rejectHandler = (feedback: string) => {
    if (currentParticipantProjectSpecies?.id) {
      const request = dispatch(
        requestUpdateParticipantProjectSpecies({
          participantProjectSpecies: {
            id: currentParticipantProjectSpecies?.id || -1,
            speciesId: species?.id || -1,
            projectId: projectId,
            submissionStatus: 'Rejected',
            feedback: feedback,
          },
        })
      );
      setRequestId(request.requestId);
      setShowRejectDialog(false);
    }
  };

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      switch (optionItem.value) {
        case 'needs_translation': {
          setStatus('Needs Translation');
          break;
        }
        case 'not_needed': {
          setStatus('Not Needed');
          break;
        }
      }
    },
    [setStatus]
  );

  const optionItems = useMemo(
    (): DropdownItem[] =>
      activeLocale
        ? [
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NEEDS_TRANSLATION) as string,
              value: 'needs_translation',
              disabled: currentDeliverable?.status === 'Needs Translation',
            },
            {
              label: strings.formatString(strings.STATUS_WITH_STATUS, strings.NOT_NEEDED) as string,
              value: 'not_needed',
              disabled: currentDeliverable?.status === 'Not Needed',
            },
          ]
        : [],
    [activeLocale, currentDeliverable?.status]
  );

  const actions = useMemo(() => {
    return (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        <Button
          disabled={currentParticipantProjectSpecies?.submissionStatus === 'Rejected'}
          id='rejectDeliverable'
          label={strings.REJECT_ACTION}
          priority='secondary'
          onClick={() => void setShowRejectDialog(true)}
          size='medium'
          type='destructive'
        />
        <Button
          disabled={currentParticipantProjectSpecies?.submissionStatus === 'Approved'}
          id='approveDeliverable'
          label={strings.APPROVE}
          onClick={() => void setShowApproveDialog(true)}
          size='medium'
        />
        <OptionsMenu onOptionItemClick={onOptionItemClick} optionItems={optionItems} />
      </Box>
    );
  }, [currentParticipantProjectSpecies?.submissionStatus, onOptionItemClick, optionItems, theme]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.DELIVERABLES : '',
        to: APP_PATHS.ACCELERATOR_DELIVERABLES,
      },
      {
        name: currentDeliverable?.name || '',
        to: `/${currentDeliverable?.id}/submissions/${projectId}`,
      },
    ],
    [activeLocale]
  );

  return (
    <>
      {showApproveDialog && (
        <ApproveDeliverableDialog
          onClose={() => setShowApproveDialog(false)}
          onSubmit={approveHandler}
          deliverableType={currentDeliverable?.type || 'species'}
        />
      )}
      {showRejectDialog && <RejectDialog onClose={() => setShowRejectDialog(false)} onSubmit={rejectHandler} />}

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
                {species?.scientificName}
              </Typography>
            </Box>
          </Box>
        }
        rightComponent={actions}
        crumbs={crumbs}
      >
        {currentParticipantProjectSpecies?.submissionStatus === 'Rejected' && currentParticipantProjectSpecies && (
          <RejectedBox participantProjectSpecies={currentParticipantProjectSpecies} onSubmit={rejectHandler} />
        )}
        <Grid container padding={theme.spacing(0, 0, 4, 0)}>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Grid
            container
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: '32px',
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

                  {currentDeliverable && <InternalComment deliverable={currentDeliverable} />}
                </Box>
              </Box>
            )}
            <Grid item xs={12} paddingBottom={theme.spacing(2)}>
              <TextField
                label={strings.RATIONALE}
                id='rationale'
                type='text'
                value={currentParticipantProjectSpecies?.rationale}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                label={strings.SCIENTIFIC_NAME}
                id='scientificName'
                type='text'
                value={species?.scientificName}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                label={strings.COMMON_NAME}
                id='commonName'
                type='text'
                value={species?.commonName}
                tooltipTitle={strings.TOOLTIP_TIME_ZONE_NURSERY}
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField id={'family'} label={strings.FAMILY} value={species?.familyName} type='text' display={true} />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'conservationCategory'}
                label={strings.CONSERVATION_CATEGORY}
                value={species?.conservationCategory}
                type='text'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'growthForms'}
                label={strings.GROWTH_FORM}
                value={species?.growthForms?.join(', ')}
                type='text'
                aria-label='date-picker'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <Checkbox
                id='Rare'
                name='rare'
                label={strings.RARE}
                disabled={true}
                onChange={() => {
                  return;
                }}
                value={species?.rare}
                className={classes.blockCheckbox}
              />
            </Grid>
            {/* TODO this will eventually come from the participant project species, not the org species */}
            {/* <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
                <TextField
                  id={'nativeStatus'}
                  label={strings.NATIVE_NON_NATIVE}
                  value={species?.nativeStatus}
                  type='text'
                  display={true}
                  required
                />
              </Grid> */}
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'nativeEcosistem'}
                label={strings.NATIVE_ECOSYSTEM}
                value={species?.nativeEcosystem}
                type='text'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'successionalGroup'}
                label={strings.SUCCESSIONAL_GROUP}
                value={species?.successionalGroups?.join(', ')}
                type='text'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'ecosystemType'}
                label={strings.ECOSYSTEM_TYPE}
                value={species?.ecosystemTypes?.join(', ')}
                type='text'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'ecologicalRoleKnown'}
                label={strings.ECOLOGICAL_ROLE_KNOWN}
                value={species?.ecologicalRoleKnown}
                type='text'
                display={true}
                tooltipTitle={strings.ECOLOGICAL_ROLE_KNOWN_TOOLTIP}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'localUsesKnown'}
                label={strings.LOCAL_USES_KNOWN}
                value={species?.localUsesKnown}
                type='text'
                display={true}
                tooltipTitle={strings.LOCAL_USES_KNOWN_TOOLTIP}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'seedStorageBehavior'}
                label={strings.SEED_STORAGE_BEHAVIOR}
                value={species?.seedStorageBehavior}
                type='text'
                display={true}
              />
            </Grid>
            <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
              <TextField
                id={'plantMaterialSourcingMethod'}
                label={strings.PLANT_MATERIAL_SOURCING_METHOD}
                value={species?.plantMaterialSourcingMethods?.join(', ')}
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
            </Grid>
            <Grid item xs={isMobile ? 12 : 8}>
              <TextField
                id={'otherFacts'}
                label={strings.OTHER_FACTS}
                value={species?.otherFacts}
                type='textarea'
                display={true}
              />
            </Grid>
          </Grid>
        </Grid>
        {/* TODO:  Additional Species Data */}
      </Page>
    </>
  );
}

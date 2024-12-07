import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import ApplicationStatusCard from 'src/components/ProjectField/ApplicationStatusCard';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import GridEntryWrapper from 'src/components/ProjectField/GridEntryWrapper';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import ProjectFieldMeta from 'src/components/ProjectField/Meta';
import MinMaxCarbonTextfield from 'src/components/ProjectField/MinMaxCarbonTextfield';
import PhaseScoreCard from 'src/components/ProjectField/PhaseScoreCard';
import RegionDisplay from 'src/components/ProjectField/RegionDisplay';
import ProjectFieldTextAreaEdit from 'src/components/ProjectField/TextAreaEdit';
import ProjectFieldTextfield from 'src/components/ProjectField/Textfield';
import VotingDecisionCard from 'src/components/ProjectField/VotingDecisionCard';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import useListCohortModules from 'src/hooks/useListCohortModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useProjectScore from 'src/hooks/useProjectScore';
import { useLocalization, useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import { requestAssignTerraformationContact } from 'src/redux/features/accelerator/acceleratorAsyncThunks';
import { selectAssignTerraformationContact } from 'src/redux/features/accelerator/acceleratorSelectors';
import { requestListGlobalRolesUsers } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUsersSearchRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { requestListOrganizationUsers } from 'src/redux/features/organizationUser/organizationUsersAsyncThunks';
import { selectOrganizationUsers } from 'src/redux/features/organizationUser/organizationUsersSelectors';
import { requestUpdateParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { selectParticipantProjectUpdateRequest } from 'src/redux/features/participantProjects/participantProjectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import { useVotingData } from '../Voting/VotingContext';

const EditView = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { crumbs, participantProject, project, projectId, projectMeta, organization, reload } =
    useParticipantProjectData();
  const { projectScore } = useProjectScore(projectId);
  const { phaseVotes } = useVotingData();
  const { goToParticipantProject } = useNavigateTo();
  const { isAllowed } = useUser();
  const { getApplicationByProjectId } = useApplicationData();
  const { cohortModules, listCohortModules } = useListCohortModules();

  useEffect(() => {
    if (project && project.cohortId) {
      void listCohortModules(project.cohortId);
    }
  }, [project, listCohortModules]);

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');
  const isAllowedEditScoreAndVoting = isAllowed('UPDATE_PARTICIPANT_PROJECT_SCORING_VOTING');

  // Participant project (accelerator data) form record and update request
  const [participantProjectRequestId, setParticipantProjectRequestId] = useState<string>('');
  const participantProjectUpdateRequest = useAppSelector(
    selectParticipantProjectUpdateRequest(participantProjectRequestId)
  );
  const [participantProjectRecord, setParticipantProjectRecord, onChangeParticipantProject] =
    useForm(participantProject);

  const [organizationUsersRequestId, setOrganizationUsersRequestId] = useState<string>('');
  const [listUsersRequestId, setListUsersRequestId] = useState('');
  const listUsersRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listUsersRequestId));
  const [assignTfContactRequestId, setAssignTfContactRequestId] = useState('');
  const assignResponse = useAppSelector(selectAssignTerraformationContact(assignTfContactRequestId));
  const response = useAppSelector(selectOrganizationUsers(organizationUsersRequestId));
  const { activeLocale } = useLocalization();
  const [globalUsersOptions, setGlobalUsersOptions] = useState<DropdownItem[]>();
  const [tfContact, setTfContact] = useState<DropdownItem>();
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>();

  const redirectToProjectView = () => {
    reload();
    snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
    goToParticipantProject(projectId);
  };

  useEffect(() => {
    if (assignResponse?.status === 'success') {
      redirectToProjectView();
    } else if (assignResponse?.status === 'error') {
      snackbar.toastError();
      setAssignTfContactRequestId('');
    }
  }, [assignResponse, redirectToProjectView, snackbar]);

  useEffect(() => {
    const tfContactSelected = globalUsersOptions?.find(
      (userOpt) => userOpt.value === organization?.tfContactUser?.userId
    );
    setTfContact(tfContactSelected);
  }, [organization?.tfContactUser, globalUsersOptions]);

  useEffect(() => {
    const request = dispatch(requestListGlobalRolesUsers({ locale: activeLocale }));
    setListUsersRequestId(request.requestId);
  }, [activeLocale, dispatch]);

  useEffect(() => {
    if (listUsersRequest?.status === 'success') {
      const userOptions = listUsersRequest.data?.users.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
      setGlobalUsersOptions(userOptions);
    }
  }, [listUsersRequest]);

  const projectApplication = useMemo(
    () => getApplicationByProjectId(projectId),
    [getApplicationByProjectId, projectId]
  );

  const onChangeCountry = useCallback(
    (countryCode?: string, region?: string) => {
      onChangeParticipantProject('countryCode', countryCode);
      onChangeParticipantProject('region', region);
    },
    [onChangeParticipantProject]
  );

  const saveParticipantProject = useCallback(() => {
    if (participantProjectRecord) {
      const dispatched = dispatch(requestUpdateParticipantProject(participantProjectRecord));
      setParticipantProjectRequestId(dispatched.requestId);
    }
  }, [participantProjectRecord, dispatch]);

  const saveTFContact = () => {
    if (organization && tfContact) {
      const assignRequest = dispatch(
        requestAssignTerraformationContact({
          organizationId: organization.id,
          terraformationContactId: tfContact?.value,
        })
      );
      setAssignTfContactRequestId(assignRequest.requestId);
    }
  };

  const handleOnCancel = useCallback(() => goToParticipantProject(projectId), [goToParticipantProject, projectId]);

  useEffect(() => {
    if (response?.status === 'success') {
      setOrganizationUsers(response.data?.users);
    }
  }, [response]);

  useEffect(() => {
    if (!participantProjectUpdateRequest) {
      return;
    }

    if (participantProjectUpdateRequest.status === 'error') {
      snackbar.toastError();
    } else if (participantProjectUpdateRequest.status === 'success') {
      if (tfContact) {
        saveTFContact();
      } else {
        redirectToProjectView();
      }
    }
  }, [participantProjectUpdateRequest, snackbar]);

  useEffect(() => {
    if (participantProject) {
      setParticipantProjectRecord(participantProject);
    }
  }, [participantProject, setParticipantProjectRecord]);

  useEffect(() => {
    if (!isAllowedEdit) {
      goToParticipantProject(projectId);
    }
  }, [goToParticipantProject, isAllowedEdit, projectId]);

  useEffect(() => {
    if (organization?.id) {
      const request = dispatch(requestListOrganizationUsers({ organizationId: organization.id }));
      setOrganizationUsersRequestId(request.requestId);
    }
  }, [organization]);

  const globalUsersWithNoOwner = useMemo(() => {
    const ownerId = organizationUsers?.find((orgUsr) => orgUsr.role === 'Owner')?.id;
    return globalUsersOptions?.filter((opt) => opt.value.toString() !== ownerId?.toString()) || [];
  }, [organizationUsers, globalUsersOptions]);

  return (
    <PageWithModuleTimeline
      title={participantProject?.dealName}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      cohortPhase={project?.cohortPhase}
      modules={cohortModules ?? []}
    >
      <PageForm
        busy={participantProjectUpdateRequest?.status === 'pending'}
        cancelID='cancelNewParticipantProject'
        onCancel={handleOnCancel}
        onSave={saveParticipantProject}
        saveID='createNewParticipantProject'
      >
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            marginBottom: theme.spacing(3),
            padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <ProjectFieldTextfield
                height='auto'
                id={'dealName'}
                md={12}
                label={strings.DEAL_NAME}
                onChange={onChangeParticipantProject}
                value={participantProjectRecord?.dealName}
              />
            </Grid>
            {projectApplication && (
              <ApplicationStatusCard
                application={projectApplication}
                md={!isAllowedEditScoreAndVoting ? 12 : undefined}
              />
            )}
            {isAllowedEditScoreAndVoting && (
              <>
                <PhaseScoreCard md={!projectApplication?.id ? 6 : undefined} score={projectScore} />
                <VotingDecisionCard md={!projectApplication?.id ? 6 : undefined} phaseVotes={phaseVotes} />
              </>
            )}
            <ProjectFieldTextfield
              id={'fileNaming'}
              label={strings.FILE_NAMING}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.fileNaming}
            />
            <GridEntryWrapper>
              <Box paddingX={theme.spacing(2)}>
                <Dropdown
                  id='projectLead'
                  placeholder={strings.SELECT}
                  selectedValue={tfContact?.value}
                  options={globalUsersWithNoOwner}
                  onChange={(value: string) => {
                    setTfContact(
                      globalUsersOptions?.find((globalUser) => globalUser.value.toString() === value.toString())
                    );
                  }}
                  hideClearIcon={true}
                  label={strings.PROJECT_LEAD}
                  fullWidth
                />
              </Box>
            </GridEntryWrapper>
            <CountrySelect
              id={'countryCode'}
              label={strings.COUNTRY}
              onChange={onChangeCountry}
              region={participantProjectRecord?.region}
              value={participantProjectRecord?.countryCode}
            />
            <RegionDisplay label={strings.REGION} value={participantProjectRecord?.region} />
            <LandUseMultiSelect
              id={'landUseModelTypes'}
              label={strings.LAND_USE_MODEL_TYPE}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.landUseModelTypes}
            />
            <ProjectFieldTextfield
              id={'numNativeSpecies'}
              label={strings.NUMBER_OF_NATIVE_SPECIES}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.numNativeSpecies}
            />
            <ProjectFieldTextfield
              id={'applicationReforestableLand'}
              label={strings.APPLICATION_RESTORABLE_LAND}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.applicationReforestableLand}
            />
            <ProjectFieldTextfield
              id={'confirmedReforestableLand'}
              label={strings.CONFIRMED_RESTORABLE_LAND}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.confirmedReforestableLand}
            />
            <ProjectFieldTextfield
              id={'totalExpansionPotential'}
              label={strings.TOTAL_EXPANSION_POTENTIAL}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.totalExpansionPotential}
            />
            <ProjectFieldTextfield
              id={'perHectareBudget'}
              label={strings.PER_HECTARE_ESTIMATED_BUDGET}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.perHectareBudget}
            />
            <ProjectFieldTextfield
              id={'hubSpotUrl'}
              label={strings.HUBSPOT_LINK}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.hubSpotUrl}
            />
            <ProjectFieldMeta
              date={project?.createdTime}
              dateLabel={strings.CREATED_ON}
              userId={project?.createdBy}
              userName={projectMeta?.createdByUserName}
              userLabel={strings.BY}
            />
            <ProjectFieldMeta
              date={project?.modifiedTime}
              dateLabel={strings.LAST_MODIFIED_ON}
              userId={project?.modifiedBy}
              userName={projectMeta?.modifiedByUserName}
              userLabel={strings.BY}
            />
          </Grid>
          <Grid container>
            <Grid item xs={12} margin={`0 ${theme.spacing(2)}`}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.CARBON}
              </Typography>
            </Grid>
            <MinMaxCarbonTextfield
              label={strings.MIN_MAX_CARBON_ACCUMULATION}
              onChange={onChangeParticipantProject}
              valueMax={participantProjectRecord?.maxCarbonAccumulation}
              valueMin={participantProjectRecord?.minCarbonAccumulation}
            />
            <ProjectFieldTextfield
              id={'carbonCapacity'}
              label={strings.CARBON_CAPACITY_TC02_HA}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProject?.carbonCapacity}
            />
            <ProjectFieldTextfield
              id={'annualCarbon'}
              label={strings.ANNUAL_CARBON_T}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProject?.annualCarbon}
            />
            <ProjectFieldTextfield
              id={'totalCarbon'}
              label={strings.TOTAL_CARBON_T}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProject?.totalCarbon}
            />
          </Grid>
        </Card>
        <Card
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            marginBottom: theme.spacing(3),
            padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
          }}
        >
          <Grid container>
            <ProjectFieldTextAreaEdit
              id={'dealDescription'}
              label={strings.DEAL_DESCRIPTION}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.dealDescription}
            />
            <ProjectFieldTextAreaEdit
              id={'investmentThesis'}
              label={strings.INVESTMENT_THESIS}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.investmentThesis}
            />
            <ProjectFieldTextAreaEdit
              id={'failureRisk'}
              label={strings.FAILURE_RISK}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.failureRisk}
            />
            <ProjectFieldTextAreaEdit
              id={'whatNeedsToBeTrue'}
              label={strings.WHAT_NEEDS_TO_BE_TRUE}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.whatNeedsToBeTrue}
            />
          </Grid>
        </Card>
      </PageForm>
    </PageWithModuleTimeline>
  );
};
export default EditView;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import PhotoChooser, { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import ApplicationStatusCard from 'src/components/ProjectField/ApplicationStatusCard';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import GridEntryWrapper from 'src/components/ProjectField/GridEntryWrapper';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import ProjectFieldMeta from 'src/components/ProjectField/Meta';
import MinMaxCarbonTextfield from 'src/components/ProjectField/MinMaxCarbonTextfield';
import PhaseScoreCard from 'src/components/ProjectField/PhaseScoreCard';
import ProjectProfileImage from 'src/components/ProjectField/ProjectProfileImage';
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
import { selectUploadImageValue } from 'src/redux/features/documentProducer/values/valuesSelector';
import {
  requestListSpecificVariablesValues,
  requestUploadManyImageValues,
} from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectSpecificVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListSpecificVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
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

const HighlightPhotoStableId = '551';
const ZoneFigureStableId = '525';
const photoVariableStableIds = [HighlightPhotoStableId, ZoneFigureStableId];

const ProjectProfileEdit = () => {
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

  const [requestsInProgress, setRequestsInProgress] = useState(false);
  const [initiatedRequests, setInitiatedRequests] = useState({
    participantProject: false,
    assignTfContact: false,
    uploadImages: false,
  });

  // Participant project (accelerator data) form record and update request
  const [participantProjectRequestId, setParticipantProjectRequestId] = useState<string>('');
  const participantProjectUpdateResponse = useAppSelector(
    selectParticipantProjectUpdateRequest(participantProjectRequestId)
  );
  const [participantProjectRecord, setParticipantProjectRecord, onChangeParticipantProject] =
    useForm(participantProject);

  const [organizationUsersRequestId, setOrganizationUsersRequestId] = useState<string>('');
  const [listUsersRequestId, setListUsersRequestId] = useState('');
  const listUsersRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listUsersRequestId));
  const [assignTfContactRequestId, setAssignTfContactRequestId] = useState('');
  const [uploadImagesRequestId, setUploadImagesRequestId] = useState('');
  const uploadImagesResponse = useAppSelector(selectUploadImageValue(uploadImagesRequestId));
  const assignContactResponse = useAppSelector(selectAssignTerraformationContact(assignTfContactRequestId));
  const response = useAppSelector(selectOrganizationUsers(organizationUsersRequestId));

  const photoValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, photoVariableStableIds, projectId)
  );
  const [photoVariableIds, setPhotoVariableIds] = useState<Record<string, number>>();
  const { activeLocale } = useLocalization();
  const [globalUsersOptions, setGlobalUsersOptions] = useState<DropdownItem[]>();
  const [tfContact, setTfContact] = useState<DropdownItem>();
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>();
  const [mainPhoto, setMainPhoto] = useState<PhotoWithAttributes>();
  const [mapPhoto, setMapPhoto] = useState<PhotoWithAttributes>();

  const redirectToProjectView = useCallback(() => {
    reload();
    snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
    goToParticipantProject(projectId);
  }, [reload, snackbar, goToParticipantProject, projectId]);

  useEffect(() => {
    if (photoValues.length > 0) {
      setPhotoVariableIds(
        photoValues.reduce<Record<string, number>>((map, variableWithValues) => {
          map[variableWithValues.stableId] = variableWithValues.id;
          return map;
        }, {})
      );
    }
  }, [photoValues]);

  useEffect(() => {
    if (!requestsInProgress) return;

    const isComplete = (status: string | undefined, wasInitiated: boolean) =>
      !wasInitiated || status === 'success' || status === 'error';

    if (
      isComplete(participantProjectUpdateResponse?.status, initiatedRequests.participantProject) &&
      isComplete(assignContactResponse?.status, initiatedRequests.assignTfContact) &&
      isComplete(uploadImagesResponse?.status, initiatedRequests.uploadImages)
    ) {
      setRequestsInProgress(false);

      if (
        [participantProjectUpdateResponse, assignContactResponse, uploadImagesResponse].some(
          (resp) => resp?.status === 'error'
        )
      ) {
        snackbar.toastError();
        setAssignTfContactRequestId('');
        setUploadImagesRequestId('');
        setParticipantProjectRequestId('');
      } else {
        redirectToProjectView();
      }
    }
  }, [
    participantProjectUpdateResponse,
    assignContactResponse,
    uploadImagesResponse,
    requestsInProgress,
    initiatedRequests,
  ]);

  useEffect(() => {
    if (assignContactResponse?.status === 'success') {
      // redirectToProjectView();
    } else if (assignContactResponse?.status === 'error') {
      snackbar.toastError();
      setAssignTfContactRequestId('');
    }
  }, [assignContactResponse, snackbar]);

  useEffect(() => {
    if (uploadImagesResponse?.status === 'success') {
      redirectToProjectView();
    } else if (uploadImagesResponse?.status === 'error') {
      snackbar.toastError();
      setUploadImagesRequestId('');
    }
  }, [uploadImagesResponse]);

  useEffect(() => {
    const tfContactSelected = globalUsersOptions?.find(
      (userOpt) => userOpt.value === organization?.tfContactUser?.userId
    );
    setTfContact(tfContactSelected);
  }, [organization?.tfContactUser, globalUsersOptions]);

  useEffect(() => {
    const listUsersRequest = dispatch(requestListGlobalRolesUsers({ locale: activeLocale }));
    void dispatch(requestListSpecificVariables(photoVariableStableIds));
    void dispatch(
      requestListSpecificVariablesValues({
        projectId: projectId,
        variablesStableIds: photoVariableStableIds,
      })
    );
    setListUsersRequestId(listUsersRequest.requestId);
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

  const handleSave = useCallback(() => {
    if (!photoVariableIds) {
      console.warn("Photo Variable Ids not yet retrieved; can't save yet");
      return;
    }
    setRequestsInProgress(true);

    const newInitiatedRequests = {
      participantProject: false,
      assignTfContact: false,
      uploadImages: false,
    };

    if (participantProjectRecord) {
      const dispatched = dispatch(requestUpdateParticipantProject(participantProjectRecord));
      setParticipantProjectRequestId(dispatched.requestId);
      newInitiatedRequests.participantProject = true;
    }
    if (tfContact) {
      saveTFContact();
      newInitiatedRequests.assignTfContact = true;
    }
    if ((mainPhoto || mapPhoto) && photoVariableIds) {
      const imageValues = [];
      if (mainPhoto) {
        imageValues.push({
          variableId: photoVariableIds[HighlightPhotoStableId],
          file: mainPhoto.file,
          caption: '',
          citation: '',
          projectId,
        });
      }
      if (mapPhoto) {
        imageValues.push({
          variableId: photoVariableIds[ZoneFigureStableId],
          file: mapPhoto.file,
          caption: '',
          citation: '',
          projectId,
        });
      }
      const dispatched = dispatch(requestUploadManyImageValues(imageValues));
      setUploadImagesRequestId(dispatched.requestId);
      newInitiatedRequests.uploadImages = true;
    }

    // No requests were initiated
    if (!Object.values(newInitiatedRequests).some(Boolean)) {
      setRequestsInProgress(false);
      redirectToProjectView();
    }

    setInitiatedRequests(newInitiatedRequests);
  }, [participantProjectRecord, dispatch, projectId, mainPhoto, mapPhoto, photoVariableIds]);

  const saveTFContact = useCallback(() => {
    if (project?.organizationId && tfContact) {
      const assignRequest = dispatch(
        requestAssignTerraformationContact({
          organizationId: project?.organizationId,
          terraformationContactId: tfContact?.value,
        })
      );
      setAssignTfContactRequestId(assignRequest.requestId);
      return true;
    }
    return false;
  }, [tfContact, dispatch, project?.organizationId]);

  const handleOnCancel = useCallback(() => goToParticipantProject(projectId), [goToParticipantProject, projectId]);

  useEffect(() => {
    if (response?.status === 'success') {
      setOrganizationUsers(response.data?.users);
    }
  }, [response]);

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
        busy={[
          participantProjectUpdateResponse?.status,
          assignContactResponse?.status,
          uploadImagesResponse?.status,
        ].includes('pending')}
        cancelID='cancelNewParticipantProject'
        onCancel={handleOnCancel}
        onSave={handleSave}
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
            <GridEntryWrapper height={'100px'}>
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
                  autocomplete
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
        <Grid container>
          <Grid item md={6}>
            <PhotoChooser
              title={'Main Photo'}
              onPhotosChanged={(value) => setMainPhoto(value[0])}
              uploadText={strings.UPLOAD_PHOTO}
              uploadDescription={strings.UPLOAD_PHOTO_DESCRIPTION}
              chooseFileText={strings.CHOOSE_FILE}
              replaceFileText={strings.REPLACE_FILE}
              includeCaption={false}
              includeCitation={false}
              multipleSelection={false}
            />
          </Grid>
          {participantProject?.projectHighlightPhotoValueId && (
            <ProjectProfileImage
              projectId={projectId}
              imageValueId={participantProject.projectHighlightPhotoValueId}
              alt={strings.PROJECT_HIGHLIGHT_IMAGE}
            />
          )}
        </Grid>
        <Grid container>
          <Grid item md={6}>
            <PhotoChooser
              title={'Map Photo'}
              onPhotosChanged={(value) => setMapPhoto(value[0])}
              uploadText={strings.UPLOAD_PHOTO}
              uploadDescription={strings.UPLOAD_PHOTO_DESCRIPTION}
              chooseFileText={strings.CHOOSE_FILE}
              replaceFileText={strings.REPLACE_FILE}
              includeCaption={false}
              includeCitation={false}
              multipleSelection={false}
            />
          </Grid>
          {participantProject?.projectZoneFigureValueId && (
            <ProjectProfileImage
              projectId={projectId}
              imageValueId={participantProject.projectZoneFigureValueId}
              alt={strings.PROJECT_ZONE_FIGURE}
            />
          )}
        </Grid>
      </PageForm>
    </PageWithModuleTimeline>
  );
};
export default ProjectProfileEdit;

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import PhotoChooser, { PhotoWithAttributes } from 'src/components/DocumentProducer/EditImagesModal/PhotoSelector';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import GridEntryWrapper from 'src/components/ProjectField/GridEntryWrapper';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import MinMaxCarbonTextfield from 'src/components/ProjectField/MinMaxCarbonTextfield';
import ProjectProfileImage from 'src/components/ProjectField/ProjectProfileImage';
import ProjectFieldTextAreaEdit from 'src/components/ProjectField/TextAreaEdit';
import ProjectFieldTextfield from 'src/components/ProjectField/Textfield';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
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
import { LAND_USE_MODEL_TYPES } from 'src/types/ParticipantProject';
import { OrganizationUser } from 'src/types/User';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';

const HighlightPhotoStableId = '551';
const ZoneFigureStableId = '525';
const photoVariableStableIds = [HighlightPhotoStableId, ZoneFigureStableId];

const ProjectProfileEdit = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { participantProject, project, projectId, organization, reload } = useParticipantProjectData();
  const { goToParticipantProject } = useNavigateTo();
  const { isAllowed } = useUser();

  // Participant project (accelerator data) form record and update request
  const [participantProjectRequestId, setParticipantProjectRequestId] = useState<string>('');
  const participantProjectUpdateResponse = useAppSelector(
    selectParticipantProjectUpdateRequest(participantProjectRequestId)
  );
  const [participantProjectRecord, setParticipantProjectRecord, onChangeParticipantProject] =
    useForm(participantProject);

  const [requestsInProgress, setRequestsInProgress] = useState(false);
  const [initiatedRequests, setInitiatedRequests] = useState({
    participantProject: false,
    assignTfContact: false,
    uploadImages: false,
  });

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

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');

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
    if (!requestsInProgress) {
      return;
    }

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
    const request = dispatch(requestListGlobalRolesUsers({ locale: activeLocale }));
    void dispatch(requestListSpecificVariables(photoVariableStableIds));
    void dispatch(
      requestListSpecificVariablesValues({
        projectId,
        variablesStableIds: photoVariableStableIds,
      })
    );
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

  const onChangeCountry = useCallback(
    (countryCode?: string, region?: string) => {
      onChangeParticipantProject('countryCode', countryCode);
      onChangeParticipantProject('region', region);
    },
    [onChangeParticipantProject]
  );

  const saveTFContact = useCallback(() => {
    if (project?.organizationId && tfContact) {
      const assignRequest = dispatch(
        requestAssignTerraformationContact({
          organizationId: project?.organizationId,
          terraformationContactId: tfContact?.value as number,
        })
      );
      setAssignTfContactRequestId(assignRequest.requestId);
      return true;
    }
    return false;
  }, [tfContact, dispatch, project?.organizationId]);

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
  }, [participantProjectRecord, dispatch, projectId, mainPhoto, mapPhoto, photoVariableIds, saveTFContact]);

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

  const onChangeLandUseHectares = (type: string, hectares: string) => {
    const updated = { ...participantProjectRecord?.landUseModelHectares, [type]: Number(hectares) };
    onChangeParticipantProject('landUseModelHectares', updated);
  };

  const onChangeLandUseTypes = (_: string, types: string[]) => {
    const typesToRemove = Object.keys(participantProjectRecord?.landUseModelHectares || {}).filter(
      (type) => !types.includes(type)
    );
    const updatedModelHectares = { ...(participantProjectRecord?.landUseModelHectares || {}) };
    typesToRemove.forEach((type) => {
      delete updatedModelHectares[type];
    });
    onChangeParticipantProject('landUseModelHectares', updatedModelHectares);
    onChangeParticipantProject('landUseModelTypes', types);
  };

  const globalUsersWithNoOwner = useMemo(() => {
    const ownerId = organizationUsers?.find((orgUsr) => orgUsr.role === 'Owner')?.id;
    return globalUsersOptions?.filter((opt) => opt.value.toString() !== ownerId?.toString()) || [];
  }, [organizationUsers, globalUsersOptions]);

  const sortedSelectedModelTypes = useMemo(() => {
    return LAND_USE_MODEL_TYPES.filter((type) => participantProjectRecord?.landUseModelTypes?.includes(type));
  }, [participantProjectRecord?.landUseModelTypes]);

  const isPhaseZeroOrApplication = useMemo(
    () => [undefined, 'Phase 0 - Due Diligence', 'Application', 'Pre-Screen'].includes(participantProject?.cohortPhase),
    [participantProject?.cohortPhase]
  );

  const isPhaseOne = useMemo(
    () => participantProject?.cohortPhase === 'Phase 1 - Feasibility Study',
    [participantProject?.cohortPhase]
  );

  const isPhaseTwoPlus = useMemo(
    () =>
      participantProject?.cohortPhase &&
      ['Phase 2 - Plan and Scale', 'Phase 3 - Implement and Monitor'].includes(participantProject.cohortPhase),
    [participantProject?.cohortPhase]
  );

  return (
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
      <Box margin={theme.spacing(2, 3)}>
        <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
          {participantProject?.dealName}
        </Typography>
      </Box>
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: theme.spacing(3),
          marginRight: theme.spacing(3),
          padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        }}
      >
        <Grid container>
          <Grid item xs={6}>
            <ProjectFieldTextfield
              height='auto'
              id={'dealName'}
              md={12}
              label={strings.DEAL_NAME}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.dealName}
            />
          </Grid>
          <GridEntryWrapper md={6}>
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
          <ProjectFieldTextAreaEdit
            id={'dealDescription'}
            height={'180'}
            label={strings.PROJECT_OVERVIEW}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.dealDescription}
          />
          <Grid item md={6} display={'flex'} flexDirection={'column'}>
            <Box width={'100%'}>
              <CountrySelect
                id={'countryCode'}
                md={12}
                label={strings.COUNTRY}
                onChange={onChangeCountry}
                region={participantProjectRecord?.region}
                value={participantProjectRecord?.countryCode}
              />
              {isPhaseZeroOrApplication && (
                <ProjectFieldTextfield
                  id={'applicationReforestableLand'}
                  md={12}
                  label={strings.ELIGIBLE_AREA_HA}
                  onChange={onChangeParticipantProject}
                  type={'number'}
                  value={participantProjectRecord?.applicationReforestableLand}
                />
              )}
              {isPhaseOne && (
                <ProjectFieldTextfield
                  id={'minProjectArea'}
                  md={12}
                  label={strings.MIN_PROJECT_AREA_HA}
                  onChange={onChangeParticipantProject}
                  type={'number'}
                  value={participantProjectRecord?.minProjectArea}
                />
              )}
              {isPhaseTwoPlus && (
                <ProjectFieldTextfield
                  id={'projectArea'}
                  md={12}
                  label={strings.PROJECT_AREA_HA}
                  onChange={onChangeParticipantProject}
                  type={'number'}
                  value={participantProjectRecord?.projectArea}
                />
              )}
            </Box>
          </Grid>
          <Grid item md={12}>
            <LandUseMultiSelect
              id={'landUseModelTypes'}
              md={6}
              label={strings.LAND_USE_MODEL_TYPE}
              onChange={onChangeLandUseTypes}
              value={sortedSelectedModelTypes}
            />
          </Grid>
          {sortedSelectedModelTypes?.map((landUseModelType) => (
            <ProjectFieldTextfield
              id={landUseModelType}
              key={landUseModelType}
              md={4}
              label={strings.formatString(strings.X_HECTARES_HA, landUseModelType) as string}
              onChange={onChangeLandUseHectares}
              type={'number'}
              value={participantProjectRecord?.landUseModelHectares?.[landUseModelType]}
            />
          ))}

          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} marginTop={theme.spacing(2)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.LAND_DATA}
              </Typography>
            </Grid>
          </Box>

          {/* TODO add tooltip to these */}
          <ProjectFieldTextfield
            id={'projectArea'}
            md={12}
            label={strings.ELIGIBLE_AREA_HA}
            onChange={onChangeParticipantProject}
            type={'number'}
            value={participantProjectRecord?.applicationReforestableLand}
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

          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} marginTop={theme.spacing(2)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.CARBON}
              </Typography>
            </Grid>
          </Box>
          <MinMaxCarbonTextfield
            label={strings.MIN_MAX_CARBON_ACCUMULATION_UNITS}
            onChange={onChangeParticipantProject}
            valueMax={participantProjectRecord?.maxCarbonAccumulation}
            valueMin={participantProjectRecord?.minCarbonAccumulation}
          />

          <ProjectFieldTextfield
            id={'perHectareBudget'}
            label={strings.PER_HECTARE_ESTIMATED_BUDGET}
            onChange={onChangeParticipantProject}
            type={'number'}
            value={participantProjectRecord?.perHectareBudget}
          />

          <Box marginX={theme.spacing(2)} width={'100%'}>
            <Grid item xs={12} marginTop={theme.spacing(2)}>
              <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                {strings.PROJECT_LINKS}
              </Typography>
            </Grid>
          </Box>

          <ProjectFieldTextfield
            id={'googleFolderUrl'}
            md={4}
            label={strings.GDRIVE_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.googleFolderUrl}
          />
          <ProjectFieldTextfield
            id={'verraLink'}
            md={4}
            label={strings.VERRA_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.verraLink}
          />
          <ProjectFieldTextfield
            id={'clickUpLink'}
            md={4}
            label={strings.CLICK_UP_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.clickUpLink}
          />
          <ProjectFieldTextfield
            id={'hubSpotUrl'}
            md={4}
            label={strings.HUBSPOT_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.hubSpotUrl}
          />
          <ProjectFieldTextfield
            id={'riskTrackerLink'}
            md={4}
            label={strings.RISK_TRACKER_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.riskTrackerLink}
          />
          <ProjectFieldTextfield
            id={'slackLink'}
            md={4}
            label={strings.SLACK_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.slackLink}
          />
          <ProjectFieldTextfield
            id={'gisReportsLink'}
            md={4}
            label={strings.GIS_REPORT_LINK}
            onChange={onChangeParticipantProject}
            value={participantProjectRecord?.gisReportsLink}
          />
        </Grid>
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
      </Card>
    </PageForm>
  );
};
export default ProjectProfileEdit;

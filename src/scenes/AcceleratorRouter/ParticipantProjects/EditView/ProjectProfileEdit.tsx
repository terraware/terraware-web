import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import PhotoSelectorWithPreview, { FileWithUrl } from 'src/components/Photo/PhotoSelectorWithPreview';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import GridEntryWrapper from 'src/components/ProjectField/GridEntryWrapper';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import MinMaxCarbonTextfield from 'src/components/ProjectField/MinMaxCarbonTextfield';
import ProjectFieldMultiSelect from 'src/components/ProjectField/MultiSelect';
import SdgMultiSelect from 'src/components/ProjectField/SdgMultiSelect';
import ProjectFieldTextAreaEdit from 'src/components/ProjectField/TextAreaEdit';
import ProjectFieldTextfield from 'src/components/ProjectField/Textfield';
import VariableSelect from 'src/components/ProjectField/VariableSelect';
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
import { LAND_USE_MODEL_TYPES, ParticipantProject } from 'src/types/ParticipantProject';
import { OrganizationUser } from 'src/types/User';
import { SelectVariable, VariableWithValues } from 'src/types/documentProducer/Variable';
import { getImagePath } from 'src/utils/images';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';

const HighlightPhotoStableId = '551';
const ZoneFigureStableId = '525';
const standardStableId = '350';
const methodologyNumberStableId = '351';
const carbonCertificationsStableId = '552';
const variableStableIds = [
  HighlightPhotoStableId,
  ZoneFigureStableId,
  standardStableId,
  methodologyNumberStableId,
  carbonCertificationsStableId,
];

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

  const variableValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, variableStableIds, projectId)
  );
  const [stableToVariable, setStableToVariable] = useState<Record<string, VariableWithValues>>();
  const { activeLocale } = useLocalization();
  const [globalUsersOptions, setGlobalUsersOptions] = useState<DropdownItem[]>();
  const [tfContact, setTfContact] = useState<DropdownItem>();
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>();
  const [mainPhoto, setMainPhoto] = useState<FileWithUrl>();
  const [mapPhoto, setMapPhoto] = useState<FileWithUrl>();

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');

  const redirectToProjectView = useCallback(() => {
    reload();
    snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
    goToParticipantProject(projectId);
  }, [reload, snackbar, goToParticipantProject, projectId]);

  useEffect(() => {
    if (variableValues.length > 0) {
      setStableToVariable(
        variableValues.reduce<Record<string, VariableWithValues>>((map, variableWithValues) => {
          map[variableWithValues.stableId] = variableWithValues;
          return map;
        }, {})
      );
    }
  }, [variableValues]);

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
    void dispatch(requestListSpecificVariables(variableStableIds));
    void dispatch(
      requestListSpecificVariablesValues({
        projectId,
        variablesStableIds: variableStableIds,
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
    if (!stableToVariable) {
      snackbar.toastError("Can't save until page is fully loaded.");
      return;
    }
    setRequestsInProgress(true);

    const newInitiatedRequests = {
      participantProject: false,
      assignTfContact: false,
      uploadImages: false,
    };

    const updatedRecord = { ...participantProjectRecord } as ParticipantProject;
    const typesToRemove = Object.keys(participantProjectRecord?.landUseModelHectares || {}).filter(
      (type) => !(updatedRecord.landUseModelTypes as string[]).includes(type)
    );
    const updatedModelHectares = { ...(participantProjectRecord?.landUseModelHectares || {}) };
    typesToRemove.forEach((type) => {
      delete updatedModelHectares[type];
    });
    updatedRecord.landUseModelHectares = updatedModelHectares;

    if (participantProjectRecord) {
      const dispatched = dispatch(requestUpdateParticipantProject(updatedRecord));
      setParticipantProjectRequestId(dispatched.requestId);
      newInitiatedRequests.participantProject = true;
    }
    if (tfContact) {
      saveTFContact();
      newInitiatedRequests.assignTfContact = true;
    }
    if ((mainPhoto || mapPhoto) && stableToVariable) {
      const imageValues = [];
      if (mainPhoto) {
        imageValues.push({
          variableId: stableToVariable[HighlightPhotoStableId].id,
          file: mainPhoto.file,
          caption: '',
          citation: '',
          projectId,
        });
      }
      if (mapPhoto) {
        imageValues.push({
          variableId: stableToVariable[ZoneFigureStableId].id,
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
  }, [participantProjectRecord, dispatch, projectId, mainPhoto, mapPhoto, stableToVariable, saveTFContact]);

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
    if (hectares === '') {
      delete updated[type];
    }
    onChangeParticipantProject('landUseModelHectares', updated);
  };

  const onChangeSdgList = (id: string, newList: string[]) => {
    onChangeParticipantProject(
      id,
      newList.map((item) => Number(item))
    );
  };

  const globalUsersWithNoOwner = useMemo(() => {
    const ownerId = organizationUsers?.find((orgUsr) => orgUsr.role === 'Owner')?.id;
    return globalUsersOptions?.filter((opt) => opt.value.toString() !== ownerId?.toString()) || [];
  }, [organizationUsers, globalUsersOptions]);

  const sortedSelectedModelTypes = useMemo(() => {
    return LAND_USE_MODEL_TYPES.filter((type) => participantProjectRecord?.landUseModelTypes?.includes(type));
  }, [participantProjectRecord?.landUseModelTypes]);

  return (
    <Grid container paddingRight={theme.spacing(3)}>
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
              </Box>
            </Grid>
            <Grid item md={12}>
              <LandUseMultiSelect
                id={'landUseModelTypes'}
                md={6}
                label={strings.LAND_USE_MODEL_TYPE}
                onChange={onChangeParticipantProject}
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

            <ProjectFieldTextfield
              id={'confirmedReforestableLand'}
              md={4}
              label={strings.ELIGIBLE_AREA_HA}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.confirmedReforestableLand}
              tooltip={strings.ELIGIBLE_AREA_DESCRIPTION}
            />
            <ProjectFieldTextfield
              id={'projectArea'}
              md={4}
              label={strings.PROJECT_AREA_HA}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.projectArea}
              tooltip={strings.PROJECT_AREA_DESCRIPTION}
            />
            <ProjectFieldTextfield
              id={'numNativeSpecies'}
              md={4}
              label={strings.NUMBER_OF_NATIVE_SPECIES}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.numNativeSpecies}
            />
            <ProjectFieldTextfield
              id={'minProjectArea'}
              md={4}
              label={strings.MIN_PROJECT_AREA_HA}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.minProjectArea}
              tooltip={strings.MIN_PROJECT_AREA_DESCRIPTION}
            />
            <ProjectFieldTextfield
              id={'totalExpansionPotential'}
              md={4}
              label={strings.EXPANSION_POTENTIAL_HA}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.totalExpansionPotential}
              tooltip={strings.EXPANSION_POTENTIAL_DESCRIPTION}
            />

            <Box marginX={theme.spacing(2)} width={'100%'}>
              <Grid item xs={12} marginTop={theme.spacing(2)}>
                <Typography fontSize='20px' fontWeight={600} lineHeight='28px'>
                  {strings.CARBON}
                </Typography>
              </Grid>
            </Box>
            <MinMaxCarbonTextfield
              md={4}
              label={strings.MIN_MAX_CARBON_ACCUMULATION_UNITS}
              onChange={onChangeParticipantProject}
              valueMax={participantProjectRecord?.maxCarbonAccumulation}
              valueMin={participantProjectRecord?.minCarbonAccumulation}
            />
            <ProjectFieldTextfield
              id={'totalVCU'}
              md={4}
              label={strings.TOTAL_VCU_T_40YRS}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.totalVCU}
            />
            <ProjectFieldTextfield
              id={'perHectareBudget'}
              md={4}
              label={strings.PER_HECTARE_ESTIMATED_BUDGET}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.perHectareBudget}
            />
            <ProjectFieldTextfield
              id={'accumulationRate'}
              md={4}
              label={strings.ACCUMULATION_RATE_UNITS}
              onChange={onChangeParticipantProject}
              type={'number'}
              value={participantProjectRecord?.accumulationRate}
            />
            <VariableSelect
              id={'standard'}
              md={4}
              label={strings.STANDARD}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.standard}
              options={(stableToVariable?.[standardStableId] as SelectVariable)?.options}
            />
            <VariableSelect
              id={'methodologyNumber'}
              md={4}
              label={strings.METHODOLOGY_NUMBER}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.methodologyNumber}
              options={(stableToVariable?.[methodologyNumberStableId] as SelectVariable)?.options}
            />
            {stableToVariable && (
              <ProjectFieldMultiSelect
                id={'carbonCertifications'}
                md={4}
                label={strings.CARBON_CERTIFICATIONS}
                onChange={onChangeParticipantProject}
                values={participantProjectRecord?.carbonCertifications}
                options={(stableToVariable[carbonCertificationsStableId] as SelectVariable).options.reduce(
                  (map, option) => {
                    map.set(option.name, option.name);
                    return map;
                  },
                  new Map<string, string>()
                )}
              />
            )}

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

            <Grid container>
              <SdgMultiSelect
                id={'sdgList'}
                md={6}
                label={strings.UN_SDG}
                onChange={onChangeSdgList}
                value={participantProjectRecord?.sdgList}
              />
            </Grid>
          </Grid>

          <Grid container>
            <Grid item md={12}>
              <PhotoSelectorWithPreview
                title={'Main Photo'}
                onPhotoChanged={setMainPhoto}
                uploadText={strings.UPLOAD_PHOTO}
                uploadDescription={strings.UPLOAD_PHOTO_DESCR_LANDSCAPE_3_2}
                chooseFileText={strings.CHOOSE_FILE}
                replaceFileText={strings.REPLACE_FILE}
                previewUrl={
                  (participantProject?.projectHighlightPhotoValueId &&
                    getImagePath(projectId, participantProject.projectHighlightPhotoValueId)) ||
                  undefined
                }
                previewPlacement={'right'}
                previewWidth={375}
                previewAspectRatio={2 / 3}
              />
            </Grid>
          </Grid>
          <Grid container>
            <Grid item md={12}>
              <PhotoSelectorWithPreview
                title={'Map Photo'}
                onPhotoChanged={setMapPhoto}
                uploadText={strings.UPLOAD_PHOTO}
                uploadDescription={strings.UPLOAD_PHOTO_DESCR_LANDSCAPE_3_2}
                chooseFileText={strings.CHOOSE_FILE}
                replaceFileText={strings.REPLACE_FILE}
                previewUrl={
                  (participantProject?.projectZoneFigureValueId &&
                    getImagePath(projectId, participantProject.projectZoneFigureValueId)) ||
                  undefined
                }
                previewPlacement={'right'}
                previewWidth={375}
                previewAspectRatio={2 / 3}
              />
            </Grid>
          </Grid>
        </Card>
      </PageForm>
    </Grid>
  );
};
export default ProjectProfileEdit;

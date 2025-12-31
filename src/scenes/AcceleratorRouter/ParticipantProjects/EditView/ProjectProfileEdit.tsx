import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Dropdown, DropdownItem, IconTooltip } from '@terraware/web-components';

import PhotoSelectorWithPreview, { FileWithUrl } from 'src/components/Photo/PhotoSelectorWithPreview';
import CountrySelect from 'src/components/ProjectField/CountrySelect';
import LandUseMultiSelect from 'src/components/ProjectField/LandUseMultiSelect';
import MinMaxCarbonTextfield from 'src/components/ProjectField/MinMaxCarbonTextfield';
import ProjectFieldMultiSelect from 'src/components/ProjectField/MultiSelect';
import SdgMultiSelect from 'src/components/ProjectField/SdgMultiSelect';
import ProjectFieldTextAreaEdit from 'src/components/ProjectField/TextAreaEdit';
import ProjectFieldTextfield from 'src/components/ProjectField/Textfield';
import VariableSelect from 'src/components/ProjectField/VariableSelect';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import PageForm from 'src/components/common/PageForm';
import Icon from 'src/components/common/icon/Icon';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useUser } from 'src/providers';
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
import {
  requestProjectInternalUsersList,
  requestProjectInternalUsersUpdate,
} from 'src/redux/features/projects/projectsAsyncThunks';
import {
  selectProjectInternalUsersListRequest,
  selectProjectInternalUsersUpdateRequest,
} from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { UpdateProjectInternalUsersRequestPayload } from 'src/services/ProjectsService';
import { LAND_USE_MODEL_TYPES, ParticipantProject } from 'src/types/ParticipantProject';
import { ProjectInternalUserRole, getProjectInternalUserRoleString, projectInternalUserRoles } from 'src/types/Project';
import { OrganizationUser } from 'src/types/User';
import { SelectVariable, VariableWithValues } from 'src/types/documentProducer/Variable';
import { getImagePath } from 'src/utils/images';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import AddInternalUserRoleModal from './AddInternalUserRoleModal';

type InternalUserItem = Omit<UpdateProjectInternalUsersRequestPayload['internalUsers'][number], 'userId'> & {
  userId?: number;
};

const HighlightPhotoStableId = '551';
const ProjectZoneFigureStableId = '525';
const standardStableId = '350';
const methodologyNumberStableId = '351';
const carbonCertificationsStableId = '552';
const variableStableIds = [
  HighlightPhotoStableId,
  ProjectZoneFigureStableId,
  standardStableId,
  methodologyNumberStableId,
  carbonCertificationsStableId,
];

const EXTERNAL_LINK_KEYS = [
  'googleFolderUrl',
  'verraLink',
  'clickUpLink',
  'hubSpotUrl',
  'riskTrackerLink',
  'slackLink',
  'gisReportsLink',
] as const;

const ProjectProfileEdit = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { participantProject, projectId, organization, reload } = useParticipantProjectData();
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
    updateInternalUsers: false,
    uploadImages: false,
  });

  const [organizationUsersRequestId, setOrganizationUsersRequestId] = useState<string>('');
  const [listUsersRequestId, setListUsersRequestId] = useState('');
  const [listInternalUsersRequestId, setListInternalUsersRequestId] = useState('');
  const listUsersRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listUsersRequestId));
  const listInternalUsersRequest = useAppSelector((state) =>
    selectProjectInternalUsersListRequest(state, listInternalUsersRequestId)
  );
  const [internalUsers, setInternalUsers] = useState<InternalUserItem[]>([]);
  const [updateInternalUsersRequestId, setUpdateInternalUsersRequestId] = useState('');
  const [uploadImagesRequestId, setUploadImagesRequestId] = useState('');
  const uploadImagesResponse = useAppSelector(selectUploadImageValue(uploadImagesRequestId));
  const updateInternalUsersResponse = useAppSelector((state) =>
    selectProjectInternalUsersUpdateRequest(state, updateInternalUsersRequestId)
  );
  const response = useAppSelector(selectOrganizationUsers(organizationUsersRequestId));

  const variableValues = useAppSelector((state) =>
    selectSpecificVariablesWithValues(state, variableStableIds, projectId)
  );
  const [stableToVariable, setStableToVariable] = useState<Record<string, VariableWithValues>>();
  const { activeLocale, strings } = useLocalization();
  const [globalUsersOptions, setGlobalUsersOptions] = useState<DropdownItem[]>();
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>();
  const [mainPhoto, setMainPhoto] = useState<FileWithUrl>();
  const [mapPhoto, setMapPhoto] = useState<FileWithUrl>();
  const [customUserRoles, setCustomUserRoles] = useState<string[]>([]);

  const isAllowedEdit = isAllowed('UPDATE_PARTICIPANT_PROJECT');

  const redirectToProjectView = useCallback(() => {
    reload();
    snackbar.toastSuccess(strings.CHANGES_SAVED, strings.SAVED);
    goToParticipantProject(projectId);
  }, [reload, snackbar, goToParticipantProject, projectId, strings]);

  const addInternalUserRole = useCallback(
    (internalUserRole: string) => {
      const trimmedRole = internalUserRole.trim();
      if (trimmedRole.length && !customUserRoles.includes(trimmedRole)) {
        setCustomUserRoles((prev) => [...prev, trimmedRole]);
      }
    },
    [customUserRoles, setCustomUserRoles]
  );

  const internalUserRoleOptions = useMemo(
    () =>
      [
        ...projectInternalUserRoles.map((role) => ({
          label: getProjectInternalUserRoleString(role, strings),
          value: role,
        })),
        ...customUserRoles.map((role) => ({
          label: role,
          value: role,
        })),
      ].sort((a, b) => a.label.localeCompare(b.label, activeLocale || undefined)),
    [activeLocale, customUserRoles, strings]
  );

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
      isComplete(updateInternalUsersResponse?.status, initiatedRequests.updateInternalUsers) &&
      isComplete(uploadImagesResponse?.status, initiatedRequests.uploadImages)
    ) {
      setRequestsInProgress(false);

      if (
        [participantProjectUpdateResponse, updateInternalUsersResponse, uploadImagesResponse].some(
          (resp) => resp?.status === 'error'
        )
      ) {
        snackbar.toastError();
        setUpdateInternalUsersRequestId('');
        setUploadImagesRequestId('');
        setParticipantProjectRequestId('');
      } else {
        redirectToProjectView();
      }
    }
  }, [
    participantProjectUpdateResponse,
    uploadImagesResponse,
    requestsInProgress,
    initiatedRequests,
    redirectToProjectView,
    snackbar,
    updateInternalUsersResponse,
  ]);

  useEffect(() => {
    if (updateInternalUsersResponse?.status === 'success') {
      // redirect to project view occurs when image uploads are finished
    } else if (updateInternalUsersResponse?.status === 'error') {
      snackbar.toastError();
      setUpdateInternalUsersRequestId('');
    }
  }, [updateInternalUsersResponse, snackbar]);

  useEffect(() => {
    if (uploadImagesResponse?.status === 'success') {
      redirectToProjectView();
    } else if (uploadImagesResponse?.status === 'error') {
      snackbar.toastError();
      setUploadImagesRequestId('');
    }
  }, [uploadImagesResponse, redirectToProjectView, snackbar]);

  useEffect(() => {
    const request = dispatch(requestProjectInternalUsersList({ projectId }));
    setListInternalUsersRequestId(request.requestId);
  }, [dispatch, projectId]);

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
  }, [activeLocale, dispatch, projectId]);

  useEffect(() => {
    if (listUsersRequest?.status === 'success') {
      const userOptions = listUsersRequest.data?.users
        .filter((user) => !!user.firstName)
        .map((user) => ({
          label: `${user.firstName} ${user.lastName}`,
          value: user.id,
        }));
      setGlobalUsersOptions(userOptions);
    }
  }, [listUsersRequest]);

  useEffect(() => {
    if (listInternalUsersRequest?.status === 'success') {
      setInternalUsers(listInternalUsersRequest.data?.users || []);

      const preExistingCustomInternalUserRoles = (listInternalUsersRequest?.data?.users || [])
        .filter((user) => user.roleName)
        .map((user) => user.roleName);

      const uniqueCustomRoles = Array.from(new Set(preExistingCustomInternalUserRoles as string[]));
      setCustomUserRoles(uniqueCustomRoles);
    }
  }, [listInternalUsersRequest]);

  const onChangeCountry = useCallback(
    (countryCode?: string, region?: string) => {
      onChangeParticipantProject('countryCode', countryCode);
      onChangeParticipantProject('region', region);
    },
    [onChangeParticipantProject]
  );

  const saveInternalUsers = useCallback(() => {
    if (listInternalUsersRequest?.data?.users) {
      const updateRequest = dispatch(
        requestProjectInternalUsersUpdate({
          projectId,
          payload: {
            internalUsers: (internalUsers || [])
              .filter((user) => !!user.userId && (user.role || user.roleName))
              .map((user) => ({
                role: user.role,
                roleName: user.roleName,
                userId: user.userId as number,
              })),
          },
        })
      );
      setUpdateInternalUsersRequestId(updateRequest.requestId);

      return true;
    }

    return false;
  }, [dispatch, internalUsers, listInternalUsersRequest?.data?.users, projectId]);

  const handleSave = useCallback(() => {
    if (!stableToVariable || listInternalUsersRequest?.status !== 'success') {
      snackbar.toastError(strings.CANNOT_SAVE_UNTIL_PAGE_IS_FULLY_LOADED);
      return;
    }

    if (!internalUsers.filter((user) => !!user.userId).every((user) => user.role || user.roleName)) {
      snackbar.toastError(strings.SELECT_A_CONTACT_TYPE_FOR_ALL_INTERNAL_LEADS);
      return;
    }

    setRequestsInProgress(true);

    const newInitiatedRequests = {
      participantProject: false,
      updateInternalUsers: false,
      uploadImages: false,
    };

    const updatedRecord = { ...participantProjectRecord } as ParticipantProject;

    EXTERNAL_LINK_KEYS.forEach((key) => {
      const value = updatedRecord[key];
      if (value && !/^https?:\/\//.test(`${value}`)) {
        updatedRecord[key] = `https://${value}`;
      }
    });

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

    saveInternalUsers();
    newInitiatedRequests.updateInternalUsers = true;

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
          variableId: stableToVariable[ProjectZoneFigureStableId].id,
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
  }, [
    stableToVariable,
    listInternalUsersRequest?.status,
    internalUsers,
    participantProjectRecord,
    saveInternalUsers,
    mainPhoto,
    mapPhoto,
    snackbar,
    dispatch,
    projectId,
    redirectToProjectView,
    strings,
  ]);

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
  }, [organization, dispatch]);

  const onChangeLandUseHectares = useCallback(
    (type: string, hectares: string) => {
      const updated = { ...participantProjectRecord?.landUseModelHectares, [type]: Number(hectares) };
      if (hectares === '') {
        delete updated[type];
      }
      onChangeParticipantProject('landUseModelHectares', updated);
    },
    [onChangeParticipantProject, participantProjectRecord]
  );

  const onChangeSdgList = useCallback(
    (id: string, newList: string[]) => {
      onChangeParticipantProject(
        id,
        newList.map((item) => Number(item))
      );
    },
    [onChangeParticipantProject]
  );

  const onClickAddRow = useCallback(() => {
    setInternalUsers((prev) => [...(prev || []), { userId: undefined, role: undefined }]);
  }, [setInternalUsers]);

  const getOnChangeInternalUser = useCallback(
    (index: number) => (value: string) => {
      const nextUser = globalUsersOptions?.find((globalUser) => globalUser.value.toString() === value.toString());
      if (nextUser) {
        setInternalUsers((prevUsers) => {
          const internalUsersUpdate = prevUsers?.map((user) => ({ ...user }));
          if (internalUsersUpdate?.[index]) {
            internalUsersUpdate[index] = {
              ...internalUsersUpdate[index],
              userId: nextUser.value,
            };
            return internalUsersUpdate;
          }
          return prevUsers;
        });
      }
    },
    [globalUsersOptions, setInternalUsers]
  );

  const getOnChangeInternalUserRole = useCallback(
    (index: number) => (nextRole: string) => {
      const internalUsersUpdate = internalUsers?.map((user) => ({ ...user }));
      if (internalUsersUpdate?.[index]) {
        const isStandardRole = projectInternalUserRoles.includes(nextRole as ProjectInternalUserRole);
        internalUsersUpdate[index] = {
          ...internalUsersUpdate[index],
          ...(isStandardRole
            ? { role: nextRole as ProjectInternalUserRole, roleName: undefined }
            : { role: undefined, roleName: nextRole }),
        };
        setInternalUsers(internalUsersUpdate);
      }
    },
    [internalUsers]
  );

  const getOnRemoveInternalUser = useCallback(
    (index: number) => () => {
      setInternalUsers((prev) => prev?.filter((_, i) => i !== index));

      // add new row if there was only one row before the function was called
      if (internalUsers.length === 1) {
        onClickAddRow();
      }
    },
    [internalUsers.length, onClickAddRow]
  );

  // add row, if API returns no internal users
  useEffect(() => {
    if (listInternalUsersRequest?.status === 'success' && listInternalUsersRequest?.data?.users?.length === 0) {
      onClickAddRow();
    }
  }, [listInternalUsersRequest, onClickAddRow]);

  const [addInternalUserRoleModalOpen, setAddInternalUserRoleModalOpen] = useState(false);

  const onClickAddOtherContact = useCallback(() => {
    setAddInternalUserRoleModalOpen(true);
  }, [setAddInternalUserRoleModalOpen]);

  const onCloseAddInternalUserRoleModal = useCallback(() => {
    setAddInternalUserRoleModalOpen(false);
  }, [setAddInternalUserRoleModalOpen]);

  const ownerId = useMemo(() => organizationUsers?.find((orgUsr) => orgUsr.role === 'Owner')?.id, [organizationUsers]);

  const getInternalUserOptions = useCallback(
    (userId?: number) => {
      const availableInternalUserIds = internalUsers?.map((user) => user.userId).filter((id) => id !== userId);
      return (
        globalUsersOptions?.filter((opt) => opt.value !== ownerId && !availableInternalUserIds.includes(opt.value)) ||
        []
      );
    },
    [globalUsersOptions, internalUsers, ownerId]
  );

  const showDeleteInternalUserButton = useMemo(
    () =>
      !(
        internalUsers.length === 1 &&
        internalUsers[0]?.userId === undefined &&
        internalUsers[0]?.role === undefined &&
        internalUsers[0]?.roleName === undefined
      ),
    [internalUsers]
  );

  const sortedSelectedModelTypes = useMemo(() => {
    return LAND_USE_MODEL_TYPES.filter((type) => participantProjectRecord?.landUseModelTypes?.includes(type));
  }, [participantProjectRecord?.landUseModelTypes]);

  return (
    <Grid container paddingRight={theme.spacing(3)}>
      {addInternalUserRoleModalOpen && (
        <AddInternalUserRoleModal
          addInternalUserRole={addInternalUserRole}
          customUserRoles={customUserRoles}
          onClose={onCloseAddInternalUserRoleModal}
        />
      )}
      <PageForm
        busy={[
          participantProjectUpdateResponse?.status,
          updateInternalUsersResponse?.status,
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

            {listInternalUsersRequest?.status === 'success' && (
              <Grid item md={12}>
                <Box border='1px solid gray' borderRadius='8px' marginX={theme.spacing(2)} padding={theme.spacing(2)}>
                  <Box borderBottom='1px solid gray' marginBottom='16px' paddingBottom='8px'>
                    <Typography fontSize='16px' fontWeight={600} lineHeight='24px'>
                      {strings.INTERNAL_LEADS} <IconTooltip title={strings.INTERNAL_LEADS_TOOLTIP} />
                    </Typography>
                  </Box>

                  <Grid container marginBottom='4px'>
                    <Grid item md={6}>
                      <Typography
                        color={theme.palette.TwClrTxtSecondary}
                        fontSize='14px'
                        fontWeight={400}
                        lineHeight='20px'
                      >
                        {strings.PERSON}
                      </Typography>
                    </Grid>
                    <Grid item md={6}>
                      <Typography
                        color={theme.palette.TwClrTxtSecondary}
                        fontSize='14px'
                        fontWeight={400}
                        lineHeight='20px'
                      >
                        {strings.CONTACT_TYPE}
                      </Typography>
                    </Grid>
                  </Grid>

                  {internalUsers.map((user, index) => (
                    <Grid container key={`internal-user-${index}`} marginBottom='8px'>
                      <Grid item md={6} paddingRight='8px'>
                        <Dropdown
                          autocomplete
                          fullWidth
                          hideClearIcon
                          id={`internal-user-id-${index}`}
                          label=''
                          onChange={getOnChangeInternalUser(index)}
                          options={getInternalUserOptions(user.userId)}
                          placeholder={strings.SELECT}
                          selectedValue={user?.userId}
                        />
                      </Grid>

                      <Grid item md={showDeleteInternalUserButton ? 5 : 6}>
                        <Dropdown
                          autocomplete
                          fullWidth
                          hideClearIcon
                          id={`internal-user-role-${index}`}
                          label=''
                          onChange={getOnChangeInternalUserRole(index)}
                          options={internalUserRoleOptions}
                          placeholder={strings.SELECT}
                          selectedValue={internalUsers?.[index]?.role || internalUsers?.[index]?.roleName}
                        />
                      </Grid>

                      {showDeleteInternalUserButton && (
                        <Grid item xs={1} display={'flex'} flexDirection={'column'}>
                          <Link onClick={getOnRemoveInternalUser(index)} style={{ height: '100%' }}>
                            <Box paddingTop='8px'>
                              <Icon name='iconSubtract' size='medium' />
                            </Box>
                          </Link>
                        </Grid>
                      )}
                    </Grid>
                  ))}

                  <Grid container>
                    <Grid item md={6}>
                      <Button
                        icon='iconAdd'
                        label={strings.EDITABLE_TABLE_ADD_ROW}
                        onClick={onClickAddRow}
                        priority='ghost'
                        size='medium'
                        style={{ paddingLeft: 0 }}
                        type='productive'
                      />
                    </Grid>

                    <Grid item md={6} textAlign='right'>
                      <Button
                        icon='plus'
                        label={strings.OTHER_CONTACT}
                        onClick={onClickAddOtherContact}
                        priority='secondary'
                        size='medium'
                        type='productive'
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            <ProjectFieldTextAreaEdit
              id={'dealDescription'}
              label={strings.PROJECT_OVERVIEW}
              onChange={onChangeParticipantProject}
              value={participantProjectRecord?.dealDescription}
            />
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

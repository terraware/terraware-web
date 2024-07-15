import React, { useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Dropdown, DropdownItem, Textfield } from '@terraware/web-components';
import isString from 'lodash/isString';

import ParticipantsDropdown from 'src/components/ParticipantsDropdown';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useParticipants } from 'src/hooks/useParticipants';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { requestListGlobalRolesUsers } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUsersSearchRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import useSnackbar from 'src/utils/useSnackbar';

import { getDocumentOwnerOptions, getDocumentTemplateName, getDocumentTemplateOptions } from './helpers';

export type DocumentMetadataEditProps = {
  documentName?: string;
  setDocumentName: (name: string) => void;
  documentOwner?: string;
  setDocumentOwner: (userId: string) => void;
  documentTemplateId?: string;
  setDocumentTemplateId?: (methodlogyId: string) => void;
  projectId?: string;
  setProjectId?: (projectId: string) => void;
  isEdit?: boolean;
  formValid?: boolean;
};

const DocumentMetadataEdit = ({
  documentName,
  setDocumentName,
  documentOwner,
  setDocumentOwner,
  documentTemplateId,
  setDocumentTemplateId,
  projectId,
  setProjectId,
  isEdit,
  formValid,
}: DocumentMetadataEditProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();
  const { documentTemplates, error: getDocumentTemplatesError } = useAppSelector(selectDocumentTemplates);
  const { availableParticipants } = useParticipants();
  const { availableProjects } = useProjects();

  const [participant, setParticipant] = useState<{ id?: number }>({ id: undefined });

  const participantProjects = useMemo(
    () =>
      availableProjects?.length && participant?.id
        ? availableProjects.filter((project: Project) => project?.participantId === participant.id)
        : [],
    [availableProjects, participant]
  );

  const [documentOwnerOptions, setDocumentOwnerOptions] = useState<DropdownItem[]>([]);
  const [listUsersRequestId, setListUsersRequestId] = useState('');
  const listUsersRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listUsersRequestId));

  useEffect(() => {
    console.log({ listUsersRequest });
    if (listUsersRequest?.status === 'success') {
      setDocumentOwnerOptions(getDocumentOwnerOptions(listUsersRequest.data?.users || []));
    } else if (listUsersRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listUsersRequest]);

  const documentTemplateOptions = useMemo(
    () => getDocumentTemplateOptions(documentTemplates || []),
    [documentTemplates]
  );

  useEffect(() => {
    // reset projectId when participant changes
    setProjectId?.('');
  }, [participant]);

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
    const request = dispatch(requestListGlobalRolesUsers({ locale: activeLocale }));
    setListUsersRequestId(request.requestId);
  }, [activeLocale, dispatch]);

  useEffect(() => {
    if (getDocumentTemplatesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, getDocumentTemplatesError]);

  // All fields are required in this form
  const getErrorText = (value: unknown): string => (formValid === false && !value ? strings.REQUIRED_FIELD : '');

  // This probably seems like overkill, I just didn't want to cast value to string in the Textfield onChange.
  // Since it comes back as unknown, use typeguard
  // TODO maybe Textfield should return back an explicit type?
  function handleTextFieldChange(value: unknown, setter: (value: string) => void): void {
    if (isString(value)) {
      setter(value);
    }
  }

  const FormField = useMemo(
    () =>
      styled(Box)({
        marginBottom: theme.spacing(2),
        textAlign: 'left',
      }),
    [theme]
  );

  const projectRecord = useMemo(() => ({ projectId: projectId ? parseInt(projectId, 10) : -1 }), [projectId]);

  return (
    <>
      <FormField>
        <ParticipantsDropdown
          availableParticipants={availableParticipants}
          record={participant}
          required
          setRecord={setParticipant}
        />
      </FormField>

      <FormField>
        <ProjectsDropdown
          availableProjects={participantProjects}
          record={projectRecord}
          required
          setRecord={(setFn) => {
            const nextRecord = setFn(projectRecord);
            if (nextRecord.projectId) {
              setProjectId?.(nextRecord.projectId.toString());
            }
          }}
        />
      </FormField>

      <FormField>
        {isEdit ? (
          <Textfield
            id='documentTemplate'
            label={strings.DOCUMENTS_ADD_FORM_DOCUMENT_TEMPLATE}
            type='text'
            value={getDocumentTemplateName(documentTemplates ?? [], documentTemplateId)}
            display={true}
            required
          />
        ) : (
          <Dropdown
            id='documentTemplate'
            placeholder={strings.SELECT}
            selectedValue={documentTemplateId}
            options={documentTemplateOptions}
            onChange={(value: string) => setDocumentTemplateId && setDocumentTemplateId(value)}
            hideClearIcon={true}
            label={strings.DOCUMENTS_ADD_FORM_DOCUMENT_TEMPLATE}
            errorText={getErrorText(documentTemplateId)}
            autocomplete
            required
          />
        )}
      </FormField>

      <FormField>
        <Textfield
          id='document-name'
          label={strings.DOCUMENTS_ADD_FORM_DOC_NAME}
          type='text'
          value={documentName}
          errorText={getErrorText(documentName)}
          onChange={(value: unknown) => handleTextFieldChange(value, setDocumentName)}
          required
        />
      </FormField>

      <FormField>
        <Dropdown
          id='document-owner'
          placeholder={strings.SELECT}
          selectedValue={documentOwner}
          options={documentOwnerOptions}
          onChange={(value: string) => setDocumentOwner(value)}
          hideClearIcon={true}
          label={strings.DOCUMENTS_ADD_FORM_DOC_OWNER}
          errorText={getErrorText(documentOwner)}
          autocomplete
          required
        />
      </FormField>
    </>
  );
};

export default DocumentMetadataEdit;

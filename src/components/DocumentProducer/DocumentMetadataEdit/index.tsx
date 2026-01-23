import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Dropdown, DropdownItem, Textfield } from '@terraware/web-components';
import isString from 'lodash/isString';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';
import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { requestListGlobalRolesUsers } from 'src/redux/features/globalRoles/globalRolesAsyncThunks';
import { selectGlobalRolesUsersSearchRequest } from 'src/redux/features/globalRoles/globalRolesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
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
  const { availableProjects: availableProjectOptions } = useProjects();
  const availableProjects = useMemo(() => availableProjectOptions || [], [availableProjectOptions]);

  const [documentNameFieldHasBeenFocused, setDocumentNameFieldHasBeenFocused] = useState(false);
  const [documentOwnerOptions, setDocumentOwnerOptions] = useState<DropdownItem[]>([]);
  const [listUsersRequestId, setListUsersRequestId] = useState('');
  const listUsersRequest = useAppSelector(selectGlobalRolesUsersSearchRequest(listUsersRequestId));

  useEffect(() => {
    if (listUsersRequest?.status === 'success') {
      setDocumentOwnerOptions(getDocumentOwnerOptions(listUsersRequest.data?.users || []));
    } else if (listUsersRequest?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [listUsersRequest, snackbar]);

  const documentTemplateOptions = useMemo(
    () => getDocumentTemplateOptions(documentTemplates || []),
    [documentTemplates]
  );

  useEffect(() => {
    void dispatch(requestListDocumentTemplates());
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
  const handleTextFieldChange = (value: unknown, setter: (value: string) => void): void => {
    if (isString(value)) {
      setter(value);
    }
  };

  const FormField = useMemo(
    () =>
      styled(Box)({
        marginBottom: theme.spacing(2),
        textAlign: 'left',
      }),
    [theme]
  );

  const projectRecord = useMemo(() => ({ projectId: projectId ? parseInt(projectId, 10) : -1 }), [projectId]);
  const projectName = useMemo(
    () => availableProjects.find((project) => project.id === projectRecord.projectId)?.name,
    [availableProjects, projectRecord.projectId]
  );

  const documentTemplateName = useMemo(
    () => getDocumentTemplateName(documentTemplates ?? [], documentTemplateId),
    [documentTemplateId, documentTemplates]
  );

  useEffect(() => {
    if (documentNameFieldHasBeenFocused) {
      return;
    }

    // if project name is set and document name is empty, set document name to project name
    if (projectName && !documentName) {
      setDocumentName(projectName);
    }

    // if project name and document template name are set AND document name is the same as project name
    // append document template name to project name
    if (projectName && documentTemplateName && documentName === projectName) {
      setDocumentName(`${projectName} - ${documentTemplateName}`);
    }
  }, [documentName, documentTemplateName, documentNameFieldHasBeenFocused, projectName, setDocumentName]);

  return (
    <>
      <FormField>
        <ProjectsDropdown
          availableProjects={availableProjects}
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
          onFocus={() => setDocumentNameFieldHasBeenFocused(true)}
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

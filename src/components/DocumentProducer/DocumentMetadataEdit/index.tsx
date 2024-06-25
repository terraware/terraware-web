import React, { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Dropdown, Textfield } from '@terraware/web-components';
import isString from 'lodash/isString';

import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import useSnackbar from 'src/utils/useSnackbar';

import { getDocumentOwnerOptions, getDocumentTemplateName, getDocumentTemplateOptions } from './helpers';

export type DocumentMetadataEditProps = {
  documentName?: string;
  setDocumentName: (name: string) => void;
  documentOwner?: string;
  setDocumentOwner: (userId: string) => void;
  documentTemplateId?: string;
  setDocumentTemplateId?: (methodlogyId: string) => void;
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
  isEdit,
  formValid,
}: DocumentMetadataEditProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { documentTemplates, error: getDocumentTemplatesError } = useAppSelector(selectDocumentTemplates);

  // TODO we don't have redux for this, should it only be TF accelerator users? Or all admins?
  // const { data: users, error: getUsersError } = useAppSelector(selectUsers);
  const users: User[] = useMemo(() => [], []);
  const getUsersError = null;

  const documentTemplateOptions = useMemo(
    () => getDocumentTemplateOptions(documentTemplates || []),
    [documentTemplates]
  );
  const documentOwnerOptions = useMemo(() => getDocumentOwnerOptions(users || []), [users]);

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
    // TODO we don't have redux for this, should it only be TF accelerator users? Or all admins?
    // dispatch(requestListUsers());
  }, [dispatch]);

  useEffect(() => {
    if (getDocumentTemplatesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, getDocumentTemplatesError]);

  useEffect(() => {
    if (getUsersError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, getUsersError]);

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

  return (
    <>
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

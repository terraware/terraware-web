import React, { useEffect, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Dropdown, Textfield } from '@terraware/web-components';
import isString from 'lodash/isString';

import { selectMethodologies } from 'src/redux/features/documentProducer/methodologies/methodologiesSelector';
import { requestListMethodologies } from 'src/redux/features/documentProducer/methodologies/methodologiesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import useSnackbar from 'src/utils/useSnackbar';

import { getDocumentOwnerOptions, getMethodologyName, getMethodologyOptions } from './helpers';

export type DocumentMetadataEditProps = {
  associatedOrganization?: string;
  setAssociatedOrganization: (organization: string) => void;
  documentName?: string;
  setDocumentName: (name: string) => void;
  documentOwner?: string;
  setDocumentOwner: (userId: string) => void;
  methodologyId?: string;
  setMethodologyId?: (methodlogyId: string) => void;
  isEdit?: boolean;
  formValid?: boolean;
};

const DocumentMetadataEdit = ({
  associatedOrganization,
  setAssociatedOrganization,
  documentName,
  setDocumentName,
  documentOwner,
  setDocumentOwner,
  methodologyId,
  setMethodologyId,
  isEdit,
  formValid,
}: DocumentMetadataEditProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const snackbar = useSnackbar();
  const { methodologies, error: getMethodologiesError } = useAppSelector(selectMethodologies);

  // TODO we don't have redux for this, should it only be TF accelerator users? Or all admins?
  // const { data: users, error: getUsersError } = useAppSelector(selectUsers);
  const users: User[] = useMemo(() => [], []);
  const getUsersError = null;

  const methodologyOptions = useMemo(() => getMethodologyOptions(methodologies || []), [methodologies]);
  const documentOwnerOptions = useMemo(() => getDocumentOwnerOptions(users || []), [users]);

  useEffect(() => {
    dispatch(requestListMethodologies());
    // TODO we don't have redux for this, should it only be TF accelerator users? Or all admins?
    // dispatch(requestListUsers());
  }, [dispatch]);

  useEffect(() => {
    if (getMethodologiesError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [snackbar, getMethodologiesError]);

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
        <Textfield
          id='associated-organization'
          label={strings.DOCUMENTS_ADD_FORM_ASSOC_ORG}
          type='text'
          value={associatedOrganization}
          errorText={getErrorText(associatedOrganization)}
          onChange={(value: unknown) => handleTextFieldChange(value, setAssociatedOrganization)}
          required
        />
      </FormField>

      <FormField>
        {isEdit ? (
          <Textfield
            id='methodology'
            label={strings.DOCUMENTS_ADD_FORM_METHODOLOGY}
            type='text'
            value={getMethodologyName(methodologies ?? [], methodologyId)}
            display={true}
            required
          />
        ) : (
          <Dropdown
            id='methodology'
            placeholder={strings.SELECT}
            selectedValue={methodologyId}
            options={methodologyOptions}
            onChange={(value: string) => setMethodologyId && setMethodologyId(value)}
            hideClearIcon={true}
            label={strings.DOCUMENTS_ADD_FORM_METHODOLOGY}
            errorText={getErrorText(methodologyId)}
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

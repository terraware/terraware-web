import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { User } from 'src/types/User';
import { Document } from 'src/types/documentProducer/Document';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getUserDisplayName } from 'src/utils/user';

import { getDocumentTemplateName } from '../DocumentsView/helpers';

export type DocumentMetadataProps = {
  document: Document;
};

const DocumentMetadata = ({ document }: DocumentMetadataProps): JSX.Element => {
  const { name, documentTemplateId, ownedBy, modifiedBy, modifiedTime } = document;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [ownedByUser, setOwnedByUser] = useState<User>();
  const [modifiedByUser, setModifiedByUser] = useState<User>();

  const ownedBySelector = useAppSelector(selectUser(ownedBy));
  const modifiedBySelector = useAppSelector(selectUser(modifiedBy));
  const { documentTemplates } = useAppSelector(selectDocumentTemplates);

  useEffect(() => {
    setOwnedByUser(ownedBySelector);
  }, [ownedBySelector]);

  useEffect(() => {
    setModifiedByUser(modifiedBySelector);
  }, [modifiedBySelector]);

  useEffect(() => {
    console.log('ownedByUser', ownedByUser);
  }, [ownedByUser]);

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(requestGetUser(ownedBy));
    dispatch(requestGetUser(modifiedBy));
  }, [dispatch, ownedBy, modifiedBy]);

  const ownedByName = useMemo(() => getUserDisplayName(ownedByUser), [ownedByUser]);
  const modifiedByName = useMemo(() => getUserDisplayName(modifiedByUser), [modifiedByUser]);
  const modifiedTimeDisplay = useMemo(() => getDateTimeDisplayValue(new Date(modifiedTime).getTime()), [modifiedTime]);
  const documentTemplateName = useMemo(
    () => getDocumentTemplateName(documentTemplateId, documentTemplates ?? []),
    [documentTemplates, documentTemplateId]
  );

  return (
    <Box display='flex' flexDirection='column' marginTop={3}>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {/* The participant name goes here, not ownedBy */}
        {ownedByName}
      </Typography>
      <Typography
        fontWeight={600}
        fontSize='24px'
        lineHeight='32px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {name} - {documentTemplateName}
      </Typography>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        component='pre'
        whiteSpace='pre-wrap'
      >
        {strings.TEMPLATE}: {documentTemplateName}
        <br />
        {strings.LAST_EDITED_BY}: {modifiedByName}, {modifiedTimeDisplay}
      </Typography>
    </Box>
  );
};

export default DocumentMetadata;

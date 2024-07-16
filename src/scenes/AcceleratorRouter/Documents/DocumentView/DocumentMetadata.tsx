import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useParticipants } from 'src/hooks/useParticipants';
import { selectDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { requestGetUser } from 'src/redux/features/user/usersAsyncThunks';
import { selectUser } from 'src/redux/features/user/usersSelectors';
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
  const { name, documentTemplateId, ownedBy, modifiedBy, modifiedTime, projectId } = document;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const [modifiedByUser, setModifiedByUser] = useState<User>();

  const modifiedBySelector = useAppSelector(selectUser(modifiedBy));
  const { documentTemplates } = useAppSelector(selectDocumentTemplates);
  const { availableParticipants } = useParticipants();

  useEffect(() => {
    setModifiedByUser(modifiedBySelector);
  }, [modifiedBySelector]);

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(requestGetUser(ownedBy));
    dispatch(requestGetUser(modifiedBy));
  }, [dispatch, ownedBy, modifiedBy]);

  const modifiedByName = useMemo(() => getUserDisplayName(modifiedByUser), [modifiedByUser]);
  const modifiedTimeDisplay = useMemo(() => getDateTimeDisplayValue(new Date(modifiedTime).getTime()), [modifiedTime]);
  const documentTemplateName = useMemo(
    () => getDocumentTemplateName(documentTemplateId, documentTemplates ?? []),
    [documentTemplates, documentTemplateId]
  );
  const participant = availableParticipants?.find((part) => part.projects.find((proj) => proj.id === projectId));

  return (
    <Box display='flex' flexDirection='column' marginTop={3}>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {participant?.name}
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

import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { useAcceleratorProjects } from 'src/hooks/useAcceleratorProjects';
import { useGetUserQuery } from 'src/queries/generated/users';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';
import { getDateTimeDisplayValue } from 'src/utils/dateFormatter';
import { getUserDisplayName } from 'src/utils/user';

export type DocumentMetadataProps = {
  document: Document;
  documentTemplate: DocumentTemplate;
};

const DocumentMetadata = ({ document, documentTemplate }: DocumentMetadataProps): JSX.Element => {
  const { name, modifiedBy, modifiedTime, projectId } = document;

  const theme = useTheme();
  const { acceleratorProjects } = useAcceleratorProjects();

  const { currentData: modifiedByData } = useGetUserQuery(modifiedBy, { skip: !modifiedBy });
  const modifiedByUser = modifiedByData?.user;

  const modifiedByName = useMemo(() => getUserDisplayName(modifiedByUser), [modifiedByUser]);
  const modifiedTimeDisplay = useMemo(() => getDateTimeDisplayValue(new Date(modifiedTime).getTime()), [modifiedTime]);

  const project = acceleratorProjects?.find((proj) => proj.projectId === projectId);

  return (
    <Box display='flex' flexDirection='column' marginTop={3}>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {project?.dealName}
      </Typography>
      <Typography
        fontWeight={600}
        fontSize='24px'
        lineHeight='32px'
        color={theme.palette.TwClrTxt}
        margin={theme.spacing(1, 0)}
      >
        {name} - {documentTemplate.name}
      </Typography>
      <Typography
        fontWeight={400}
        fontSize='14px'
        lineHeight='20px'
        color={theme.palette.TwClrTxt}
        component='pre'
        whiteSpace='pre-wrap'
      >
        {strings.TEMPLATE}: {documentTemplate.name}
        <br />
        {strings.LAST_EDITED_BY}: {modifiedByName}, {modifiedTimeDisplay}
      </Typography>
    </Box>
  );
};

export default DocumentMetadata;

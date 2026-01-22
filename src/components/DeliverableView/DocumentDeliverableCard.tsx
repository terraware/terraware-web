import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import DeliverableDocumentsList from './DeliverableDocumentsList';
import DocumentDeliverableStatusMessage from './DocumentDeliverableStatusMessage';
import DocumentLimitReachedMessage from './DocumentLimitReachedMessage';
import DocumentsUploader from './DocumentsUploader';
import Metadata from './Metadata';
import { EditProps, ViewProps } from './types';

const MAX_FILES_LIMIT = 15;

const DocumentDeliverableCard = (props: EditProps): JSX.Element => {
  const { ...viewProps }: ViewProps = props;

  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const documentLimitReached = useMemo(
    () => viewProps.deliverable.documents.length >= MAX_FILES_LIMIT,
    [viewProps.deliverable.documents.length]
  );

  const columns: TableColumnType[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              key: 'name',
              name: strings.DOCUMENT_NAME,
              type: 'string',
            },
            {
              key: 'description',
              name: strings.DESCRIPTION,
              type: 'string',
            },
            {
              key: 'createdTime',
              name: strings.DATE_UPLOADED,
              type: 'date',
            },
          ]
        : [],
    [activeLocale]
  );

  return (
    <Box display='flex' flexDirection='column' flexGrow={1} overflow={'auto'}>
      <DocumentDeliverableStatusMessage {...viewProps} />
      {documentLimitReached && <DocumentLimitReachedMessage maxFiles={MAX_FILES_LIMIT} />}
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Metadata {...viewProps} />
        <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
          {strings.DOCUMENTS}
        </Typography>
        {!documentLimitReached && (
          <DocumentsUploader
            {...viewProps}
            deliverableStatusesToIgnore={['Not Submitted', 'In Review', 'Needs Translation']}
            maxFiles={MAX_FILES_LIMIT}
          />
        )}
        <DeliverableDocumentsList columns={columns} {...viewProps} />
      </Card>
    </Box>
  );
};

export default DocumentDeliverableCard;

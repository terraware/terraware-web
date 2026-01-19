import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import DeliverableDocumentsList from 'src/components/DeliverableView/DeliverableDocumentsList';
import DocumentsUploader from 'src/components/DeliverableView/DocumentsUploader';
import Metadata from 'src/components/DeliverableView/Metadata';
import { EditProps } from 'src/components/DeliverableView/types';
import Card from 'src/components/common/Card';
import { useLocalization, useOrganization, useUser } from 'src/providers';
import strings from 'src/strings';

const columns = (activeLocale: string | null): TableColumnType[] =>
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
          key: 'link',
          name: strings.LINK,
          type: 'string',
        },
        {
          key: 'projectName',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'createdTime',
          name: strings.DATE_UPLOADED,
          type: 'date',
        },
      ]
    : [];

const DocumentDeliverableCard = (props: EditProps): JSX.Element => {
  const { ...viewProps }: EditProps = props;

  const { activeLocale } = useLocalization();
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();

  const canCreateSubmission = isAllowed('CREATE_SUBMISSION', { organization: selectedOrganization });

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Metadata {...viewProps} />
      <Typography marginBottom={theme.spacing(2)} fontSize='20px' lineHeight='28px' fontWeight={600}>
        {strings.DOCUMENTS}
      </Typography>
      {canCreateSubmission && (
        <DocumentsUploader {...viewProps} deliverableStatusesToIgnore={['Not Submitted', 'In Review']} />
      )}
      <DeliverableDocumentsList {...viewProps} columns={columns(activeLocale)} />
    </Card>
  );
};

export default DocumentDeliverableCard;

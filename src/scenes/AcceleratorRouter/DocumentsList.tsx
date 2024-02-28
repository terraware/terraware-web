import React from 'react';
import strings from 'src/strings';
import { useLocalization } from 'src/providers';
import { TableColumnType } from 'src/components/common/table/types';
import { default as SharedDocumentsList } from 'src/components/DeliverableView/DocumentsList';
import { ViewProps } from 'src/components/DeliverableView/types';

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
        // TODO this might need to be changed up if the link isn't full formed in the BE response
        {
          key: 'link',
          name: strings.LINK,
          type: 'string',
        },
        {
          key: 'project_name',
          name: strings.PROJECT,
          type: 'string',
        },
        {
          key: 'dateUploaded',
          name: strings.DATE_UPLOADED,
          type: 'string',
        },
      ]
    : [];

const DocumentsList = (props: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();

  return <SharedDocumentsList columns={columns(activeLocale)} isAcceleratorConsole {...props} />;
};

export default DocumentsList;

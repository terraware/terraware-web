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
        {
          key: 'dateUploaded',
          name: strings.DATE_UPLOADED,
          type: 'string',
        },
      ]
    : [];

const DocumentsList = (props: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();

  return <SharedDocumentsList columns={columns(activeLocale)} {...props} />;
};

export default DocumentsList;

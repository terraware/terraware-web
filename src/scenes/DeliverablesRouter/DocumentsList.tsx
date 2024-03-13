import React from 'react';

import { default as SharedDocumentsList } from 'src/components/DeliverableView/DocumentsList';
import { ViewProps } from 'src/components/DeliverableView/types';
import { TableColumnType } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
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
          key: 'createdTime',
          name: strings.DATE_UPLOADED,
          type: 'date',
        },
      ]
    : [];

const DocumentsList = (props: ViewProps): JSX.Element => {
  const { activeLocale } = useLocalization();

  return <SharedDocumentsList columns={columns(activeLocale)} {...props} />;
};

export default DocumentsList;

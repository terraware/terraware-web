import React from 'react';

import { EditableTable as WebEditableTable } from '@terraware/web-components';
import { EditableTableProps } from '@terraware/web-components/components/EditableTable';
import { MRT_RowData } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { useLocalization } from 'src/providers';

const EditableTable = <TData extends MRT_RowData>(props: EditableTableProps<TData>) => {
  const { activeLocale } = useLocalization();
  const language = activeLocale?.replace(/[-_].*/, '');
  const localization =
    language === 'es'
      ? MRT_Localization_ES
      : language === 'fr' || language === 'gx'
        ? MRT_Localization_FR
        : MRT_Localization_EN;

  return (
    <WebEditableTable
      {...props}
      tableOptions={{
        ...props.tableOptions,
        localization: { ...localization, ...props.tableOptions?.localization },
      }}
    />
  );
};

export default EditableTable;

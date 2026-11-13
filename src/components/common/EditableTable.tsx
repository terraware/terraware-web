import React from 'react';

import { EditableTablePropsV2, EditableTableV2, EditableTable as WebEditableTable } from '@terraware/web-components';
import { EditableTableProps } from '@terraware/web-components/components/EditableTable';
import { MRT_RowData } from 'material-react-table';
import { MRT_Localization_EN } from 'material-react-table/locales/en';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { MRT_Localization_FR } from 'material-react-table/locales/fr';

import { useFeatureEnabled } from 'src/features';
import { useLocalization } from 'src/providers';

type Props<TData extends MRT_RowData> = EditableTableProps<TData> & { v2Props?: EditableTablePropsV2<TData> };

const EditableTable = <TData extends MRT_RowData>({ v2Props, ...props }: Props<TData>) => {
  const useV2 = useFeatureEnabled('Editable Table V2');
  const { activeLocale } = useLocalization();
  const language = activeLocale?.replace(/[-_].*/, '');
  const localization =
    language === 'es'
      ? MRT_Localization_ES
      : language === 'fr' || language === 'gx'
        ? MRT_Localization_FR
        : MRT_Localization_EN;

  return useV2 && v2Props ? (
    <EditableTableV2 {...v2Props} />
  ) : (
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

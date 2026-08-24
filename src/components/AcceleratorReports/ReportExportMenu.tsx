import React, { type JSX, useCallback, useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization } from 'src/providers';

export type ReportExportMenuProps = {
  disabled?: boolean;
  onExport: () => void;
};

const ReportExportMenu = ({ disabled, onExport }: ReportExportMenuProps): JSX.Element => {
  const { strings } = useLocalization();

  const optionItems = useMemo(
    (): DropdownItem[] => [
      {
        disabled,
        label: strings.EXPORT_CSV,
        value: 'exportCsv',
      },
    ],
    [disabled, strings]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'exportCsv') {
        onExport();
      }
    },
    [onExport]
  );

  return (
    <OptionsMenu
      onOptionItemClick={onOptionItemClick}
      optionItems={optionItems}
      size='medium'
      sx={{ '& .button': { margin: '4px' }, marginLeft: 0 }}
    />
  );
};

export default ReportExportMenu;

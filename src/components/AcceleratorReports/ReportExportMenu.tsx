import React, { type JSX, useCallback, useMemo } from 'react';

import { DropdownItem } from '@terraware/web-components';

import OptionsMenu from 'src/components/common/OptionsMenu';
import { useLocalization } from 'src/providers';

export type ReportExportMenuProps = {
  disabled?: boolean;
  /** each action is left out of the menu unless the view supports it */
  onExport?: () => void;
  onPrint?: () => void;
};

const ReportExportMenu = ({ disabled, onExport, onPrint }: ReportExportMenuProps): JSX.Element => {
  const { strings } = useLocalization();

  const optionItems = useMemo(
    (): DropdownItem[] => [
      ...(onExport
        ? [
            {
              disabled,
              label: strings.EXPORT_CSV,
              value: 'exportCsv',
            },
          ]
        : []),
      ...(onPrint
        ? [
            {
              disabled,
              label: strings.PRINT_REPORT,
              value: 'print',
            },
          ]
        : []),
    ],
    [disabled, onExport, onPrint, strings]
  );

  const onOptionItemClick = useCallback(
    (optionItem: DropdownItem) => {
      if (optionItem.value === 'exportCsv') {
        onExport?.();
      } else if (optionItem.value === 'print') {
        onPrint?.();
      }
    },
    [onExport, onPrint]
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

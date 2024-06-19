import React, { useMemo, useState } from 'react';

import { DropdownItem, Tooltip } from '@terraware/web-components';
import PopoverMenu from '@terraware/web-components/components/PopoverMenu/Popover';
import { TableDensityType } from '@terraware/web-components/components/table/types';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import useTableDensity from './useTableDensity';

const TableDensitySettingsButton = () => {
  const { activeLocale } = useLocalization();
  const { tableDensity, setTableDensity } = useTableDensity();

  const saveTableDensity = (newDensity: TableDensityType) => {
    setTableDensity(newDensity);
  };

  const options = useMemo(
    () => [
      {
        label: activeLocale ? strings.DENSITY_COMPACT : '',
        value: 'compact',
      },
      {
        label: activeLocale ? strings.DENSITY_COMFORTABLE : '',
        value: 'comfortable',
      },
      {
        label: activeLocale ? strings.DENSITY_ROOMY : '',
        value: 'roomy',
      },
    ],
    [activeLocale]
  );

  const handleItemSelected = (item: DropdownItem) => {
    saveTableDensity(item.value as TableDensityType);
    handleClose();
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={strings.DENSITY_SETTINGS}>
        <Button
          id='updateTableDensity'
          onClick={(event) => event && handleClick(event)}
          type='passive'
          priority='ghost'
          icon='iconSettings'
        />
      </Tooltip>
      <PopoverMenu
        sections={[options]}
        handleClick={handleItemSelected}
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
        selectedValue={tableDensity}
      />
    </>
  );
};

export default TableDensitySettingsButton;

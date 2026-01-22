import React, { type JSX, useMemo, useState } from 'react';

import { DropdownItem, Tooltip } from '@terraware/web-components';
import PopoverMenu, { Section } from '@terraware/web-components/components/PopoverMenu/Popover';
import { TableDensityType } from '@terraware/web-components/components/table/types';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import useTableDensity from './useTableDensity';

interface Props {
  extraSections?: Section[];
}

export default function TableSettingsButton(props: Props): JSX.Element {
  const { extraSections } = props;
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
    if (options.find((opt) => opt.value === item.value)) {
      saveTableDensity(item.value as TableDensityType);
    } else {
      if (item.onClick) {
        item.onClick();
      }
    }
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
      <Tooltip title={strings.SETTINGS}>
        <Button
          id='updateTableDensity'
          onClick={(event) => event && handleClick(event)}
          type='passive'
          priority='ghost'
          icon='iconSettings'
        />
      </Tooltip>
      <PopoverMenu
        sections={extraSections ? [...extraSections, options] : [options]}
        handleClick={handleItemSelected}
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
        selectedValue={tableDensity}
      />
    </>
  );
}

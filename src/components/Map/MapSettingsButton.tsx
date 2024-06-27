import React, { useMemo, useState } from 'react';

import { DropdownItem, Tooltip } from '@terraware/web-components';
import PopoverMenu from '@terraware/web-components/components/PopoverMenu/Popover';

import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { MapViewStyle } from 'src/types/Map';

export type MapSettingsButtonProp = {
  mapViewStyle: MapViewStyle;
  onChangeMapViewStyle: (style: MapViewStyle) => void;
};

export default function MapSettingsButton({ mapViewStyle, onChangeMapViewStyle }: MapSettingsButtonProp): JSX.Element {
  const { activeLocale } = useLocalization();

  const mapStyleOptions = useMemo<DropdownItem[]>(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      { label: strings.OUTDOORS, value: 'Outdoors' },
      { label: strings.SATELLITE, value: 'Satellite' },
    ];
  }, [activeLocale]);

  const handleItemSelected = (item: DropdownItem) => {
    if (mapStyleOptions.find((opt) => opt.value === item.value)) {
      onChangeMapViewStyle(item.value);
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
        sections={[mapStyleOptions]}
        handleClick={handleItemSelected}
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
        selectedValue={mapViewStyle}
      />
    </>
  );
}

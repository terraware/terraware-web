import React from 'react';

import { Popover } from '@terraware/web-components';

import strings from 'src/strings';

type InsertOptionsDropdownProps = {
  anchorElement: HTMLElement | null;
  setAnchorElement: (anchorEl: HTMLElement | null) => void;
  onSelect: (reference: boolean) => void;
};

export default function InsertOptionsDropdown({
  anchorElement,
  setAnchorElement,
  onSelect,
}: InsertOptionsDropdownProps) {
  const optionItems = [
    { label: strings.REFERENCE, value: 'insert-reference', onClick: () => onSelect(true) },
    { label: strings.VALUE, value: 'insert-value', onClick: () => onSelect(false) },
  ];

  const handleItemClick = () => setAnchorElement(null);

  return (
    <Popover
      sections={[optionItems]}
      handleClick={handleItemClick}
      anchorElement={anchorElement}
      setAnchorElement={setAnchorElement}
    />
  );
}

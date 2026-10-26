import React, { type JSX, useState } from 'react';

import { Box } from '@mui/material';
import { Button, Checkbox, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';
import { EditedCompletedSubstratum } from 'src/utils/plantingSiteMapEditUtils';

export type MarkSubstrataIncompleteModalProps = {
  initialSelectedIds?: number[];
  onCancel: () => void;
  onSave: (substratumIds: number[]) => void;
  substrata: EditedCompletedSubstratum[];
};

export default function MarkSubstrataIncompleteModal({
  initialSelectedIds = [],
  onCancel,
  onSave,
  substrata,
}: MarkSubstrataIncompleteModalProps): JSX.Element {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(initialSelectedIds.filter((id) => substrata.some((substratum) => substratum.id === id)))
  );

  const toggle = (id: number) =>
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });

  return (
    <DialogBox
      onClose={onCancel}
      open={true}
      title={strings.MARK_SUBSTRATA_INCOMPLETE}
      size='medium'
      message={strings.MARK_SUBSTRATA_INCOMPLETE_MESSAGE}
      middleButtons={[
        <Button
          id='cancel-mark-substrata-incomplete'
          key='cancel'
          label={strings.CANCEL}
          onClick={onCancel}
          priority='secondary'
          type='passive'
        />,
        <Button
          id='save-mark-substrata-incomplete'
          key='save'
          label={strings.SAVE_CHANGES}
          onClick={() => onSave([...selectedIds])}
        />,
      ]}
    >
      <Box display='flex' flexDirection='column' textAlign='left' marginTop={2}>
        {substrata.map(({ id, stratumName, substratumName }) => (
          <Checkbox
            id={`mark-substratum-incomplete-${id}`}
            key={id}
            label={`${stratumName}-${substratumName}`}
            name={`mark-substratum-incomplete-${id}`}
            onChange={() => toggle(id)}
            value={selectedIds.has(id)}
          />
        ))}
      </Box>
    </DialogBox>
  );
}

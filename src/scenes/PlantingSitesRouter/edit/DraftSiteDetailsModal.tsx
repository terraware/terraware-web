import React, { type JSX, useCallback, useState } from 'react';

import { Box } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useForm from 'src/utils/useForm';

import DraftSiteDetailsInputForm from './editor/DraftSiteDetailsInputForm';

export type DraftSiteDetailsModalProps = {
  busy: boolean;
  onClose: () => void;
  onSave: (site: DraftPlantingSite) => void;
  onSaveAndClose?: (site: DraftPlantingSite) => void;
  saveLabel: string;
  site: DraftPlantingSite;
  title: string;
};

const DraftSiteDetailsModal = ({
  busy,
  onClose,
  onSave,
  onSaveAndClose,
  saveLabel,
  site,
  title,
}: DraftSiteDetailsModalProps): JSX.Element => {
  const [record, setRecord, onChange] = useForm<DraftPlantingSite>(site);
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>();
  const [isLoadingNames, setIsLoadingNames] = useState(true);

  const validateThen = useCallback(
    (save: (site: DraftPlantingSite) => void) => {
      setOnValidate(() => (hasErrors: boolean) => {
        setOnValidate(undefined);
        if (!hasErrors) {
          save(record);
        }
      });
    },
    [record]
  );

  const handleSave = useCallback(() => validateThen(onSave), [onSave, validateThen]);
  const handleSaveAndClose = useCallback(() => {
    if (onSaveAndClose) {
      validateThen(onSaveAndClose);
    }
  }, [onSaveAndClose, validateThen]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={title}
      size={onSaveAndClose ? 'large' : 'medium'}
      middleButtons={[
        <Button
          disabled={busy}
          id='cancel-draft-site-details'
          key='cancel'
          size='medium'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        ...(onSaveAndClose
          ? [
              <Button
                disabled={busy || isLoadingNames}
                id='save-and-close-draft-site-details'
                key='save-and-close'
                label={strings.SAVE_AND_CLOSE}
                onClick={handleSaveAndClose}
                priority='secondary'
              />,
            ]
          : []),
        <Button
          disabled={busy || isLoadingNames}
          id='save-draft-site-details'
          key='save'
          label={saveLabel}
          onClick={handleSave}
        />,
      ]}
    >
      <Box textAlign='left'>
        <DraftSiteDetailsInputForm
          onChange={onChange}
          onLoadingChange={setIsLoadingNames}
          onValidate={onValidate}
          record={record}
          setRecord={setRecord}
        />
      </Box>
    </DialogBox>
  );
};

export default DraftSiteDetailsModal;

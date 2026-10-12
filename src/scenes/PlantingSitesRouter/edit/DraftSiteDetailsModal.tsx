import React, { type JSX, useCallback, useState } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useForm from 'src/utils/useForm';

import DraftSiteDetailsInputForm from './editor/DraftSiteDetailsInputForm';

export type DraftSiteDetailsModalProps = {
  busy: boolean;
  onClose: () => void;
  onSave: (site: DraftPlantingSite) => void;
  saveLabel: string;
  site: DraftPlantingSite;
  title: string;
};

const DraftSiteDetailsModal = ({
  busy,
  onClose,
  onSave,
  saveLabel,
  site,
  title,
}: DraftSiteDetailsModalProps): JSX.Element => {
  const [record, setRecord, onChange] = useForm<DraftPlantingSite>(site);
  const [onValidate, setOnValidate] = useState<((hasErrors: boolean) => void) | undefined>();

  const handleSave = useCallback(() => {
    setOnValidate(() => (hasErrors: boolean) => {
      setOnValidate(undefined);
      if (!hasErrors) {
        onSave(record);
      }
    });
  }, [onSave, record]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={title}
      size='medium'
      middleButtons={[
        <Button
          disabled={busy}
          id='cancel-draft-site-details'
          key='cancel'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button disabled={busy} id='save-draft-site-details' key='save' label={saveLabel} onClick={handleSave} />,
      ]}
    >
      <DraftSiteDetailsInputForm onChange={onChange} onValidate={onValidate} record={record} setRecord={setRecord} />
    </DialogBox>
  );
};

export default DraftSiteDetailsModal;

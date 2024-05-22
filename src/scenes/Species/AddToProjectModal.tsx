import React, { useCallback, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { MultiSelect } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';
import { Project } from 'src/types/Project';

export interface AddToProjectModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (ids: number[]) => void;
  projects?: Project[];
}

export default function AddToProjectModal(props: AddToProjectModalProps): JSX.Element {
  const { onClose, onSubmit, projects } = props;
  const theme = useTheme();

  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);

  const handleOnAdd = useCallback((value: number) => {
    console.log('value', value);
    setSelectedProjectIds((prev) => [...prev, value]);
  }, []);
  console.log('selectedProjectIds', selectedProjectIds);
  const handleOnRemove = useCallback((value: number) => {
    setSelectedProjectIds((prev) => prev.filter((prevValue) => prevValue !== value));
  }, []);

  const save = () => {
    if (selectedProjectIds.length > 0) {
      onSubmit(selectedProjectIds);
      onClose();
    }
  };

  const options: Map<number, string> = useMemo(
    () => new Map((projects || []).map((project) => [project.id, project.name])),
    [projects]
  );

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_TO_PROJECT}
      size='small'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={() => onClose()}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.ADD} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <MultiSelect<number, string>
            id={'project'}
            label={strings.PROJECT}
            onAdd={handleOnAdd}
            onRemove={handleOnRemove}
            options={options}
            selectedOptions={selectedProjectIds}
            valueRenderer={(value) => value}
            fullWidth
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

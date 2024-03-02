import { useCallback, useMemo, useState } from 'react';
import { Box, CircularProgress, useTheme, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { Deliverable } from 'src/types/Deliverables';
import { useAppDispatch } from 'src/redux/store';
import { requestGetDeliverable } from 'src/redux/features/deliverables/deliverablesAsyncThunks';
import useUpdateDeliverable from 'src/scenes/AcceleratorRouter/useUpdateDeliverable';

const useStyles = makeStyles((theme: Theme) => ({
  description: {
    marginTop: theme.spacing(2),
  },
  spinner: {
    height: '100px',
    width: '100px',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    '& .MuiCircularProgress-svg': {
      color: theme.palette.TwClrIcnBrand,
      height: '100px',
      width: '100px',
    },
  },
}));

export type FileUploadDialogProps = {
  deliverable: Deliverable;
  files: File[];
  onClose: () => void;
};

export default function FileUploadDialog({ deliverable, files, onClose }: FileUploadDialogProps): JSX.Element {
  const [busy, setBusy] = useState<boolean>(false);
  const [validate, setValidate] = useState<boolean>(false);
  const [description, setDescription] = useState<string[]>(files.map((_) => ''));
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { update } = useUpdateDeliverable();

  const submit = useCallback(() => {
    setValidate(true);
    if (description.some((d) => !d.trim())) {
      return;
    }
    setBusy(true);
    update({ ...deliverable, status: 'In Review' });
    setTimeout(() => {
      // mock api latency
      dispatch(requestGetDeliverable(deliverable.id));
      onClose();
    }, 3000);
  }, [deliverable, description, dispatch, onClose, update]);

  const changeDescription = (index: number, val: string) => {
    setDescription((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const blockStyle = useMemo<Record<string, string | number>>(
    () => ({
      borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      marginBottom: theme.spacing(3),
      paddingBottom: theme.spacing(3),
    }),
    [theme]
  );

  return (
    <DialogBox
      onClose={() => !busy && onClose()}
      open={true}
      middleButtons={[
        <Button
          disabled={busy}
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button
          disabled={busy}
          id='submit'
          key='button-2'
          label={strings.SUBMIT}
          onClick={submit}
          priority='primary'
        />,
      ]}
      scrolled
      size='large'
      title={strings.SUBMIT_DOCUMENT}
    >
      <Box display='flex' flexDirection='column'>
        {busy && <CircularProgress className={classes.spinner} size='100' />}
        {files.map((file, index) => (
          <Box key={`${file.name}_${index}`} textAlign='left' sx={index < files.length - 1 ? blockStyle : {}}>
            <Textfield display id={`name_${index}`} label={strings.FILE_NAME} type='text' value={file.name} />
            <Textfield
              className={classes.description}
              errorText={validate && !description[index] ? strings.REQUIRED_FIELD : ''}
              id={`description_${index}`}
              label={strings.DESCRIPTION}
              onChange={(val) => changeDescription(index, val as string)}
              required
              type='text'
              value={description[index]}
            />
          </Box>
        ))}
      </Box>
    </DialogBox>
  );
}

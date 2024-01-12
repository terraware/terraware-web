import { useEffect } from 'react';
import { Box, useTheme, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button } from '@terraware/web-components';
import { FeatureCollection } from 'geojson';
import _ from 'lodash';
import useUndoRedoState from 'src/hooks/useUndoRedoState';
import { ReadOnlyBoundary } from 'src/types/Map';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    background: theme.palette.TwClrBaseWhite,
    color: theme.palette.TwClrTxt,
    '&:hover': {
      background: theme.palette.TwClrBaseWhite,
      color: theme.palette.TwClrTxt,
    },
    '&:focus': {
      outline: 'none',
    },
  },
}));

type StackData = {
  editableBoundary?: FeatureCollection;
  readOnlyBoundary?: ReadOnlyBoundary[];
};

export type UndoRedoBoundaryControlProps = {
  editableBoundary?: FeatureCollection;
  onEditableBoundaryChanged?: (editableBoundary?: FeatureCollection) => void;
  onReadOnlyBoundaryChanged?: (readOnlyBoundary?: ReadOnlyBoundary[]) => void;
  readOnlyBoundary?: ReadOnlyBoundary[];
};

const UndoRedoBoundaryControl = ({
  editableBoundary,
  onEditableBoundaryChanged,
  onReadOnlyBoundaryChanged,
  readOnlyBoundary,
}: UndoRedoBoundaryControlProps): JSX.Element => {
  const classes = useStyles();
  const theme = useTheme();
  const [data, setData, undo, redo] = useUndoRedoState<StackData>({ editableBoundary, readOnlyBoundary });

  useEffect(() => {
    const newData: StackData = { editableBoundary, readOnlyBoundary };
    if (!_.isEqual(newData, data)) {
      setData(newData);
    }
  }, [data, editableBoundary, readOnlyBoundary, setData]);

  const onUndo = () => {
    if (!undo) {
      return;
    }
    onUpdate(undo());
  };

  const onRedo = () => {
    if (!redo) {
      return;
    }
    onUpdate(redo());
  };

  const onUpdate = (stackData?: StackData) => {
    if (onEditableBoundaryChanged && !_.isEqual(editableBoundary, stackData?.editableBoundary)) {
      onEditableBoundaryChanged(stackData?.editableBoundary);
    }

    if (onReadOnlyBoundaryChanged && !_.isEqual(readOnlyBoundary, stackData?.readOnlyBoundary)) {
      onReadOnlyBoundaryChanged(stackData?.readOnlyBoundary);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '10px',
        right: '45px',
        zIndex: 10,
        height: 28,
        backgroundColor: `${theme.palette.TwClrBaseWhite}`,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Button className={classes.button} icon='iconUndo' onClick={onUndo} disabled={!undo} />
      <Box width='1px' height='20px' border={`1px solid ${theme.palette.TwClrBgTertiary}`} />
      <Button className={classes.button} icon='iconRedo' onClick={onRedo} disabled={!redo} />
    </Box>
  );
};

export default UndoRedoBoundaryControl;

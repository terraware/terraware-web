import { Grid } from '@mui/material';

export type Props = {
  leftChild?: React.ReactNode;
  rightChild?: React.ReactNode;
  style?: Record<string, string | number>;
};

const VoteRowGrid = ({ leftChild, rightChild, style }: Props): JSX.Element => {
  return (
    <Grid alignItems='center' display='flex' flexDirection='row' flexGrow={1} sx={style}>
      <Grid item xs={4}>
        {leftChild}
      </Grid>
      <Grid item xs={8}>
        {rightChild}
      </Grid>
    </Grid>
  );
};

export default VoteRowGrid;

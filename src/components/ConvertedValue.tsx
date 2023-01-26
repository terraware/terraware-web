import { Box, Typography } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import strings from 'src/strings';
import { convertValue } from 'src/units';

type ConvertedValueProps = {
  quantity: number;
  unit: string;
  isEstimated?: boolean;
};

export default function ConvertedValue(props: ConvertedValueProps): JSX.Element {
  const { quantity, unit, isEstimated } = props;
  return (
    <Box display='flex'>
      <Typography>
        {isEstimated && '~'} {convertValue(quantity, unit)}
      </Typography>
      <IconTooltip title={strings.CONVERTED_VALUE_INFO} />
    </Box>
  );
}

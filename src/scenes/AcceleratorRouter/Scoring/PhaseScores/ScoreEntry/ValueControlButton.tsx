import { Button, useTheme } from '@mui/material';

import { ScoreValue, getScoreColors, getScoreValue } from 'src/types/Score';

type ScoreControlButtonProps = {
  disabled?: boolean;
  onChangeValue?: (value: ScoreValue) => void;
  selected: boolean;
  value: ScoreValue;
};

const ValueControlButton = ({ disabled, onChangeValue, selected, value }: ScoreControlButtonProps) => {
  const theme = useTheme();

  const scoreColors = getScoreColors(value, theme);
  const label = getScoreValue(value);

  const handleOnClick = () => {
    onChangeValue?.(value);
  };

  return (
    <Button
      disabled={disabled}
      onClick={handleOnClick}
      sx={{
        backgroundColor: selected ? scoreColors.background : theme.palette.TwClrBg,
        borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
        borderRadius: '8px',
        borderWidth: '2px',
        color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
        height: 48,
        margin: '4px',
        minWidth: '48px',
        width: 48,
        '&:hover': {
          backgroundColor: selected ? scoreColors.background : undefined,
          borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
          borderWidth: '2px',
          color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
        },
        '&.Mui-disabled': {
          borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
          borderWidth: '2px',
          color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
          opacity: selected ? 1 : 0.5,
        },
      }}
      variant='outlined'
    >
      {label}
    </Button>
  );
};

export default ValueControlButton;

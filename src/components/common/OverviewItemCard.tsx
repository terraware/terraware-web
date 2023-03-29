import { Box, Typography, useTheme } from '@mui/material';
import { Button, Tooltip, IconTooltip } from '@terraware/web-components';
import useDeviceInfo from '../../utils/useDeviceInfo';
import strings from 'src/strings';

type OverviewItemCardProps = {
  isEditable: boolean;
  hideEditIcon?: boolean;
  onClick?: () => void;
  handleEdit?: () => void;
  title: string;
  titleInfoTooltip?: React.ReactNode;
  contents: JSX.Element | string | null;
  className?: string;
};

export default function OverviewItemCard({
  isEditable,
  hideEditIcon,
  onClick,
  handleEdit,
  title,
  titleInfoTooltip,
  contents,
  className,
}: OverviewItemCardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      className={className}
      sx={{
        alignItems: 'flex-start',
        backgroundColor: `${theme.palette.TwClrBg}`,
        borderRadius: '24px',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        padding: theme.spacing(3),
        width: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexBasis: 'fit-content',
        }}
      >
        <Typography
          sx={{
            color: theme.palette.TwClrTxtSecondary,
            fontSize: '14px',
            fontWeight: 400,
            marginBottom: theme.spacing(1),
          }}
        >
          {title} {titleInfoTooltip && <IconTooltip title={titleInfoTooltip} />}
        </Typography>
        <Box
          sx={{
            alignItems: isMobile ? 'flex-start' : 'center',
            color: theme.palette.TwClrTxt,
            display: 'flex',
            fontSize: '16px',
            fontWeight: 500,
            justifyContent: isMobile ? 'space-between' : 'normal',
            lineHeight: '24px',
            width: '100%',
          }}
        >
          {contents}
        </Box>
      </Box>
      {isEditable && !hideEditIcon ? (
        <Box sx={{ marginLeft: 1, position: 'relative', top: '-8px', right: '-8px' }}>
          <Tooltip title={strings.EDIT}>
            <Button
              onClick={() => isEditable && handleEdit && handleEdit()}
              icon='iconEdit'
              type='passive'
              priority='ghost'
              size='small'
            />
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ marginLeft: 1, height: '16px', width: 2 }} />
      )}
    </Box>
  );
}

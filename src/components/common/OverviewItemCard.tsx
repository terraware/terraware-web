import { Box, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon, IconTooltip } from '@terraware/web-components';
import useDeviceInfo from '../../utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  editIcon: {
    display: 'none',
    fill: theme.palette.TwClrIcn,
  },
}));

type OverviewItemCardProps = {
  isEditable: boolean;
  hideEditIcon?: boolean;
  onClick?: () => void;
  title: string;
  titleInfoTooltip?: React.ReactNode;
  contents: JSX.Element | string | null;
  className?: string;
};

export default function OverviewItemCard({
  isEditable,
  hideEditIcon,
  onClick,
  title,
  titleInfoTooltip,
  contents,
  className,
}: OverviewItemCardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

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
        '&:hover': {
          backgroundColor: `${isEditable && theme.palette.TwClrBgGhostHover}`,
        },
        '&:hover .edit-icon': {
          display: 'block',
          position: 'absolute',
        },
        '.edit-icon': {
          display: isMobile ? 'block' : 'none',
          position: 'absolute',
        },
        cursor: isEditable ? 'pointer' : 'auto',
      }}
      onClick={() => isEditable && onClick && onClick()}
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
        <Box sx={{ marginLeft: 1, height: '16px', width: '16px' }}>
          <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
        </Box>
      ) : (
        <Box sx={{ marginLeft: 1, height: '16px', width: 2 }} />
      )}
    </Box>
  );
}

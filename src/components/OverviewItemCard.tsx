import { Box, IconButton, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Icon } from '@terraware/web-components';
import useDeviceInfo from '../utils/useDeviceInfo';

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
  contents: JSX.Element | string | null;
};

export default function OverviewItemCard({
  isEditable,
  hideEditIcon,
  onClick,
  title,
  contents,
}: OverviewItemCardProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  return (
    <Box
      sx={{
        alignItems: 'flex-start',
        backgroundColor: `${theme.palette.TwClrBg}`,
        borderRadius: '16px',
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
          {title}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: isMobile ? 'space-between' : 'normal',
            width: '100%',
          }}
        >
          <Box
            sx={{
              color: theme.palette.TwClrTxt,
              fontSize: '16px',
              fontWeight: 600,
              lineHeight: '24px',
            }}
          >
            {contents}
          </Box>
        </Box>
      </Box>
      {isEditable && !hideEditIcon ? (
        <IconButton sx={{ marginLeft: 1, height: '24px', width: '24px' }}>
          <Icon name='iconEdit' className={`${classes.editIcon} edit-icon`} />
        </IconButton>
      ) : (
        <Box sx={{ marginLeft: 1, height: '24px', width: 2 }} />
      )}
    </Box>
  );
}

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';
import { useCallback } from 'react';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

type DeliverableStatusBadgeProps = {
  status: DeliverableStatusType;
};

const DeliverableStatusBadge = (props: DeliverableStatusBadgeProps): JSX.Element | undefined => {
  const { status } = props;
  const theme = useTheme();

  const getBadgePropsForStatus = useCallback((): BadgeProps => {
    let badgeProps: BadgeProps;

    switch (status) {
      case 'Approved':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.APPROVED,
        };
        break;
      case 'In Review':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.APPROVED,
        };
        break;
      case 'Needs Translation':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.APPROVED,
        };
        break;
      case 'Not Needed':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_NEEDED,
        };
        break;
      case 'Not Submitted':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_SUBMITTED,
        };
        break;
      case 'Rejected':
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.REJECTED,
        };
        break;
      default:
        badgeProps = {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: status,
        };
    }

    return badgeProps;
  }, [status, theme]);

  return (
    <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
      <Badge {...getBadgePropsForStatus()} />
    </div>
  );
};

export default DeliverableStatusBadge;

import { useTheme } from '@mui/material';
import { Badge } from '@terraware/web-components';
import { BadgeProps } from '@terraware/web-components/components/Badge';
import { useMemo } from 'react';
import { useLocalization } from 'src/providers/hooks';
import strings from 'src/strings';
import { DeliverableStatusType } from 'src/types/Deliverables';

type DeliverableStatusBadgeProps = {
  status: DeliverableStatusType;
};

const DeliverableStatusBadge = (props: DeliverableStatusBadgeProps): JSX.Element => {
  const { status } = props;
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const badgeProps = useMemo((): BadgeProps | undefined => {
    if (!activeLocale) {
      return undefined;
    }

    switch (status) {
      case 'Approved':
        return {
          backgroundColor: theme.palette.TwClrBgSuccessTertiary,
          borderColor: theme.palette.TwClrBrdrSuccess,
          labelColor: theme.palette.TwClrTxtSuccess,
          label: strings.APPROVED,
        };
      case 'In Review':
        return {
          backgroundColor: theme.palette.TwClrBgWarningTertiary,
          borderColor: theme.palette.TwClrBrdrWarning,
          labelColor: theme.palette.TwClrTxtWarning,
          label: strings.APPROVED,
        };
      case 'Needs Translation':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.APPROVED,
        };
      case 'Not Needed':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_NEEDED,
        };
      case 'Not Submitted':
        return {
          backgroundColor: theme.palette.TwClrBgInfoTertiary,
          borderColor: theme.palette.TwClrBrdrInfo,
          labelColor: theme.palette.TwClrTxtInfo,
          label: strings.NOT_SUBMITTED,
        };
      case 'Rejected':
        return {
          backgroundColor: theme.palette.TwClrBgDangerTertiary,
          borderColor: theme.palette.TwClrBrdrDanger,
          labelColor: theme.palette.TwClrTxtDanger,
          label: strings.REJECTED,
        };
      default:
        return undefined;
    }
  }, [activeLocale, status, theme]);

  return (
    <>
      {activeLocale && badgeProps ? (
        <div style={{ float: 'right', marginBottom: '0px', marginLeft: '16px' }}>
          <Badge {...badgeProps} />
        </div>
      ) : undefined}
    </>
  );
};

export default DeliverableStatusBadge;

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import { leaveOrganization } from 'src/api/organization/organization';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import snackbarAtom from 'src/state/snackbar';
import { APP_PATHS } from '../constants';
import { useHistory } from 'react-router';
import { User } from 'src/types/User';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(4),
    },
    container: {
      textAlign: 'center',
    },
    title: {
      padding: theme.spacing(6, 6, 1, 6),
      '& h2': {
        fontSize: '20px',
        fontWeight: 600,
      },
    },
  })
);

export type LeaveOrganizationModalProps = {
  open: boolean;
  onCancel: () => void;
  reloadOrganizationData: (selectedOrgId?: number) => void;
  organization: ServerOrganization;
  user: User;
};

export default function LeaveOrganizationModal(props: LeaveOrganizationModalProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { onCancel, open, reloadOrganizationData, organization } = props;
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const leaveOrganizationHandler = async () => {
    const response = await leaveOrganization(organization.id, 3);
    if (response.requestSucceeded) {
      setSnackbar({
        type: 'page',
        priority: 'success',
        title: strings.formatString(strings.ORGANIZATION_LEFT, organization.name),
        msg: strings.ORGANIZATION_CREATED_MSG,
      });
      reloadOrganizationData();
      history.push({ pathname: APP_PATHS.HOME });
    } else {
      setSnackbar({
        type: 'page',
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      });
    }
    onCancel();
  };

  return (
    <Dialog onClose={onCancel} disableEscapeKeyDown open={open} maxWidth='sm' className={classes.container}>
      <DialogTitle className={classes.title}>
        {strings.formatString(strings.LEAVE_ORGANIZATION_MODAL_TITLE, organization.name)}
        <DialogCloseButton onClick={onCancel} />
      </DialogTitle>
      <DialogContent>{strings.LEAVE_ORGANIZATION_MODAL_DESC}</DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onCancel} label={strings.CANCEL} priority='secondary' type='passive' />
        <Button onClick={leaveOrganizationHandler} label={strings.LEAVE} type='destructive' />
      </DialogActions>
    </Dialog>
  );
}

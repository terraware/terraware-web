import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { OrganizationUser } from 'src/types/User';
import { Site } from 'src/types/Organization';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      textAlign: 'center',
      padding: theme.spacing(6, 6, 2, 6),
    },
    actions: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(4),
    },
    content: {
      textAlign: 'center',
    },
  })
);

export interface RemovePeopleOrSitesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  removedPeople?: OrganizationUser[];
  removedSites?: Site[];
}

export default function RemovePeopleOrSitesDialog(props: RemovePeopleOrSitesDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit, removedPeople, removedSites } = props;

  const removedPeopleNames = removedPeople?.map((person) => (person.firstName ? person.firstName : person.email));
  const removedSitesNames = removedSites?.map((site) => site.name);
  const onlyPeopleRemoved = removedPeople?.length && !removedSites?.length;
  const onlySitesRemoved = !removedPeople?.length && removedSites?.length;
  const peopleAndSitesRemoved = removedPeople?.length && removedSites?.length;
  return (
    <Dialog onClose={() => onClose()} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle className={classes.title}>
        {!!onlyPeopleRemoved && <Typography variant='h6'>{strings.REMOVED_PEOPLE_WARNING}</Typography>}
        {!!onlySitesRemoved && <Typography variant='h6'>{strings.REMOVED_SITES_WARNING}</Typography>}
        {!!peopleAndSitesRemoved && <Typography variant='h6'>{strings.REMOVED_PEOPLE_AND_SITES_WARNING}</Typography>}
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent className={classes.content}>
        {!!onlyPeopleRemoved && (
          <p>
            {strings.REMOVED_PEOPLE_WARNING_DESC} {removedPeopleNames?.join(', ')}
          </p>
        )}
        {!!onlySitesRemoved && (
          <p>
            {strings.REMOVED_SITES_WARNING_DESC} {removedSitesNames?.join(', ')}
          </p>
        )}
        {!!peopleAndSitesRemoved && !!removedPeopleNames && !!removedSitesNames && (
          <p>
            {strings.formatString(
              strings.REMOVED_PEOPLE_AND_SITES_WARNING_DESC,
              removedPeopleNames.join(', '),
              removedSitesNames.join(', ')
            )}
          </p>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.REMOVE_AND_SAVE} type='destructive' onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}

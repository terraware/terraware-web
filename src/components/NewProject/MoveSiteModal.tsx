import { Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import strings from 'src/strings';
import DialogCloseButton from '../common/DialogCloseButton';
import Button from '../common/button/Button';
import { Project, Site } from 'src/types/Organization';
import Select from '../common/Select/Select';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    moveSiteModal: {
      '& .MuiDialog-scrollPaper': {
        '& .MuiDialog-paper': {
          overflow: 'visible',
        },
      },
    },
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
      margin: '0 auto',
      overflow: 'visible',
    },
  })
);

export interface MoveSiteDialogProps {
  open: boolean;
  onClose: () => void;
  selectedSites?: Site[];
  orgProjects?: Project[];
  saveSites: (modifiedSites: Site[]) => void;
}

export default function MoveSiteDialog(props: MoveSiteDialogProps): JSX.Element {
  const classes = useStyles();
  const [modifiedSites, setModifiedSites] = useState<Site[]>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const { onClose, open, orgProjects, selectedSites, saveSites } = props;

  useEffect(() => {
    if (selectedSites && selectedSites.length > 0) {
      const originalProjectId = selectedSites[0].projectId;
      setSelectedProject(orgProjects?.find((proj) => proj.id === originalProjectId));
    }
  }, [selectedSites, orgProjects]);

  const onSubmit = () => {
    if (modifiedSites) {
      saveSites(modifiedSites);
    }
    onClose();
  };

  const onChangeHandler = (selectedProjectOpt: string) => {
    if (selectedSites) {
      const newProject = orgProjects?.find((project) => project.name === selectedProjectOpt);
      if (newProject) {
        setSelectedProject(newProject);
        setModifiedSites(
          selectedSites.map((site) => {
            return { ...site, projectId: newProject.id };
          })
        );
      }
    }
  };
  return (
    <Dialog onClose={() => onClose()} disableEscapeKeyDown open={open} maxWidth='sm' className={classes.moveSiteModal}>
      <DialogTitle className={classes.title}>
        <Typography variant='h6'>{strings.REASSIGN_SITE_TITLE}</Typography>
        <DialogCloseButton onClick={onClose} />
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Select
          options={orgProjects?.map((project) => project.name)}
          onChange={onChangeHandler}
          selectedValue={selectedProject?.name}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />
        <Button label={strings.REMOVE_AND_SAVE} type='destructive' onClick={onSubmit} />
      </DialogActions>
    </Dialog>
  );
}

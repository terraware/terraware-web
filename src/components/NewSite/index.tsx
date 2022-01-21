import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { Site, ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import FormBottomBar from '../common/FormBottomBar';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(7),
      marginBottom: theme.spacing(6),
      background: '#ffffff',
    },
    backIcon: {
      fill: '#007DF2',
      marginRight: theme.spacing(1),
    },
    back: {
      display: 'flex',
      textDecoration: 'none',
      color: '#0067C8',
      fontSize: '20px',
      alignItems: 'center',
    },
    label: {
      color: '#5C6B6C',
      lineHeight: '20px',
      fontFamily: '"Inter", sans-serif',
    },
  })
);

type SiteViewProps = {
  organization: ServerOrganization;
};

export default function SiteView({ organization }: SiteViewProps): JSX.Element {
  const [nameError, setNameError] = useState('');
  const [record, , onChange] = useForm<Site>({ name: '', id: -1, projectId: -1 });
  const history = useHistory();
  const setSnackbar = useSetRecoilState(snackbarAtom);

  const classes = useStyles();

  const onChangeProject = (newProject: string) => {
    const newSelectedProject = organization?.projects?.find((project) => project.name === newProject);
    if (newSelectedProject) {
      onChange('projectId', newSelectedProject.id);
    }
  };

  const goToSites = () => {
    const sitesLocation = {
      pathname: `/sites`,
    };
    history.push(sitesLocation);
  };

  const saveSite = () => {
    if (record.name === '') {
      setNameError('Required Field');
    } else {
      // We can uncomment this once the backend functionality is in place
      // const response = await createSite(record);
      // if (response.requestSucceeded) {
      setSnackbar({
        type: 'success',
        msg: 'Project added',
      });
      // We can uncomment this once the backend functionality is in place
      // } else {
      //   setSnackbar({
      //     type: 'delete',
      //     msg: strings.GENERIC_ERROR,
      //   });
      // }
      goToSites();
    }
  };

  const findProjectById = (projectId: number) => {
    const foundProject = organization?.projects?.find((project) => project.id === projectId);
    return foundProject?.name;
  };

  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <>
              <h2>{strings.ADD_SITE}</h2>
              <p>{strings.ADD_SITE_DESC}</p>
            </>
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='name'
              label={strings.NAME}
              type='text'
              onChange={onChange}
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField id='description' label={strings.DESCRIPTION} type='textarea' onChange={onChange} />
          </Grid>
          <Grid item xs={4}>
            <Select
              id='projectId'
              label={strings.PROJECT}
              onChange={onChangeProject}
              options={organization.projects?.map((project) => project.name)}
              selectedValue={record.projectId ? findProjectById(record.projectId) : ''}
            />
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToSites} onSave={saveSite} />
    </>
  );
}

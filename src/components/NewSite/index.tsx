import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { ServerOrganization, Site } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import FormBottomBar from '../common/FormBottomBar';
import { getAllSitesWithProjectName, getOrganizationProjects } from 'src/utils/organization';
import { createSite, updateSite } from 'src/api/site/site';

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
  reloadOrganizationData: () => void;
};

export default function SiteView({ organization, reloadOrganizationData }: SiteViewProps): JSX.Element {
  const [nameError, setNameError] = useState('');

  const [record, setRecord, onChange] = useForm<Site>({ name: '', id: -1, projectId: -1 });
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const { siteId } = useParams<{ siteId: string }>();
  const [selectedSite, setSelectedSite] = useState<Site | null>();
  const history = useHistory();

  const classes = useStyles();

  useEffect(() => {
    const sites = getAllSitesWithProjectName(organization);
    setSelectedSite(sites.find((site) => site.id === parseInt(siteId, 10)));
  }, [siteId, organization]);

  useEffect(() => {
    setRecord({
      name: selectedSite?.name || '',
      description: selectedSite?.description,
      projectId: selectedSite?.projectId || -1,
      id: -1,
    });
  }, [selectedSite, setRecord]);

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

  const saveSite = async () => {
    if (record.name === '') {
      setNameError('Required Field');
    } else {
      if (selectedSite) {
        const response = await updateSite({ ...record, id: selectedSite.id } as Site);
        if (response.requestSucceeded) {
          reloadOrganizationData();
          setSnackbar({
            type: 'success',
            msg: 'Changes saved',
          });
        } else {
          setSnackbar({
            type: 'delete',
            msg: strings.GENERIC_ERROR,
          });
        }
      } else {
        const response = await createSite(record);
        if (response.requestSucceeded) {
          reloadOrganizationData();
          setSnackbar({
            type: 'success',
            msg: 'Site added',
          });
        } else {
          setSnackbar({
            type: 'delete',
            msg: strings.GENERIC_ERROR,
          });
        }
      }
      goToSites();
    }
  };

  const findProjectById = (projectId: number) => {
    const foundProject = organization?.projects?.find((project) => project.id === projectId);
    return foundProject?.name;
  };

  const selectedProject = () => {
    if (record.projectId !== -1) {
      const project = findProjectById(record.projectId);
      if (project) {
        return project;
      }
    }
    if (getOrganizationProjects(organization) && getOrganizationProjects(organization).length) {
      const firstProject = getOrganizationProjects(organization)[0];
      onChange('projectId', firstProject.id);
      return firstProject.name;
    }
    return '';
  };

  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {selectedSite ? (
              <h2>{selectedSite?.name}</h2>
            ) : (
              <>
                <h2>{strings.ADD_SITE}</h2>
                <p>{strings.ADD_SITE_DESC}</p>
              </>
            )}
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
              options={getOrganizationProjects(organization)?.map((project) => project.name)}
              selectedValue={selectedProject()}
            />
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToSites} onSave={saveSite} />
    </>
  );
}

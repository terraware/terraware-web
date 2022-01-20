import { AppBar, Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { Project, ProjectTypes, ServerOrganization, Site } from 'src/types/Organization';
import TfDivisor from '../common/TfDivisor';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationUsers } from 'src/api/organization/organization';
import TextField from '../common/Textfield/Textfield';
import Checkbox from '../common/Checkbox';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import Button from '../common/button/Button';
import { updateProjectUser, createProject, updateProject } from 'src/api/project/project';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import AddPeopleModal from './AddPeopleModal';
import DatePicker from '../common/DatePicker';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { getProjectsById } from 'src/utils/organization';
import Icon from '../common/icon/Icon';
import RemovedPeopleOrSitesModal from './RemovedPeopleOrSitesModal';
import MoveSiteModal from './MoveSiteModal';
import axios from 'axios';

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
    value: {
      fontSize: '16px',
    },
    bottomBar: {
      filter: 'drop-shadow(0px 0px 8px rgba(0, 0, 0, 0.2))',
      background: '#ffffff',
      boxShadow: 'none',
      flexDirection: 'row',
      justifyContent: 'space-between',
      display: 'flex',
      padding: '16px 24px',
      width: 'calc(100% - 200px)',
    },
    titleWithButton: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      color: '#5C6B6C',
      lineHeight: '20px',
      fontFamily: '"Inter", sans-serif',
    },
    datePicker: {
      marginTop: '4px',
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          borderColor: '#708284',
        },
      },
    },
    blockCheckbox: {
      display: 'block',
    },
  })
);

type ProjectViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

const peopleColumns: TableColumnType[] = [
  { key: 'firstName', name: 'First Name', type: 'string' },
  { key: 'lastName', name: 'Last Name', type: 'string' },
  { key: 'email', name: 'Email', type: 'string' },
  { key: 'role', name: 'Role', type: 'string' },
];

const siteColumns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
  { key: 'longitude', name: 'Longitude', type: 'string' },
  { key: 'latitude', name: 'Latitude', type: 'string' },
];

export default function ProjectView({ organization, reloadOrganizationData }: ProjectViewProps): JSX.Element {
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [addPeopleModalOpened, setAddPeopleModalOpened] = useState(false);
  const [removedPeopleModalOpened, setRemovedPeopleModalOpened] = useState(false);
  const [moveSiteModalOpened, setMoveSiteModalOpened] = useState(false);
  const [peopleOnProject, setPeopleOnProject] = useState<OrganizationUser[]>();
  const [sitesOfProject, setSitesOfProject] = useState<Site[]>();
  const [nameError, setNameError] = useState('');
  const { projectId } = useParams<{ projectId: string }>();
  const [projectSelected, setProjectSelected] = useState<Project | null>();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [selectedSitesRows, setSelectedSitesRows] = useState<Site[]>();
  const [removedPeople, setRemovedPeople] = useState<OrganizationUser[]>();
  const [modifiedSites, setModifiedSites] = useState<Site[]>();

  const [newProject, setNewProject, onChange] = useForm<Project>({ id: -1, name: '' });
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const history = useHistory();

  useEffect(() => {
    setNewProject({
      id: projectSelected?.id || -1,
      name: projectSelected?.name || '',
      description: projectSelected?.description,
      startDate: projectSelected?.startDate,
      status: projectSelected?.status,
      types: projectSelected?.types,
    });
  }, [projectSelected, setNewProject, organization]);

  useEffect(() => {
    const projectIdNum = parseInt(projectId, 10);
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
          if (!peopleOnProject) {
            setPeopleOnProject(response.users.filter((person) => person.projectIds.includes(projectIdNum)));
          }
        }
      }
    };
    if (organization) {
      const projects = getProjectsById(organization);
      setProjectSelected(projects.get(projectIdNum));
      const projectSites = projects.get(projectIdNum)?.sites;
      if (projectSites && projectSites.length > 0) {
        setSitesOfProject(projectSites.filter((site) => !modifiedSites?.includes(site)));
      }
      populatePeople();
    }
  }, [organization, projectId, modifiedSites, peopleOnProject]);

  const classes = useStyles();

  const onChangeProjectType = (id: string, value: unknown) => {
    let projectTypes = newProject.types ? [...newProject.types] : undefined;
    if (projectTypes) {
      const index = projectTypes.indexOf(id as ProjectTypes, 0);
      if (index !== -1 && value === false) {
        projectTypes.splice(index, 1);
      }

      if (index === -1 && value === true) {
        projectTypes.push(id as ProjectTypes);
      }
    } else {
      if (value === true) {
        projectTypes = [id as ProjectTypes];
      }
    }
    setNewProject({ ...newProject, types: projectTypes });
  };

  const onChangeStatus = (newStatus: string) => {
    onChange('status', newStatus);
  };

  const isCheckboxChecked = (id: ProjectTypes) => {
    const projectTypes = newProject.types;

    return projectTypes?.includes(id);
  };

  const goToProjects = () => {
    const projectsLocation = {
      pathname: `/projects`,
    };
    history.push(projectsLocation);
  };

  const removeSelectedPeople = () => {
    if (peopleOnProject) {
      const peopleOnProjectCopy = [...peopleOnProject];
      selectedPeopleRows?.forEach((removedPerson) => {
        const index = peopleOnProjectCopy?.indexOf(removedPerson);
        peopleOnProjectCopy.splice(index, 1);
      });

      setPeopleOnProject(peopleOnProjectCopy);
    }
  };

  const moveSelectedSites = () => {
    setMoveSiteModalOpened(true);
  };

  const saveExistingProject = async () => {
    if (projectSelected) {
      const response = await updateProject({ ...newProject, id: projectSelected.id } as Project);
      let allNewPeopleResponsesOk = true;
      let allRemovedPeopleResponsesOk = true;
      peopleOnProject?.forEach(async (person) => {
        if (!person.projectIds.includes(projectSelected.id)) {
          const response = await updateProjectUser(projectSelected.id, person.id, axios.post);
          if (!response.requestSucceeded) {
            allNewPeopleResponsesOk = false;
          }
        }
      });
      removedPeople?.forEach(async (person) => {
        const response = await updateProjectUser(projectSelected.id, person.id, axios.delete);
        if (!response.requestSucceeded) {
          allRemovedPeopleResponsesOk = false;
        }
      });
      if (response.requestSucceeded && allNewPeopleResponsesOk && allRemovedPeopleResponsesOk) {
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
      goToProjects();
    }
  };

  const saveNewProject = async () => {
    const response = await createProject(newProject, organization.id);
    if (response.requestSucceeded) {
      let allPeopleAdded = true;
      peopleOnProject?.forEach(async (person) => {
        if (response.project !== null) {
          const userResponse = await updateProjectUser(response.project.id, person.id, axios.post);
          if (!userResponse.requestSucceeded) {
            allPeopleAdded = false;
          }
        }
      });
      if (allPeopleAdded) {
        setSnackbar({
          type: 'success',
          msg: 'Project added',
        });
      } else {
        setSnackbar({
          type: 'delete',
          msg: strings.GENERIC_ERROR,
        });
      }
      reloadOrganizationData();
    } else {
      setSnackbar({
        type: 'delete',
        msg: strings.GENERIC_ERROR,
      });
    }
    goToProjects();
  };

  const saveProject = async () => {
    if (newProject.name === '') {
      setNameError('Required Field');
    } else {
      if (projectSelected) {
        if (!removedPeopleModalOpened) {
          const originalPeopleOnProject = people?.filter((person) => person.projectIds.includes(projectSelected.id));
          if (originalPeopleOnProject && peopleOnProject) {
            const removedPeopleArray: OrganizationUser[] = [];
            originalPeopleOnProject?.forEach((person) => {
              const found = peopleOnProject?.filter((newPerson) => newPerson.id === person.id);
              if (found?.length === 0) {
                removedPeopleArray.push(person);
              }
            });
            if (removedPeopleArray.length > 0 || (modifiedSites && modifiedSites.length > 0)) {
              setRemovedPeople(removedPeopleArray);
              setRemovedPeopleModalOpened(true);
            } else {
              saveExistingProject();
            }
          }
        } else {
          saveExistingProject();
        }
      } else {
        saveNewProject();
      }
    }
  };

  const getPeopleNotOnProject = () => {
    const allPeopleOnProjectIds = peopleOnProject?.map((person) => person.id);
    return people?.filter((person) => !allPeopleOnProjectIds?.includes(person.id));
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <MoveSiteModal
        open={moveSiteModalOpened}
        onClose={() => setMoveSiteModalOpened(false)}
        selectedSites={selectedSitesRows}
        setNewModifiedSites={setModifiedSites}
        orgProjects={organization.projects}
      />
      <RemovedPeopleOrSitesModal
        open={removedPeopleModalOpened}
        onClose={() => setRemovedPeopleModalOpened(false)}
        onSubmit={saveProject}
        removedPeople={removedPeople}
        removedSites={modifiedSites}
      />
      <AddPeopleModal
        open={addPeopleModalOpened}
        onClose={() => setAddPeopleModalOpened(false)}
        people={getPeopleNotOnProject()}
        peopleOnProject={peopleOnProject}
        setPeopleOnProject={setPeopleOnProject}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          {projectSelected && (
            <Grid item xs={12}>
              <Link id='back' to='/projects' className={classes.back}>
                <Icon name='caretLeft' className={classes.backIcon} />
                {strings.PROJECTS}
              </Link>
            </Grid>
          )}
          <Grid item xs={12}>
            {projectSelected ? (
              <h2>{projectSelected?.name}</h2>
            ) : (
              <>
                <h2>{strings.ADD_PROJECT}</h2>
                <p>{strings.ADD_PROJECT_DESC}</p>
              </>
            )}
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='name'
              label={strings.NAME}
              type='text'
              onChange={onChange}
              value={newProject.name}
              errorText={newProject.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField id='description' label={strings.DESCRIPTION} type='textarea' onChange={onChange} />
          </Grid>
          <Grid item xs={4}>
            <label htmlFor={newProject.startDate} className={classes.label}>
              {strings.START_DATE_OPT}
            </label>
            <DatePicker
              id='startDate'
              value={newProject.startDate}
              onChange={onChange}
              label=''
              aria-label={strings.START_DATE_OPT}
              className={classes.datePicker}
            />
          </Grid>
          <Grid item xs={4}>
            <Select
              id='status'
              label={strings.STATUS_OPT}
              onChange={onChangeStatus}
              options={['Propagating', 'Planting', 'Completed/Monitoring']}
              selectedValue={newProject.status}
            />
          </Grid>
          <Grid item xs={4}>
            <span className={classes.label}>{strings.PROJECT_TYPE_OPT}</span>
            <Checkbox
              id='Native Forest Restoration'
              name='projectType'
              label={strings.NATIVE_FOREST_RESTORATION}
              onChange={onChangeProjectType}
              value={isCheckboxChecked('Native Forest Restoration')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Agroforestry'
              name='projectType'
              label={strings.AGROFORESTRY}
              onChange={onChangeProjectType}
              value={isCheckboxChecked('Agroforestry')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Silvopasture'
              name='projectType'
              label={strings.SILVOPASTURE}
              onChange={onChangeProjectType}
              value={isCheckboxChecked('Silvopasture')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Sustainable Timber'
              name='projectType'
              label={strings.SUSTAINABLE_TIMBER}
              onChange={onChangeProjectType}
              value={isCheckboxChecked('Sustainable Timber')}
              className={classes.blockCheckbox}
            />
          </Grid>
          <Grid item xs={12} />
          <Grid item xs={12}>
            <TfDivisor />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div className={classes.titleWithButton}>
              <h2>{strings.PEOPLE}</h2>
              <Button
                label={strings.ADD_PEOPLE}
                priority='secondary'
                onClick={() => {
                  setAddPeopleModalOpened(true);
                }}
              />
            </div>
            <span>{strings.PEOPLE_DESC}</span>
          </Grid>
          <Grid item xs={12}>
            <Table
              rows={peopleOnProject || []}
              orderBy='name'
              columns={peopleColumns}
              emptyTableMessage='No People to show.'
              showCheckbox={true}
              selectedRows={selectedPeopleRows}
              setSelectedRows={setSelectedPeopleRows}
              showTopBar={true}
              buttonType='destructive'
              buttonText={strings.REMOVE}
              onButtonClick={removeSelectedPeople}
            />
          </Grid>
          <Grid item xs={12} />
        </Grid>
        {projectSelected && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <h2>{strings.SITES}</h2>
              <p>{strings.SITES_DESC}</p>
            </Grid>
            {projectSelected?.sites && (
              <Grid item xs={12}>
                <Table
                  rows={sitesOfProject || []}
                  orderBy='name'
                  columns={siteColumns}
                  showCheckbox={true}
                  showTopBar={true}
                  selectedRows={selectedSitesRows}
                  setSelectedRows={setSelectedSitesRows}
                  buttonType='passive'
                  buttonText={strings.MOVE}
                  onButtonClick={moveSelectedSites}
                />
              </Grid>
            )}
          </Grid>
        )}
      </Container>
      <AppBar
        position='fixed'
        color='primary'
        style={{ top: 'auto', bottom: 0, right: 'auto' }}
        className={classes.bottomBar}
      >
        <Button label='Cancel' onClick={goToProjects} priority='secondary' type='passive' />
        <Button label='Save' onClick={saveProject} />
      </AppBar>
    </MuiPickersUtilsProvider>
  );
}

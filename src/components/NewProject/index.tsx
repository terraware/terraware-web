import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { NewProject, Project, ServerOrganization, Site } from 'src/types/Organization';
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
import { createProject, updateProject } from 'src/api/project/project';
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
    value: {
      fontSize: '16px',
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
};

export default function ProjectView({ organization }: ProjectViewProps): JSX.Element {
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [addPeopleModalOpened, setAddPeopleModalOpened] = useState(false);
  const [removedPeopleModalOpened, setRemovedPeopleModalOpened] = useState(false);
  const [moveSiteModalOpened, setMoveSiteModalOpened] = useState(false);
  const [peopleOnProject, setPeopleOnProject] = useState<OrganizationUser[]>();
  const [sitesOfProject, setSitesOfProject] = useState<Site[]>();
  const [nameError, setNameError] = useState('');
  const { projectId } = useParams<{ projectId: string }>();
  const [projectSelected, setProjectSelected] = useState<Project | null>();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>();
  const [selectedSitesRows, setSelectedSitesRows] = useState<Site[]>();
  const [removedPeople, setRemovedPeople] = useState<OrganizationUser[]>();
  const [newModifiedSites, setNewModifiedSites] = useState<Site[]>();

  const [record, setRecord, onChange] = useForm<NewProject>({ name: '', organizationId: organization?.id });
  const setSnackbar = useSetRecoilState(snackbarAtom);

  useEffect(() => {
    setRecord({
      name: projectSelected?.name,
      description: projectSelected?.description,
      startDate: projectSelected?.startDate,
      status: projectSelected?.status,
      types: projectSelected?.types,
      organizationId: organization?.id,
    });
  }, [projectSelected, setRecord, organization]);

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
        setSitesOfProject(projectSites.filter((site) => !newModifiedSites?.includes(site)));
      }
      populatePeople();
    }
  }, [organization, projectId, newModifiedSites, peopleOnProject]);

  const classes = useStyles();

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

  type ProjectType = 'Native Forest Restoration' | 'Agroforestry' | 'Silvopasture' | 'Sustainable Timber';

  const onChangeProjectType = (id: string, value: unknown) => {
    let projectTypes = record.types ? [...record.types] : undefined;
    if (projectTypes) {
      const index = projectTypes.indexOf(id as ProjectType, 0);
      if (index !== -1 && value === false) {
        projectTypes.splice(index, 1);
      }

      if (index === -1 && value === true) {
        projectTypes.push(id as ProjectType);
      }
    } else {
      if (value === true) {
        projectTypes = [id as ProjectType];
      }
    }
    setRecord({ ...record, types: projectTypes });
  };

  const onChangeStatus = (newStatus: string) => {
    onChange('status', newStatus);
  };

  const isChecked = (id: ProjectType) => {
    const projectTypes = record.types;

    return projectTypes?.includes(id);
  };
  const history = useHistory();

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

  const updateProjectHandler = async () => {
    if (projectSelected) {
      const response = await updateProject({ ...record, id: projectSelected.id } as Project);
      if (response.requestSucceeded) {
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

  const saveProject = async () => {
    if (record.name === '') {
      setNameError('Required Field');
    } else {
      if (projectSelected) {
        if (!removedPeopleModalOpened) {
          const originalPeopleOnProject = people?.filter((person) => person.projectIds.includes(projectSelected.id));
          if (
            (originalPeopleOnProject && peopleOnProject && originalPeopleOnProject.length > peopleOnProject?.length) ||
            (newModifiedSites && newModifiedSites.length > 0)
          ) {
            const removedPeopleArray: OrganizationUser[] = [];
            originalPeopleOnProject?.forEach((person) => {
              const found = peopleOnProject?.filter((newPerson) => newPerson.id === person.id);
              if (found?.length === 0) {
                removedPeopleArray.push(person);
              }
            });
            setRemovedPeople(removedPeopleArray);
            setRemovedPeopleModalOpened(true);
          }
        } else {
          updateProjectHandler();
        }
      } else {
        const response = await createProject(record);
        if (response.requestSucceeded) {
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
        goToProjects();
      }
    }
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <MoveSiteModal
        open={moveSiteModalOpened}
        onClose={() => setMoveSiteModalOpened(false)}
        selectedSites={selectedSitesRows}
        setNewModifiedSites={setNewModifiedSites}
        orgProjects={organization.projects}
      />
      <RemovedPeopleOrSitesModal
        open={removedPeopleModalOpened}
        onClose={() => setRemovedPeopleModalOpened(false)}
        onSubmit={saveProject}
        removedPeople={removedPeople}
        removedSites={newModifiedSites}
      />
      <AddPeopleModal
        open={addPeopleModalOpened}
        onClose={() => setAddPeopleModalOpened(false)}
        people={people}
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
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField id='description' label={strings.DESCRIPTION} type='textarea' onChange={onChange} />
          </Grid>
          <Grid item xs={4}>
            <label htmlFor={record.startDate} className={classes.label}>
              {strings.START_DATE_OPT}
            </label>
            <DatePicker
              id='startDate'
              value={record.startDate}
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
              selectedValue={record.status}
            />
          </Grid>
          <Grid item xs={4}>
            <span className={classes.label}>{strings.PROJECT_TYPE_OPT}</span>
            <Checkbox
              id='Native Forest Restoration'
              name='projectType'
              label={strings.NATIVE_FOREST_RESTORATION}
              onChange={onChangeProjectType}
              value={isChecked('Native Forest Restoration')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Agroforestry'
              name='projectType'
              label={strings.AGROFORESTRY}
              onChange={onChangeProjectType}
              value={isChecked('Agroforestry')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Silvopasture'
              name='projectType'
              label={strings.SILVOPASTURE}
              onChange={onChangeProjectType}
              value={isChecked('Silvopasture')}
              className={classes.blockCheckbox}
            />
            <Checkbox
              id='Sustainable Timber'
              name='projectType'
              label={strings.SUSTAINABLE_TIMBER}
              onChange={onChangeProjectType}
              value={isChecked('Sustainable Timber')}
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
      <FormBottomBar onCancel={goToProjects} onSave={saveProject} />
    </MuiPickersUtilsProvider>
  );
}

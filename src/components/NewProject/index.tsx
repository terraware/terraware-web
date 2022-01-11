import { AppBar, Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import strings from 'src/strings';
import { NewProject, ServerOrganization } from 'src/types/Organization';
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
import { createProject } from 'src/api/project/project';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import AddPeopleModal from './AddPeopleModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      background: '#ffffff',
      height: '100vh',
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
  })
);

type ProjectViewProps = {
  organization: ServerOrganization;
};
export default function ProjectView({ organization }: ProjectViewProps): JSX.Element {
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [addPeopleModalOpened, setAddPeopleModalOpened] = useState(false);
  const [peopleOnProject, setPeopleOnProject] = useState<OrganizationUser[]>();

  const [record, setRecord, onChange] = useForm<NewProject>({ name: '', organizationId: organization?.id });
  const setSnackbar = useSetRecoilState(snackbarAtom);

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
    };
    if (organization) {
      populatePeople();
    }
  }, [organization]);

  const classes = useStyles();

  const peopleColumns: TableColumnType[] = [
    { key: 'firstName', name: 'First Name', type: 'string' },
    { key: 'lastName', name: 'Last Name', type: 'string' },
    { key: 'email', name: 'Email', type: 'string' },
    { key: 'role', name: 'Role', type: 'string' },
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

  const saveProject = async () => {
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
  };

  return (
    <>
      <AddPeopleModal
        open={addPeopleModalOpened}
        onClose={() => setAddPeopleModalOpened(false)}
        people={people}
        peopleOnProject={peopleOnProject}
        setPeopleOnProject={setPeopleOnProject}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h2>{strings.ADD_PROJECT}</h2>
            <p>{strings.ADD_PROJECT_DESC}</p>
          </Grid>
          <Grid item xs={4}>
            <TextField id='name' label={strings.NAME} type='text' onChange={onChange} value={record.name} />
          </Grid>
          <Grid item xs={4}>
            <TextField id='description' label={strings.DESCRIPTION} type='textarea' onChange={onChange} />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='startDate'
              label={strings.START_DATE_OPT}
              type='text'
              iconRight='calendar'
              onChange={onChange}
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
            <p>{strings.PROJECT_TYPE_OPT}</p>
            <Checkbox
              id='Native Forest Restoration'
              name='projectType'
              label={strings.NATIVE_FOREST_RESTORATION}
              onChange={onChangeProjectType}
              value={isChecked('Native Forest Restoration')}
            />
            <Checkbox
              id='Agroforestry'
              name='projectType'
              label={strings.AGROFORESTRY}
              onChange={onChangeProjectType}
              value={isChecked('Agroforestry')}
            />
            <Checkbox
              id='Silvopasture'
              name='projectType'
              label={strings.SILVOPASTURE}
              onChange={onChangeProjectType}
              value={isChecked('Silvopasture')}
            />
            <Checkbox
              id='Sustainable Timber'
              name='projectType'
              label={strings.SUSTAINABLE_TIMBER}
              onChange={onChangeProjectType}
              value={isChecked('Sustainable Timber')}
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
            />
          </Grid>
          <Grid item xs={12} />
        </Grid>
        <Grid container spacing={3}></Grid>
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
    </>
  );
}

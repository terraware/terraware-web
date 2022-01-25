import { AppBar, Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import strings from 'src/strings';
import { Project, ProjectTypes, ServerOrganization, Site } from 'src/types/Organization';
import TfDivisor from '../common/TfDivisor';
import Table from 'src/components/common/table';
import { TableColumnType } from '../common/table/types';
import { OrganizationUser } from 'src/types/User';
import { getOrganizationUsers } from 'src/api/organization/organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import Select from '../common/Select/Select';
import Button from '../common/button/Button';
import { updateProjectUser, createProject, updateProject } from 'src/api/project/project';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import { getProjectsById } from 'src/utils/organization';
import axios from 'axios';
import AddToProjectModal from './AddToProjectModal';

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

type PersonViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

const projectColumns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
  { key: 'site', name: 'Sites', type: 'string' },
  { key: 'people', name: 'People', type: 'string' },
  { key: 'role', name: 'Role', type: 'string' },
];

export default function PersonView({ organization, reloadOrganizationData }: PersonViewProps): JSX.Element {
  const [people, setPeople] = useState<OrganizationUser[]>();
  const [addToProjectModalOpened, setAddToProjectModalOpened] = useState(false);
  const [removedPeopleModalOpened, setRemovedPeopleModalOpened] = useState(false);
  const [peopleOnProject, setPeopleOnProject] = useState<OrganizationUser[]>();
  const [emailError, setEmailError] = useState('');
  const { projectId } = useParams<{ projectId: string }>();
  const [projectSelected, setProjectSelected] = useState<Project | null>();
  const [selectedPeopleRows, setSelectedPeopleRows] = useState<OrganizationUser[]>([]);
  const [removedPeople, setRemovedPeople] = useState<OrganizationUser[]>();
  const [modifiedSites, setModifiedSites] = useState<Site[]>();

  useEffect(() => {
    const populatePeople = async () => {
      if (organization) {
        const response = await getOrganizationUsers(organization);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      }
      populatePeople();
    };
  }, []);

  const [newPerson, setNewPerson, onChange] = useForm<OrganizationUser>({
    id: -1,
    email: '',
    role: 'Contributor',
    projectIds: [-1],
  });
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const history = useHistory();

  const onChangeRole = (newRole: string) => {
    onChange('role', newRole);
  };

  const goToPeople = () => {
    const peopleLocation = {
      pathname: `/people`,
    };
    history.push(peopleLocation);
  };

  return (
    <>
      <AddToProjectModal
        open={addToProjectModalOpened}
        onClose={() => setAddToProjectModalOpened(false)}
        projects={organization.projects}
        people={people}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h2>{strings.ADD_PERSON}</h2>
            <p>{strings.ADD_PERSON_DESC}</p>
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='Email'
              label={strings.EMAIL}
              type='text'
              onChange={onChange}
              value={newPerson.email}
              errorText={newPerson.email ? '' : emailError}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField id='firstName' label={strings.FIRST_NAME} type='text' onChange={onChange} disabled={true} />
          </Grid>
          <Grid item xs={4}>
            <TextField id='lastName' label={strings.LAST_NAME} type='text' onChange={onChange} disabled={true} />
          </Grid>
          <Grid item xs={12}>
            <p>{strings.ROLES_INFO}</p>
            <ul>
              <li>{strings.CONTRIBUTOR_INFO}</li>
              <li>{strings.MANAGER_INFO}</li>
              <li>{strings.ADMIN_INFO}</li>
            </ul>
          </Grid>
          <Grid item xs={4}>
            <Select
              id='role'
              label={strings.ROLE}
              onChange={onChangeRole}
              options={['Contributor', 'Manager', 'Admin']}
              selectedValue={newPerson.role}
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
              <h2>{strings.PROJECTS}</h2>
              <Button
                label={strings.ADD_TO_PROJECT}
                priority='secondary'
                onClick={() => {
                  setAddToProjectModalOpened(true);
                }}
              />
            </div>
            <span>{strings.ADD_TO_PROJECT_DESC}</span>
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
      </Container>
      <AppBar
        position='fixed'
        color='primary'
        style={{ top: 'auto', bottom: 0, right: 'auto' }}
        className={classes.bottomBar}
      >
        <Button label='Cancel' onClick={goToPeople} priority='secondary' type='passive' />
        <Button label='Save' onClick={saveProject} />
      </AppBar>
    </>
  );
}

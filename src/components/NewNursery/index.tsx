import { Container, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import FormBottomBar from '../common/FormBottomBar';
import { Facility } from 'src/api/types/facilities';
import { createFacility, updateFacility } from 'src/api/facility/facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import { getAllNurseries } from 'src/utils/organization';

type SiteViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function NurseryView({ organization, reloadOrganizationData }: SiteViewProps): JSX.Element {
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [record, setRecord, onChange] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Nursery',
    organizationId: organization.id,
    connectionState: 'Not Connected',
  });
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [selectedNursery, setSelectedNursery] = useState<Facility | null>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  useEffect(() => {
    const seedBanks = getAllNurseries(organization);
    setSelectedNursery(seedBanks?.find((sb) => sb?.id === parseInt(nurseryId, 10)));
  }, [nurseryId, organization]);

  useEffect(() => {
    setRecord({
      name: selectedNursery?.name || '',
      description: selectedNursery?.description,
      id: -1,
      organizationId: organization.id,
      type: 'Nursery',
      connectionState: 'Not Connected',
    });
  }, [selectedNursery, setRecord, organization.id]);

  const goToNurseries = () => {
    const nurseriesLocation = {
      pathname: APP_PATHS.NURSERIES,
    };
    history.push(nurseriesLocation);
  };

  const saveNursery = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    if (!record.description) {
      setDescriptionError(strings.REQUIRED_FIELD);
      return;
    }
    const response = selectedNursery
      ? await updateFacility({ ...record, id: selectedNursery.id } as Facility)
      : await createFacility(record);

    if (response.requestSucceeded) {
      reloadOrganizationData();
      snackbar.toastSuccess(selectedNursery ? strings.CHANGES_SAVED : strings.NURSERY_ADDED);
      goToNurseries();
    } else {
      snackbar.toastError();
    }
  };

  return (
    <>
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography fontSize='24px' fontWeight={600} margin={theme.spacing(3, 0)}>
              {selectedNursery ? selectedNursery.name : strings.ADD_NURSERY}
            </Typography>
          </Grid>
          <PageSnackbar />
          <Grid item xs={12}>
            <Typography fontSize='20px' fontWeight={600}>
              {strings.GENERAL}
            </Typography>
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='name'
              label={strings.NAME_REQUIRED}
              type='text'
              onChange={onChange}
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='description'
              label={strings.DESCRIPTION_REQUIRED}
              type='textarea'
              onChange={onChange}
              value={record.description}
              errorText={record.description ? '' : descriptionError}
            />
          </Grid>
        </Grid>
      </Container>
      <FormBottomBar onCancel={goToNurseries} onSave={saveNursery} />
    </>
  );
}

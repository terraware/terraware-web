import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import FormBottomBar from '../common/FormBottomBar';
import { getAllSeedBanks } from 'src/utils/organization';
import { Facility } from 'src/api/types/facilities';
import { createFacility, updateFacility } from 'src/api/facility/facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';

type SiteViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function SeedBankView({ organization, reloadOrganizationData }: SiteViewProps): JSX.Element {
  const theme = useTheme();
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const snackbar = useSnackbar();

  const [record, setRecord, onChange] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Seed Bank',
    organizationId: organization.id,
    connectionState: 'Not Connected',
  });
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility | null>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  useEffect(() => {
    const seedBanks = getAllSeedBanks(organization);
    setSelectedSeedBank(seedBanks?.find((sb) => sb?.id === parseInt(seedBankId, 10)));
  }, [seedBankId, organization]);

  useEffect(() => {
    setRecord({
      name: selectedSeedBank?.name || '',
      description: selectedSeedBank?.description,
      id: -1,
      organizationId: organization.id,
      type: 'Seed Bank',
      connectionState: 'Not Connected',
    });
  }, [selectedSeedBank, setRecord, organization.id]);

  const goToSeedBanks = () => {
    const sitesLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(sitesLocation);
  };

  const saveSeedBank = async () => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return;
    }
    if (!record.description) {
      setDescriptionError(strings.REQUIRED_FIELD);
      return;
    }
    if (selectedSeedBank) {
      const response = await updateFacility({ ...record, id: selectedSeedBank.id } as Facility);
      if (response.requestSucceeded) {
        reloadOrganizationData();
        snackbar.toastSuccess(strings.CHANGES_SAVED);
      } else {
        snackbar.toastError();
      }
    } else {
      const response = await createFacility(record);
      if (response.requestSucceeded) {
        reloadOrganizationData();
        snackbar.toastSuccess(strings.SEED_BANK_ADDED);
      } else {
        snackbar.toastError();
      }
    }
    goToSeedBanks();
  };

  return (
    <TfMain>
      <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {selectedSeedBank ? selectedSeedBank?.name : strings.ADD_SEED_BANK}
        </Typography>
        <PageSnackbar />
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
        }}
      >
        <Grid container spacing={3}>
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
      </Box>
      <FormBottomBar onCancel={goToSeedBanks} onSave={saveSeedBank} />
    </TfMain>
  );
}

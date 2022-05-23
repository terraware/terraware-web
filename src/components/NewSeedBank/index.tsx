import { Container, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import { useSetRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import FormBottomBar from '../common/FormBottomBar';
import { getAllSeedBanks, getSeedBankSite } from 'src/utils/organization';
import { Facility } from 'src/api/types/facilities';
import { createFacility, updateFacility } from 'src/api/facility/facility';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      height: '-webkit-fill-available',
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

export default function SeedBankView({ organization, reloadOrganizationData }: SiteViewProps): JSX.Element {
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const [siteId, setSiteId] = useState<number>();
  const [record, setRecord, onChange] = useForm<Facility>({
    name: '',
    id: -1,
    type: 'Seed Bank',
    siteId: siteId || -1,
  });
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [selectedSeedBank, setSelectedSeedBank] = useState<Facility | null>();
  const history = useHistory();

  const classes = useStyles();

  useEffect(() => {
    const seedBanks = getAllSeedBanks(organization);
    setSelectedSeedBank(seedBanks?.find((sb) => sb?.id === parseInt(seedBankId, 10)));
    const seedBankSite = getSeedBankSite(organization);
    if (seedBankSite) {
      setSiteId(seedBankSite.id);
    }
  }, [seedBankId, organization]);

  useEffect(() => {
    setRecord({
      name: selectedSeedBank?.name || '',
      description: selectedSeedBank?.description,
      id: -1,
      siteId: selectedSeedBank?.siteId || siteId || -1,
      type: 'Seed Bank',
    });
  }, [selectedSeedBank, setRecord, siteId]);

  const goToSeedBanks = () => {
    const sitesLocation = {
      pathname: APP_PATHS.SEED_BANKS,
    };
    history.push(sitesLocation);
  };

  const saveSeedBank = async () => {
    if (record.name === '') {
      setNameError(strings.REQUIRED_FIELD);
    } else if (record.description === '') {
      setDescriptionError(strings.REQUIRED_FIELD);
    } else {
      if (selectedSeedBank) {
        const response = await updateFacility({ ...record, id: selectedSeedBank.id } as Facility);
        if (response.requestSucceeded) {
          reloadOrganizationData();
          setSnackbar({
            type: 'toast',
            priority: 'success',
            msg: strings.CHANGES_SAVED,
          });
        } else {
          setSnackbar({
            type: 'toast',
            priority: 'critical',
            msg: strings.GENERIC_ERROR,
          });
        }
      } else {
        const response = await createFacility(record);
        if (response.requestSucceeded) {
          reloadOrganizationData();
          setSnackbar({
            type: 'toast',
            priority: 'success',
            msg: strings.SEED_BANK_ADDED,
          });
        } else {
          setSnackbar({
            type: 'toast',
            priority: 'critical',
            msg: strings.GENERIC_ERROR,
          });
        }
      }
      goToSeedBanks();
    }
  };

  return (
    <>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {selectedSeedBank ? <h2>{selectedSeedBank?.name}</h2> : <h2>{strings.ADD_SEED_BANK}</h2>}
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='name'
              label={strings.NAME_REQUIRED}
              type='text'
              onChange={onChange}
              value={record.name}
              errorText={record.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={4}>
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
      <FormBottomBar onCancel={goToSeedBanks} onSave={saveSeedBank} />
    </>
  );
}

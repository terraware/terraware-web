import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, CircularProgress, Grid, Theme, useTheme } from '@mui/material';
import { ErrorBox, TableColumnType } from '@terraware/web-components';
import useQuery from 'src/utils/useQuery';
import { Delivery } from 'src/types/Tracking';
import { SpeciesService, TrackingService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import TitleDescription from 'src/components/common/TitleDescription';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import ReassignmentRenderer, { Reassignment, SubzoneInfo } from './ReassignmentRenderer';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { useLocalization, useOrganization } from 'src/providers';
import Table from 'src/components/common/table';
import { useUser } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumber';
import { makeStyles } from '@mui/styles';
import BackToLink from 'src/components/common/BackToLink';

const useStyles = makeStyles((theme: Theme) => ({
  backToWithdrawals: {
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
}));

export default function NurseryReassignment(): JSX.Element {
  const classes = useStyles();
  const query = useQuery();
  const { user } = useUser();
  const numberFormatter = useNumberFormatter();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const snackbar = useSnackbar();
  const [speciesMap, setSpeciesMap] = useState<{ [id: string]: string }>();
  const [delivery, setDelivery] = useState<Delivery>();
  const [subzones, setSubzones] = useState<SubzoneInfo[]>();
  const [zoneName, setZoneName] = useState<string>();
  const [siteName, setSiteName] = useState<string>();
  const [reassignments, setReassignments] = useState<{ [subzoneId: string]: Reassignment }>({});
  const [noReassignments, setNoReassignments] = useState<boolean>(false);
  const contentRef = useRef(null);

  const columns: TableColumnType[] = useMemo(
    () =>
      activeLocale
        ? [
            { key: 'species', name: strings.SPECIES, type: 'string' },
            { key: 'siteName', name: strings.PLANTING_SITE, type: 'string' },
            { key: 'zoneName', name: strings.ZONE, type: 'string' },
            { key: 'originalSubzone', name: strings.ORIGINAL_SUBZONE, type: 'string' },
            { key: 'newSubzone', name: strings.NEW_SUBZONE, type: 'string' },
            { key: 'reassign', name: strings.REASSIGN, type: 'string' },
            { key: 'notes', name: strings.NOTES, type: 'string' },
          ]
        : [],
    [activeLocale]
  );

  const numericFormatter = useMemo(() => numberFormatter(user?.locale), [numberFormatter, user?.locale]);

  // populate map of species id to scientific name
  useEffect(() => {
    const populateSpecies = async () => {
      const speciesResponse = await SpeciesService.getAllSpecies(selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpeciesMap(
          speciesResponse.species?.reduce((acc: any, current: any) => {
            acc[current.id] = current.scientificName;
            return acc;
          }, {})
        );
      } else {
        snackbar.toastError();
      }
    };

    populateSpecies();
  }, [selectedOrganization, snackbar]);

  // populate delivery
  useEffect(() => {
    if (!deliveryId) {
      return;
    }
    const populateDelivery = async () => {
      const response = await TrackingService.getDelivery(Number(deliveryId));
      if (response.requestSucceeded) {
        setDelivery(response.delivery);
      } else {
        snackbar.toastError();
      }
    };

    populateDelivery();
  }, [deliveryId, snackbar]);

  // populate lookup maps of zones and subzones
  useEffect(() => {
    if (!delivery) {
      return;
    }

    const populateSubzones = async () => {
      const plantingSubzoneIds = delivery.plantings.map((planting) => planting.plantingSubzoneId).filter((id) => id);
      if (!plantingSubzoneIds.length) {
        return;
      }
      const response = await TrackingService.getPlantingSite(delivery.plantingSiteId);
      if (response.requestSucceeded && response.site) {
        setSiteName(response.site.name);
        const zone = response.site.plantingZones?.find((otherZone) =>
          otherZone.plantingSubzones?.some((subzone) => plantingSubzoneIds.indexOf(subzone.id) !== -1)
        );
        if (!zone) {
          return;
        }
        setSubzones(zone.plantingSubzones.map((subzone) => ({ id: subzone.id.toString(), name: subzone.fullName })));
        setZoneName(zone.name);
      } else {
        snackbar.toastError();
      }
    };

    populateSubzones();
  }, [delivery, snackbar]);

  const goToWithdrawals = () => {
    const withdrawalId = query.has('fromWithdrawal') ? delivery?.withdrawalId : undefined;
    history.push({ pathname: APP_PATHS.NURSERY_WITHDRAWALS + (withdrawalId ? `/${withdrawalId}` : '') });
  };

  const reassign = async () => {
    // get all reassignments that have a valid quantity
    setNoReassignments(false);
    let hasErrors = false;
    const validReassignments = plantings
      .map((planting) => planting?.reassignment)
      .filter((reassignment: any) => {
        if (reassignment.error.quantity) {
          hasErrors = true;
          return false;
        }
        return Number(reassignment.quantity) > 0 && reassignment.newSubzone;
      });

    if (hasErrors) {
      return;
    }

    if (!validReassignments.length) {
      setNoReassignments(true);
      return;
    }

    const request = {
      reassignments: validReassignments.map((reassignment) => ({
        fromPlantingId: reassignment!.plantingId,
        numPlants: Number(reassignment!.quantity),
        toPlantingSubzoneId: Number(reassignment!.newSubzone!.id),
        notes: reassignment?.notes,
      })),
    };

    const response = await TrackingService.reassignPlantings(delivery!.id, request);
    if (response.requestSucceeded) {
      goToWithdrawals();
    } else {
      snackbar.toastError();
    }
  };

  const plantings = useMemo(() => {
    if (!delivery) {
      return [];
    }

    return delivery.plantings
      .map((planting) => {
        if (planting.type !== 'Delivery' || !planting.plantingSubzoneId || !speciesMap) {
          return null;
        }

        const subzone = subzones?.find((subzoneInfo) => subzoneInfo.id === planting.plantingSubzoneId?.toString());
        if (!subzone) {
          return null;
        }

        return {
          ...planting,
          species: speciesMap![planting.speciesId],
          zoneName,
          siteName,
          subzone,
          reassignment: reassignments[planting.id] || { plantingId: planting.id, error: {}, notes: '' },
        };
      })
      .filter((planting) => !!planting);
  }, [delivery, siteName, speciesMap, zoneName, subzones, reassignments]);

  const reassignmentRenderer = useMemo(
    () =>
      ReassignmentRenderer({
        numericFormatter,
        subzones: subzones || [],
        setReassignment: (reassignment: Reassignment) =>
          setReassignments((current) => {
            const newReassignments = { ...current };
            newReassignments[reassignment.plantingId] = reassignment;
            return newReassignments;
          }),
      }),
    [subzones, numericFormatter]
  );

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box>
          <BackToLink
            id='back'
            to={APP_PATHS.NURSERY_WITHDRAWALS}
            className={classes.backToWithdrawals}
            name={strings.WITHDRAWAL_LOG}
          />
        </Box>
        <Box marginTop={theme.spacing(3)}>
          <TitleDescription title={strings.REASSIGN_SEEDLINGS} description={strings.REASSIGN_SEEDLINGS_DESCRIPTION} />
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {noReassignments && (
        <Box sx={{ marginTop: 3, marginBottom: 3 }}>
          <ErrorBox title={strings.NO_REASSIGNMENTS} text={strings.NO_REASSIGNMENTS_TEXT} />
        </Box>
      )}
      {subzones ? (
        <PageForm
          cancelID='cancelNurseryReassignment'
          saveID='saveNurseryReassignment'
          onCancel={goToWithdrawals}
          onSave={reassign}
          saveButtonText={strings.REASSIGN}
        >
          <Box
            paddingRight={theme.spacing(3)}
            paddingBottom={theme.spacing(8)}
            display='flex'
            flexDirection={isMobile ? 'row' : 'column'}
            marginTop={theme.spacing(3)}
            minWidth='fit-content'
            ref={contentRef}
          >
            <Card>
              <Table
                id='reassignments'
                columns={columns}
                rows={plantings as any[]}
                Renderer={reassignmentRenderer}
                orderBy='species'
                showPagination={false}
              />
            </Card>
          </Box>
        </PageForm>
      ) : (
        <CircularProgress sx={{ margin: 'auto' }} />
      )}
    </TfMain>
  );
}

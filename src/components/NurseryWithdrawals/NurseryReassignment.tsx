import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, CircularProgress, Grid, useTheme } from '@mui/material';
import { ErrorBox, TableColumnType } from '@terraware/web-components';
import { Delivery } from 'src/types/Tracking';
import { getDelivery } from 'src/api/tracking/deliveries';
import { getPlantingSite } from 'src/api/tracking/tracking';
import { getAllSpecies } from 'src/api/species/species';
import { reassignPlantings } from 'src/api/tracking/deliveries';
import useSnackbar from 'src/utils/useSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import TitleDescription from 'src/components/common/TitleDescription';
import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import ReassignmentRenderer, { Reassignment, PlotInfo } from './ReassignmentRenderer';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import BusySpinner from 'src/components/common/BusySpinner';
import { useOrganization } from 'src/providers/hooks';
import Table from 'src/components/common/table';

export default function NurseryReassignment(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const snackbar = useSnackbar();
  const [speciesMap, setSpeciesMap] = useState<{ [id: string]: string }>();
  const [delivery, setDelivery] = useState<Delivery>();
  const [plots, setPlots] = useState<PlotInfo[]>();
  const [zoneName, setZoneName] = useState<string>();
  const [siteName, setSiteName] = useState<string>();
  const [reassignments, setReassignments] = useState<{ [plotId: string]: Reassignment }>({});
  const [noReassignments, setNoReassignments] = useState<boolean>(false);
  const [reassigning, setReassigning] = useState<boolean>(false);
  const contentRef = useRef(null);
  const columns: TableColumnType[] = [
    { key: 'species', name: strings.SPECIES, type: 'string' },
    { key: 'siteName', name: strings.PLANTING_SITE, type: 'string' },
    { key: 'zoneName', name: strings.ZONE, type: 'string' },
    { key: 'originalPlot', name: strings.ORIGINAL_PLOT, type: 'string' },
    { key: 'newPlot', name: strings.NEW_PLOT, type: 'string' },
    { key: 'reassign', name: strings.REASSIGN, type: 'string' },
    { key: 'notes', name: strings.NOTES, type: 'string' },
  ];

  // populate map of species id to scientific name
  useEffect(() => {
    const populateSpecies = async () => {
      const speciesResponse = await getAllSpecies(selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpeciesMap(
          speciesResponse.species.reduce((acc: any, current: any) => {
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
      const response = await getDelivery(Number(deliveryId));
      if (response.requestSucceeded) {
        setDelivery(response.delivery);
      } else {
        snackbar.toastError(response.error);
      }
    };

    populateDelivery();
  }, [deliveryId, snackbar]);

  // populate lookup maps of zones and plots
  useEffect(() => {
    if (!delivery) {
      return;
    }

    const populatePlots = async () => {
      const plotIds = delivery.plantings.map((planting) => planting.plotId).filter((id) => id);
      if (!plotIds.length) {
        return;
      }
      const response = await getPlantingSite(delivery.plantingSiteId);
      if (response.requestSucceeded && response.site) {
        setSiteName(response.site.name);
        const zone = response.site.plantingZones?.find((otherZone) =>
          otherZone.plots?.some((plot) => plotIds.indexOf(plot.id) !== -1)
        );
        if (!zone) {
          return;
        }
        setPlots(zone.plots.map((plot) => ({ id: plot.id.toString(), name: plot.fullName })));
        setZoneName(zone.name);
      } else {
        snackbar.toastError(response.error);
      }
    };

    populatePlots();
  }, [delivery, snackbar]);

  const goToWithdrawals = () => {
    history.push({ pathname: APP_PATHS.NURSERY_WITHDRAWALS });
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
        return Number(reassignment.quantity) > 0 && reassignment.newPlot;
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
        toPlotId: Number(reassignment!.newPlot!.id),
        notes: reassignment?.notes,
      })),
    };

    setReassigning(true);
    const response = await reassignPlantings(delivery!.id, request);
    setReassigning(false);
    if (response.requestSucceeded) {
      goToWithdrawals();
    } else {
      snackbar.toastError(response.error);
    }
  };

  const plantings = useMemo(() => {
    if (!delivery) {
      return [];
    }

    return delivery.plantings
      .map((planting) => {
        if (planting.type !== 'Delivery' || !planting.plotId || !speciesMap) {
          return null;
        }

        const plot = plots?.find((plotInfo) => plotInfo.id === planting.plotId?.toString());
        if (!plot) {
          return null;
        }

        return {
          ...planting,
          species: speciesMap![planting.speciesId],
          zoneName,
          siteName,
          plot,
          reassignment: reassignments[planting.id] || { plantingId: planting.id, error: {}, notes: '' },
        };
      })
      .filter((planting) => !!planting);
  }, [delivery, siteName, speciesMap, zoneName, plots, reassignments]);

  const reassignmentRenderer = useMemo(
    () =>
      ReassignmentRenderer({
        plots: plots || [],
        setReassignment: (reassignment: Reassignment) =>
          setReassignments((current) => {
            const newReassignments = { ...current };
            newReassignments[reassignment.plantingId] = reassignment;
            return newReassignments;
          }),
      }),
    [plots]
  );

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <TitleDescription title={strings.REASSIGN_SEEDLINGS} description={strings.REASSIGN_SEEDLINGS_DESCRIPTION} />
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {noReassignments && (
        <Box sx={{ marginTop: 3, marginBottom: 3 }}>
          <ErrorBox title={strings.NO_REASSIGNMENTS} text={strings.NO_REASSIGNMENTS_TEXT} />
        </Box>
      )}
      {plots ? (
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
            {reassigning && <BusySpinner withSkrim={true} />}
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

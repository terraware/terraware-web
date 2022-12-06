import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { Table, TableColumnType } from '@terraware/web-components';
import { ServerOrganization } from 'src/types/Organization';
import { Delivery, Plot } from 'src/api/types/tracking';
import { getDelivery } from 'src/api/tracking/deliveries';
import { getPlantingSite } from 'src/api/tracking/tracking';
import { getAllSpecies } from 'src/api/species/species';
import useSnackbar from 'src/utils/useSnackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import TfMain from 'src/components/common/TfMain';
import TitleDescription from 'src/components/common/TitleDescription';
import Card from 'src/components/common/Card';
import FormBottomBar from 'src/components/common/FormBottomBar';
import ReassignmentRenderer, { PlotsMap, ZonesMap } from './ReassignmentRenderer';

const columns: TableColumnType[] = [
  { key: 'species', name: strings.SPECIES, type: 'string' },
  { key: 'plantingSite', name: strings.PLANTING_SITE, type: 'string' },
  { key: 'zone', name: strings.ZONE, type: 'string' },
  { key: 'originalPlot', name: strings.ORIGINAL_PLOT, type: 'string' },
  { key: 'newPlot', name: strings.NEW_PLOT, type: 'string' },
  { key: 'numPlants', name: strings.QUANTITY, type: 'number' },
  { key: 'reassign', name: strings.REASSIGN, type: 'string' },
  { key: 'notes', name: strings.NOTES, type: 'string' },
];

type NurseryReassignmentProps = {
  organization: ServerOrganization;
};

export default function NurseryReassignment(props: NurseryReassignmentProps): JSX.Element {
  const { organization } = props;
  const theme = useTheme();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const [snackbar] = useState(useSnackbar());
  const [speciesMap, setSpeciesMap] = useState<{ [id: string]: string }>();
  const [delivery, setDelivery] = useState<Delivery>();
  const [plots, setPlots] = useState<PlotsMap>();
  const [zones, setZones] = useState<ZonesMap>();
  const [siteName, setSiteName] = useState<string>();

  // populate map of species id to scientific name
  useEffect(() => {
    const populateSpecies = async () => {
      const speciesResponse = await getAllSpecies(organization.id);
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
  }, [organization.id, snackbar]);

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
        const zoneList = response.site.plantingZones?.filter((zone) =>
          zone.plots?.filter((plot) => plotIds.indexOf(plot.id) !== -1)
        );
        if (!zoneList?.length) {
          return;
        }
        const zonesMap: ZonesMap = {};
        setPlots(
          zoneList.reduce((acc: any, zone: any) => {
            const zonePlots = zone.plots;
            if (zonePlots) {
              zonePlots.forEach(
                (plot: Plot) =>
                  (zonesMap[plot.id.toString()] = { id: zone.id, name: zone.name, plotName: plot.fullName })
              );
              acc[zone.id.toString()] = zonePlots.map((plot: Plot) => ({ id: plot.id, fullName: plot.fullName }));
            }
            return acc;
          }, {})
        );
        setZones(zonesMap);
      } else {
        snackbar.toastError(response.error);
      }
    };

    populatePlots();
  }, [delivery, snackbar]);

  const goToWithdrawals = () => {
    history.push({ pathname: APP_PATHS.NURSERY_WITHDRAWALS });
  };

  const reassign = () => {
    // do nothing for now
    return;
  };

  const plantings = useMemo(() => {
    if (!delivery) {
      return [];
    }

    return delivery.plantings
      .filter((planting) => planting.type === 'Delivery' && planting.plotId)
      .map((planting) => {
        if (!planting.plotId || !speciesMap || !zones) {
          return planting;
        }
        return {
          ...planting,
          species: speciesMap[planting.speciesId],
          zone: zones[planting.plotId]?.name,
          plantingSite: siteName,
          originalPlot: zones[planting.plotId]?.plotName,
        };
      });
  }, [delivery, siteName, speciesMap, zones]);

  const reassignmentRenderer = useMemo(
    () =>
      ReassignmentRenderer({
        plots: plots || {},
        zones: zones || {},
      }),
    [plots, zones]
  );

  return (
    <TfMain>
      <TitleDescription title={strings.REASSIGN_SEEDLINGS} description={strings.REASSIGN_SEEDLINGS_DESCRIPTION} />
      {zones ? (
        <Box
          paddingBottom={isMobile ? '185px' : '105px'}
          display='flex'
          flexDirection={isMobile ? 'row' : 'column'}
          marginTop={theme.spacing(3)}
        >
          <Card>
            <Table
              id='reassignments'
              columns={columns}
              rows={plantings}
              Renderer={reassignmentRenderer}
              orderBy='species'
            />
          </Card>
          <FormBottomBar onCancel={goToWithdrawals} onSave={reassign} saveButtonText={strings.REASSIGN} />
        </Box>
      ) : (
        <CircularProgress sx={{ margin: 'auto' }} />
      )}
    </TfMain>
  );
}

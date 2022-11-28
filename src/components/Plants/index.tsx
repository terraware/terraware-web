import React, { useCallback, useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Select } from '@terraware/web-components';
import { listPlantingSites } from 'src/api/tracking/tracking';
import { PlantingSite } from 'src/api/types/tracking';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { search } from 'src/api/search';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import useSnackbar from 'src/utils/useSnackbar';

type Population = {
  species_scientificName: string;
  species_commonName: string;
  totalPlants: number;
};

type PlantingSitesPlotsSearch = {
  id: string;
  fullName: string;
  populations: Population[];
};

type PlantsDashboardProps = {
  organization: ServerOrganization;
};

export default function PlantsDashboard(props: PlantsDashboardProps): JSX.Element {
  const { organization } = props;
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [totalPlants, setTotalPlants] = useState<number>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const [snackbar] = useState(useSnackbar());

  const borderCardStyle = {
    border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    marginBottom: 2,
    borderRadius: '8px',
    padding: 3,
  };

  const cardTitleStyle = {
    fontSize: '20px',
    fontWeight: 600,
  };

  const cardElementStyle = {
    marginTop: theme.spacing(3),
  };

  useEffect(() => {
    const populateResults = async () => {
      if (selectedPlantingSite) {
        const serverResponse: PlantingSitesPlotsSearch[] | null = (await search({
          prefix: 'plantingSites.plantingZones.plots',
          fields: [
            'id',
            'fullName',
            'populations.species_scientificName',
            'populations.species_commonName',
            'populations.totalPlants',
          ],
          search: {
            operation: 'field',
            field: 'plantingSite_id',
            values: [selectedPlantingSite.id],
          },
          count: 0,
        })) as unknown as PlantingSitesPlotsSearch[] | null;

        if (serverResponse) {
          let totalPlantsOfSite = 0;
          // eslint-disable-next-line
          const plantsPerSpecies: { [key: string]: number } = serverResponse.reduce((acc, plot) => {
            if (plot.populations) {
              plot.populations.forEach((population) => {
                totalPlantsOfSite = +totalPlantsOfSite + +population.totalPlants;
                if (acc[population.species_scientificName]) {
                  acc[population.species_scientificName] =
                    +acc[population.species_scientificName] + +population.totalPlants;
                } else {
                  acc[population.species_scientificName] = +population.totalPlants;
                }
              });
            }
            return acc;
          }, {} as { [key: string]: number });

          setTotalPlants(totalPlantsOfSite);
        }
      }
    };

    populateResults();
  }, [selectedPlantingSite]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        history.push(APP_PATHS.PLANTING_SITE_DASHBOARD.replace(':plantingSiteId', site.id.toString()));
      }
    },
    [history]
  );

  useEffect(() => {
    const populatePlantingSites = async () => {
      const serverResponse = await listPlantingSites(organization.id);
      if (serverResponse.requestSucceeded) {
        setPlantingSites(serverResponse.sites ?? []);
      } else {
        snackbar.toastError(serverResponse.error);
      }
    };
    populatePlantingSites();
  }, [organization.id, snackbar]);

  useEffect(() => {
    if (plantingSites.length) {
      const plantingSiteIdToUse = plantingSiteId;
      const requestedPlantingSite = plantingSites.find((ps) => ps?.id === parseInt(plantingSiteIdToUse, 10));
      const plantingSiteToUse = requestedPlantingSite || plantingSites[0];
      if (plantingSiteToUse.id.toString() === plantingSiteId) {
        setSelectedPlantingSite(plantingSiteToUse);
      } else {
        setActivePlantingSite(plantingSiteToUse);
      }
    }
  }, [plantingSites, plantingSiteId, setActivePlantingSite]);

  const onChangePlantingSite = (newValue: string) => {
    setActivePlantingSite(plantingSites.find((ps) => ps.name === newValue));
  };

  return (
    <TfMain>
      <Grid item xs={12} display={isMobile ? 'block' : 'flex'}>
        <Typography sx={{ fontSize: '24px', fontWeight: 600, alignItems: 'center' }}>{strings.DASHBOARD}</Typography>
        {!isMobile && (
          <Box sx={{ margin: '0 1%', width: '1px', height: '32px', backgroundColor: theme.palette.TwClrBgTertiary }} />
        )}
        <Box display='flex' alignItems='center' paddingTop={isMobile ? 2 : 0}>
          <Typography sx={{ paddingRight: 1, fontSize: '16px', fontWeight: 500 }}>{strings.PLANTING_SITE}</Typography>
          <Select
            options={plantingSites.map((ps) => ps?.name || '')}
            onChange={onChangePlantingSite}
            selectedValue={selectedPlantingSite?.name}
            placeholder={strings.SELECT}
          />
        </Box>
      </Grid>
      <Grid container display='flex' marginTop={6}>
        <Grid item xs={isMobile ? 12 : 6} sx={{ paddingRight: 1, paddingBottom: isMobile ? 2 : 0 }}>
          Map
        </Grid>
        <Grid item xs={isMobile ? 12 : 6} sx={{ paddingLeft: 1 }}>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.TOTAL_NUMBER_OF_PLANTS}</Typography>
            <Box style={cardElementStyle}>
              <Typography fontSize='48px' fontWeight={600}>
                {totalPlants}
              </Typography>
            </Box>
          </Box>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_SPECIES}</Typography>
            <Box style={cardElementStyle} />
          </Box>
          <Box sx={borderCardStyle}>
            <Typography sx={cardTitleStyle}>{strings.NUMBER_OF_PLANTS_BY_PLOT_AND_SPECIES}</Typography>
            <Box style={cardElementStyle} />
          </Box>
        </Grid>
      </Grid>
    </TfMain>
  );
}

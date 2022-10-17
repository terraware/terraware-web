import React, { useEffect, useState } from 'react';
import { Box, LinearProgress, Switch, Stack, Grid } from '@mui/material';
import { getPreferences, updatePreferences } from 'src/api/preferences/preferences';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';
import PageSnackbar from 'src/components/PageSnackbar';
import { Feature, OPT_IN_FEATURES } from 'src/features';

type OptInFeaturesProps = {
  refresh?: () => void;
};

export default function OptInFeatures({ refresh }: OptInFeaturesProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const [preferences, setPreferences] = useState<{ [key: string]: boolean }>();
  const snackbar = useSnackbar();

  useEffect(() => {
    const loadPreferences = async () => {
      const response = await getPreferences();
      const data: any = {};
      // collect preferences related to our opt-in feature set
      if (response.requestSucceeded && response.preferences) {
        const prefs = response.preferences;
        Object.keys(prefs).forEach((key) => {
          if (OPT_IN_FEATURES.find((f) => f.preferenceName === key)) {
            data[key] = prefs[key] || false;
          }
        });

        OPT_IN_FEATURES.forEach((f) => {
          if (f.get) {
            data[f.preferenceName] = f.get();
          }
        });
      }
      setTimeout(() => {
        setPreferences(data);
      }, 250);
    };

    if (!preferences) {
      loadPreferences();
    }
  });

  const savePreference = async (feature: Feature, value: boolean) => {
    let response = {
      requestSucceeded: true,
    };

    if (feature.set) {
      feature.set(value);
    } else {
      response = await updatePreferences(feature.preferenceName, value);
    }

    if (response.requestSucceeded) {
      setPreferences((prev) => ({
        ...prev,
        [feature.preferenceName]: value,
      }));
      if (refresh) {
        refresh();
      }
    } else {
      setPreferences((prev) => ({
        ...prev,
        [feature.preferenceName]: !value,
      }));
      snackbar.toastError();
    }
  };

  const gridSize = () => (isMobile ? 12 : 4);

  const gridStyle = (isDisclosure: boolean) => ({
    marginTop: isMobile ? '20px !important' : '0px !important',
    paddingTop: isMobile ? '20px !important' : 0,
    borderLeft: isMobile ? 'none' : isDisclosure ? '1px solid #b86f6f' : '1px solid #ddd',
    borderTop: isMobile ? (isDisclosure ? '1px solid #b86f6f' : '1px solid #ddd') : 'none',
    fontSize: '14px',
    color: isDisclosure ? '#b86f6f' : 'inherit',
  });

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px',
      }}
    >
      <PageSnackbar />
      {preferences === undefined ? (
        <LinearProgress color='success' />
      ) : (
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              color: '#444',
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '30px',
              justifyContent: 'center',
            }}
          >
            Opt-in to see experimental or work-in-progress features
          </Box>
          {OPT_IN_FEATURES.filter((f) => f.active).map((f, i) => (
            <Stack
              spacing={2}
              sx={{
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                marginBottom: '10px',
              }}
              key={i}
            >
              <Grid container spacing={0}>
                <Grid item xs={gridSize()}>
                  <Box sx={{ color: '#444', fontSize: '16px', whiteSpace: 'pre', alignSelf: 'center' }}>
                    <Switch
                      checked={preferences[f.preferenceName] === true}
                      onChange={(event) => savePreference(f, event.target.checked)}
                    />
                    &nbsp;{f.name}
                  </Box>
                </Grid>
                <Grid item xs={gridSize()} sx={gridStyle(false)}>
                  <Box sx={{ padding: isMobile ? 0 : '0 20px' }}>
                    <ul>
                      {f.description.map((d, index) => (
                        <li key={index}>
                          <Box sx={{ marginBottom: '5px' }}>{d}</Box>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </Grid>
                <Grid item xs={gridSize()} sx={gridStyle(true)}>
                  <ul>
                    {f.disclosure.map((d, index) => (
                      <li key={index}>
                        <Box sx={{ marginBottom: '5px' }}>{d}</Box>
                      </li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
            </Stack>
          ))}
        </Grid>
      )}
    </Box>
  );
}

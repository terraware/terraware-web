import React, { type JSX, useEffect, useState } from 'react';

import { Box, Grid, LinearProgress, Stack, Switch, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import PageSnackbar from 'src/components/PageSnackbar';
import TfMain from 'src/components/common/TfMain';
import { Feature, OPT_IN_FEATURES } from 'src/features';
import { PreferencesService } from 'src/services';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useSnackbar from 'src/utils/useSnackbar';

type OptInFeaturesViewProps = {
  refresh?: () => void;
};

export default function OptInFeaturesView({ refresh }: OptInFeaturesViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [preferences, setPreferences] = useState<{ [key: string]: boolean }>();
  const snackbar = useSnackbar();

  useEffect(() => {
    const loadPreferences = async () => {
      const response = await PreferencesService.getUserPreferences();
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
      void loadPreferences();
    }
  });

  const savePreference = async (feature: Feature, value: boolean) => {
    let response = {
      requestSucceeded: true,
    };

    if (feature.set) {
      feature.set(value);
    } else {
      // set it to true for a responsive feedback
      setPreferences((prev) => ({
        ...prev,
        [feature.preferenceName]: value,
      }));
      response = await PreferencesService.updateUserPreferences({ [feature.preferenceName]: value });
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
    borderLeft: isMobile
      ? 'none'
      : isDisclosure
        ? `1px solid ${theme.palette.TwClrTxtDanger}`
        : `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    borderTop: isMobile
      ? isDisclosure
        ? `1px solid ${theme.palette.TwClrTxtDanger}`
        : `1px solid ${theme.palette.TwClrBrdrTertiary}`
      : 'none',
    fontSize: '14px',
    color: isDisclosure ? theme.palette.TwClrTxtDanger : 'inherit',
  });

  return (
    <TfMain>
      <PageSnackbar />
      {preferences === undefined ? (
        <LinearProgress color='success' />
      ) : (
        <Page contentStyle={{ display: 'block' }}>
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                color: theme.palette.TwClrTxt,
                fontWeight: 'bold',
                fontSize: '20px',
                marginTop: '115px',
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
                  border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  padding: '10px',
                  borderRadius: '5px',
                  backgroundColor: getRgbaFromHex(theme.palette.TwClrBg as string, 0.8),
                  marginBottom: '10px',
                }}
                key={i}
              >
                <Grid container spacing={0}>
                  <Grid item xs={gridSize()}>
                    <Box
                      sx={{ color: theme.palette.TwClrTxt, fontSize: '16px', whiteSpace: 'pre', alignSelf: 'center' }}
                    >
                      <Switch
                        disabled={f.enabled}
                        checked={preferences[f.preferenceName] === true}
                        onChange={(event) => void savePreference(f, event.target.checked)}
                      />
                      &nbsp;{f.name}
                      {f.enabled ? ' (Feature Ungated)' : ''}
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
        </Page>
      )}
    </TfMain>
  );
}

import { CircularProgress } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cookies from 'cookies-js';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { SeedSearchCriteria } from 'src/api/seeds/search';
import { getSummary, GetSummaryResponse } from 'src/api/seeds/summary';
import EmptyMessage from 'src/components/common/EmptyMessage';
import TfMain from 'src/components/common/TfMain';
import MainPaper from 'src/components/MainPaper';
import { API_PULL_INTERVAL, APP_PATHS, TERRAWARE_SUPPORT_LINK } from 'src/constants';
import { seedsSummarySelectedOrgInfo } from 'src/state/selectedOrgInfoPerPage';
import strings from 'src/strings';
import emptyMessageStrings from 'src/strings/emptyMessageModal';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import PageHeader from '../PageHeader';
import SummaryPaper from './SummaryPaper';
import Updates from './Updates';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      padding: '32px 0',
    },
    paper: {
      display: 'flex',
      overflow: 'auto',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: '100%',
    },
    message: {
      margin: '0 auto',
      width: '50%',
      marginTop: '10%',
    },
    spinnerContainer: {
      position: 'fixed',
      top: '50%',
      left: 'calc(50% + 100px)',
    },
  })
);

Cookies.defaults = {
  path: '/',
  secure: true,
};

type SeedSummaryProps = {
  organization?: ServerOrganization;
  setSeedSearchCriteria: (criteria: SeedSearchCriteria) => void;
  setFacilityIdSelected: (facilityId: number) => void;
};

export default function SeedSummary(props: SeedSummaryProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { setSeedSearchCriteria, organization, setFacilityIdSelected } = props;
  // populateSummaryInterval value is only being used when it is set.
  const [, setPopulateSummaryInterval] = useState<ReturnType<typeof setInterval>>();
  const [summary, setSummary] = useState<GetSummaryResponse>();
  const errorOccurred = summary ? summary.errorOccurred : false;
  const [, setSelectedOrgInfo] = useRecoilState(seedsSummarySelectedOrgInfo);

  useEffect(() => {
    if (organization) {
      const seedbankProject = organization?.projects?.length ? organization?.projects[0] : undefined;
      const seedbankSite = seedbankProject?.sites?.find((site) => site.name === 'Seed Bank');
      const seedbankFacility = seedbankSite?.facilities?.find((facility) => facility.name === 'Seed Bank');

      const populateSummary = async () => {
        if (seedbankFacility) {
          setSummary(await getSummary(seedbankFacility.id));
        }
      };

      // Update summary information
      if (seedbankFacility) {
        setFacilityIdSelected(seedbankFacility.id);
        populateSummary();
      } else {
        setSummary(undefined);
      }

      // Update interval that keeps summary up to date
      if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
        setPopulateSummaryInterval((currInterval) => {
          if (currInterval) {
            // Clear an existing interval when the facilityId changes
            clearInterval(currInterval);
          }
          return seedbankFacility?.id ? setInterval(populateSummary, API_PULL_INTERVAL) : undefined;
        });
      }

      setSelectedOrgInfo({
        selectedFacility: seedbankFacility,
        selectedProject: seedbankProject,
        selectedSite: seedbankSite,
      });
    }

    // Clear interval on exit
    return () => {
      setPopulateSummaryInterval((currInterval) => {
        if (currInterval) {
          clearInterval(currInterval);
        }
        return undefined;
      });
    };
  }, [setFacilityIdSelected, organization, setSelectedOrgInfo]);

  const goToProjects = () => {
    const projectsLocation = {
      pathname: APP_PATHS.PROJECTS,
    };
    history.push(projectsLocation);
  };

  const goToSupport = () => {
    window.open(TERRAWARE_SUPPORT_LINK);
  };

  return (
    <TfMain>
      <PageHeader subtitle={strings.WELCOME_MSG} page={strings.DASHBOARD} parentPage={strings.SEEDS} />
      <Container maxWidth={false} className={classes.mainContainer}>
        {organization && summary ? (
          <Grid container spacing={3}>
            {!!organization?.projects?.length && !summary?.value?.activeAccessions.current && (
              <Grid item xs={12}>
                <EmptyMessage
                  title={emptyMessageStrings.COLLECT_IN_FIELD_PLANT_DATA}
                  text={emptyMessageStrings.TERRAWARE_MOBILE_APP_INFO_MSG}
                  buttonText={emptyMessageStrings.REQUEST_MOBILE_APP}
                  onClick={goToSupport}
                />
              </Grid>
            )}
            {!!organization?.projects?.length ? (
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <MainPaper className={classes.paper}>
                      <SummaryPaper
                        id='sessions'
                        title={strings.ACTIVE_ACCESSIONS}
                        statistics={summary?.value?.activeAccessions}
                        loading={summary === undefined}
                        error={errorOccurred}
                      />
                    </MainPaper>
                  </Grid>
                  <Grid item xs={4}>
                    <MainPaper className={classes.paper}>
                      <SummaryPaper
                        id='species'
                        title={strings.SPECIES}
                        statistics={summary?.value?.species}
                        loading={summary === undefined}
                        error={errorOccurred}
                      />
                    </MainPaper>
                  </Grid>
                  <Grid item xs={4}>
                    <MainPaper className={classes.paper}>
                      <SummaryPaper
                        id='families'
                        title={strings.FAMILY}
                        statistics={summary?.value?.families}
                        loading={summary === undefined}
                        error={errorOccurred}
                      />
                    </MainPaper>
                  </Grid>
                  <Grid item xs={12}>
                    <MainPaper className={`${classes.paper} ${classes.fixedHeight}`}>
                      <Updates
                        setSeedSearchCriteria={setSeedSearchCriteria}
                        summaryResponse={summary?.value}
                        loading={summary === undefined}
                        error={errorOccurred}
                      />
                    </MainPaper>
                  </Grid>
                </Grid>
              </Grid>
            ) : HighOrganizationRolesValues.includes(organization?.role || '') ? (
              <EmptyMessage
                className={classes.message}
                title={emptyMessageStrings.PLANTS_EMPTY_MSG_TITLE}
                text={emptyMessageStrings.PLANTS_EMPTY_MSG_BODY}
                buttonText={strings.GO_TO_PROJECTS}
                onClick={goToProjects}
              />
            ) : (
              <EmptyMessage
                className={classes.message}
                title={emptyMessageStrings.CHECK_BACK_LATER}
                text={emptyMessageStrings.EMPTY_MESSAGE_CONTRIBUTOR}
              />
            )}
          </Grid>
        ) : (
          <div className={classes.spinnerContainer}>
            <CircularProgress />
          </div>
        )}
      </Container>
    </TfMain>
  );
}

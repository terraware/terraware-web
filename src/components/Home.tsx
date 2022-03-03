import { Container, Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import { getUser } from 'src/api/user/user';
import PageCard from 'src/components/common/PageCard';
import PageHeader from 'src/components/seeds/PageHeader';
import TfDivisor from 'src/components/common/TfDivisor';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import homePageStrings from 'src/strings/homePage';
import { HighOrganizationRolesValues, ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainContainer: {
      padding: '20px 0',
    },
    mainGrid: {
      display: 'flex',
      width: '100%',
      margin: 0,
    },
    main: {
      background:
        'url(/assets/trees-right.png) no-repeat 100% 100%/auto 248px, url(/assets/trees-left.png) no-repeat 0 100%/auto 175px, url(/assets/water.png) repeat-x 0 100%/auto 142px, url(/assets/mountain.png) no-repeat 0 100%/auto 233px, url(/assets/far-mountain.png) no-repeat 100% 100%/auto 317px, url(/assets/background.png) no-repeat 100% 0/90% 633px, linear-gradient(to bottom right, rgb(255, 255, 255) 0%, rgb(199, 226, 234) 100%) no-repeat 0 0/auto',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 12px',
    },
    extraPadding: {
      paddingLeft: '12px',
    },
  })
);

export type HomeProps = {
  organization?: ServerOrganization;
};

export default function Home({ organization }: HomeProps): JSX.Element {
  const classes = useStyles();
  const role = organization?.role;
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const populateUser = async () => {
      const response = await getUser();
      if (response.requestSucceeded) {
        setUser(response.user ?? undefined);
      }
    };
    populateUser();
  }, []);
  return (
    <main className={classes.main}>
      <PageHeader
        title={
          user?.firstName
            ? strings.formatString(homePageStrings.WELCOME_PERSON, user.firstName)
            : homePageStrings.WELCOME
        }
        subtitle=''
        titleClassName={classes.extraPadding}
      />
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container spacing={3} className={classes.mainGrid}>
          {role && role in HighOrganizationRolesValues && (
            <>
              <Grid item xs={4}>
                <PageCard
                  name={strings.PROJECTS}
                  icon='folder'
                  description={homePageStrings.PROJECTS_CARD_DESCRIPTION}
                  link={APP_PATHS.PROJECTS}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.PROJECTS) as string}
                  linkStyle={'underline'}
                />
              </Grid>
              <Grid item xs={4}>
                <PageCard
                  name={strings.SITES}
                  icon='site'
                  description={homePageStrings.SITES_CARD_DESCRIPTION}
                  link={APP_PATHS.SITES}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.SITES) as string}
                  linkStyle={'underline'}
                />
              </Grid>
              <Grid item xs={4}>
                <PageCard
                  name={strings.PEOPLE}
                  icon='person'
                  description={homePageStrings.PEOPLE_CARD_DESCRIPTION}
                  link={APP_PATHS.PEOPLE}
                  linkText={strings.formatString(homePageStrings.GO_TO, strings.PEOPLE) as string}
                  linkStyle={'underline'}
                />
              </Grid>

              <Grid item xs={12}>
                <TfDivisor />
              </Grid>
            </>
          )}
          <>
            <Grid item xs={4}>
              <PageCard
                name={strings.SEEDS}
                icon='seeds'
                description={homePageStrings.SEEDS_CARD_DESCRIPTION}
                link={APP_PATHS.SEEDS_DASHBOARD}
                linkText={strings.formatString(homePageStrings.GO_TO, strings.SEEDS) as string}
                linkStyle={'underline'}
              />
            </Grid>
            <Grid item xs={4}>
              <PageCard
                name={strings.PLANTS}
                icon='restorationSite'
                description={homePageStrings.PLANTS_CARD_DESCRIPTION}
                link={APP_PATHS.PLANTS_DASHBOARD}
                linkText={strings.formatString(homePageStrings.GO_TO, strings.PLANTS) as string}
                linkStyle={'underline'}
              />
            </Grid>
            <Grid item xs={4}>
              <PageCard
                name={strings.SPECIES}
                icon='species'
                description={homePageStrings.SPECIES_CARD_DESCRIPTION}
                link={APP_PATHS.SPECIES}
                linkText={strings.formatString(homePageStrings.GO_TO, strings.SPECIES) as string}
                linkStyle={'underline'}
              />
            </Grid>
          </>
        </Grid>
      </Container>
    </main>
  );
}

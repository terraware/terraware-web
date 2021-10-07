import { Box, Chip, Link, Typography } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Cookies from 'cookies-js';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import strings from 'src/strings';
import Divisor from '../../common/Divisor';
import HelpAccordion from './Accordion';
import getContent, { useContentStyles } from './content';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      backgroundColor: theme.palette.neutral[100],
      paddingBottom: theme.spacing(4),
      paddingLeft: 0,
      paddingRight: 0,
    },
    header: {
      backgroundColor: theme.palette.common.white,
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    title: {
      fontWeight: theme.typography.fontWeightBold,
      marginBottom: theme.spacing(3),
    },
    subtitle: {
      fontWeight: theme.typography.fontWeightBold,
      marginTop: theme.spacing(8),
    },
    detail: {
      color: theme.palette.neutral[600],
    },
    image: {
      marginTop: theme.spacing(8),
      width: '100%',
    },
    quicktour: {
      backgroundColor: theme.palette.common.white,
      marginTop: theme.spacing(8),
      borderWidth: 1,
      borderColor: theme.palette.neutral[400],
      borderStyle: 'solid',
      padding: theme.spacing(3),
    },
    button: {
      color: theme.palette.common.white,
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3),
    },
    heading: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

Cookies.defaults = {
  path: '/',
  secure: true,
};

export default function Help(): JSX.Element {
  const classes = useStyles();
  const contentClasses = useContentStyles();
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange = (id: string, isExpanded: boolean) => {
    setExpanded(isExpanded ? id : false);
  };

  const goTo = (
    id: string,
    item = 0,
    block: 'start' | 'center' | 'end' | 'nearest' = 'start'
  ) => {
    handleChange(id + item, true);
    setTimeout(() => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ block });
    }, 300);
  };

  const goToTour = () => {
    Cookies.set('onboarding', 'false');
  };

  const content = getContent(contentClasses, goTo);

  return (
    <main>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Grid container className={classes.header}>
          <Grid item xs={2} />
          <Grid item xs={8}>
            <Box display='flex'>
              <Box mr={2}>
                <img src='/assets/help.svg' height='50' alt='helpIcon' />
              </Box>
              <Typography variant='h3' component='p' className={classes.title}>
                {strings.HELP_HEADER_TITLE}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={2} />
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={3} />
          <Grid item xs={6}>
            <Box className={classes.quicktour} display='flex'>
              <Box display='flex' flexDirection='column'>
                <Typography variant='h6'>
                  {strings.HELP_HEADER_QUICK_TOUR}
                </Typography>
                <Typography variant='body2' className={classes.detail}>
                  {strings.HELP_HEADER_QUICK_TOUR_TEXT}
                </Typography>
              </Box>
              <Box
                display='flex'
                justifyContent='center'
                flex={1}
                alignItems='center'
              >
                <Link
                  component={RouterLink}
                  to='/'
                  target='_blank'
                  rel='noopener noreferrer'
                  id='letsDoIt-button-link'
                  onClick={goToTour}
                >
                  <Chip
                    id='letsDoIt-button'
                    className={classes.button}
                    label={strings.HELP_HEADER_QUICK_TOUR_BUTTON}
                    clickable={true}
                    color='primary'
                  />
                </Link>
              </Box>
            </Box>
            <Box mt={4}>{content.header}</Box>
            {content.accordions.map((accordion) => (
              <Box
                key={accordion.id}
                id={accordion.id}
                display='flex'
                flexDirection='column'
              >
                <Typography variant='h4' className={classes.subtitle}>
                  {accordion.title}
                </Typography>
                <Divisor mt={3} />
                {accordion.children.map((child, index) => (
                  <>
                    <HelpAccordion
                      key={accordion.id + index}
                      id={accordion.id + index}
                      title={child.title}
                      expanded={expanded}
                      onChange={handleChange}
                    >
                      <Box display='flex' flexDirection='column'>
                        {child.content}
                      </Box>
                    </HelpAccordion>
                    <Divisor mt={3} />
                  </>
                ))}
              </Box>
            ))}
          </Grid>
          <Grid item xs={3} />
        </Grid>
      </Container>
    </main>
  );
}

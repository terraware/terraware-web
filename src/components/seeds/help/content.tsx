import { Box, Link, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export const useContentStyles = makeStyles((theme) =>
  createStyles({
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
    spacing: {
      paddingBottom: theme.spacing(2),
    },
  })
);

type Classes = ReturnType<typeof useContentStyles>;
interface Content {
  header: JSX.Element;
  accordions: {
    id: string;
    title: string;
    children: {
      title: string;
      content: JSX.Element;
    }[];
  }[];
}

const helpContent = (
  classes: Classes,
  goTo: (
    id: string,
    item?: number,
    block?: 'start' | 'center' | 'end' | 'nearest'
  ) => void
): Content => ({
  header: (
    <>
      <Typography variant='body1'>
        This page provides FAQs and reference information for the Seed Bank App,
        split into the following sections:
      </Typography>
      <Box>
        <ul>
          <li>
            <Typography variant='body1'>
              A list of{' '}
              <Link
                component={RouterLink}
                to={'help'}
                onClick={() => goTo('faqs')}
              >
                Frequently Asked Questions
              </Link>
              .
            </Typography>
          </li>
          <li>
            <Typography variant='body1'>
              Definitions of terms and uses for each page in the Seed Bank App:
            </Typography>
            <ul>
              <li>
                <Link
                  component={RouterLink}
                  to={'help'}
                  onClick={() => goTo('summary')}
                >
                  <Typography variant='body1'>Summary Page</Typography>
                </Link>
              </li>
              <li>
                <Link
                  component={RouterLink}
                  to={'help'}
                  onClick={() => goTo('database')}
                >
                  <Typography variant='body1'>Database Page</Typography>
                </Link>
              </li>

              <li>
                <Link
                  component={RouterLink}
                  to={'help'}
                  onClick={() => goTo('accession')}
                >
                  <Typography variant='body1'>Accession Page</Typography>
                </Link>
              </li>
              <li>
                <Link
                  component={RouterLink}
                  to={'help'}
                  onClick={() => goTo('species')}
                >
                  <Typography variant='body1'>Species Page</Typography>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </Box>
    </>
  ),
  accordions: [
    {
      id: 'faqs',
      title: 'Frequently Asked Questions',
      children: [
        {
          title: 'What is the Seed Bank App for?',
          content: (
            <Typography component='p' variant='body1'>
              The Seed Bank App helps you run your seed bank as efficiently as
              possible. With the Seed Bank App, you can:
              <ul>
                <li>
                  Log incoming seeds manually or automatically with the Seed
                  Collector App
                </li>
                <li>Track seeds through the processing and drying phases</li>
                <li>Keep a catalog of seeds currently in storage</li>
                <li>
                  Maintain a standardized list of species, eliminating
                  inconsistencies in data entry
                </li>
                <li>
                  Set schedules for batches of seeds to be stored, withdrawn, or
                  germination tested
                </li>
                <li>
                  Generate custom reports of all the seeds in your system
                  striped by species, status, or dozens of other parameters
                </li>
              </ul>
            </Typography>
          ),
        },
        {
          title: 'What is an accession?',
          content: (
            <Typography component='p' variant='body1'>
              An accession is a set of seeds from the same species collected on
              the same day in the same location. Defining batches of seeds by
              accession is useful because it allows you the most granular level
              of data collection: seeds from the same species that were gathered
              on different days can be sorted into different accessions for the
              maximum possible chance of success. You can define accessions in
              whatever way makes the most sense: for instance, having two
              accessions from the same species, day, and location is completely
              fine if you want to keep collections from different plants
              separate.
            </Typography>
          ),
        },
        {
          title:
            'What defines an active accession? What are the possible stages for an accession?',
          content: (
            <>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                Any accession that has a nonzero amount of seeds is defined as
                active.
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                <Typography
                  component='span'
                  variant='body1'
                  className={classes.bold}
                >
                  Exception:
                </Typography>{' '}
                An accession could have 0 seeds upon first being brought to the
                seed bank, before its seed count has been input, and technically
                be active.
              </Typography>
              <Typography component='p' variant='body1'>
                The possible stages for an accession in the Seed Bank App are:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Pending:
                    </Typography>{' '}
                    Seeds that have been collected but not yet brought to the
                    seed bank location or had any work done on them.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Processing:
                    </Typography>{' '}
                    Seeds that have been received at the seed bank and are being
                    prepared for drying.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Drying:
                    </Typography>{' '}
                    Seeds that are being dried out in preparation for storage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      In Storage:
                    </Typography>{' '}
                    Seeds that have finished drying and are in storage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Withdrawn:
                    </Typography>{' '}
                    Seeds that were removed from storage.{' '}
                  </li>
                </ul>
              </Typography>
              <Typography component='p' variant='body1'>
                An accession becomes inactive if all its seeds have been fully
                withdrawn, or if it was sent to the nursery directly after
                collection without ever coming to the seed bank in the first
                place.
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I move accessions from one stage to the next?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                Every accession has its own page containing all its data, most
                of which can be found in subsections of the Details section:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 1)}
                    >
                      <Typography component='span' variant='body1'>
                        Seed Collection
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 2)}
                    >
                      <Typography component='span' variant='body1'>
                        Processing & Drying
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 3)}
                    >
                      <Typography component='span' variant='body1'>
                        Storage
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 4)}
                    >
                      <Typography component='span' variant='body1'>
                        Withdrawal
                      </Typography>
                    </Link>
                  </li>
                </ul>
                <Typography
                  component='p'
                  variant='body1'
                  className={classes.spacing}
                >
                  You can click on any subsection at any time. Entering and
                  saving information into a new subsection moves the accession
                  into the stage corresponding to that subsection.
                </Typography>
                <Typography component='p' variant='body1'>
                  For example: A new accession is in the “Pending” stage. If you
                  click on the “Processing & Drying” subsection, enter today as
                  the “Drying Start Date”, and click “Save Changes”, the
                  accession will automatically change stages to “Drying”.
                </Typography>
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I create a new accession?',
          content: (
            <Typography component='p' variant='body1'>
              You can create a new accession manually at any time by clicking
              the “New Accession+” button in the top right corner of the Seed
              Bank App. Fill in any relevant information and click “Create
              Accession”.
            </Typography>
          ),
        },
        {
          title:
            'How do I get my entries from the Seed Collector App to the Seed Bank App?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                To import entries from the Seed Collector App into the Seed Bank
                App:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Make sure the device with the Seed Collector App is
                      connected to the Seed Bank Wifi.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Open the Seed Collector App.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Tap the “Drop Off” button in the upper right corner of the
                      Seed Collector App. <br />
                      The accessions created in the Seed Collector App appear in
                      the Seed Bank App.
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </>
          ),
        },
        {
          title:
            'Where can I find the accessions I just dropped off from the Seed Collector App?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                To find any accessions you&apos;ve just dropped off from the
                Seed Collector App:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Open the Seed Bank App.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Open the “Database” page.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click the “RECEIVED DATE” column heading until you see the
                      ↓ arrow. <br />
                      The most recent accessions appear at the top of the
                      listing.
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I use filters and columns?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                The Database page allows you to filter the list of accessions by
                almost any data field in the Seed Bank App.
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                Existing filter parameters appear above the list of accessions;
                they correspond to the columns currently displayed.
              </Typography>
              <Typography component='p' variant='body1'>
                To filter the list:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click on a filter name.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Enter a parameter. <br />
                      Only accessions that fit your selection are shown.
                    </Typography>
                  </li>
                </ol>
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                For example: If you only want to show the Coconut trees in your
                database, click “Species” and enter &quot;Coconut&quot;.
              </Typography>
              <Typography component='p' variant='body1'>
                To clear an individual filter:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click on a filter name.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click the green “Clear” link that appears in the box.
                    </Typography>
                  </li>
                </ol>
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                To clear all filters and reset, click the green “Clear Filters”
                link to the right of the filter names; the full list of
                accessions appears.
              </Typography>
              <Typography component='p' variant='body1'>
                To add or remove columns and filter parameters:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click the “Add Columns” button.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Select the fields you want to use as filters.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click “Save changes”. <br />
                      The list reloads with your selections added as both
                      columns and filters; anything you&apos;ve deselected are
                      removed.
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </>
          ),
        },
        {
          title: 'Are there useful filter templates for reports or in general?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                The Seed Bank App comes with the following templates for the
                “Database” page that can be loaded as filters for reports:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Default:
                    </Typography>{' '}
                    The default view for the “Database” page.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      General Inventory:
                    </Typography>{' '}
                    Shows a general inventory of all accessions in the seed
                    bank.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seed Storage Status:
                    </Typography>{' '}
                    Lists accessions currently in storage, so you can see at a
                    glance what seeds your seed bank has and what needs to be
                    collected.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Viability Summary:
                    </Typography>{' '}
                    Displays accessions that have been germination tested for
                    viability.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Germination Testing To Do:
                    </Typography>{' '}
                    Shows a list of accessions for which germination tests have
                    begun but whose results haven&apos;t been input, as well as
                    accessions in storage.{' '}
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I generate a report?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                To generate a report:
              </Typography>
              <Typography component='p' variant='body1'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click the “Add Columns” button.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Select the fields you want to use as filters.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click “Save changes”. <br />
                      The list reloads with your selections added as both
                      columns and filters; anything you&apos;ve deselected are
                      removed.
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </>
          ),
        },
        {
          title: "What's the difference between a notification and an alert?",
          content: (
            <>
              <Typography component='p' variant='body1'>
                Alerts are a special kind of notification.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography component='span' variant='body1'>
                      Notifications appear in the upper right corner of the Seed
                      Bank App and in the “Summary” page, in the “Most Recent
                      Stage Updates” card.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Alerts appear in the “Summary” page of the Seed Bank App
                      in the “Alerts” card. Alerts pertain specifically to
                      equipment that needs attention: a fridge losing power, the
                      internet connection disappearing, etc.
                    </Typography>
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I set up alerts?',
          content: (
            <Typography component='p' variant='body1'>
              Alerts don&apos;t need to be set. Any equipment that&apos;s been
              connected to the Seed Bank Wifi and configured to interface with
              the Seed Bank App will trigger alerts automatically as needed.
              Your equipment has been pre-configured with this functionality, so
              you don&apos;t need to do anything.
            </Typography>
          ),
        },
        {
          title: 'How do I set up notifications?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                Notifications appear when important data for an accession has
                been updated, like a change of stage or a date you&apos;ve set.
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                For example, setting a date in any of these fields will trigger
                a notification at the appropriate date:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography component='span' variant='body1'>
                      “Schedule Date to Move from Racks to Dry Cabinets” in the{' '}
                      <Link
                        component={RouterLink}
                        to={'help'}
                        onClick={() => goTo('accession', 2, 'center')}
                      >
                        Processing & Drying
                      </Link>{' '}
                      subsection of the accession&apos;s Details section
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      “Withdrawn On” in the{' '}
                      <Link
                        component={RouterLink}
                        to={'help'}
                        onClick={() => goTo('accession', 4, 'end')}
                      >
                        Withdrawal
                      </Link>{' '}
                      subsection of the accession&apos;s Details section
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      “Start Date” in the{' '}
                      <Link
                        component={RouterLink}
                        to={'help'}
                        onClick={() => goTo('accession', 5, 'end')}
                      >
                        Nursery
                      </Link>{' '}
                      subsection of the accession&apos;s Germination Testing
                      section
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      “Start Date” in the{' '}
                      <Link
                        component={RouterLink}
                        to={'help'}
                        onClick={() => goTo('accession', 6, 'end')}
                      >
                        Lab
                      </Link>{' '}
                      subsection of the accession&apos;s Germination Testing
                      section
                    </Typography>
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'How do I create a new species?',
          content: (
            <>
              <Typography component='p' variant='body1'>
                To create a new species for your database:
              </Typography>
              <Typography component='p' variant='body1' align='left'>
                <ol>
                  <li>
                    <Typography component='span' variant='body1'>
                      Open the Seed Bank App.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Open the “Species” page.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Click the “New Species+” button.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Enter the “Species Name” and click “Create”.
                    </Typography>
                  </li>
                </ol>
              </Typography>
            </>
          ),
        },
        {
          title: "Why can't I set the storage date?",
          content: (
            <Typography component='p' variant='body1'>
              The short version is that the future is unknowable. If you try to
              set the storage date for some point in the future, it&apos;s
              impossible to truly know how many seed packets you&apos;ll use,
              where they&apos;ll be stored, or even whether you&apos;ll have the
              required space available when the appointed date arrives. Rather
              than introduce that potential element of confusion, and to make
              sure the Seed Bank App is a source of truth you can rely on,
              we&apos;ve structured things so that accessions can only enter the
              &quot;In Storage&quot; stage when they&apos;ve been logged by you
              as physically stored.
            </Typography>
          ),
        },
        {
          title: "Why isn't the Seed Bank App working?",
          content: (
            <Typography component='p' variant='body1'>
              Your Seed Bank App may have lost its connection. Check to make
              sure that your internet connection is functioning, and that
              you&apos;re connected to the Seed Bank Wifi.
            </Typography>
          ),
        },
      ],
    },
    {
      id: 'summary',
      title: 'Summary Page',
      children: [
        {
          title: 'Overview',
          content: (
            <>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                The “Summary” page of the Seed Bank App gives you an overview of
                your seed bank activity.
              </Typography>
              <Typography component='p' variant='body1'>
                From the “Summary” page, you can:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography component='span' variant='body1'>
                      See the number of active accessions, species, and families
                      in the seed bank, and whether those numbers are trending
                      up or down.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      View any notifications or alerts that require your
                      attention.
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Get an overview of the most recent status updates from
                      your seed bank&apos;s accessions.
                    </Typography>
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
      ],
    },
    {
      id: 'database',
      title: 'Database Page',
      children: [
        {
          title: 'Overview',
          content: (
            <>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                The “Database” page of the Seed Bank App is a filterable list of
                all the accessions in your seed bank.
              </Typography>
              <Typography component='p' variant='body1'>
                From the “Database” page, you can:
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography component='span' variant='body1'>
                      View all your accessions current and past
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Filter the list of accessions to see only the ones you
                      want
                    </Typography>
                  </li>
                  <li>
                    <Typography component='span' variant='body1'>
                      Generate a report on the accessions you&apos;ve filtered
                      in .csv format
                    </Typography>
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
      ],
    },
    {
      id: 'accession',
      title: 'Accession Page',
      children: [
        {
          title: 'Overview',
          content: (
            <>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                Click on an accession in the list in the “Database” page to open
                its details.
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                Every accession has aspects tracked in the following major
                sections, each of which are split into subsections:
              </Typography>
              <Typography component='p' variant='body1'>
                Details
                <ul>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 1)}
                    >
                      <Typography component='span' variant='body1'>
                        Seed Collection
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 2)}
                    >
                      <Typography component='span' variant='body1'>
                        Processing & Drying
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 3)}
                    >
                      <Typography component='span' variant='body1'>
                        Storage
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 4)}
                    >
                      <Typography component='span' variant='body1'>
                        Withdrawal
                      </Typography>
                    </Link>
                  </li>
                </ul>
              </Typography>
              <Typography component='p' variant='body1'>
                Germination Testing
                <ul>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 5, 'end')}
                    >
                      <Typography component='span' variant='body1'>
                        Nursery
                      </Typography>
                    </Link>
                  </li>
                  <li>
                    <Link
                      component={RouterLink}
                      to={'help'}
                      onClick={() => goTo('accession', 6, 'end')}
                    >
                      <Typography component='span' variant='body1'>
                        Lab
                      </Typography>
                    </Link>
                  </li>
                </ul>
              </Typography>
              <Typography component='p' variant='body1'>
                <span className={classes.bold}>Note:</span> The nursery and lab
                subsections can be unlocked after saving an option under
                Viability Test Types in the Processing & Drying subsection under
                Details
              </Typography>
            </>
          ),
        },
        {
          title: 'Details: Seed Collection',
          content: (
            <>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                The Seed Collection subsection tracks helpful details about when
                and where the accession was gathered, as well as its species and
                conservation status.
              </Typography>
              <Typography component='p' variant='body1'>
                <span className={classes.bold}>Note:</span> Most of the
                information in this subsection will be automatically entered if
                you&apos;ve imported the accession data from the Seed Collector
                App.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Species:
                    </Typography>{' '}
                    The species of seeds collected.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Family:
                    </Typography>{' '}
                    The family to which the species belongs.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      # of Trees:
                    </Typography>{' '}
                    The number of trees collected from.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Founder ID:
                    </Typography>{' '}
                    A unique set of numbers associated with a wild plant.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Endangered:
                    </Typography>{' '}
                    The conservation status of the species.
                  </li>

                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Rare:
                    </Typography>{' '}
                    Whether the species is rare or not.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Wild/Outplant:
                    </Typography>{' '}
                    A wild plant was planted by nature; outplant indicates the
                    plant was planted by someone after having collected seeds
                    from a wild plant.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Field Notes:
                    </Typography>{' '}
                    Any notes from the collector made in the field (usually
                    about seeds, fruits, or plants).
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Collected On:
                    </Typography>{' '}
                    The date the seeds were collected.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Received On:
                    </Typography>{' '}
                    The date the seeds were brought to the seed bank.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Primary Collector:
                    </Typography>{' '}
                    The main individual who collected the seeds.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Secondary Collector:
                    </Typography>{' '}
                    Any individuals who helped the primary collector (inputting
                    data into the Seed Collector App, taking pictures, helping
                    collect seeds, etc)
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Add New:
                    </Typography>{' '}
                    Click this link to add a new “Secondary Collector”.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Site:
                    </Typography>{' '}
                    The site where the seeds were collected.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Landowner:
                    </Typography>{' '}
                    The owner of the land on which the site sits.
                  </li>

                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Environmental Notes:
                    </Typography>{' '}
                    Any notes about landscape, climate, or other environmental
                    conditions.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Bag IDs:
                    </Typography>{' '}
                    ID numbers of the bags in which the seeds were gathered.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Photos:
                    </Typography>{' '}
                    Photos of the plant or site where the seeds were gathered.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Geolocations:
                    </Typography>{' '}
                    The GPS coordinates of the plant or group of plants from
                    which the seeds were collected.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'Details: Processing & Drying',
          content: (
            <>
              <Typography component='p' variant='body1'>
                The Processing & Drying subsection tracks anything related to
                the accession relevant to processing and drying the seeds.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Quantify:
                    </Typography>{' '}
                    Specify whether to quantify the accession by actual seed
                    count or the weight of the seeds.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seed Count:
                    </Typography>{' '}
                    If you&apos;re tracking by seed count, the total number of
                    seeds in the accession.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seed Weight:
                    </Typography>{' '}
                    If you&apos;re tracking by seed weight, the following fields
                    appear:
                    <ul>
                      {' '}
                      <li>
                        <Typography
                          component='span'
                          variant='body1'
                          className={classes.bold}
                        >
                          Units:
                        </Typography>{' '}
                        The unit of measurement used to weigh the seeds.
                      </li>{' '}
                      <li>
                        <Typography
                          component='span'
                          variant='body1'
                          className={classes.bold}
                        >
                          Total Weight of Seeds:
                        </Typography>{' '}
                        The total weight of all the seeds in the accession;
                        required field.
                      </li>{' '}
                      <li>
                        <Typography
                          component='span'
                          variant='body1'
                          className={classes.bold}
                        >
                          Subset&apos;s Weight of Seeds:
                        </Typography>{' '}
                        The weight of a subset of seeds in the accession; helps
                        calculate the “Total Seeds Count Estimation”.
                      </li>{' '}
                      <li>
                        <Typography
                          component='span'
                          variant='body1'
                          className={classes.bold}
                        >
                          Number of Seeds in Subset:
                        </Typography>{' '}
                        The number of seeds in that subset; helps calculate the
                        “Total Seeds Count Estimation”.
                      </li>{' '}
                      <li>
                        <Typography
                          component='span'
                          variant='body1'
                          className={classes.bold}
                        >
                          Total Seeds Count Estimation:
                        </Typography>{' '}
                        The estimated number of all the seeds in the accession,
                        automatically calculated as Number of Seeds in Subset *
                        (Total Weight of Seeds / Subset&apos;s weight).
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Viability Test Types:
                    </Typography>{' '}
                    How the seeds will be tested for viability. These checkboxes
                    unlock new subsections for the accession upon save.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Target %RH:
                    </Typography>{' '}
                    Target relative humidity for drying, usually 30% or 40%.
                  </li>

                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Drying Start Date:
                    </Typography>{' '}
                    The date the seeds started the drying process.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Estimated Drying End Date:
                    </Typography>{' '}
                    The estimated date the seeds should finish drying.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Schedule Date to Move from Racks to Dry Cabinets:
                    </Typography>{' '}
                    Set this date to create a notification that will appear in
                    the “Summary” page to remind you to move the accession from
                    the drying racks to the storage cabinets.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Notes:
                    </Typography>{' '}
                    Any notes about the accession&apos;s processing and drying
                    stage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Processed & Dried By:
                    </Typography>{' '}
                    The person primarily responsible for storing and drying the
                    accession.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'Details: Storage',
          content: (
            <>
              <Typography component='p' variant='body1'>
                The Storage subsection tracks how and where the accession is
                stored.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Starting On:
                    </Typography>{' '}
                    The date the accession entered storage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Number of Packets:
                    </Typography>{' '}
                    The number of seed packets in the accession.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Location:
                    </Typography>{' '}
                    Where the accession is being stored.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Condition:
                    </Typography>{' '}
                    The condition of the accession; automatically filled based
                    on its location (an accession in a refrigerator is set to
                    Refrigerator).
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Notes:
                    </Typography>{' '}
                    Any notes about the accession for storage purposes.
                  </li>

                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Stored By:
                    </Typography>{' '}
                    The person primarily responsible for looking after the
                    accession while it&apos;s in storage.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'Details: Withdrawal',
          content: (
            <>
              <Typography component='p' variant='body1'>
                The Withdrawal subsection tracks any withdrawals made from the
                accession, as well as who made them and why.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Available:
                    </Typography>{' '}
                    The quantity of seeds available in the accession for
                    withdrawal.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Withdrawn:
                    </Typography>{' '}
                    The quantity of seeds being withdrawn.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Remaining:
                    </Typography>{' '}
                    The quantity of seeds remaining.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Withdrawn On:
                    </Typography>{' '}
                    The date the seeds are being withdrawn. Scheduling a future
                    date creates a notification that will appear in the
                    “Summary” page to remind you to make the withdrawal.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Destination:
                    </Typography>{' '}
                    Where the withdrawal is going.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Purpose:
                    </Typography>{' '}
                    The purpose behind the withdrawal.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Notes:
                    </Typography>{' '}
                    Any notes about the withdrawal.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Withdrawn By:
                    </Typography>{' '}
                    The person primarily responsible for the withdrawal.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'Germination Testing: Nursery',
          content: (
            <>
              <Typography component='p' variant='body1'>
                This subsection tracks germination tests made with the accession
                that were done in the nursery. The viability percentage of the
                most recent test also appears here.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Start Date:
                    </Typography>{' '}
                    The date the test begins. Scheduling a future date creates a
                    notification that will appear in the “Summary” page to
                    remind you to start the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      End date:
                    </Typography>{' '}
                    The date the test ends.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seed Type:
                    </Typography>{' '}
                    Whether the seeds were fresh or brought out of storage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Substrate:
                    </Typography>{' '}
                    The substrate in which the seeds are being germinated.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Treatment:
                    </Typography>{' '}
                    Any treatment applied to the seeds for the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Sown:
                    </Typography>{' '}
                    The number of seeds sown.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Remaining:
                    </Typography>{' '}
                    The quantity of seeds remaining.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Germinated:
                    </Typography>{' '}
                    The number of seeds germinated.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Recording Date:
                    </Typography>{' '}
                    The date the observation of germination was recorded.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      % Viability:
                    </Typography>{' '}
                    The percentage of seeds estimated to be viable
                    (automatically calculated for each test as (Seeds
                    Germinated/Seeds Sown) * 100).
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Notes:
                    </Typography>{' '}
                    Any notes about the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Germination Tested By:
                    </Typography>{' '}
                    The person primarily responsible for the test.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
        {
          title: 'Germination Testing: Lab',
          content: (
            <>
              <Typography component='p' variant='body1'>
                This subsection tracks germination tests made with the accession
                that were done in the lab. The viability percentage of the most
                recent test also appears here.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Start Date:
                    </Typography>{' '}
                    The date the test begins. Scheduling a future date creates a
                    notification that will appear in the “Summary” page to
                    remind you to start the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      End date:
                    </Typography>{' '}
                    The date the test ends.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seed Type:
                    </Typography>{' '}
                    Whether the seeds were fresh or brought out of storage.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Substrate:
                    </Typography>{' '}
                    The substrate in which the seeds are being germinated.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Treatment:
                    </Typography>{' '}
                    Any treatment applied to the seeds for the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Sown:
                    </Typography>{' '}
                    The number of seeds sown.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Seeds Remaining:
                    </Typography>{' '}
                    The quantity of seeds remaining.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Notes:
                    </Typography>{' '}
                    Any notes about the test.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Germination Tested By:
                    </Typography>{' '}
                    The person primarily responsible for the test.
                  </li>
                </ul>
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.bold}
              >
                Edit Number of Seeds Germinated
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                While nursery germination only checks once at the end of the
                test, lab germination tests check for germination repeatedly
                over a span of time. Clicking “Edit Number of Seeds Germinated”
                opens the germination entries graph, which displays the %
                Viability (automatically calculated as (total seeds germinated
                over time/Seeds Sown) * 100) and charts the number of seeds
                germinated (entries) over time. Click “New Entry” to record a
                new observation.
              </Typography>
              <Typography
                component='p'
                variant='body1'
                className={classes.bold}
              >
                Cut Test
              </Typography>
              <Typography component='p' variant='body1'>
                To avoid destroying seeds that might be perfectly viable, we
                suggest cutting open any seeds that didn&apos;t germinate in the
                lab to see what&apos;s going on and record the results.
              </Typography>
              <Typography component='p' variant='body1'>
                <ul>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Filled Seeds:
                    </Typography>{' '}
                    The number of seeds that are filled.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Empty Seeds:
                    </Typography>{' '}
                    The number of seeds that turned out to be empty.
                  </li>
                  <li>
                    <Typography
                      component='span'
                      variant='body1'
                      className={classes.bold}
                    >
                      Compromised Seeds:
                    </Typography>{' '}
                    The number of seeds that were compromised in some way.
                  </li>
                </ul>
              </Typography>
            </>
          ),
        },
      ],
    },
    {
      id: 'species',
      title: 'Species Page',
      children: [
        {
          title: 'Overview',
          content: (
            <>
              {' '}
              <Typography
                component='p'
                variant='body1'
                className={classes.spacing}
              >
                The “Species” page of the Seed Bank App lists all the species in
                your seed bank.
              </Typography>
              <Typography component='p' variant='body1'>
                You can add new species from here by clicking the “New Species+”
                button.
              </Typography>
            </>
          ),
        },
      ],
    },
  ],
});

export default helpContent;

import { createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import { Facility } from 'src/api/types/facilities';
import strings from 'src/strings';
import { Project, ServerOrganization, Site } from 'src/types/Organization';
import Select from './Select/Select';

const useStyles = makeStyles((theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    title: {
      fontWeight: 600,
      fontSize: 24,
      color: 'gray',
    },
    selectedSection: {
      color: 'black',
      paddingLeft: '5px',
    },
    separator: {
      height: '32px',
      width: '1px',
      backgroundColor: 'gray',
      marginLeft: '10px',
    },
    titleLabel: {
      fontSize: '16px',
      paddingLeft: '16px',
      paddingRight: '8px',
    },
  })
);

interface TitleProps {
  page: string;
  parentPage: string;
  organization?: ServerOrganization;
  onChangeFacility?: (facility?: Facility) => void;
  allowAll?: boolean;
  setSelectedSiteToParent?: (site: Site | undefined) => void;
  setSelectedProjectToParent?: (project: Project | undefined) => void;
}
export default function Title({
  page,
  parentPage,
  organization,
  onChangeFacility,
  allowAll,
  setSelectedProjectToParent,
  setSelectedSiteToParent,
}: TitleProps): JSX.Element {
  const classes = useStyles();
  const [selectedProject, setSelectedProject] = React.useState<Project>();
  const [selectedSite, setSelectedSite] = React.useState<Site>();

  useEffect(() => {
    if (organization && organization.projects) {
      //if page doesn't allow the 'all' options on dropdowns, then select on dropdowns the first project, first site and first facility
      if (!allowAll) {
        setSelectedProject(organization.projects[0]);
        if (organization.projects[0].sites) {
          setSelectedSite(organization.projects[0].sites[0]);
        }
        if (onChangeFacility && organization.projects[0].sites && organization.projects[0].sites[0].facilities) {
          onChangeFacility(organization.projects[0].sites[0].facilities[0]);
        }
      }
    }
  }, [organization]);

  const addAllOption = (originalOptions?: string[]) => {
    let newOptions: string[] = [];
    if (originalOptions) {
      newOptions = [...originalOptions];
    }
    if (allowAll) {
      newOptions.unshift('All');
    }
    return newOptions;
  };

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>
        {parentPage} / <span className={classes.selectedSection}>{page}</span>
      </div>
      <div className={classes.separator} />
      <label className={classes.titleLabel}>{strings.PROJECT}</label>
      <Select
        options={addAllOption(organization?.projects?.map((org) => org.name))}
        selectedValue={allowAll ? 'All' : selectedProject?.name}
        onChange={(newValue) => {
          setSelectedProject(organization?.projects?.find((proj) => proj.name === newValue));
          if (setSelectedProjectToParent) {
            setSelectedProjectToParent(organization?.projects?.find((proj) => proj.name === newValue));
          }
        }}
      />
      <label className={classes.titleLabel}>{strings.SITE}</label>
      <Select
        selectedValue={allowAll ? 'All' : selectedProject?.sites ? selectedProject?.sites[0].name : undefined}
        options={addAllOption(selectedProject?.sites?.map((site) => site.name))}
        onChange={(newValue) => {
          setSelectedSite(selectedProject?.sites?.find((site) => site.name === newValue));
          if (setSelectedSiteToParent) {
            setSelectedSiteToParent(selectedProject?.sites?.find((site) => site.name === newValue));
          }
        }}
      />
      {onChangeFacility && (
        <>
          <label className={classes.titleLabel}>{strings.FACILITY}</label>
          <Select
            selectedValue={
              selectedProject?.sites && selectedProject?.sites[0].facilities
                ? selectedProject?.sites[0].facilities[0].name
                : allowAll
                ? 'All'
                : undefined
            }
            options={addAllOption(selectedSite?.facilities?.map((facility) => facility.name))}
            onChange={(newValue) =>
              onChangeFacility(selectedSite?.facilities?.find((facility) => facility.name === newValue))
            }
          />
        </>
      )}
    </div>
  );
}

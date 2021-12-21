import { createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import { SelectedValues } from 'src/api/types/facilities';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
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
  allowAll?: boolean;
  selectedValues: SelectedValues;
  onChangeSelectedValues: (selectedValues: SelectedValues) => void;
  showFacility?: boolean;
}
export default function Title({
  page,
  parentPage,
  organization,
  allowAll,
  selectedValues,
  showFacility,
  onChangeSelectedValues,
}: TitleProps): JSX.Element {
  const classes = useStyles();

  useEffect(() => {
    // if no project selected and all option is not available, select first project and site
    if (!allowAll) {
      if (!selectedValues.selectedProject && organization?.projects && organization.projects[0].sites) {
        if (organization?.projects[0].sites[0].facilities) {
          onChangeSelectedValues({
            selectedProject: organization?.projects[0],
            selectedSite: organization?.projects[0].sites[0],
            selectedFacility: organization?.projects[0].sites[0].facilities[0],
          });
        } else {
          onChangeSelectedValues({
            selectedProject: organization?.projects[0],
            selectedSite: organization?.projects[0].sites[0],
          });
        }
      }
    }
  }, [organization, selectedValues, onChangeSelectedValues, allowAll]);

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
        selectedValue={selectedValues?.selectedProject?.name ?? 'All'}
        onChange={(newValue) => {
          onChangeSelectedValues({
            selectedProject: organization?.projects?.find((proj) => proj.name === newValue),
            selectedSite: undefined,
            selectedFacility: undefined,
          });
        }}
      />
      <label className={classes.titleLabel}>{strings.SITE}</label>
      <Select
        disabled={!selectedValues.selectedProject}
        selectedValue={selectedValues?.selectedSite?.name ?? 'All'}
        options={addAllOption(selectedValues?.selectedProject?.sites?.map((site) => site.name))}
        onChange={(newValue) => {
          onChangeSelectedValues({
            ...selectedValues,
            selectedSite: selectedValues.selectedProject?.sites?.find((site) => site.name === newValue),
            selectedFacility: undefined,
          });
        }}
      />
      {showFacility && (
        <>
          <label className={classes.titleLabel}>{strings.FACILITY}</label>
          <Select
            disabled={!selectedValues.selectedSite}
            selectedValue={selectedValues?.selectedFacility?.name ?? 'All'}
            options={addAllOption(selectedValues.selectedSite?.facilities?.map((facility) => facility.name))}
            onChange={(newValue) => {
              onChangeSelectedValues({
                ...selectedValues,
                selectedFacility: selectedValues.selectedSite?.facilities?.find(
                  (facility) => facility.name === newValue
                ),
              });
            }}
          />
        </>
      )}
    </div>
  );
}

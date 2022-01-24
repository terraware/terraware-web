import { createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import strings from 'src/strings';
import { SelectedOrgInfo, ServerOrganization } from 'src/types/Organization';
import { getFirstFacility, getFirstProject, getFirstSite } from 'src/utils/organization';
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
  selectedOrgInfo: SelectedOrgInfo;
  onChangeSelectedOrgInfo: (selectedValues: SelectedOrgInfo) => void;
  showFacility?: boolean;
}
export default function Title({
  page,
  parentPage,
  organization,
  allowAll,
  selectedOrgInfo,
  showFacility,
  onChangeSelectedOrgInfo,
}: TitleProps): JSX.Element {
  const classes = useStyles();

  useEffect(() => {
    // if no project selected and all option is not available, select first project and site
    if (!allowAll) {
      if (!selectedOrgInfo.selectedProject && getFirstSite(organization)) {
        if (getFirstFacility(organization)) {
          onChangeSelectedOrgInfo({
            selectedProject: getFirstProject(organization) ?? undefined,
            selectedSite: getFirstSite(organization) ?? undefined,
            selectedFacility: getFirstFacility(organization) ?? undefined,
          });
        } else {
          onChangeSelectedOrgInfo({
            selectedProject: getFirstProject(organization) ?? undefined,
            selectedSite: getFirstSite(organization) ?? undefined,
          });
        }
      }
    }
  }, [organization, selectedOrgInfo, onChangeSelectedOrgInfo, allowAll]);

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
        id='projectSelect'
        options={addAllOption(organization?.projects?.map((org) => org.name))}
        selectedValue={selectedOrgInfo?.selectedProject?.name ?? 'All'}
        onChange={(newValue) => {
          onChangeSelectedOrgInfo({
            selectedProject: organization?.projects?.find((proj) => proj.name === newValue),
            selectedSite: undefined,
            selectedFacility: undefined,
          });
        }}
      />
      <label className={classes.titleLabel}>{strings.SITE}</label>
      <Select
        id='siteSelect'
        disabled={!selectedOrgInfo.selectedProject}
        selectedValue={selectedOrgInfo?.selectedSite?.name ?? 'All'}
        options={addAllOption(selectedOrgInfo?.selectedProject?.sites?.map((site) => site.name))}
        onChange={(newValue) => {
          onChangeSelectedOrgInfo({
            ...selectedOrgInfo,
            selectedSite: selectedOrgInfo.selectedProject?.sites?.find((site) => site.name === newValue),
            selectedFacility: undefined,
          });
        }}
      />
      {showFacility && (
        <>
          <label className={classes.titleLabel}>{strings.FACILITY}</label>
          <Select
            id='facilitySelect'
            disabled={!selectedOrgInfo.selectedSite}
            selectedValue={selectedOrgInfo?.selectedFacility?.name ?? 'All'}
            options={addAllOption(selectedOrgInfo.selectedSite?.facilities?.map((facility) => facility.name))}
            onChange={(newValue) => {
              onChangeSelectedOrgInfo({
                ...selectedOrgInfo,
                selectedFacility: selectedOrgInfo.selectedSite?.facilities?.find(
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

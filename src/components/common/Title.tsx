import { createStyles, makeStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import strings from 'src/strings';
import { SelectedOrgInfo, ServerOrganization } from 'src/types/Organization';
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
  onChangeSelectedOrgInfo: (selectedOrgInfo: SelectedOrgInfo) => void;
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
    // if no project selected, select first project and site
    if (!selectedOrgInfo.selectedProject && organization?.projects && organization.projects[0].sites) {
      if (organization?.projects[0].sites[0].facilities) {
        onChangeSelectedOrgInfo({
          selectedProject: organization?.projects[0],
          selectedSite: organization?.projects[0].sites[0],
          selectedFacility: organization?.projects[0].sites[0].facilities[0],
        });
      } else {
        onChangeSelectedOrgInfo({
          selectedProject: organization?.projects[0],
          selectedSite: organization?.projects[0].sites[0],
        });
      }
    }
  }, [organization, selectedOrgInfo, onChangeSelectedOrgInfo]);

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
        selectedValue={selectedOrgInfo?.selectedProject?.name}
        onChange={(newValue) => {
          onChangeSelectedOrgInfo({
            ...selectedOrgInfo,
            selectedProject: organization?.projects?.find((proj) => proj.name === newValue),
          });
        }}
      />
      <label className={classes.titleLabel}>{strings.SITE}</label>
      <Select
        selectedValue={selectedOrgInfo?.selectedSite?.name}
        options={addAllOption(selectedOrgInfo?.selectedProject?.sites?.map((site) => site.name))}
        onChange={(newValue) => {
          onChangeSelectedOrgInfo({
            ...selectedOrgInfo,
            selectedSite: selectedOrgInfo.selectedProject?.sites?.find((site) => site.name === newValue),
          });
        }}
      />
      {showFacility && (
        <>
          <label className={classes.titleLabel}>{strings.FACILITY}</label>
          <Select
            selectedValue={selectedOrgInfo?.selectedFacility?.name}
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

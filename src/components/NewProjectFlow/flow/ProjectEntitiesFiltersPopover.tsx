import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Popover, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { getAllNurseries } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useOrganization } from 'src/providers/hooks';
import FilterMultiSelect from 'src/components/common/FilterMultiSelect';
import { useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { ACCESSION_2_STATES } from 'src/types/Accession';
import { ProjectEntitiesFilters } from 'src/components/NewProjectFlow/flow/useProjectEntitySelection';
import { FlowStates } from 'src/components/NewProjectFlow';

const useStyles = makeStyles((theme: Theme) => ({
  dropdown: {
    cursor: 'pointer',
    border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
    borderRadius: '4px',
    width: '176px',
    height: '40px',
    padding: theme.spacing(1, 2, 1, 1),
    marginTop: theme.spacing(0.5),
    display: 'flex',
    justifyContent: 'space-between',
  },
  dropdownIconRight: {
    height: '24px',
    width: '24px',
  },
  popoverContainer: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      overflow: 'visible',
      width: '480px',
    },
  },
  mobileContainer: {
    borderRadius: '8px',
    overflow: 'visible',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90%',
    width: '90%',
    zIndex: 1300,
  },
}));

type ProjectEntitiesFiltersPopoverProps = {
  flowState: FlowStates;
  filters: ProjectEntitiesFilters;
  setFilters: (value: ProjectEntitiesFilters) => void;
};

export default function ProjectEntitiesFiltersPopover(props: ProjectEntitiesFiltersPopoverProps): JSX.Element {
  const { flowState, filters, setFilters } = props;

  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  const projects = useAppSelector(selectProjects);
  const nurseries = useMemo(() => getAllNurseries(selectedOrganization), [selectedOrganization]);

  const [entitySpecificOptions, setEntitySpecificOptions] = useState<(number | string)[]>([]);
  const [projectOptions, setProjectOptions] = useState<number[]>([]);
  const [anchorEls, setAnchorEls] = useState<{ [key: string]: undefined | HTMLElement }>({});

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, filterKey: string) =>
      setAnchorEls({ ...anchorEls, [filterKey]: event.currentTarget }),
    [anchorEls]
  );

  const handleClose = useCallback(
    (filterKey: string) => setAnchorEls({ ...anchorEls, [filterKey]: undefined }),
    [anchorEls]
  );

  const handleConfirm = useCallback(
    (filterKey: string, selected: (number | string)[]) => {
      handleClose(filterKey);
      setFilters({ [filterKey]: selected });
    },
    [handleClose, setFilters]
  );

  useEffect(() => setProjectOptions(projects?.map((project) => project.id) || []), [projects]);

  useEffect(() => {
    if (flowState === 'accessions') {
      setEntitySpecificOptions(ACCESSION_2_STATES);
    } else if (flowState === 'batches') {
      setEntitySpecificOptions(nurseries.map((nursery) => nursery.id));
    }
  }, [selectedOrganization, flowState, nurseries]);

  const EntitySpecificFilterMultiSelect = useMemo(() => {
    let label = '';
    let initialSelection: (number | string)[] = [];
    let filterKey = '';
    let renderOption = (value: number | string) => `${value}`;

    if (flowState === 'accessions') {
      label = strings.STATUS;
      initialSelection = filters.statuses ?? [];
      filterKey = 'statuses';
    } else if (flowState === 'batches') {
      label = strings.NURSERY;
      initialSelection = filters.nurseryIds ?? [];
      filterKey = 'nurseryIds';
      renderOption = (nurseryId: number | string) => nurseries.find((nursery) => nursery.id === nurseryId)?.name || '';
    }

    const isOpen = Boolean(anchorEls[filterKey]);

    return (
      <div>
        <div className={classes.dropdown} onClick={(event) => handleClick(event, filterKey)}>
          <Typography>{label}</Typography>
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} className={classes.dropdownIconRight} />
        </div>
        {isMobile && isOpen ? (
          <div className={classes.mobileContainer}>
            <FilterMultiSelect
              label={label}
              initialSelection={initialSelection}
              onCancel={() => handleClose(filterKey)}
              onConfirm={(selected) => handleConfirm(filterKey, selected)}
              options={entitySpecificOptions}
              renderOption={renderOption}
            />
          </div>
        ) : (
          <Popover
            id='pre-exposed-filter-popover'
            open={isOpen}
            onClose={handleClose}
            anchorEl={anchorEls[filterKey]}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            className={classes.popoverContainer}
          >
            <FilterMultiSelect
              label={label}
              initialSelection={initialSelection}
              onCancel={() => handleClose(filterKey)}
              onConfirm={(selected) => handleConfirm(filterKey, selected)}
              options={entitySpecificOptions}
              renderOption={renderOption}
            />
          </Popover>
        )}
      </div>
    );
  }, [
    anchorEls,
    classes,
    entitySpecificOptions,
    filters.nurseryIds,
    filters.statuses,
    flowState,
    handleClick,
    handleClose,
    handleConfirm,
    isMobile,
    nurseries,
  ]);

  const ProjectFilterMultiSelect = useMemo(() => {
    const label = strings.PROJECT;
    const initialSelection = filters.projectIds ?? [];
    const filterKey = 'projectIds';
    const renderOption = (projectId: number) =>
      (projects || []).find((project) => project.id === projectId)?.name || '';

    const isOpen = Boolean(anchorEls[filterKey]);

    return (
      <div>
        <div className={classes.dropdown} onClick={(event) => handleClick(event, filterKey)}>
          <Typography>{label}</Typography>
          <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} className={classes.dropdownIconRight} />
        </div>
        {isMobile && isOpen ? (
          <div className={classes.mobileContainer}>
            <FilterMultiSelect
              label={label}
              initialSelection={initialSelection}
              onCancel={() => handleClose(filterKey)}
              onConfirm={(selected) => handleConfirm('projectIds', selected)}
              options={projectOptions}
              renderOption={renderOption}
            />
          </div>
        ) : (
          <Popover
            id='pre-exposed-filter-popover'
            open={isOpen}
            onClose={() => handleClose(filterKey)}
            anchorEl={anchorEls[filterKey]}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            className={classes.popoverContainer}
          >
            <FilterMultiSelect
              label={label}
              initialSelection={initialSelection}
              onCancel={() => handleClose(filterKey)}
              onConfirm={(selected) => handleConfirm('projectIds', selected)}
              options={projectOptions}
              renderOption={renderOption}
            />
          </Popover>
        )}
      </div>
    );
  }, [
    filters.projectIds,
    anchorEls,
    classes,
    isMobile,
    projectOptions,
    projects,
    handleClick,
    handleClose,
    handleConfirm,
  ]);

  return (
    <>
      {flowState !== 'plantingSites' && EntitySpecificFilterMultiSelect}
      {ProjectFilterMultiSelect}
    </>
  );
}

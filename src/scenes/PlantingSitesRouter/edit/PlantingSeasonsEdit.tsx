import React, { Fragment, type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid } from '@mui/material';
import { DateTime, DurationLike } from 'luxon';

import AddLink from 'src/components/common/AddLink';
import DatePicker from 'src/components/common/DatePicker';
import Link from 'src/components/common/Link';
import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import { TimeZoneDescription } from 'src/types/TimeZones';

// Minimum length of a planting season.
const minDuration: DurationLike = { weeks: 4 };
// Maximum length of a planting season.
const maxDuration: DurationLike = { years: 1 };
// Maximum amount of time in the future we allow scheduling a planting season.
const maxTimeUntilStart: DurationLike = { years: 1 };

/** YYYY-MM-DD string representation of a date. This type is just for code clarity. */
type IsoDate = string;

/** Data from a row in the edit UI. May or may not be valid. */
type EditableRow = {
  /**
   * If this row is a season that already exists on the server, its ID. Undefined if this row was
   * added in the UI and hasn't been saved yet.
   */
  id?: number;
  startDate?: IsoDate;
  endDate?: IsoDate;
};

export type ValidPlantingSeason = {
  id?: number;
  startDate: IsoDate;
  endDate: IsoDate;
};

type Props = {
  /** Initial set of planting seasons, if editing an existing site. */
  plantingSeasons: ValidPlantingSeason[];

  /**
   * Called with a set of ValidPlantingSeason objects at component initialization time and when the
   * user changes the planting seasons in a valid way. If there are validation errors in the
   * planting seasons list, this will not be called.
   */
  setPlantingSeasons: (seasons: ValidPlantingSeason[]) => void;

  /** Called whenever the list of planting seasons becomes either valid or invalid. */
  setPlantingSeasonsValid: (valid: boolean) => void;

  /**
   * If true, show any validation errors that should only be shown just after the user tries to save
   * the site. The component can clear this flag if the user does something such as adding a new row
   * to the planting seasons list such that it no longer makes sense to show these errors.
   */
  showSaveValidationErrors: boolean;
  setShowSaveValidationErrors: (showErrors: boolean) => void;

  /** Effective time zone of the planting site, possibly inherited from its organization. */
  timeZone: TimeZoneDescription;
};

/** Calculated metadata for each row in the edit UI. */
type RowMetadata = {
  /**
   * Whether or not the dates are valid. This is always true if there are error messages, but may
   * also be true if the dates are invalid but the error should only be shown when the user tries
   * to save the site.
   */
  isValid: boolean;

  /** Earliest allowed end date based on this season's start date. */
  minEndDate?: IsoDate;

  /** Latest allowed end date based on this season's start date. */
  maxEndDate?: IsoDate;

  startDateError?: string;
  endDateError?: string;
};

export default function PlantingSeasonsEdit(props: Props): JSX.Element {
  const {
    setPlantingSeasons,
    setPlantingSeasonsValid,
    setShowSaveValidationErrors,
    showSaveValidationErrors,
    timeZone,
  } = props;
  const [loaded, setLoaded] = useState(false);
  const [rows, setRows] = useState<EditableRow[]>([]);

  // Luxon DateTime factory options to use planting site's time zone.
  const dateTimeOptions = useMemo(() => ({ zone: timeZone.id }), [timeZone]);

  // Converts a JavaScript Date object to a Luxon DateTime in the site's time zone.
  const jsDateToDateTime = useCallback((date: Date) => DateTime.fromJSDate(date, dateTimeOptions), [dateTimeOptions]);

  const today: DateTime = useMemo(() => jsDateToDateTime(new Date()), [jsDateToDateTime]);
  const minStartDate: DateTime = useMemo(() => today.minus(maxDuration), [today]);
  const maxStartDate: DateTime = useMemo(() => today.plus(maxTimeUntilStart), [today]);

  // Planting seasons whose end dates have passed. We don't show these in the edit UI, but we need
  // to check whether they overlap with any date ranges the user enters.
  const pastPlantingSeasons: ValidPlantingSeason[] = useMemo(() => {
    const todayString = today.toISODate() || today;
    return props.plantingSeasons.filter((season) => season.endDate < todayString);
  }, [props.plantingSeasons, today]);

  // Converts a YYYY-MM-DD string to a Luxon DateTime in the site's time zone. If the string is an
  // invalid date or undefined, the returned DateTime's isValid property will be false.
  const stringToDateTime = useCallback(
    (dateString?: IsoDate) => DateTime.fromISO(dateString ?? '', dateTimeOptions),
    [dateTimeOptions]
  );

  const metadataForRows = useMemo(() => {
    return rows.map((row, index): RowMetadata => {
      const startDate = stringToDateTime(row.startDate);
      const endDate = stringToDateTime(row.endDate);
      const metadata: RowMetadata = { isValid: true };

      if (endDate.isValid && endDate < today) {
        metadata.endDateError = strings.PLANTING_SEASON_END_IN_PAST;
      }

      if (startDate.isValid && endDate.isValid) {
        if (startDate < minStartDate || startDate > maxStartDate) {
          metadata.startDateError = strings.PLANTING_SEASON_START_OUT_OF_RANGE;
        } else {
          metadata.minEndDate = startDate.plus(minDuration).toISODate();
          metadata.maxEndDate = startDate.plus(maxDuration).toISODate();
        }

        if (endDate >= today && (endDate < startDate.plus(minDuration) || endDate > startDate.plus(maxDuration))) {
          metadata.endDateError = strings.PLANTING_SEASON_END_OUT_OF_RANGE;
        }

        rows
          .slice(0, index)
          .concat(pastPlantingSeasons)
          .forEach((otherRow) => {
            const otherStartDate = stringToDateTime(otherRow.startDate);
            const otherEndDate = stringToDateTime(otherRow.endDate);

            if (otherStartDate.isValid && otherEndDate.isValid) {
              if (
                (startDate >= otherStartDate && startDate <= otherEndDate) ||
                (endDate >= otherStartDate && endDate <= otherEndDate) ||
                (startDate <= otherStartDate && endDate >= otherEndDate)
              ) {
                metadata.startDateError = strings
                  .formatString(
                    strings.PLANTING_SEASON_NO_OVERLAP,
                    otherStartDate.toISODate(),
                    otherEndDate.toISODate()
                  )
                  .toString();
              }
            }
          });
      } else {
        if (!row.startDate) {
          metadata.isValid = false;
          metadata.startDateError = showSaveValidationErrors ? strings.REQUIRED_FIELD : undefined;
        } else if (!startDate.isValid) {
          metadata.startDateError = strings.INVALID_DATE;
        }

        if (!row.endDate) {
          metadata.isValid = false;
          metadata.endDateError = showSaveValidationErrors ? strings.REQUIRED_FIELD : undefined;
        } else if (!endDate.isValid) {
          metadata.endDateError = strings.INVALID_DATE;
        }
      }

      if (metadata.startDateError || metadata.endDateError) {
        metadata.isValid = false;
      }

      return metadata;
    });
  }, [rows, pastPlantingSeasons, showSaveValidationErrors, today, minStartDate, maxStartDate, stringToDateTime]);

  const allSeasonsValid: boolean = useMemo(
    () => metadataForRows.find((metadata) => !metadata.isValid) === undefined,
    [metadataForRows]
  );

  // Initialization.
  useEffect(() => {
    if (!loaded) {
      const todayString = today.toISODate();
      if (todayString) {
        const entries = props.plantingSeasons.filter((entry) => entry.endDate >= todayString);

        setRows(entries);
        setLoaded(true);
      }
    }
  }, [props.plantingSeasons, today, loaded, setLoaded, setRows]);

  // Publish current state (valid flag and, if valid, UpdatedPlantingSeason list) to parent.
  useEffect(() => {
    if (allSeasonsValid) {
      const payloads = rows.map((season) => ({
        id: season.id,
        startDate: season.startDate!,
        endDate: season.endDate!,
      }));

      setPlantingSeasons(payloads);
    }

    setPlantingSeasonsValid(allSeasonsValid);
  }, [rows, allSeasonsValid, setPlantingSeasons, setPlantingSeasonsValid]);

  const onAddPlantingSeason = () => {
    setRows(rows.concat([{}]));
    setShowSaveValidationErrors(false);
  };

  const onDeletePlantingSeason = useCallback(
    (index: number) => {
      setRows(rows.filter((_row, _index) => _index !== index));
    },
    [rows, setRows]
  );

  const onPlantingSeasonChanged = useCallback(
    (index: number, field: 'startDate' | 'endDate', value?: any) => {
      const dateTime = value ? jsDateToDateTime(value as Date) : undefined;
      const newList = rows
        .slice(0, index)
        .concat([
          {
            ...rows[index],
            [field]: dateTime?.toISODate(),
          },
        ])
        .concat(rows.slice(index + 1));

      setRows(newList);
    },
    [rows, setRows, jsDateToDateTime]
  );

  return (
    <Grid container key='plantingSeasons' spacing={2}>
      {rows.map((plantingSeason, index) => (
        <Fragment key={index}>
          <Grid item xs={5} rowSpacing={2}>
            <DatePicker
              id={`season-${index}-startDate`}
              label=''
              onChange={(value) => onPlantingSeasonChanged(index, 'startDate', value)}
              aria-label='date-picker'
              value={plantingSeason.startDate ?? ''}
              minDate={minStartDate.toISODate()}
              maxDate={maxStartDate.toISODate()}
              errorText={metadataForRows[index].startDateError}
              defaultTimeZone={timeZone.id}
            />
          </Grid>
          <Grid item xs={5}>
            <DatePicker
              id={`season-${index}-endDate`}
              label=''
              onChange={(value) => onPlantingSeasonChanged(index, 'endDate', value)}
              aria-label='date-picker'
              value={plantingSeason.endDate ?? ''}
              minDate={metadataForRows[index].minEndDate}
              maxDate={metadataForRows[index].maxEndDate}
              errorText={metadataForRows[index].endDateError}
              defaultTimeZone={timeZone.id}
            />
          </Grid>
          <Grid item xs={2}>
            <Link onClick={() => onDeletePlantingSeason(index)}>
              <Box paddingTop='8px'>
                <Icon name='iconSubtract' size='medium' />
              </Box>
            </Link>
          </Grid>
        </Fragment>
      ))}
      <Grid item xs={12}>
        <AddLink onClick={onAddPlantingSeason} key='addPlantingSeason' text={strings.ADD} large={true} />
      </Grid>
    </Grid>
  );
}

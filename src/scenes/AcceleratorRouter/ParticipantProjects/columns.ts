import { TableColumnType } from '@terraware/web-components';

import strings from 'src/strings';

export function columns(): TableColumnType[] {
  return [
    {
      key: 'dealName',
      name: strings.DEAL_NAME,
      type: 'string',
    },
    {
      key: 'cohortName',
      name: strings.COHORT,
      type: 'string',
    },
    {
      key: 'cohortPhase',
      name: strings.PHASE,
      type: 'string',
    },
    {
      key: 'fileNaming',
      name: strings.FILE_NAMING,
      type: 'string',
    },
    {
      key: 'countryCode',
      name: strings.COUNTRY,
      type: 'string',
    },
    {
      key: 'region',
      name: strings.REGION,
      type: 'string',
    },
    {
      key: 'confirmedReforestableLand',
      name: strings.RESTORABLE_LAND,
      type: 'number',
    },
    {
      key: 'landUseModelTypes',
      name: strings.LAND_USE_MODEL_TYPE,
      type: 'string',
    },
  ];
}

export function orderedColumnNames(): string[] {
  return columns().map((column) => column.key);
}

export function columnsIndexed(): Record<string, TableColumnType> {
  return columns().reduce(
    (acum, value) => {
      //console.log(`value.key = ${value.key}`);
      acum[value.key] = value;

      return acum;
    },
    {} as Record<string, TableColumnType>
  );
}

export interface Preset {
  name: string;
  fields: string[];
}

export const defaultPreset = (): Preset => {
  return {
    name: 'Default',
    fields: [
      'dealName',
      'cohortName',
      'cohortPhase',
      'fileNaming',
      'countryCode',
      'region',
      'confirmedReforestableLand',
      'landUseModelTypes',
    ],
  };
};

const generalInventoryPreset: Preset = {
  name: 'Preset Name #2',
  fields: [
    'dealName',
    'cohortName',
    'cohortPhase',
    'fileNaming',
    'countryCode',
    'region',
    'confirmedReforestableLand',
    'landUseModelTypes',
  ],
};

const seedStoragePreset: Preset = {
  name: 'Preset Name #3',
  fields: [
    'dealName',
    'cohortName',
    'cohortPhase',
    'fileNaming',
    'countryCode',
    'region',
    'confirmedReforestableLand',
    'landUseModelTypes',
  ],
};

export const searchPresets = () => {
  return [defaultPreset(), generalInventoryPreset, seedStoragePreset];
};

import React from 'react';

import { getRegionLabel } from 'src/types/ParticipantProject';
import { Region } from 'src/types/ParticipantProject';

import { ProjectFieldProps } from './';
import TextfieldDisplay from './TextfieldDisplay';

const RegionDisplay = ({ label, value }: ProjectFieldProps) => (
  <TextfieldDisplay id='project-region' label={label} value={getRegionLabel(value as Region)} />
);

export default RegionDisplay;

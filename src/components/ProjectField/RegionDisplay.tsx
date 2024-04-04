import { ProjectFieldProps } from './';
import TextfieldDisplay from './TextfieldDisplay';

const RegionDisplay = ({ label, value }: ProjectFieldProps) => (
  <TextfieldDisplay id='project-region' label={label} value={value} />
);

export default RegionDisplay;

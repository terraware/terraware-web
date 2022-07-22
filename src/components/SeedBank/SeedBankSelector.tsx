import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Select from '../common/Select/Select';
import { getAllSeedBanks } from 'src/utils/organization';

const useStyles = makeStyles(() => ({
  seedBankLabel: {
    margin: '0 8px 0 0',
    fontWeight: 500,
    fontSize: '16px',
  },
}));

export type SeedBankSelectorProps = {
  organization: ServerOrganization;
  onSelect: (facilityName: string) => void;
  selectedValue?: string;
};

export default function SeedBankSelector(props: SeedBankSelectorProps): JSX.Element {
  const classes = useStyles();
  const { organization, onSelect, selectedValue } = props;

  return (
    <>
      <p className={classes.seedBankLabel}>{strings.SEED_BANK}</p>
      <Select
        options={getAllSeedBanks(organization).map((sb) => sb?.name || '')}
        onChange={onSelect}
        selectedValue={selectedValue}
      />
    </>
  );
}

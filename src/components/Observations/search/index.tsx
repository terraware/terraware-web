import { Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type SearchProps = {
  value: string;
  onSearch: (value: string) => void;
  // TODO: add filters
};

export default function Search({ value, onSearch }: SearchProps): JSX.Element {
  const { isMobile } = useDeviceInfo();

  return (
    <>
      <Box display='flex' flexDirection='row' alignItems='center'>
        <Box width={isMobile ? '200px' : '300px'}>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(val) => onSearch(val as string)}
            value={value}
            iconRight='cancel'
            onClickRightIcon={() => onSearch('')}
          />
        </Box>
        {/* filters go here */}
      </Box>
    </>
  );
}

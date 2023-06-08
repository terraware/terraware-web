import { Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type SearchInputProps = {
  search: string;
  onSearch: (search: string) => void;
};

export type SearchProps = SearchInputProps & {
  // TODO: add filters
};

export default function Search({ search, onSearch }: SearchProps): JSX.Element {
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
            value={search}
            iconRight='cancel'
            onClickRightIcon={() => onSearch('')}
          />
        </Box>
        {/* filters go here */}
      </Box>
    </>
  );
}

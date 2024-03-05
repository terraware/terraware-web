import { Box, Typography } from '@mui/material';
import { Story } from '@storybook/react';

import ListMapView, { ListMapViewProps } from 'src/components/ListMapView';

const ListMapViewTemplate: Story<ListMapViewProps> = (args) => {
  return (
    <Box display='flex' height='300px' padding='16px' style={{ backgroundColor: 'gray' }}>
      <ListMapView
        {...args}
        search={
          <Box width='50px'>
            <input type='text' placeholder='search' style={{ fontSize: '16px', padding: '4px', borderRadius: '8px' }} />
          </Box>
        }
        list={
          <Box>
            <Typography fontSize='20px'>This is the list view</Typography>
          </Box>
        }
        map={
          <Box>
            <Typography fontSize='20px'>This is the map view</Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default {
  title: 'ListMapView',
  component: ListMapView,
};

export const Default = ListMapViewTemplate.bind({});

Default.args = {
  initialView: 'list',
};

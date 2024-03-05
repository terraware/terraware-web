import { useLocation } from 'react-router-dom';

import { Location, LocationDescriptor } from 'history';

type State = {
  from?: string;
};
type StateLocation = Location<State>;

export default function useStateLocation(): StateLocation {
  const location = useLocation<{
    from?: string;
  }>();

  return location;
}

export function getLocation(pathname: string, location: StateLocation, search?: string): LocationDescriptor<State> {
  if (location.state?.from) {
    return {
      pathname,
      state: {
        from: location.state.from,
      },
      search,
    };
  } else {
    return {
      pathname,
      state: {
        from: location.pathname,
      },
      search,
    };
  }
}

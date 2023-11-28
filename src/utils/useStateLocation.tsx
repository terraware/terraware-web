import { Location, LocationDescriptor } from 'history';
import { useLocation } from 'react-router-dom';

type State = {
  from?: string;
};
type StateLocation = Location<State>;

export default function useStateLocation(): StateLocation {
  const location = useLocation();

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

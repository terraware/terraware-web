import { useMemo, useState } from 'react';

import { useUser } from 'src/providers';

export type DismissableWrapperProps = {
  dontShowAgainPreferenceName: string;
  children: (onClose: () => void) => JSX.Element;
};

export default function DismissableWrapper(props: DismissableWrapperProps): JSX.Element | null {
  const { children, dontShowAgainPreferenceName } = props;
  const { userPreferences, updateUserPreferences } = useUser();

  // Show the children automatically if it is user preference controlled, and value is not set to true (don't show preference)
  const userPreferenceControlled = useMemo<boolean>(
    () => !!dontShowAgainPreferenceName && userPreferences[dontShowAgainPreferenceName] !== true,
    [dontShowAgainPreferenceName, userPreferences]
  );
  const [show, setShow] = useState<boolean>(userPreferenceControlled);

  const onClose = (dontShowAgain?: boolean) => {
    setShow(false);
    if (dontShowAgain && !!dontShowAgainPreferenceName) {
      updateUserPreferences({ ...userPreferences, [dontShowAgainPreferenceName]: true });
    }
  };

  if (!show) {
    return null;
  }

  return <>{children(onClose)}</>;
}

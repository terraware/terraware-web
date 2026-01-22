import React, { type JSX, useMemo, useState } from 'react';

import { useUser } from 'src/providers';

export type DismissibleWrapperProps = {
  dontShowAgainPreferenceName: string;
  children: (onClose: () => void) => JSX.Element;
};

/**
 * A wrapper that hooks up to user preferences to show or not show contents, passes
 * an onClose function to the children which is used to dismiss the content forever
 *
 * Usage:
 * <DismissibleWrapper dontShowAgainPreferenceName={'dont-show-my-component'}>
 *   {(onClose) => (
 *     <MyComponent onClose={onClose} />
 *   )}
 * </DismissibleWrapper>
 */
export default function DismissibleWrapper(props: DismissibleWrapperProps): JSX.Element | null {
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
      void updateUserPreferences({ ...userPreferences, [dontShowAgainPreferenceName]: true });
    }
  };

  if (!show) {
    return null;
  }

  return <>{children(onClose)}</>;
}

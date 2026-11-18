import React from 'react';

import { rstest } from '@rstest/core';
import { screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import PlantingSiteSelectTypeModal2 from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteSelectTypeModal2';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const renderModal = () => {
  const onClose = rstest.fn();
  const onNext = rstest.fn();

  return {
    onClose,
    onNext,
    ...renderWithProviders(<PlantingSiteSelectTypeModal2 open onClose={onClose} onNext={onNext} />),
  };
};

/**
 * The thing a user clicks to pick a site type is a plain `div` with no role, no accessible name
 * and no keyboard handling, so there is nothing to query it by: reach it from the title rendered
 * beside it. Giving it `role='button'` and its title as the accessible name would turn this into
 * `getByRole('button', { name: strings.SIMPLE_SITE })` and make the choice reachable without a
 * mouse.
 */
const siteTypeOption = (title: string): Element => {
  const option = screen.getByText(title).parentElement?.firstElementChild;
  if (!option) {
    throw new Error(`No site type option titled "${title}"`);
  }
  return option;
};

const chooseSiteType = (user: UserEvent, title: string) => user.click(siteTypeOption(title));

const nextButton = () => screen.getByRole('button', { name: strings.NEXT });

describe('PlantingSiteSelectTypeModal2', () => {
  it('will not continue until a site type is chosen', () => {
    const { onNext } = renderModal();

    expect(nextButton()).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('continues with a simple site', async () => {
    const { onNext, user } = renderModal();

    await chooseSiteType(user, strings.SIMPLE_SITE);
    await user.click(nextButton());

    expect(onNext).toHaveBeenCalledWith('Simple');
  });

  it('continues with a detailed site', async () => {
    const { onNext, user } = renderModal();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await user.click(nextButton());

    expect(onNext).toHaveBeenCalledWith('Detailed');
  });

  it('continues with the type chosen last when the choice is changed', async () => {
    const { onNext, user } = renderModal();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await chooseSiteType(user, strings.SIMPLE_SITE);
    await user.click(nextButton());

    expect(onNext).toHaveBeenCalledWith('Simple');
  });

  it('closes without choosing a site type when cancelled', async () => {
    const { onClose, onNext, user } = renderModal();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });

  // Reopening with the earlier choice still in place would create a site of a type the user never
  // picked this time round.
  it('forgets the earlier choice when it is reopened', async () => {
    const { onClose, onNext, rerender, user } = renderModal();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    rerender(<PlantingSiteSelectTypeModal2 open={false} onClose={onClose} onNext={onNext} />);
    rerender(<PlantingSiteSelectTypeModal2 open onClose={onClose} onNext={onNext} />);

    expect(nextButton()).toBeDisabled();
  });
});

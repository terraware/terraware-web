import React from 'react';

import { rstest } from '@rstest/core';
import { act, screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import CurrentViewSelect, { CurrentViewSelectProps, DEFAULT_VIEW } from './CurrentViewSelect';

const presetViews = [
  { value: 'zeta', label: 'Zeta preset', description: 'Only the last letter' },
  { value: 'alpha', label: 'Alpha preset', description: 'Only the first letter' },
];

const myViews = [
  { value: 'mine-1', label: 'My first view' },
  { value: 'mine-2', label: 'My second view' },
];

const renderSelect = (props: Partial<CurrentViewSelectProps> = {}) => {
  const onChange = rstest.fn();
  const result = renderWithProviders(
    <CurrentViewSelect
      myViews={myViews}
      onChange={onChange}
      presetViews={presetViews}
      selected={DEFAULT_VIEW}
      {...props}
    />
  );
  return { ...result, onChange };
};

const combobox = () => screen.getByRole('combobox', { name: new RegExp(strings.CURRENT_VIEW) });

const openMenu = async (user: ReturnType<typeof renderSelect>['user']) => {
  await user.click(combobox());
  return screen.findByRole('listbox');
};

const menuEntries = (listbox: HTMLElement) =>
  within(listbox)
    .getAllByRole('option')
    .map((item) => item.textContent)
    .filter(Boolean);

const option = (name: string) => screen.getByRole('option', { name: new RegExp(`^${name}`) });

const startRenaming = async (user: ReturnType<typeof renderSelect>['user'], label: string) => {
  await user.click(within(option(label)).getByRole('button', { name: strings.EDIT }));
  return screen.getByRole('textbox', { name: strings.VIEW_NAME });
};

describe('CurrentViewSelect', () => {
  describe('rendering', () => {
    it('lists the default view, sorted preset views with descriptions, and my views under section headers', async () => {
      const { user } = renderSelect();

      const listbox = await openMenu(user);

      expect(menuEntries(listbox)).toEqual([
        strings.DEFAULT,
        strings.PRESET_VIEWS.toUpperCase(),
        'Alpha presetOnly the first letter',
        'Zeta presetOnly the last letter',
        strings.MY_VIEWS.toUpperCase(),
        'My first view',
        'My second view',
      ]);
    });

    it('omits a section that has no views', async () => {
      const { user } = renderSelect({ myViews: [] });

      const listbox = await openMenu(user);

      expect(within(listbox).getByText(strings.PRESET_VIEWS.toUpperCase())).toBeInTheDocument();
      expect(within(listbox).queryByText(strings.MY_VIEWS.toUpperCase())).not.toBeInTheDocument();
    });

    it('hides the default view when its label is null', async () => {
      const { user } = renderSelect({ defaultViewLabel: null, selected: 'alpha' });

      const listbox = await openMenu(user);

      expect(menuEntries(listbox)).toEqual([
        strings.PRESET_VIEWS.toUpperCase(),
        'Alpha presetOnly the first letter',
        'Zeta presetOnly the last letter',
        strings.MY_VIEWS.toUpperCase(),
        'My first view',
        'My second view',
      ]);
    });

    it('shows the selected view name, marked as modified when the table has unsaved changes', () => {
      const { rerender } = renderSelect({ selected: 'mine-2' });

      expect(combobox()).toHaveTextContent('My second view');
      expect(combobox()).not.toHaveTextContent(strings.MODIFIED);

      rerender(
        <CurrentViewSelect
          myViews={myViews}
          modified
          onChange={rstest.fn()}
          presetViews={presetViews}
          selected='mine-2'
        />
      );

      expect(combobox()).toHaveTextContent(`My second view(${strings.MODIFIED})`);
    });
  });

  describe('choosing a view', () => {
    it('reports the chosen view', async () => {
      const { onChange, user } = renderSelect();

      await openMenu(user);
      await user.click(option('Zeta preset'));

      expect(onChange).toHaveBeenCalledWith('zeta');
    });

    it('reports the already-selected view when it is chosen again so it can be reapplied', async () => {
      const { onChange, user } = renderSelect({ modified: true, selected: 'mine-1' });

      await openMenu(user);
      await user.click(option('My first view'));

      expect(onChange).toHaveBeenCalledWith('mine-1');
    });

    it('starts saving a new view instead of changing views when the save item is chosen', async () => {
      const onSave = rstest.fn();
      const { onChange, user } = renderSelect({ onSave, showSave: true });

      await openMenu(user);
      await user.click(screen.getByRole('option', { name: strings.SAVE_TABLE_NEW_VIEW }));

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not offer saving a new view unless asked to', async () => {
      const { user } = renderSelect({ onSave: rstest.fn() });

      await openMenu(user);

      expect(screen.queryByRole('option', { name: strings.SAVE_TABLE_NEW_VIEW })).not.toBeInTheDocument();
    });
  });

  describe('renaming a view', () => {
    it('opens a name field prefilled with the current name from the edit button', async () => {
      const { user } = renderSelect({ onRenameView: rstest.fn() });

      await openMenu(user);
      const field = await startRenaming(user, 'My second view');

      expect(field).toHaveValue('My second view');
    });

    it('opens the name field with F2 on a focused view', async () => {
      const { user } = renderSelect({ onRenameView: rstest.fn() });

      await openMenu(user);
      act(() => option('My first view').focus());
      await user.keyboard('{F2}');

      expect(screen.getByRole('textbox', { name: strings.VIEW_NAME })).toHaveValue('My first view');
    });

    it('sends the trimmed name when Enter is pressed and closes the field', async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, '  Renamed view  {Enter}');

      expect(onRenameView).toHaveBeenCalledWith('mine-1', 'Renamed view');
      await waitFor(() => expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument());
    });

    it('sends the new name when the save button is clicked', async () => {
      const onRenameView = rstest.fn();
      const { onChange, user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, 'Renamed view');
      await user.click(screen.getByRole('button', { name: strings.SAVE }));

      expect(onRenameView).toHaveBeenCalledWith('mine-1', 'Renamed view');
      expect(onChange).not.toHaveBeenCalled();
    });

    it('discards the edit when Escape is pressed', async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.type(field, ' changed{Escape}');

      expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument();
      expect(onRenameView).not.toHaveBeenCalled();
      expect(option('My first view')).toBeInTheDocument();
    });

    it('discards the edit when the cancel button is clicked', async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.type(field, ' changed');
      await user.click(screen.getByRole('button', { name: strings.CANCEL }));

      expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument();
      expect(onRenameView).not.toHaveBeenCalled();
    });

    it('requires a name', async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, '   ');

      expect(screen.getByText(strings.VIEW_NAME_REQUIRED)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
      await user.keyboard('{Enter}');
      expect(onRenameView).not.toHaveBeenCalled();
    });

    it("rejects another view's name regardless of case and surrounding spaces", async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, '  MY SECOND VIEW ');

      expect(screen.getByText(strings.VIEW_NAME_EXISTS)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
      await user.keyboard('{Enter}');
      expect(onRenameView).not.toHaveBeenCalled();
    });

    it('closes without renaming when the name is unchanged', async () => {
      const onRenameView = rstest.fn();
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      await startRenaming(user, 'My first view');

      expect(screen.queryByText(strings.VIEW_NAME_EXISTS)).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: strings.SAVE }));

      expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument();
      expect(onRenameView).not.toHaveBeenCalled();
    });

    it('keeps the name field open when the rename fails', async () => {
      const onRenameView = rstest.fn().mockRejectedValue(new Error('failed'));
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, 'Renamed view{Enter}');

      await waitFor(() => expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled());
      expect(screen.getByRole('textbox', { name: strings.VIEW_NAME })).toHaveValue('Renamed view');
    });

    it('closes the name field once the rename succeeds', async () => {
      let resolveRename: () => void = () => undefined;
      const onRenameView = rstest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveRename = resolve;
          })
      );
      const { user } = renderSelect({ onRenameView });

      await openMenu(user);
      const field = await startRenaming(user, 'My first view');
      await user.clear(field);
      await user.type(field, 'Renamed view{Enter}');

      expect(screen.getByRole('textbox', { name: strings.VIEW_NAME })).toBeInTheDocument();
      await act(async () => {
        resolveRename();
        await Promise.resolve();
      });

      await waitFor(() => expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument());
    });

    it('offers no way to rename when renaming is not supported', async () => {
      const { user } = renderSelect({ onDeleteView: rstest.fn() });

      await openMenu(user);
      act(() => option('My first view').focus());
      await user.keyboard('{F2}');

      expect(within(option('My first view')).queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: strings.VIEW_NAME })).not.toBeInTheDocument();
    });

    it('offers no way to rename preset views', async () => {
      const { user } = renderSelect({ onRenameView: rstest.fn() });

      await openMenu(user);

      expect(within(option('Alpha preset')).queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
    });
  });

  describe('deleting a view', () => {
    it('deletes a view from its delete button and closes the menu', async () => {
      const onDeleteView = rstest.fn();
      const { onChange, user } = renderSelect({ onDeleteView });

      await openMenu(user);
      await user.click(within(option('My second view')).getByRole('button', { name: strings.DELETE }));

      expect(onDeleteView).toHaveBeenCalledWith('mine-2');
      expect(onChange).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    });

    it.each(['{Delete}', '{Backspace}'])('deletes a focused view with %s and closes the menu', async (key) => {
      const onDeleteView = rstest.fn();
      const { user } = renderSelect({ onDeleteView });

      await openMenu(user);
      act(() => option('My first view').focus());
      await user.keyboard(key);

      expect(onDeleteView).toHaveBeenCalledWith('mine-1');
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    });

    it('offers no way to delete when deleting is not supported', async () => {
      const { user } = renderSelect({ onRenameView: rstest.fn() });

      await openMenu(user);
      act(() => option('My first view').focus());
      await user.keyboard('{Delete}');

      expect(within(option('My first view')).queryByRole('button', { name: strings.DELETE })).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('offers no way to delete preset views', async () => {
      const { user } = renderSelect({ onDeleteView: rstest.fn() });

      await openMenu(user);

      expect(within(option('Alpha preset')).queryByRole('button', { name: strings.DELETE })).not.toBeInTheDocument();
    });
  });
});

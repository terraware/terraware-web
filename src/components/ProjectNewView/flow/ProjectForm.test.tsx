import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { AppStore } from 'src/redux/store';
import strings from 'src/strings';
import { captureRequests, mockPost, renderWithProviders, server } from 'src/test-utils';

import ProjectForm from './ProjectForm';

// Textfield labels target the input wrapper rather than the input itself.
const getNameInput = () => {
  const label = screen.getByText(`${strings.NAME} *`);
  const wrapper = document.getElementById(label.getAttribute('for') ?? '');
  const input = wrapper?.querySelector('input');
  if (!input) {
    throw new Error('Name input not found');
  }
  return input;
};

describe('ProjectForm', () => {
  let projectRequests: Request[];

  beforeEach(() => {
    projectRequests = captureRequests('get', '/api/v1/projects', {
      projects: [{ id: 1, name: 'Existing Project', organizationId: 1 }],
    });
    mockPost('/api/v1/search', { results: [] });
  });

  const renderForm = (store?: AppStore) => {
    const onNext = rstest.fn();
    const result = renderWithProviders(
      <ProjectForm
        project={{ name: '', organizationId: 1 }}
        onNext={onNext}
        onCancel={rstest.fn()}
        saveText={strings.NEXT}
      />,
      { store }
    );
    return { ...result, onNext };
  };

  it.each(['New Project', 'Existing Project'])(
    'waits for project names before advancing with %s',
    async (projectName) => {
      let finishLoading!: () => void;
      const loading = new Promise<void>((resolve) => {
        finishLoading = resolve;
      });
      server.use(
        http.get('/api/v1/projects', async () => {
          await loading;
          return HttpResponse.json({
            status: 'ok',
            projects: [{ id: 1, name: 'Existing Project', organizationId: 1 }],
          });
        })
      );

      const { user, onNext } = renderForm();
      const next = screen.getByRole('button', { name: strings.NEXT });
      try {
        await user.type(getNameInput(), projectName);
        await user.keyboard('{Enter}');
        await user.tab();
        expect(next).toBeDisabled();
        expect(onNext).not.toHaveBeenCalled();
      } finally {
        finishLoading();
      }

      if (projectName === 'Existing Project') {
        expect(
          await screen.findByText(strings.formatString(strings.PROJECT_NAME_IN_USE, projectName) as string)
        ).toBeInTheDocument();
        expect(next).toBeDisabled();
        expect(onNext).not.toHaveBeenCalled();
      } else {
        await waitFor(() => expect(next).toBeEnabled());
        await user.click(next);
        expect(onNext).toHaveBeenCalledWith({ name: projectName, organizationId: 1 });
      }
    }
  );

  it('reports a duplicate after blur and prevents advancing until the name is unique', async () => {
    const { user, onNext } = renderForm();
    const name = getNameInput();
    const next = screen.getByRole('button', { name: strings.NEXT });
    const duplicateError = '"Existing Project" is already in use. Please provide a new name.';

    await user.type(name, 'Existing Project');
    expect(screen.queryByText(duplicateError)).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByText(duplicateError)).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();

    await user.clear(name);
    await user.type(name, 'New Project');
    await user.tab();
    expect(screen.queryByText(duplicateError)).not.toBeInTheDocument();
    expect(next).toBeEnabled();
    await user.click(next);
    expect(onNext).toHaveBeenCalledWith({ name: 'New Project', organizationId: 1 });
  });

  it('keeps the user on the form and reports a required name when advancing without one', async () => {
    const { user, onNext } = renderForm();

    await user.click(screen.getByRole('button', { name: strings.NEXT }));

    expect(screen.getByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it('allows a name whose case differs from an existing project', async () => {
    const { user, onNext } = renderForm();

    await user.type(getNameInput(), 'existing project');
    await user.tab();
    await user.click(screen.getByRole('button', { name: strings.NEXT }));

    expect(onNext).toHaveBeenCalledWith({ name: 'existing project', organizationId: 1 });
  });

  it('uses cached project names when returning to the form', async () => {
    const first = renderForm();
    await first.user.type(getNameInput(), 'Existing Project');
    await first.user.tab();
    expect(
      await screen.findByText(strings.formatString(strings.PROJECT_NAME_IN_USE, 'Existing Project') as string)
    ).toBeInTheDocument();
    first.unmount();

    const { user } = renderForm(first.store);
    await user.type(getNameInput(), 'Existing Project');
    await user.tab();

    expect(
      screen.getByText(strings.formatString(strings.PROJECT_NAME_IN_USE, 'Existing Project') as string)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.NEXT })).toBeDisabled();
    expect(projectRequests).toHaveLength(1);
  });
});

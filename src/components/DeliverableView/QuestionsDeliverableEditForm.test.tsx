import React, { useState } from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';
import { DeliverableWithOverdue } from 'src/types/Deliverables';

import QuestionsDeliverableEditForm from './QuestionsDeliverableEditForm';

const deliverable: DeliverableWithOverdue = {
  id: 4,
  projectId: 7,
  organizationId: 1,
  organizationName: 'Restoration',
  projectName: 'Forest',
  name: 'Questionnaire',
  category: 'Compliance',
  documents: [],
  position: 1,
  required: true,
  sensitive: false,
  status: 'Not Submitted',
  type: 'Questions',
};

const Form = () => {
  const [exited, setExited] = useState(false);
  return exited ? (
    <p>Returned to deliverable</p>
  ) : (
    <QuestionsDeliverableEditForm deliverable={deliverable} exit={() => setExited(true)} />
  );
};

it.each([
  'images',
  'values',
  'complete',
  'incomplete',
  'value-error',
  'image-error',
  'images-error',
  'complete-error',
  'empty',
])(
  'waits for every questionnaire request before unlocking or exiting and retries only failed work (%s)',
  async (mode) => {
    mockGet('/build-version.txt');
    const baseVariable = { internalOnly: false, isList: false, isRequired: false };
    mockGet('/api/v1/document-producer/variables', {
      variables:
        mode === 'empty'
          ? []
          : [
              {
                ...baseVariable,
                id: 1,
                stableId: 'question',
                name: 'Question',
                type: 'Text',
                textType: 'SingleLine',
                isRequired: mode !== 'complete-error',
              },
              { ...baseVariable, id: 2, stableId: 'photos', name: 'Photos', type: 'Image', isList: true },
            ],
    });
    mockGet('/api/v1/document-producer/projects/7/values', { values: [] });
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let receivedFastResponse!: () => void;
    const fastResponse = new Promise<void>((resolve) => {
      receivedFastResponse = resolve;
    });
    const onResponse = ({ request, response }: { request: Request; response: Response }) => {
      if (
        ['value-error', 'image-error', 'images-error'].includes(mode)
          ? response.status === 500
          : request.url.endsWith('/complete')
      ) {
        receivedFastResponse();
      }
    };
    server.events.on('response:mocked', onResponse);
    const requests: Request[] = [];
    let images = 0;
    let values = 0;
    server.use(
      http.post('/api/v1/document-producer/projects/7/images', async ({ request }) => {
        requests.push(request.clone());
        images++;
        const fails = (mode === 'image-error' && images === 1) || (mode === 'images-error' && images <= 2);
        if (['images', 'value-error', 'image-error', 'images-error'].includes(mode) && images === 2) {
          await pending;
        }
        return HttpResponse.json({ status: fails ? 'error' : 'ok' }, { status: fails ? 500 : 200 });
      }),
      http.post('/api/v1/document-producer/projects/7/values', async ({ request }) => {
        requests.push(request.clone());
        values++;
        if (mode === 'values') {
          await pending;
        }
        return HttpResponse.json(
          { status: mode === 'value-error' && values === 1 ? 'error' : 'ok' },
          { status: mode === 'value-error' && values === 1 ? 500 : 200 }
        );
      }),
      http.post('/api/v1/accelerator/deliverables/4/submissions/7/:status', async ({ request }) => {
        requests.push(request.clone());
        if (['complete', 'incomplete', 'complete-error'].includes(mode)) {
          await pending;
        }
        return HttpResponse.json(
          { status: mode === 'complete-error' ? 'error' : 'ok' },
          { status: mode === 'complete-error' ? 500 : 200 }
        );
      })
    );
    try {
      const { user, store } = renderWithProviders(<Form />, {
        route: mode === 'empty' ? '/deliverables/4/edit' : '/applications/9/deliverables/4/edit',
      });
      const save = screen.getByRole('button', { name: strings.SAVE });
      const cancel = screen.getByRole('button', { name: strings.CANCEL });
      const noChanges = ['incomplete', 'complete-error', 'empty'].includes(mode);
      if (mode !== 'empty') {
        await screen.findByText('Photos');
      } else {
        await waitFor(() => expect(screen.queryByRole('textbox')).not.toBeInTheDocument());
      }
      if (!noChanges) {
        await user.type(document.querySelector('#value input') as HTMLInputElement, 'Restoring forest');
        const files = [
          new File(['x'], 'first.jpg', { type: 'image/jpeg' }),
          new File(['y'], 'second.jpg', { type: 'image/jpeg' }),
        ];
        await user.upload(document.querySelector('input[type="file"]') as HTMLInputElement, files);
        await screen.findByRole('img', { name: 'second.jpg' });
      }
      await user.click(save);
      if (mode === 'empty') {
        await screen.findByText('Returned to deliverable');
        expect(requests).toHaveLength(0);
        return;
      }
      await waitFor(() => expect(requests).toHaveLength(noChanges ? 1 : 4));
      expect(
        requests.some((request) => request.url.endsWith(mode === 'incomplete' ? '/incomplete' : '/complete'))
      ).toBe(true);
      if (!['complete', 'incomplete', 'complete-error'].includes(mode)) {
        await act(async () => {
          await fastResponse;
        });
      }
      expect(save).toBeDisabled();
      expect(cancel).toBeDisabled();
      expect(screen.queryByText('Returned to deliverable')).not.toBeInTheDocument();
      save.click();
      expect(requests).toHaveLength(noChanges ? 1 : 4);
      release();
      if (['value-error', 'image-error', 'images-error'].includes(mode)) {
        await waitFor(() => expect(save).toBeEnabled());
        expect(cancel).toBeEnabled();
        expect(screen.queryByText('Returned to deliverable')).not.toBeInTheDocument();
        expect(document.querySelector('#value input')).toHaveValue('Restoring forest');
        expect(screen.getByRole('img', { name: 'first.jpg' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'second.jpg' })).toBeInTheDocument();
      } else {
        await screen.findByText('Returned to deliverable');
      }
      if (mode === 'value-error' || mode === 'complete-error') {
        await waitFor(() =>
          expect(store.getState().snackbar.snackbars.toast).toMatchObject({
            priority: 'critical',
            msg: strings.GENERIC_ERROR,
          })
        );
      }
      if (['value-error', 'image-error', 'images-error'].includes(mode)) {
        const valueRequests = requests.filter((request) => request.url.endsWith('/values'));
        expect(await valueRequests[0].clone().json()).toMatchObject({
          operations: [{ operation: 'Append', variableId: 1 }],
        });
        await user.click(save);
        await screen.findByText('Returned to deliverable');
        expect(requests.filter((request) => request.url.endsWith('/values'))).toHaveLength(
          mode === 'value-error' ? 2 : 1
        );
        const imageRequests = requests.filter((request) => request.url.endsWith('/images'));
        expect(imageRequests).toHaveLength(mode === 'value-error' ? 2 : mode === 'image-error' ? 3 : 4);
        const filenames = await Promise.all(
          imageRequests.map(async (request) => ((await request.clone().formData()).get('file') as File).name)
        );
        expect(filenames.filter((name) => name === 'first.jpg')).toHaveLength(mode === 'value-error' ? 1 : 2);
        expect(filenames.filter((name) => name === 'second.jpg')).toHaveLength(mode === 'images-error' ? 2 : 1);
        expect(requests.filter((request) => request.url.endsWith('/complete'))).toHaveLength(2);
        expect(requests.filter((request) => request.url.endsWith('/incomplete'))).toHaveLength(0);
      }
    } finally {
      release();
      server.events.removeListener('response:mocked', onResponse);
    }
  }
);

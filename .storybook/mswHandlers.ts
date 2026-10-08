import { HttpResponse, http, passthrough } from 'msw';

const countries = [
  { code: 'BR', name: 'Brazil' },
  { code: 'KE', name: 'Kenya' },
  {
    code: 'US',
    name: 'United States',
    subdivisions: [
      { code: 'US-CA', name: 'California' },
      { code: 'US-HI', name: 'Hawaii' },
    ],
  },
];

const timeZones = [
  { id: 'America/Los_Angeles', longName: 'Pacific Time - Los Angeles' },
  { id: 'Africa/Nairobi', longName: 'East Africa Time - Nairobi' },
  { id: 'Etc/UTC', longName: 'Coordinated Universal Time' },
];

export const mswHandlers = [
  http.post('/api/v1/search', async ({ request }) => {
    const { prefix } = (await request.clone().json()) as { prefix?: string };
    return prefix === 'countries' ? HttpResponse.json({ results: countries }) : passthrough();
  }),
  http.get('/api/v1/i18n/timeZones', () => HttpResponse.json({ status: 'ok', timeZones })),
];

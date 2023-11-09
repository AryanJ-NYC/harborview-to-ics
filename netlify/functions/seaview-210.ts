import type { Handler } from '@netlify/functions';
import { createEvents } from 'ics';

export const handler: Handler = async () => {
  if (typeof process.env.PASSWORD !== 'string') {
    throw new Error('Password not found');
  }

  const options = {
    method: 'POST',
    body: new URLSearchParams({
      userName: 'AryanJabbari@gmail.com',
      usernametest: '',
      password: process.env.PASSWORD,
      pmId: 'undefined',
      source: 'EscapiaVRS',
      grant_type: 'password',
    }),
  };

  const resp = await fetch('https://owner.escapia.com/auth/token', options);
  const data: { access_token: string } = await resp.json();

  let cookies = resp.headers.get('set-cookie');
  if (cookies) {
    cookies = cookies
      .concat('ASP.NET_SessionId=itjustneedsavalueapparently;')
      .concat('source=EscapiaVRS;');
  }

  const options2 = {
    method: 'GET',
    headers: { Authorization: `Bearer ${data.access_token}`, Cookie: cookies ?? '' },
  };
  const resp2 = await fetch(
    'https://owner.escapia.com/api/calendar/reservations?ownerId=16740316&unitId=229742',
    options2
  );
  const data2: { events: BookingEvent[] } = await resp2.json();

  const mappedEvents = data2.events.map((e) => ({
    start: dateStringToArray(e.checkIn),
    end: dateStringToArray(e.checkOut),
    title: e.title,
  }));
  const { value } = createEvents(mappedEvents);

  return {
    body: value,
    headers: { 'Content-Type': 'text/calendar', 'Cache-Control': 'max-age=21600' },
    statusCode: 200,
  };
};

type BookingEvent = {
  checkIn: string;
  checkOut: string;
  title: string;
};

const dateStringToArray = (dateString: string): [number, number, number, number, number] => {
  const date = new Date(dateString);
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
};

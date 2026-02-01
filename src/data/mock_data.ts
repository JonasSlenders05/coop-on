// src/data/mock_data.ts
export interface Event {
  id: number;
  naam: string;
  location: string;
  startDate: Date;
  eindDatum: Date;
}

export const EVENTS: Event[] = [
  {
    id: 1,
    naam: 'Pukkelpop',
    location: 'Kiewit',
    startDate: new Date('2025-08-14'),
    eindDatum: new Date('2025-08-17'),
  },
  {
    id: 2,
    naam: 'Rock Werchter',
    location: 'Werchter',
    startDate: new Date('2025-07-03'),
    eindDatum: new Date('2025-07-06'),
  },
  {
    id: 3,
    naam: 'Tomorrowland',
    location: 'Boom',
    startDate: new Date('2025-07-18'),
    eindDatum: new Date('2025-07-27'),
  },
];

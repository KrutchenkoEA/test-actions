
// @ts-ignore
import { IDashboardRawData } from '../../../../models';

export const mockRawResponse: IDashboardRawData = {
  formula: 'mock',
  result: [
    {
      Err: '',
      ResArray: {
        'Время работы': {
          value: [
            { time: '2024-11-05T20:00:00.000Z', val: 48 },
            { time: '2024-11-05T20:01:00.000Z', val: 44 },
            { time: '2024-11-05T20:02:00.000Z', val: 40 },
            { time: '2024-11-05T20:03:00.000Z', val: 39 },
            { time: '2024-11-05T20:04:00.000Z', val: 35 },
            { time: '2024-11-05T20:05:00.000Z', val: 34 },
            { time: '2024-11-05T20:06:00.000Z', val: 33 },
            { time: '2024-11-05T20:07:00.000Z', val: 37 },
            { time: '2024-11-05T20:08:00.000Z', val: 38 },
            { time: '2024-11-05T20:09:00.000Z', val: 43 },
          ],
          order: 2,
        },
        'Планируемые потери': {
          value: [
            { time: '2024-11-05T20:00:00.000Z', val: 50 },
            { time: '2024-11-05T20:01:00.000Z', val: 44 },
            { time: '2024-11-05T20:02:00.000Z', val: 47 },
            { time: '2024-11-05T20:03:00.000Z', val: 41 },
            { time: '2024-11-05T20:04:00.000Z', val: 43 },
            { time: '2024-11-05T20:05:00.000Z', val: 48 },
            { time: '2024-11-05T20:06:00.000Z', val: 50 },
            { time: '2024-11-05T20:07:00.000Z', val: 52 },
            { time: '2024-11-05T20:08:00.000Z', val: 57 },
            { time: '2024-11-05T20:09:00.000Z', val: 55 },
          ],
          order: 1,
        },
      },
      Result: '',
    },
  ],
  valid: true,
};

export const mockRawResponseTable = {
  formula: 'mock',
  result: [
    {
      Err: '',
      ResArray: {
        tableRowOrder: {
          name: 2,
          time: 3,
          val: 4,
          order: 1,
        },
        value: [
          { name: 'v1', time: '2024-11-05T20:00:00.000Z', val: 50 },
          { name: 'v2', time: '2024-11-05T20:01:00.000Z', val: 44 },
          { name: 'v3', time: '2024-11-05T20:02:00.000Z', val: 47 },
          { name: 'v4', time: '2024-11-05T20:03:00.000Z', val: 41 },
          { name: 'v5', time: '2024-11-05T20:04:00.000Z', val: 43 },
          { name: 'v6', time: '2024-11-05T20:05:00.000Z', val: 48 },
          { name: 'v7', time: '2024-11-05T20:06:00.000Z', val: 50 },
          { name: 'v8', time: '2024-11-05T20:07:00.000Z', val: 52 },
          { name: 'v9', time: '2024-11-05T20:08:00.000Z', val: 57 },
          { name: 'v10', time: '2024-11-05T20:09:00.000Z', val: 55 },
        ],
      },
      Result: '',
    },
  ],
  valid: true,
};

export const getMockRawResponse = (): IDashboardRawData => JSON.parse(JSON.stringify(mockRawResponse));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMockTableRawResponse = (): any => JSON.parse(JSON.stringify(mockRawResponseTable));

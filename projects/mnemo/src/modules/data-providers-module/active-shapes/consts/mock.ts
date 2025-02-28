import { IDashboardRawData, IDashboardRawDataTable } from '../../../../models';

export const mockPie: IDashboardRawData = {
  valid: true,
  formula:
    'calc_py.PieChartByEquips(startTime=\u00222023-02-01 00:00:00\u0022,endTime=\u00222023-03-31 23:59:59\u0022,equips=Array(Object(\u0022name\u0022,\u0022МБЕ\u0022,\u0022ids\u0022,\u0022polus.p3.Status.185,polus.p3.Status.187,polus.p3.Status.190,polus.p3.Status.193,polus.p3.Status.198,polus.p3.Status.209,polus.p3.Status.232,polus.p3.Status.244,polus.p3.Status.266,polus.p3.Status.304,polus.p3.Status.937\u0022),Object(\u0022name\u0022,\u0022КБЕ\u0022,\u0022ids\u0022,\u0022polus.p3.Status.785,polus.p3.Status.789,polus.p3.Status.804,polus.p3.Status.825,polus.p3.Status.850,polus.p3.Status.871,polus.p3.Status.898,polus.p3.Status.935\u0022)))',
  result: [
    {
      Err: '',
      ResArray: {
        КБЕ: {
          order: 2,
          value: [
            {
              name: 'Планируемые потери в доступное время (код9)',
              val: 15.862962729717601,
              order: 2,
            },
            {
              name: 'Время работы (код7)',
              val: 79.23055869993094,
              order: 1,
            },
            {
              name: 'Планируемые потери во время ремонтного простоя (код11)',
              val: 1.6804632686522283,
            },
            {
              name: 'Не планируемые потери в доступное время (код10)',
              val: 0.32170565648729627,
            },
            {
              name: 'Не планируемые потери во время ремонтного простоя (код12)',
              val: 2.90430964521193,
              order: 5,
            },
          ],
        },
        МБЕ: {
          order: 1,
          value: [
            {
              name: 'Планируемые потери в доступное время (код9)',
              val: 11.937421604981521,
              order: 2,
            },
            {
              name: 'Время работы (код7)',
              val: 73.37418235507337,
              order: 1,
            },
            {
              name: 'Планируемые потери во время ремонтного простоя (код11)',
              val: 4.481988523192231,
              order: 4,
            },
            {
              name: 'Не планируемые потери в доступное время (код10)',
              val: 0.5440004204346193,
              order: 4,
            },
            {
              name: 'Не планируемые потери во время ремонтного простоя (код12)',
              val: 9.662407096317708,
              order: 5,
            },
          ],
        },
      },
      Result: 0,
    },
  ],
};

export const mockBarLine: IDashboardRawData = {
  valid: true,
  formula:
    'calc_py.PerEventsBarsByTime(tagNames=\u0022polus.p3.Status.2,polus.p3.Status.101,polus.p3.Status.111,polus.p3.Status.124,polus.p3.Status.132,polus.p3.Status.153,polus.p3.Status.23,polus.p3.Status.43,polus.p3.Status.58,polus.p3.Status.68,polus.p3.Status.91,polus.p3.Status.99,polus.p3.Status.183,polus.p3.Status.190,polus.p3.Status.198,polus.p3.Status.212,polus.p3.Status.232,polus.p3.Status.243,polus.p3.Status.265,polus.p3.Status.283,polus.p3.Status.291,polus.p3.Status.316,polus.p3.Status.937,polus.p3.Status.332,polus.p3.Status.340,polus.p3.Status.361,polus.p3.Status.376,polus.p3.Status.401,polus.p3.Status.424,polus.p3.Status.448,polus.p3.Status.469,polus.p3.Status.498,polus.p3.Status.941,polus.p3.Status.506,polus.p3.Status.511,polus.p3.Status.535,polus.p3.Status.550,polus.p3.Status.563,polus.p3.Status.573,polus.p3.Status.603,polus.p3.Status.625,polus.p3.Status.644,polus.p3.Status.942,polus.p3.Status.653,polus.p3.Status.658,polus.p3.Status.673,polus.p3.Status.689,polus.p3.Status.714,polus.p3.Status.732,polus.p3.Status.759,polus.p3.Status.781,polus.p3.Status.943,polus.p3.Status.785,polus.p3.Status.789\u0022,startTime=\u00222023-02-01 00:00:00\u0022,endTime=\u00222023-03-31 23:59:59\u0022,interval=\u0022month\u0022,isPercent=\u0022false\u0022)',
  result: [
    {
      Err: '',
      ResArray: {
        'Время работы (код7)': {
          order: 7,
          value: [
            {
              time: '2023-02-01T00:00:00.000Z',
              val: 18.16043416666665,
            },
            {
              time: '2023-03-01T00:00:00.000Z',
              val: 19.562343888888996,
            },
          ],
        },
        'Не планируемые потери в доступное время (код10)': {
          order: 4,
          value: [
            {
              time: '2023-02-01T00:00:00.000Z',
              val: 1.3322819444444454,
            },
            {
              time: '2023-03-01T00:00:00.000Z',
              val: 0.2790997222222221,
            },
          ],
        },
        'Не планируемые потери во время ремонтного простоя (код12)': {
          order: 5,
          value: [
            {
              time: '2023-02-01T00:00:00.000Z',
              val: 0.7270352777777777,
            },
            {
              time: '2023-03-01T00:00:00.000Z',
              val: 1.07946861111111,
            },
          ],
        },
        'Планируемые потери во время ремонтного простоя (код11)': {
          order: 3,
          value: [
            {
              time: '2023-02-01T00:00:00.000Z',
              val: 0.8157372222222167,
            },
            {
              time: '2023-03-01T00:00:00.000Z',
              val: 1.0563724999999957,
            },
          ],
        },
        'Планируемые потери в доступное время (код9)': {
          order: 0,
          value: [
            {
              time: '2023-02-01T00:00:00.000Z',
              val: 4.7899608333333505,
            },
            {
              time: '2023-03-01T00:00:00.000Z',
              val: 2.65228027777777,
            },
          ],
        },
      },
      Result: 0,
    },
  ],
};

export const mockTable: IDashboardRawDataTable = {
  valid: true,
  formula:
    'calc_py.TableKioKtg(tagNames=\u0022polus.p3.Status.332,polus.p3.Status.333,polus.p3.Status.335,polus.p3.Status.338\u0022,startTime=\u00222023-02-01 00:00:00\u0022,endTime=\u00222023-03-31 23:59:59\u0022,interval=\u0022day\u0022)',
  result: [
    {
      Err: '',
      ResArray: {
        tableRowOrder: {
          'Имя оборудования': 3,
          КИО: 1,
          КТГ: 2,
        },
        value: [
          {
            lastRow: true,
            'Имя оборудования': 'Всего',
            КИО: 0.817,
            КТГ: 0.924,
          },
          {
            'Имя оборудования': 'Конв.332',
            КИО: 0.791,
            КТГ: 0.901,
          },
          {
            'Имя оборудования': 'Конв.333',
            КИО: 0.834,
            КТГ: 0.943,
          },
          {
            'Имя оборудования': 'Конв.335',
            КИО: 0.826,
            КТГ: 0.928,
          },
          {
            'Имя оборудования': 'Конв.338',
            КИО: 0,
            КТГ: 0,
          },
        ],
      },
      Result: 0,
    },
  ],
};

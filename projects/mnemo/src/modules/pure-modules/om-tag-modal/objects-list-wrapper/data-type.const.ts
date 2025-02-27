import { EmitterNameType, IObjectAttribute } from '../../../../models';

export const dataTypeNames: EmitterNameType[] = ['constants', 'tags', 'formulas', 'SQLs', 'urls', 'attributes'];

export const dataTypeMap: Map<
  string,
  {
    value: number | null;
    emitterName: EmitterNameType;
    emitterFunc?: Function;
  }
> = new Map<
  string,
  {
    value: number | null;
    emitterName: EmitterNameType;
    emitterFunc?: Function;
  }
>([
  [
    'Константа',
    {
      value: 1,
      emitterName: 'constants',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitterFunc(attributes: IObjectAttribute[], ...args: unknown[]): unknown {
        return null;
      },
    },
  ],
  [
    'Тег',
    {
      value: 2,
      emitterName: 'tags',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitterFunc(attributes: IObjectAttribute[], parentGuid: string, parentPath: string, ...args: unknown[]): unknown {
        return attributes.map((attr) => {
          return {
            tagName: attr.inputData,
            parentGuid,
            parentPath,
          };
        });
      },
    },
  ],
  [
    'Формула',
    {
      value: 3,
      emitterName: 'formulas',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitterFunc(attributes: IObjectAttribute[], ...args: unknown[]): unknown {
        return null;
      },
    },
  ],
  [
    'SQL',
    {
      value: 4,
      emitterName: 'SQLs',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitterFunc(attributes: IObjectAttribute[], ...args: unknown[]): unknown {
        return null;
      },
    },
  ],
  [
    'Ссылка',
    {
      value: 5,
      emitterName: 'urls',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emitterFunc(attributes: IObjectAttribute[], ...args: unknown[]): unknown {
        return attributes.map((attr) => {
          return {
            name: attr.name,
            guid: attr.guid,
          };
        });
      },
    },
  ],
  [
    'Все',
    {
      value: null,
      emitterName: 'attributes',
      emitterFunc(
        attributes: IObjectAttribute[],
        attrParentGuid: string,
        attrParentPath: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ...args: unknown[]
      ): unknown {
        return attributes.map((attr) => {
          return {
            attrGuid: attr.guid,
            attrName: attr.name,
            attrType: attr.dataType,
            attrParentPath,
            attrParentGuid,
          };
        });
      },
    },
  ],
]);

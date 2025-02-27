import { Dirent } from 'fs';

interface IShapeItem {
  name: string;
  shape: string;
  cellType?: string;
  pathToImg?: string;
  searchLabel?: string;
}

const fs = require('fs');
const path = require('path');

const localePath = path.join(__dirname, `..\\i18n\\shapes`);
const ruData = JSON.parse(fs.readFileSync(`${localePath}\\ru.json`).toString());
const enData = JSON.parse(fs.readFileSync(`${localePath}\\en.json`).toString());
const faData = JSON.parse(fs.readFileSync(`${localePath}\\fa.json`).toString());

export const createShapeObject = (shapePrefix: string, folderName: string, shapes: Dirent[]): IShapeItem[] => {
  const shapesArr: IShapeItem[] = [];
  shapes.forEach((shape) => {
    if (shape.isFile()) {
      const newName = shape.name?.match(/\(.*\)/i)?.[0].slice(1, -1) ?? shape.name;
      const ruLabel = ruData?.[newName] ?? '';
      const enLabel = enData?.[newName] ?? '';
      const faLabel = faData?.[newName] ?? '';

      const shapeItem: IShapeItem = {
        name: newName,
        pathToImg: `${shapePrefix}/${folderName}/${shape.name}`,
        shape: 'image',
        cellType: 'svg-shape',
        searchLabel: `${ruLabel} ${enLabel} ${faLabel} ${newName}`,
      };
      shapesArr.push(shapeItem);
    }
  });
  return shapesArr;
};

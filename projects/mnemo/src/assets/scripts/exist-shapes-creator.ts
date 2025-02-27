import { ShapeCreator } from './shapeCreator.class';

const path = require('path');

const shapePrefix = 'shapes';
const importedShapes = new ShapeCreator(
  path.join(__dirname, `..\\..\\..\\shapes\\${shapePrefix}`),
  shapePrefix,
  path.join(__dirname, `..\\`)
);

importedShapes.readDir('\\default', null, null);
importedShapes.createFiles();
importedShapes.logger();

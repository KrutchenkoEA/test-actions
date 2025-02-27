import { ShapeCreator } from './shapeCreator.class';

const path = require('path');

const shapePrefix = 'imported-shapes';
const importedShapesCreator = new ShapeCreator(
  path.join(__dirname, `..\\..\\..\\shapes\\${shapePrefix}`),
  shapePrefix,
  path.join(__dirname, `..\\`)
);

importedShapesCreator.readDir(null, /\s.*\w\s/i, /\(.*\)/i);
importedShapesCreator.createFiles();
importedShapesCreator.logger();

import { Dirent } from 'fs';

export const createShapeTranslate = (shapes: Dirent[], localeRegExp?: RegExp | null): Record<string, string> => {
  const shapesObj = {};
  shapes.forEach((shape) => {
    if (shape.isFile()) {
      const newName = localeRegExp
        ? (shape.name?.match(localeRegExp)?.[0]?.slice(1, -1) ?? shape.name.slice(0, -4))
        : shape.name.slice(0, -4);
      const key = newName.split(' ').join(' ');
      shapesObj[key] = newName;
    }
  });
  return shapesObj;
};

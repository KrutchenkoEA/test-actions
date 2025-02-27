import { Dirent } from 'fs';
import { createShapeObject } from './createShapeObject';
import { createShapeTranslate } from './createShapeTranslate';

const fs = require('fs');

const headerText = "/** Don't edit this file! It has been generated automatically. */";

interface IShapeItem {
  name: string;
  shape: string;
  cellType?: string;
  pathToImg?: string;
}

export class ShapeCreator {
  public shapes: {
    name: string;
    shapes: IShapeItem[];
  }[] = [];

  public translates: {
    [key: string]: string | Record<string, string>;
  } = {};

  private readonly shapeDir: string;
  private readonly shapePrefix: string;
  private readonly shapeDestDir: string;

  constructor(shapeDir: string, shapePrefix: string, shapeDestDir?: string) {
    this.shapeDir = shapeDir;
    this.shapePrefix = shapePrefix;
    this.shapeDestDir = shapeDestDir;
  }

  public readDir(additionalPath?: string | null, regExp?: RegExp | null, localeRegExp?: RegExp | null): void {
    fs.readdirSync(this.shapeDir, { withFileTypes: true })?.forEach((folder: Dirent): void => {
      if (folder.isDirectory()) {
        const dir = additionalPath
          ? `${this.shapeDir}\\${folder.name}\\${additionalPath}`
          : `${this.shapeDir}\\${folder.name}`;
        const dirName = regExp ? regExp?.exec(folder.name)?.[0]?.trim() : folder.name.trim();

        let shapes = [];

        try {
          shapes = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
          console.log('e', e);
          shapes = [];
        }

        this.shapes.push({
          name: dirName,
          shapes: createShapeObject(this.shapePrefix, folder.name, shapes),
        });

        this.translates[dirName] = dirName;

        Object.entries(createShapeTranslate(shapes, localeRegExp))?.forEach(([key, value]) => {
          this.translates[key] = value;
        });
      }
    });
  }

  public createFiles(): void {
    fs.writeFileSync(
      `${this.shapeDestDir ? this.shapeDestDir : this.shapeDir}/${this.shapePrefix}.ts`,
      `${headerText}\n\nexport const ${this.shapePrefix.toUpperCase().split('-').join('_')}=${JSON.stringify(this.shapes, null, 2)}`,
      {
        encoding: 'utf-8',
      }
    );

    fs.writeFileSync(
      `${this.shapeDestDir ? this.shapeDestDir : this.shapeDir}/${this.shapePrefix}.locale.json`,
      JSON.stringify(this.translates, null, 2),
      {
        encoding: 'utf-8',
      }
    );
  }

  public logger(): void {
    console.log('_____________________');
    console.log(`Complete. Please check ${this.shapeDir}\\${this.shapePrefix}.ts`);
    console.log(`Complete. Please check for manual translate ${this.shapeDir}\\${this.shapePrefix}.locale.json`);
  }
}

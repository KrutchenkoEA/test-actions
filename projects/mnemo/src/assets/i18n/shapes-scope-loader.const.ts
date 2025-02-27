export const ShapesScopeLoader = ['ru', 'en', 'fa'].reduce((acc, lang) => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  acc[lang] = () => import(`./shapes/${lang}.json`);
  return acc;
}, {});


export const ShapesScopeLoaderConst = () => {
  return {
    scope: 'builderShapes',
    loader: (lang: string) => import(`./shapes/${lang}.json`),
    alias: 'shapes',
  };
};

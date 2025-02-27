export const MnemoScopeLoader = ['ru', 'en', 'fa'].reduce((acc, lang) => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  acc[lang] = () => import(`./${lang}.json`);
  return acc;
}, {});


export const MnemoScopeLoaderConst = () => {
  return {
    scope: 'mnemo',
    loader: (lang: string) => import(`./${lang}.json`),
    alias: 'mnemo',
  };
};

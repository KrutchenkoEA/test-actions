export type SourceTypeBase = 'tag' | 'formula' | 'omAttr';
/**  @deprecated поддержка старых мнемосхем - 'om' */
type SourceTypeDeprecated = 'om';
export type SourceType = SourceTypeBase | SourceTypeDeprecated;

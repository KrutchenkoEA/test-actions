import { Injectable, OnDestroy, OnInit } from '@angular/core';

const VAR_REGEXP = /var\(.+?\)(,|$)/ig;
const TAG_SAVE_REGEXP = /TagSave\(.+?\)(,|$)/ig;
const TAG_SAVE_VAR_REGEXP = /\(".+?",|\('.+?;,|\(.+?,/;

const MOCK0 = 'Var("aaa",calc_py.TimeTrendsByEvents("eventIds","352,327","startTime","2022-12-31 00:00:00","endTime","2023-01-01 00:00:00","interval","day")),Var("bbb",aaa.ResArray),Var("ccc",ExtractField("В работе",bbb)),Var("a",ArrayElem(0,ExtractField("val",ArrayElem(0,ExtractField("value",ArrayElem(0,ccc)))))),TagSave("/tlrt_1/test_for_mnemo_cd_t500_0001",a)';
const MOCK1 = '3-2';
const MOCK2 = 'TagSave("/tlrt_1/Signal0", TagVal("/tlrt_1/0000000000") * 10)';
const MOCK3 = 'test.HydrostaticDemo("V1",11,"V2",12,"V3",13,"V4",14),test.HydrostaticDemo("V1",21,"V2",22,"V3",23,"V4",24)';
const MOCK4 = 'Var("a",test.HydrostaticDemo("V1",1,"V2",2,"V3",3,"V4",4)),TagSave("/tlrt_1/Signal0",a.Result)';
const MOCK5 = 'Var(a,Now()),TagSave(/tlrt_1/Signal02101,a)';
const MOCK6 = 'TagSave(\'/tlrt_1/Signal02104\',TagVal("/tlrt_1/Signal01000")+TagVal("/tlrt_1/Signal01001")),TagSave("/tlrt_1/Signal0", TagVal("/tlrt_1/0000000000") * 10)';
const MOCK7 = 'Var("now", Now()), Var("result", TagGood("/tlrt_2/UE-01_TEMPERATURE.PV", TimeShift(now, "h-1"), now)), TagSave("/tlrt_2/UE-01_TEMPERATUREHOURGOOD.PV", result)';
const MOCK8 = 'Var("aaa",calc_py.TimeTrendsByEvents("eventIds","352,327","startTime","2022-12-31 00:00:00","endTime","2023-01-01 00:00:00","interval","day")),Var("bbb",aaa.ResArray),Var("ccc",ExtractField("В работе",bbb)),Var("a",ArrayElem(0,ExtractField("val",ArrayElem(0,ExtractField("value",ArrayElem(0,ccc)))))),TagSave("/tlrt_1/test_for_mnemo_cd_t500_0001",a)';
const MOCK9 = 'print(12345)';

const ALL_MOCK = [MOCK0, MOCK1, MOCK2, MOCK3, MOCK4, MOCK5, MOCK6, MOCK7, MOCK8, MOCK9];

export interface IParseResult {
  variable: string | null | undefined;
  formula: string | null | undefined;
  result: string | null | undefined;
  deleteable?: boolean;
}


export interface IParseArrResult {
  initial: string;
  parsed: IParseResult[];
}

@Injectable({
  providedIn: 'root',
})
export class CalculationsFormulaParseService implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    console.log('service OnDestroy');
  }
  ngOnInit(): void {
    console.log('service ngOnInit');
  }

  public parseDataArr(value: string[] = ALL_MOCK): IParseArrResult[] {
    return value?.map((form) => this.parseData(form));
  }

  public parseData(value: string = MOCK8): IParseArrResult {
    const vars = value.match(VAR_REGEXP) ?? [];
    let formula = value.replace(VAR_REGEXP, '');
    const tagSaves = formula.match(TAG_SAVE_REGEXP) ?? [];
    formula = formula.replace(TAG_SAVE_REGEXP, '');

    const varsParsed = vars?.map(t => this.parseVar(t));
    const tagSavesParsed = tagSaves?.map(t => this.parseTagSave(t));

    if (tagSavesParsed?.length > 0 && varsParsed?.length > 0) {
      tagSavesParsed?.forEach(tagSaves => {
        const findRes = varsParsed?.find(varsParsed => varsParsed.variable === tagSaves.formula);
        if (!!findRes) {
          findRes.result = tagSaves.result;
          tagSaves.deleteable = true;
        }
      });
    }

    const result = [];
    if (vars?.length > 0) {
      result.push(...varsParsed);
    }
    if (tagSaves?.length > 0) {
      result.push(...tagSavesParsed?.filter(ts => !ts?.deleteable));
    }
    if (formula?.trim()?.length > 0) {
      result.push(this.parseFormula(formula));
    }

    return { initial: value, parsed: result };
  }

  public parseVar(value: string): IParseResult {
    const newValue = value.slice(3);
    const variable = newValue.match(TAG_SAVE_VAR_REGEXP)?.[0];
    const formula = newValue.replace(TAG_SAVE_VAR_REGEXP, '');
    return {
      variable: variable?.slice(2, -2),
      formula: formula?.slice(0, -1).trim().trim(),
      result: null,
    };
  }

  public parseTagSave(value: string): IParseResult {
    const newValue = value.slice(7);
    const result = newValue.match(TAG_SAVE_VAR_REGEXP)?.[0];
    const formula = newValue.replace(TAG_SAVE_VAR_REGEXP, '');
    return {
      variable: null,
      formula: formula?.slice(0, -1).trim().trim(),
      result: result?.slice(2, -2),
    };
  }

  public parseFormula(value: string): IParseResult {
    return {
      variable: null,
      formula: value.trim(),
      result: null,
    };
  }
}

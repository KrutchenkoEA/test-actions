// eslint-disable-next-line import/no-extraneous-dependencies
import { Injectable } from '@angular/core';
import { UtTlDataRefService } from '../../components/univer-table-tl';

@Injectable()
export class UtvDataRefService extends UtTlDataRefService {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {
    super();
  }

  public init(): void {
    super.init();
  }
}

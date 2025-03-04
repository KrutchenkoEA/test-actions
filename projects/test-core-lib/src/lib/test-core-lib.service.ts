import { Injectable } from '@angular/core';

@Injectable()
export class TestCoreLibService {
  private readonly currentVersion: string = '1.0.0';

  public showVersion() {
    console.info('currentVersion', this.currentVersion);
  }
}

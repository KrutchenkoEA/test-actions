import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TestSecondLibService {
  public logger() {
    console.log('TestSecondLibService work');
  }
}

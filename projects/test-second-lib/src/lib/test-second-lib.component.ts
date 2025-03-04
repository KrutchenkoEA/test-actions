import { Component } from '@angular/core';
import { SomeComponentComponent } from '@actions/core';

@Component({
  selector: 'lib-test-second-lib',
  standalone: true,
  imports: [
    SomeComponentComponent,
  ],
  template: `
    <p>
      test-second-lib works!
    </p>
    <core-lib-some-component></core-lib-some-component>
  `,
  styles: ``
})
export class TestSecondLibComponent {

}

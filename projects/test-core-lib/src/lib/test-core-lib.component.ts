import { AfterViewInit, Component, inject } from '@angular/core';
import { TestCoreLibService } from './test-core-lib.service';
import { SomeComponentComponent } from './some-component/some-component.component';

@Component({
  selector: 'lib-test-core-lib',
  standalone: true,
  imports: [
    SomeComponentComponent,
  ],
  template: `
    <p>
      test-core-lib works!
    </p>
  `,
  styles: ``,
  providers: [TestCoreLibService],
})
export class TestCoreLibComponent implements AfterViewInit {
  private readonly testCoreLibService = inject(TestCoreLibService);

  ngAfterViewInit(): void {
    this.testCoreLibService.showVersion()
  }

}

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SomeComponentComponent, TestCoreLibComponent } from '@actions/core';
import { TestSecondLibComponent } from '@actions/second';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestCoreLibComponent, TestSecondLibComponent, SomeComponentComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor() {
  }

  public ngOnInit(): void {

  }
}

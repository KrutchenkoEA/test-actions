import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalculationsFormulaParseService, IParseArrResult } from './calculations-formula-parse.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'clear-angular';
  public data: IParseArrResult | null = null;
  public dataArr: IParseArrResult[] = [];

  constructor(private parseServe: CalculationsFormulaParseService) {
  }

  public ngOnInit(): void {
    this.data = this.parseServe.parseData();

    // this.dataArr = this.parseServe.parseDataArr();
  }
}

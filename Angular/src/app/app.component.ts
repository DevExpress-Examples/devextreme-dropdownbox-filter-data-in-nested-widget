import {
  Component, inject,
} from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import type { DxSelectBoxTypes } from 'devextreme-angular/ui/select-box';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private readonly appService = inject(AppService);

  searchExprOptions = [
    {
      name: '\'Employee\'',
      value: 'Employee',
    },
    {
      name: '[\'OrderNumber\', \'Employee\']',
      value: ['OrderNumber', 'Employee'],
    },
    {
      name: '[\'StoreCity\', \'Employee\']',
      value: ['StoreCity', 'Employee'],
    },
    {
      name: '[\'OrderNumber\',\'StoreCity\', \'StoreState\', \'Employee\']',
      value: ['OrderNumber', 'StoreCity', 'StoreState', 'Employee'],
    },
  ];

  selectedSearchExpr: string | string[] = 'Employee';

  searchTimeout = 1000;

  dataSource: DataSource;

  dropDownBoxDataSource: DataSource;

  constructor() {
    this.dataSource = new DataSource({
      store: this.appService.makeAsyncDataSource(),
      searchExpr: this.selectedSearchExpr,
    });

    this.dropDownBoxDataSource = new DataSource({
      store: this.appService.makeAsyncDataSource(),
    });
  }

  onSearchExprChanged(e: DxSelectBoxTypes.ValueChangedEvent): void {
    this.dataSource.searchExpr(e.value);
  }
}

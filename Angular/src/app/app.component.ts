import {
  Component, inject,
} from '@angular/core';
import { DataSource } from 'devextreme-angular/common/data';
import type { DxSelectBoxTypes } from 'devextreme-angular/ui/select-box';
import { AppService } from './app.service';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTemplateModule } from 'devextreme-angular/core';
import { DropDownGridComponent } from './drop-down-grid/drop-down-grid.component';

@Component({
  selector: 'app-root',
  imports: [DxDropDownBoxModule, DxDataGridModule, DxSelectBoxModule, DxNumberBoxModule, DxTemplateModule, DropDownGridComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly appService = inject(AppService);

  readonly displayExpr = this.appService.formatDisplayExpr.bind(this.appService);

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

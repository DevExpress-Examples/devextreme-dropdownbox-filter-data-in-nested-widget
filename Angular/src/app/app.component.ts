import { AfterViewInit, Component, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { DxDropDownBoxComponent, DxDataGridComponent } from 'devextreme-angular';
import type { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import type { DxDropDownBoxTypes } from 'devextreme-angular/ui/drop-down-box';
import type dxDropDownBox from 'devextreme/ui/drop_down_box';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('dropDownBox', { static: false }) dropDownBox!: DxDropDownBoxComponent;

  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent<OrderItem, number>;

  dataSource: DataSource;

  dropDownBoxDataSource: DataSource;

  searchTimer: ReturnType<typeof setTimeout> | null = null;

  gridBoxValue: number[] = [35711];

  gridBoxOpened = false;

  focusedRowIndex = 0;

  focusedRowKey: number | null = null;

  private firstLoadCompleted = false;

  constructor() {
    this.dataSource = new DataSource({
      store: this.makeAsyncDataSource(),
      searchExpr: ['StoreCity', 'StoreState', 'Employee'],
    } as any);
    this.dropDownBoxDataSource = new DataSource({
      store: this.makeAsyncDataSource(),
    } as any);
  }

  ngAfterViewInit(): void {

  }

  private makeAsyncDataSource(): unknown {
    return AspNetData.createStore({
      key: 'OrderNumber',
      loadUrl: 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders',
    });
  }

  gridBoxDisplayExpr = (item: OrderItem | null): string => (
    item ? `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>` : ''
  );

  onDropDownValueChanged(_e: DxDropDownBoxTypes.ValueChangedEvent): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.gridBoxOpened = false;
  }

  private isSearchIncomplete(dropDownBox: any): boolean {
    const displayValue = dropDownBox.option('displayValue');
    const text = dropDownBox.option('text');
    const textValue = text?.length ? text : undefined;
    const displayFirst = displayValue?.length ? displayValue[0] : undefined;
    return textValue !== displayFirst;
  }

  onInput(e: DxDropDownBoxTypes.InputEvent): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const text = e.component.option('text');
      this.dataSource.searchValue(text ?? null);
      if (this.gridBoxOpened && this.isSearchIncomplete(e.component)) {
        this.dataSource.load().then((items: OrderItem[]) => {
          if (items.length > 0 && this.dataGrid?.instance) {
            this.focusedRowKey = items[0].OrderNumber;
            this.focusedRowIndex = 0;
          }
        }).catch(() => {});
      } else {
        this.gridBoxOpened = true;
      }
    }, 500);
  }

  onOpened(e: DxDropDownBoxTypes.OpenedEvent): void {
    const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
    if (ddbInstance.isKeyDown) {
      if (!this.dataGrid?.instance) return;
      const inst = this.dataGrid.instance;
      const contentReadyHandler = (args: DxDataGridTypes.ContentReadyEvent<OrderItem, number>): void => {
        const gridInstance = args.component;
        gridInstance.focus();
        gridInstance.off('contentReady', contentReadyHandler as any);
      };
      if (!this.firstLoadCompleted) {
        inst.on('contentReady', contentReadyHandler as any);
      } else {
        const optionChangedHandler = (args: DxDataGridTypes.OptionChangedEvent<OrderItem, number>): void => {
          const gridInstance = args.component;
          if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
            gridInstance.off('optionChanged', optionChangedHandler as any);
            gridInstance.focus();
          }
        };
        inst.on('optionChanged', optionChangedHandler as any);
        this.focusedRowIndex = 0;
      }
      ddbInstance.isKeyDown = false;
    } else if (this.firstLoadCompleted && this.isSearchIncomplete(ddbInstance)) {
      this.dataSource.load().then((items: OrderItem[]) => {
        if (items.length > 0) this.focusedRowKey = items[0].OrderNumber;
        ddbInstance.focus();
      }).catch(() => {});
    }
  }

  onClosed(e: DxDropDownBoxTypes.ClosedEvent): void {
    const ddbInstance = e.component;
    const searchValue = this.dataSource.searchValue();
    if (this.isSearchIncomplete(ddbInstance)) {
      this.gridBoxValue = [];
    }
    if (searchValue) {
      this.dataSource.searchValue(null);
    }
  }

  onKeyDown(e: DxDataGridTypes.KeyDownEvent<OrderItem, number>): void {
    if (!e.event || e.event.keyCode !== 40) return;
    if (!this.gridBoxOpened) {
      if (this.dropDownBox?.instance) {
        (this.dropDownBox.instance as any).isKeyDown = true;
      }
      this.gridBoxOpened = true;
    } else if (this.dataGrid?.instance) {
      this.dataGrid.instance.focus();
    }
  }

  dataGridContentReady(e: DxDataGridTypes.ContentReadyEvent<OrderItem, number>): void {
    if (!this.firstLoadCompleted) {
      this.firstLoadCompleted = true;
      this.dropDownBox.instance.focus();
    }
  }

  dataGridKeyDown(e: DxDataGridTypes.KeyDownEvent<OrderItem, number>): void {
    if (e.event?.keyCode === 13 && this.focusedRowKey != null) {
      this.focusedRowIndex = (e.component as any).option('focusedRowIndex');
      this.gridBoxValue = [this.focusedRowKey];
      this.gridBoxOpened = false;
    }
  }

  onDropDownBoxKeyDown(e: DxDropDownBoxTypes.KeyDownEvent): void {
    if (e.event?.keyCode !== 40) return;
    if (!this.gridBoxOpened && this.dropDownBox?.instance) {
      (this.dropDownBox.instance as any).isKeyDown = true;
      this.gridBoxOpened = true;
    } else if (this.dataGrid?.instance) {
      this.dataGrid.instance.focus();
    }
  }
}

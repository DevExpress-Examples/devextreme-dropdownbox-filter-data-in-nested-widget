import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly API_URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders';

  constructor() {}

  /**
   * Create async data source for DropDownBox
   */
  createDropDownDataSource(): DataSource {
    return new DataSource({
      store: this.makeAsyncDataSource(),
    } as any);
  }

  /**
   * Create async data source for DataGrid with search
   */
  createGridDataSource(): DataSource {
    return new DataSource({
      store: this.makeAsyncDataSource(),
      searchExpr: ['StoreCity', 'StoreState', 'Employee'],
    } as any);
  }

  /**
   * Format display expression for dropdown
   */
  formatDisplayExpr(item: OrderItem | null): string {
    if (!item || typeof item !== 'object') return '';
    return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
  }

  /**
   * Check if search is incomplete
   */
  isSearchIncomplete(displayValue: string[] | undefined, text: string | undefined): boolean {
    const textValue = text?.length ? text : undefined;
    const displayFirst = displayValue?.length ? displayValue[0] : undefined;
    return textValue !== displayFirst;
  }

  /**
   * Private: Create async data store
   */
  private makeAsyncDataSource(): unknown {
    return AspNetData.createStore({
      key: 'OrderNumber',
      loadUrl: this.API_URL,
    });
  }
}

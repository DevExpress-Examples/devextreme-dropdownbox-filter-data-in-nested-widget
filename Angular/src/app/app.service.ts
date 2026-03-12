import { Injectable } from '@angular/core';
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

  makeAsyncDataSource(): any {
    return AspNetData.createStore({
      key: 'OrderNumber',
      loadUrl: this.API_URL,
    });
  }
}

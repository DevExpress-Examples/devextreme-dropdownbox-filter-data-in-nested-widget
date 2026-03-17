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

  formatDisplayExpr(item: OrderItem | null): string {
    if (!item || typeof item !== 'object') return '';
    return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
  }

  makeAsyncDataSource(): AspNetData.CustomStore {
    return AspNetData.createStore({
      key: 'OrderNumber',
      loadUrl: this.API_URL,
    });
  }
}

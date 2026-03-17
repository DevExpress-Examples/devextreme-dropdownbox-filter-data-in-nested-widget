import * as AspNetData from 'devextreme-aspnet-data-nojquery';

export interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

const API_URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders';

export function formatDisplayExpr(item: OrderItem | null): string {
  if (!item || typeof item !== 'object') return '';
  return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
}

export function makeAsyncDataSource(): AspNetData.CustomStore {
  return AspNetData.createStore({
    key: 'OrderNumber',
    loadUrl: API_URL,
  });
}
export const searchExprOptions = [
  { name: '\'Employee\'', value: 'Employee' },
  { name: '[\'OrderNumber\', \'Employee\']', value: ['OrderNumber', 'Employee'] },
  { name: '[\'StoreCity\', \'Employee\']', value: ['StoreCity', 'Employee'] },
  { name: '[\'OrderNumber\',\'StoreCity\', \'StoreState\', \'Employee\']', value: ['OrderNumber', 'StoreCity', 'StoreState', 'Employee'] },
];

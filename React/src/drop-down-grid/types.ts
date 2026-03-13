import type dxDataGrid from 'devextreme/ui/data_grid';

export interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

export type GridInstance = dxDataGrid<OrderItem, number> & { isNotFirstLoad?: boolean };

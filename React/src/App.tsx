import { useState, useMemo, useCallback } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.light.css';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import SelectBox, { type SelectBoxTypes } from 'devextreme-react/select-box';
import NumberBox, { type NumberBoxTypes } from 'devextreme-react/number-box';
import { DropDownGrid } from './drop-down-grid/DropDownGrid';

const API_URL = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

interface SearchExprItem { text: string; value: string[] }

const searchExprOptions: SearchExprItem[] = [
  { text: 'City', value: ['StoreCity'] },
  { text: 'State', value: ['StoreState'] },
  { text: 'Employee', value: ['Employee'] },
  { text: 'City and State', value: ['StoreCity', 'StoreState'] },
  { text: 'All Fields', value: ['StoreCity', 'StoreState', 'Employee'] },
];

function makeAsyncDataSource(): any {
  return AspNetData.createStore({
    key: 'OrderNumber',
    loadUrl: API_URL,
  });
}

function formatDisplayExpr(item: OrderItem | null): string {
  if (!item || typeof item !== 'object') return '';
  return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
}

function App(): JSX.Element {
  const [searchTimeout, setSearchTimeout] = useState(500);

  const dataSource = useMemo(() => new DataSource({ store: makeAsyncDataSource() }), []);
  const gridDataSource = useMemo(
    () => new DataSource({
      store: makeAsyncDataSource(),
      searchExpr: searchExprOptions[4].value,
    }),
    [],
  );

  const onSearchExprChanged = useCallback((e: SelectBoxTypes.ValueChangedEvent): void => {
    const option = searchExprOptions.find((o) => o.text === e.value);
    if (option) gridDataSource.searchExpr(option.value);
  }, []);

  const onSearchTimeoutChanged = useCallback((e: NumberBoxTypes.ValueChangedEvent): void => {
    setSearchTimeout(e.value);
  }, []);

  return (
    <div className="dx-viewport demo-container">
      <div className="dx-fieldset">
        <div className="dx-field">
          <div className="dx-field-label">Search Expression</div>
          <div className="dx-field-value">
            <SelectBox
              items={searchExprOptions}
              defaultValue={searchExprOptions[4].text}
              displayExpr="text"
              valueExpr="text"
              onValueChanged={onSearchExprChanged}
            />
          </div>
        </div>
        <div className="dx-field">
          <div className="dx-field-label">Search Timeout</div>
          <div className="dx-field-value">
            <NumberBox
              value={searchTimeout}
              min={0}
              max={5000}
              onValueChanged={onSearchTimeoutChanged}
            />
          </div>
        </div>
        <div className="dx-field">
          <div className="dx-field-label">DropDownBox with search and embedded DataGrid</div>
          <div className="dx-field-value">
            <DropDownGrid
              selectedRowKey={35711}
              dataSource={dataSource}
              gridDataSource={gridDataSource}
              searchTimeout={searchTimeout}
              displayExpr={formatDisplayExpr}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

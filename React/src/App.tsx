import { useState, useMemo, useCallback } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.light.css';
import { DataSource } from 'devextreme-react/common/data';
import SelectBox, { type SelectBoxTypes } from 'devextreme-react/select-box';
import NumberBox, { type NumberBoxTypes } from 'devextreme-react/number-box';
import { DropDownGrid } from './components/drop-down-grid/DropDownGrid';
import { formatDisplayExpr, makeAsyncDataSource, searchExprOptions } from './appService';

function App(): JSX.Element {
  const [searchTimeout, setSearchTimeout] = useState(1000);

  const dataSource = useMemo(() => new DataSource({
    store: makeAsyncDataSource(),
    searchExpr: 'Employee',
  }), []);

  const dropDownBoxDataSource = useMemo(() => new DataSource({
    store: makeAsyncDataSource(),
  }), []);

  const onSearchExprChanged = useCallback((e: SelectBoxTypes.ValueChangedEvent) => {
    dataSource.searchExpr(e.value);
  }, [dataSource]);

  const onTimeoutChanged = useCallback((e: NumberBoxTypes.ValueChangedEvent) => {
    setSearchTimeout(e.value);
  }, []);

  return (
    <div className="dx-viewport demo-container">
      <div className="row">
        <p>DropDownBox with search and embedded DataGrid</p>
        <DropDownGrid
          selectedRowKey={35709}
          dataSource={dataSource}
          dropDownBoxDataSource={dropDownBoxDataSource}
          searchTimeout={searchTimeout}
          displayExpr={formatDisplayExpr}
        />
      </div>

      <div className="options">
        <div className="caption">Search Options</div>
        <div className="option">
          <div>Search Expression</div>
          <SelectBox
            id="searchExpr"
            items={searchExprOptions}
            displayExpr="name"
            valueExpr="value"
            defaultValue="Employee"
            onValueChanged={onSearchExprChanged}
          />
        </div>
        <div className="option">
          <div>Search Timeout</div>
          <NumberBox
            id="searchTimeout"
            min={0}
            max={10000}
            value={searchTimeout}
            showSpinButtons={true}
            step={100}
            onValueChanged={onTimeoutChanged}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

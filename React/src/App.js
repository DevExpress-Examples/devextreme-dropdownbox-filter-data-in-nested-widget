import React, { useMemo, useEffect, useReducer, useContext } from 'react';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import './App.css';
import DropDownBox, { DropDownOptions } from 'devextreme-react/drop-down-box';

import DataGrid, { Column, Format, Selection, Paging, FilterRow, Scrolling } from 'devextreme-react/data-grid';

import * as AspNetData from "devextreme-aspnet-data-nojquery";
import DataSource from 'devextreme/data/data_source';

const makeAsyncDataSource = function () {
  return AspNetData.createStore({
    key: "OrderNumber",
    loadUrl: "https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders"
  });
};
const gridBox_displayExpr = function (item) {
  return (
    item &&
    `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`
  );
}
let searchTimer = null;

const initialState = {
  value: [35711],
  focusedRowIndex: 0,
  focusedRowKey: null,
  opened: false,
  dataGridInstance: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'all':
      return {
        ...state,
        opened: action.opened,
        value: action.value
      }
    case 'open/close':
      return {
        ...state,
        opened: action.opened
      }
    case "dataGridInstance":
      return {
        ...state,
        dataGridInstance: action.instance
      }
    case 'focusedRowKey':
      return {
        ...state,
        focusedRowIndex: action.focusedRowIndex,
        focusedRowKey: action.focusedRowKey
      }
    case 'value': {
      return {
        ...state,
        value: action.value
      }
    }
    default:
      throw new Error("non-processed action: ", action.type);
  }
}
function isSearchIncomplete(dropDownBox) {
  // compare the last displayed value and the current real text in the input field
  let displayValue = dropDownBox.option("displayValue"),
    text = dropDownBox.option("text");
  text = text && text.length && text;
  displayValue = displayValue && displayValue.length && displayValue[0];
  return text !== displayValue;
};

const DropDownBoxDispatch = React.createContext(null);

function App() {
  const dataSource = useMemo(() => new DataSource({
    store: makeAsyncDataSource()

  }), []);
  const gridDataSource = useMemo(() => new DataSource({
    store: makeAsyncDataSource(),
    searchExpr: ["StoreCity", "StoreState", "Employee"]
  }), []);

  const [state, dispatch] = useReducer(reducer, initialState);

  let { value, opened, focusedRowIndex, focusedRowKey, dataGridInstance } = state;

  const dropDownBoxValueChanged = (args) => {
    clearTimeout(searchTimer);
    dispatch({ value: args.value, opened: false, type: 'all' })
  }
  const onInput = function (e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {

      let text = e.component.option("text");
      gridDataSource.searchValue(text);
      if (opened && isSearchIncomplete(e.component)) {
        gridDataSource.load().then((items) => {
          if (items.length > 0 && dataGridInstance)
            dispatch({ focusedRowKey: items[0].OrderNumber, type: 'focusedRowKey' })
        });
      } else {
        dispatch({ opened: true, type: 'open/close' })
      }
    }, 500);
  }
  const onKeyDown = (e) => {
    let ddbInstance = e.component;
    if (e.event.keyCode !== 40) return; //not arrow down
    if (!opened) {
      ddbInstance.isKeyDown = true;
      dispatch({ opened: true, type: 'open/close' })
    } else dataGridInstance && dataGridInstance.focus();
  }
  const onOpened = (e) => {
    let ddbInstance = e.component;

    if (ddbInstance.isKeyDown) {
      if (!dataGridInstance)
        return;
      var contentReadyHandler = args => {
        let gridInstance = args.component;
        gridInstance.focus();
        gridInstance.off("contentReady", contentReadyHandler);
      };

      if (!dataGridInstance.isNotFirstLoad)
        dataGridInstance.on("contentReady", contentReadyHandler);
      else {
        var optionChangedHandler = (args) => {
          let gridInstance = args.component;
          if (args.name === 'focusedRowKey') {
            gridInstance.off('optionChanged', optionChangedHandler);
            gridInstance.focus();
          }
        }
        dataGridInstance.on('optionChanged', optionChangedHandler);
        dispatch({ type: 'focusedRowKey', focusedRowKey: null, focusedRowIndex: 0 })

      }
      ddbInstance.isKeyDown = false;
    } else if (dataGridInstance && dataGridInstance.isNotFirstLoad && isSearchIncomplete(ddbInstance)) {
      gridDataSource.load().done(items => {
        if (items.length > 0)
          dispatch({ focusedRowKey: items[0].OrderNumber, type: 'focusedRowKey' })
        ddbInstance.focus();
      });
    }
  }
  const onClosed = (e) => {
    let ddbInstance = e.component,
      searchValue = gridDataSource.searchValue();
    if (isSearchIncomplete(ddbInstance)) {
      dispatch({ value: value === "" ? null : "", type: 'value' })
    }
    if (searchValue) {
      gridDataSource.searchValue(null);
    }
  }
  const onOptionChanged = (args) => {
    if (args.name === "opened") {
      dispatch({ opened: args.value, type: 'open/close' })
    }
  }
  useEffect(() => {
    // A DataSource instance created outside a widget should be disposed of manually
    return () => {
      dataSource.dispose();
      gridDataSource.dispose();
      dispatch({ type: 'dataGridInstance', instance: null })
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="dx-viewport demo-container">
      <div className="dx-fieldset">
        <div className="dx-field">
          <div className="dx-field-label">DropDownBox with search and embedded DataGrid</div>
          <div className="dx-field-value">
            <DropDownBoxDispatch.Provider value={{
              dataSource: gridDataSource,
              dispatch: dispatch,
              focusedRowKey: focusedRowKey,
              focusedRowIndex: focusedRowIndex
            }}>
              <DropDownBox showClearButton={true}
                placeholder="Select a value..."
                onInput={onInput}
                displayExpr={gridBox_displayExpr}
                valueExpr="OrderNumber"
                value={value}
                valueChangeEvent=""
                acceptCustomValue={true}
                onOpened={onOpened}
                opened={opened}
                openOnFieldClick={false}
                dataSource={dataSource}
                onKeyDown={onKeyDown}
                onClosed={onClosed}
                onValueChanged={dropDownBoxValueChanged}
                onOptionChanged={onOptionChanged}
                contentComponent={DataGridComponent}
              >
                <DropDownOptions height={300} />
              </DropDownBox>
            </DropDownBoxDispatch.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

const DataGridComponent = ({ data }) => {
  const { value, component } = data;
  const { dispatch, dataSource, focusedRowKey, focusedRowIndex } = useContext(DropDownBoxDispatch);
  const selectionChanged = (e) => {
    dispatch({ value: e.selectedRowKeys, opened: false, type: 'all' })
  }
  const contentReady = (e) => {
    if (!e.component.isNotFirstLoad) {
      e.component.isNotFirstLoad = true;
      component.focus();
      dispatch({ instance: e.component, type: 'dataGridInstance' })
    }
  }

  const keyDown = (e) => {
    if (e.event.keyCode === 13) {// Enter press     
      dispatch({ value: [focusedRowKey], opened: false, type: 'all' });
    }
  }
  const focusedRowChanged = (e) => {
    dispatch({ focusedRowIndex: e.rowIndex, focusedRowKey: e.component.getKeyByRowIndex(e.rowIndex), type: 'focusedRowKey' })
  }

  return (
    <DataGrid
      onFocusedRowChanged={focusedRowChanged}
      dataSource={dataSource}
      focusedRowEnabled={true}
      onContentReady={contentReady}
      autoNavigateToFocusedRow={false}
      remoteOperations={true}
      hoverStateEnabled={true}
      onKeyDown={keyDown}
      focusedRowIndex={focusedRowIndex}
      focusedRowKey={focusedRowKey}
      onSelectionChanged={selectionChanged}
      defaultSelectedRowKeys={value}
      columnWidth={100}
      width="100%"
      height="100%"
    >
      <Column dataField="OrderNumber" caption="ID" dataType="number" />
      <Column dataField="OrderDate" format="shortDate" dataType="date" />
      <Column dataField="StoreState" dataType="string" />
      <Column dataField="StoreCity" dataType="string" />
      <Column dataField="Employee" dataType="string" />
      <Column dataField="SaleAmount" dataType="number" >
        <Format type="currency" precision={2} />
      </Column>
      <Selection mode="single" />
      <Scrolling mode="virtual" />
      <Paging enabled={true} pageSize={10} />
      <FilterRow visible={true} />
    </DataGrid>
  )
}
export default App;

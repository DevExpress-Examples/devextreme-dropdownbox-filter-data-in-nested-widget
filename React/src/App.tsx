import React, {
  useReducer, useEffect, useMemo, useContext, useCallback, useState,
} from 'react';
import './App.css';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';

import DropDownBox, { DropDownOptions, type DropDownBoxTypes } from 'devextreme-react/drop-down-box';
import DataGrid, {
  Column, Format, Selection, Paging, FilterRow, Scrolling, type DataGridRef, type DataGridTypes,
} from 'devextreme-react/data-grid';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import CustomStore from 'devextreme/data/custom_store';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import type dxDropDownBox from 'devextreme/ui/drop_down_box';
import type dxDataGrid from 'devextreme/ui/data_grid';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

interface AppState {
  value: number[] | null;
  focusedRowIndex: number;
  focusedRowKey: number | null;
  opened: boolean;
  dataGridRef: DataGridRef<OrderItem, number> | null;
}

type Action =
  | { type: 'all'; value: number[] | null; opened: boolean }
  | { type: 'open/close'; opened: boolean }
  | { type: 'dataGridRef'; ref: DataGridRef<OrderItem, number> | null }
  | { type: 'focusedRowKey'; focusedRowIndex: number; focusedRowKey: number | null }
  | { type: 'value'; value: number[] | null };

const initialState: AppState = {
  value: [35711],
  focusedRowIndex: 0,
  focusedRowKey: null,
  opened: false,
  dataGridRef: null,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'all':
      return { ...state, opened: action.opened, value: action.value };
    case 'open/close':
      return { ...state, opened: action.opened };
    case 'dataGridRef':
      return { ...state, dataGridRef: action.ref };
    case 'focusedRowKey':
      return { ...state, focusedRowIndex: action.focusedRowIndex, focusedRowKey: action.focusedRowKey };
    case 'value':
      return { ...state, value: action.value };
    default:
      return state;
  }
}

function makeAsyncDataSource(): CustomStore {
  return AspNetData.createStore({
    key: 'OrderNumber',
    loadUrl: 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders',
  });
}

function gridBoxDisplayExpr(item: OrderItem): string {
  return item ? `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>` : '';
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

interface DropDownContextShape {
  dataSource: DataSource;
  dispatch: React.Dispatch<Action>;
  focusedRowKey: number | null;
  focusedRowIndex: number;
}
const DropDownBoxDispatch = React.createContext<DropDownContextShape | null>(null);

function isSearchIncomplete(dropDownBox: any): boolean {
  const displayValue = dropDownBox.option('displayValue') as string[] | undefined;
  const text = dropDownBox.option('text') as string | undefined;
  const textValue = text?.length ? text : undefined;
  const displayFirst = displayValue?.length ? displayValue[0] : undefined;
  return textValue !== displayFirst;
}

function App(): JSX.Element {
  const dataSource = useMemo(() => new DataSource({ store: makeAsyncDataSource() }), []);
  const gridDataSource = useMemo(
    () => new DataSource({
      store: makeAsyncDataSource(),
      searchExpr: ['StoreCity', 'StoreState', 'Employee'],
    }),
    [],
  );

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    value, opened, focusedRowIndex, focusedRowKey, dataGridRef,
  } = state;
  const gridInstance = dataGridRef?.instance() as dxDataGrid<OrderItem, number> & { isNotFirstLoad?: boolean };

  const dropDownBoxValueChanged = useCallback((args: DropDownBoxTypes.ValueChangedEvent): void => {
    if (searchTimer) clearTimeout(searchTimer);
    dispatch({ value: args.value, opened: false, type: 'all' });
  }, []);

  const onInput = useCallback((e: DropDownBoxTypes.InputEvent): void => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const text = e.component.option('text');
      gridDataSource.searchValue(text ?? null);
      if (opened && isSearchIncomplete(e.component)) {
        gridDataSource.load().then((items: OrderItem[]) => {
          if (items.length > 0 && gridInstance) {
            dispatch({ focusedRowKey: items[0].OrderNumber, focusedRowIndex: 0, type: 'focusedRowKey' });
          }
        }).catch((error: unknown) => notify(error, 'error', 1000));
      } else {
        dispatch({ opened: true, type: 'open/close' });
      }
    }, 500);
  }, [opened, gridInstance, gridDataSource]);

  const onKeyDown = useCallback((e: DropDownBoxTypes.KeyDownEvent): void => {
    if (e.event?.keyCode !== 40) return;
    const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
    if (!opened) {
      ddbInstance.isKeyDown = true;
      dispatch({ opened: true, type: 'open/close' });
    } else if (gridInstance) {
      gridInstance.focus();
    }
  }, [opened, gridInstance]);

  function contentReadyHandler(args: DataGridTypes.ContentReadyEvent<OrderItem, number>): void {
    const inst = args.component;
    inst.focus();
    inst.off('contentReady', contentReadyHandler);
  }

  function optionChangedHandler(args: { component: DataGridTypes.ContentReadyEvent<OrderItem, number>['component']; name: string }): void {
    const inst = args.component;
    if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
      inst.off('optionChanged', optionChangedHandler);
      inst.focus();
    }
  }

  const onOpened = useCallback((e: DropDownBoxTypes.OpenedEvent): void => {
    const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
    if (ddbInstance.isKeyDown) {
      if (!gridInstance) return;

      if (!gridInstance.isNotFirstLoad) {
        gridInstance.on('contentReady', contentReadyHandler);
      } else {
        gridInstance.on('optionChanged', optionChangedHandler);
        dispatch({ type: 'focusedRowKey', focusedRowKey: null, focusedRowIndex: 0 });
      }
      ddbInstance.isKeyDown = false;
    } else if (gridInstance?.isNotFirstLoad
      && isSearchIncomplete(ddbInstance)
    ) {
      gridDataSource.load().then((items: OrderItem[]) => {
        if (items.length > 0) {
          dispatch({ focusedRowKey: items[0].OrderNumber, focusedRowIndex: 0, type: 'focusedRowKey' });
        }
        ddbInstance.focus();
      }).catch((error: unknown) => notify(error, 'error', 1000));
    }
  }, [gridInstance, gridDataSource]);

  const onClosed = useCallback((e: DropDownBoxTypes.ClosedEvent): void => {
    const ddbInstance = e.component;
    const searchValue = gridDataSource.searchValue();
    if (isSearchIncomplete(ddbInstance)) {
      dispatch({ value: null, type: 'value' });
    }
    if (searchValue) {
      gridDataSource.searchValue(null);
    }
  }, [value, gridDataSource]);

  const onOptionChanged = useCallback((args: DropDownBoxTypes.OptionChangedEvent): void => {
    if (args.name === 'opened') {
      dispatch({ opened: args.value, type: 'open/close' });
    }
  }, []);

  const contextValue = useMemo(() => ({
    dataSource: gridDataSource,
    dispatch,
    focusedRowKey,
    focusedRowIndex,
  }), [gridDataSource, dispatch, focusedRowKey, focusedRowIndex]);

  useEffect(() => () => {
    dispatch({ type: 'dataGridRef', ref: null });
  }, []);

  return (
    <div className="dx-viewport demo-container">
      <div className="dx-fieldset">
        <div className="dx-field">
          <div className="dx-field-label">DropDownBox with search and embedded DataGrid</div>
          <div className="dx-field-value">
            <DropDownBoxDispatch.Provider value={contextValue}>
              <DropDownBox
                showClearButton
                placeholder="Select a value..."
                onInput={onInput}
                displayExpr={gridBoxDisplayExpr}
                valueExpr="OrderNumber"
                value={value}
                valueChangeEvent=""
                acceptCustomValue
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

interface DataGridComponentProps {
  data: { value: number[] | null; component: any };
}

function DataGridComponent({ data }: DataGridComponentProps): JSX.Element {
  const { value, component } = data;

  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  const [pendingSelection, setPendingSelection] = useState<number[] | null>(null);

  const ctx = useContext(DropDownBoxDispatch);
  if (!ctx) return <div />;
  const {
    dispatch, dataSource, focusedRowKey, focusedRowIndex,
  } = ctx;

  const effectiveSelection = useMemo((): number[] => {
    if (isDataReady && (pendingSelection || value)) {
      return pendingSelection ?? value ?? [];
    }
    return [];
  }, [isDataReady, pendingSelection, value]);

  const selectionChanged = useCallback((e: DataGridTypes.SelectionChangedEvent<OrderItem, number>): void => {
    if (!isDataReady) return;

    const newSelection = e.selectedRowKeys;
    const currentSelection = effectiveSelection;

    if (JSON.stringify(newSelection) !== JSON.stringify(currentSelection)) {
      dispatch({ value: newSelection, opened: false, type: 'all' });
      setPendingSelection(null);
    }
  }, [dispatch, isDataReady, effectiveSelection]);

  const contentReady = useCallback((e: DataGridTypes.ContentReadyEvent<OrderItem, number>): void => {
    const inst = e.component;

    if (!(inst as unknown as { isNotFirstLoad?: boolean }).isNotFirstLoad) {
      (inst as unknown as { isNotFirstLoad?: boolean }).isNotFirstLoad = true;
      component.focus();
      const refObj: DataGridRef<OrderItem, number> = { instance: () => inst };
      dispatch({ ref: refObj, type: 'dataGridRef' });
    }
    setIsDataReady(true);
    if (value && !isDataReady) {
      setPendingSelection(value);
    }
  }, [component, dispatch, value, isDataReady]);

  const keyDown = useCallback((e: DataGridTypes.KeyDownEvent<OrderItem, number>): void => {
    if (e.event && e.event.keyCode === 13 && focusedRowKey != null) {
      dispatch({ value: [focusedRowKey], opened: false, type: 'all' });
    }
  }, [dispatch, focusedRowKey]);

  const focusedRowChanged = useCallback((e: DataGridTypes.FocusedRowChangedEvent<OrderItem, number>): void => {
    const rowIndex = e.rowIndex;
    const key = e.component.getKeyByRowIndex(rowIndex);
    dispatch({ focusedRowIndex: rowIndex, focusedRowKey: key ?? null, type: 'focusedRowKey' });
  }, [dispatch, focusedRowKey]);

  useEffect(() => {
    setIsDataReady(false);
    setPendingSelection(value);
  }, [dataSource, value]);

  return (
    <DataGrid
      onFocusedRowChanged={focusedRowChanged}
      dataSource={dataSource}
      focusedRowEnabled
      onContentReady={contentReady}
      autoNavigateToFocusedRow={false}
      remoteOperations
      hoverStateEnabled
      onKeyDown={keyDown}
      focusedRowIndex={focusedRowIndex}
      focusedRowKey={focusedRowKey ?? undefined}
      onSelectionChanged={selectionChanged}
      selectedRowKeys={effectiveSelection}
      columnWidth={100}
      width="100%"
      height="100%"
    >
      <Column dataField="OrderNumber" caption="ID" dataType="number" />
      <Column dataField="OrderDate" format="shortDate" dataType="date" />
      <Column dataField="StoreState" dataType="string" />
      <Column dataField="StoreCity" dataType="string" />
      <Column dataField="Employee" dataType="string" />
      <Column dataField="SaleAmount" dataType="number">
        <Format type="currency" precision={2} />
      </Column>
      <Selection mode="single" />
      <Scrolling mode="virtual" />
      <Paging enabled pageSize={10} />
      <FilterRow visible />
    </DataGrid>
  );
}

export default App;

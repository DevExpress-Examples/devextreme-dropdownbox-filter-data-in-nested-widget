import {
  useState, useMemo, useCallback, useRef,
} from 'react';
import DropDownBox, { DropDownOptions, type DropDownBoxTypes } from 'devextreme-react/drop-down-box';
import DataGrid, {
  Column, Format, Selection, Paging, FilterRow, Scrolling, type DataGridTypes,
} from 'devextreme-react/data-grid';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import type dxDropDownBox from 'devextreme/ui/drop_down_box';
import { isSearchIncomplete } from './utils';
import type { GridInstance, OrderItem } from './types';

export interface DropDownGridProps {
  selectedRowKey: number;
  dataSource: DataSource;
  gridDataSource: DataSource;
  searchTimeout: number;
  // eslint-disable-next-line no-unused-vars
  displayExpr: (item: OrderItem) => string;
}

export function handleGridContentReady(args: DataGridTypes.ContentReadyEvent): void {
  const inst = args.component;
  inst.focus();
  inst.off('contentReady', handleGridContentReady);
}

export function handleGridOptionChanged(args: DataGridTypes.OptionChangedEvent): void {
  const inst = args.component;
  if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
    inst.off('optionChanged', handleGridOptionChanged);
    inst.focus();
  }
}

export function DropDownGrid({
  selectedRowKey,
  dataSource,
  gridDataSource,
  searchTimeout,
  displayExpr,
}: DropDownGridProps): JSX.Element {
  const [value, setValue] = useState<number[] | null>([selectedRowKey]);
  const [opened, setOpened] = useState(false);
  const [focusedRowKey, setFocusedRowKey] = useState<number | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(0);
  const [gridInstance, setGridInstance] = useState<GridInstance | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<number[] | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveSelection = useMemo((): number[] => {
    if (isDataReady && (pendingSelection || value)) {
      return pendingSelection ?? value ?? [];
    }
    return [];
  }, [isDataReady, pendingSelection, value]);

  // --- DropDownBox handlers ---

  const onValueChanged = useCallback((args: DropDownBoxTypes.ValueChangedEvent): void => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setValue(args.value);
    setOpened(false);
  }, []);

  const onInput = useCallback((e: DropDownBoxTypes.InputEvent): void => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const text = e.component.option('text');
      gridDataSource.searchValue(text ?? null);
      if (opened && isSearchIncomplete(e.component)) {
        gridDataSource.load().then((items: OrderItem[]) => {
          if (items.length > 0 && gridInstance) {
            setFocusedRowKey(items[0].OrderNumber);
            setFocusedRowIndex(0);
          }
        }).catch((error: unknown) => notify(error, 'error', 1000));
      } else {
        setOpened(true);
      }
    }, searchTimeout);
  }, [opened, gridInstance, gridDataSource, searchTimeout]);

  const onKeyDown = useCallback((e: DropDownBoxTypes.KeyDownEvent): void => {
    if (e.event?.keyCode !== 40) return;
    const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
    if (!opened) {
      ddbInstance.isKeyDown = true;
      setOpened(true);
    } else if (gridInstance) {
      gridInstance.focus();
    }
  }, [opened, gridInstance]);

  const onOptionChanged = useCallback((args: DropDownBoxTypes.OptionChangedEvent): void => {
    if (args.name === 'opened') {
      setOpened(args.value);
    }
  }, []);

  const onOpened = useCallback((e: DropDownBoxTypes.OpenedEvent): void => {
    const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
    if (ddbInstance.isKeyDown) {
      if (!gridInstance) return;
      if (!gridInstance.isNotFirstLoad) {
        gridInstance.on('contentReady', handleGridContentReady);
      } else {
        gridInstance.on('optionChanged', handleGridOptionChanged);
        setFocusedRowKey(null);
        setFocusedRowIndex(0);
      }
      ddbInstance.isKeyDown = false;
    } else if (gridInstance?.isNotFirstLoad && isSearchIncomplete(ddbInstance)) {
      gridDataSource.load().then((items: OrderItem[]) => {
        if (items.length > 0) {
          setFocusedRowKey(items[0].OrderNumber);
          setFocusedRowIndex(0);
        }
        ddbInstance.focus();
      }).catch((error: unknown) => notify(error, 'error', 1000));
    }
  }, [gridInstance, gridDataSource]);

  const onClosed = useCallback((e: DropDownBoxTypes.ClosedEvent): void => {
    const ddbInstance = e.component;
    const searchValue = gridDataSource.searchValue();
    if (isSearchIncomplete(ddbInstance)) {
      setValue(null);
    }
    if (searchValue) {
      gridDataSource.searchValue(null);
    }
  }, [gridDataSource]);

  // --- DataGrid handlers ---

  const onContentReady = useCallback((e: DataGridTypes.ContentReadyEvent<OrderItem, number>): void => {
    const inst = e.component as GridInstance;
    if (!inst.isNotFirstLoad) {
      inst.isNotFirstLoad = true;
      setGridInstance(inst);
    }
    setIsDataReady(true);
    if (value && !isDataReady) {
      setPendingSelection(value);
    }
  }, [value, isDataReady]);

  const onSelectionChanged = useCallback((e: DataGridTypes.SelectionChangedEvent<OrderItem, number>): void => {
    if (!isDataReady) return;
    const newSelection = e.selectedRowKeys;
    if (JSON.stringify(newSelection) !== JSON.stringify(effectiveSelection)) {
      setValue(newSelection);
      setOpened(false);
      setPendingSelection(null);
    }
  }, [isDataReady, effectiveSelection]);

  const onGridKeyDown = useCallback((e: DataGridTypes.KeyDownEvent<OrderItem, number>): void => {
    if (e.event && e.event.keyCode === 13 && focusedRowKey != null) {
      setValue([focusedRowKey]);
      setOpened(false);
    }
  }, [focusedRowKey]);

  const onFocusedRowChanged = useCallback((e: DataGridTypes.FocusedRowChangedEvent<OrderItem, number>): void => {
    const key = e.component.getKeyByRowIndex(e.rowIndex);
    setFocusedRowIndex(e.rowIndex);
    setFocusedRowKey(key ?? null);
  }, []);

  return (
    <DropDownBox
      showClearButton
      placeholder="Select a value..."
      onInput={onInput}
      displayExpr={displayExpr}
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
      onValueChanged={onValueChanged}
      onOptionChanged={onOptionChanged}
    >
      <DropDownOptions height={300} />
      <DataGrid
        dataSource={gridDataSource}
        focusedRowEnabled
        onContentReady={onContentReady}
        autoNavigateToFocusedRow={false}
        remoteOperations
        hoverStateEnabled
        onKeyDown={onGridKeyDown}
        focusedRowIndex={focusedRowIndex}
        focusedRowKey={focusedRowKey ?? undefined}
        onSelectionChanged={onSelectionChanged}
        onFocusedRowChanged={onFocusedRowChanged}
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
    </DropDownBox>
  );
}

import {
  useState, useCallback, useRef, useReducer,
} from 'react';
import DropDownBox, { type DropDownBoxTypes, type DropDownBoxRef } from 'devextreme-react/drop-down-box';
import DataGrid, {
  Column, Format, Selection, Paging, Scrolling, type DataGridTypes, type DataGridRef,
} from 'devextreme-react/data-grid';
import { DataSource } from 'devextreme-react/common/data';
import { isSearchIncomplete, type OrderItem } from '../../service';
import { selectionReducer } from './selectionReducer';

interface DropDownGridProps {
  selectedRowKey: number;
  dataSource: DataSource;
  dropDownBoxDataSource: DataSource;
  searchTimeout: number;
  // eslint-disable-next-line no-unused-vars
  displayExpr: (item: OrderItem | null) => string;
}

const dropDownOptions = { height: 400 };

export function DropDownGrid({
  selectedRowKey,
  dataSource,
  dropDownBoxDataSource,
  searchTimeout,
  displayExpr,
}: DropDownGridProps): JSX.Element {
  const [selection, dispatch] = useReducer(selectionReducer, {
    dropDownValue: selectedRowKey,
    selectedRowKeys: [selectedRowKey],
    focusedRowKey: selectedRowKey,
  });

  const [gridBoxOpened, setGridBoxOpened] = useState(false);
  const [focusAfterLoading, setFocusAfterLoading] = useState(false);

  const gridFirstLoadCompleted = useRef(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dropDownBoxRef = useRef<DropDownBoxRef>(null);
  const dataGridRef = useRef<DataGridRef>(null);

  const onDropDownValueChanged = useCallback((args: DropDownBoxTypes.ValueChangedEvent) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    dispatch({ type: 'SELECT_VALUE', value: args.value ?? null });
    if (args.value) {
      setGridBoxOpened(false);
    }
  }, []);

  const onFocusedRowChanged = useCallback((e: DataGridTypes.FocusedRowChangedEvent) => {
    dispatch({ type: 'SET_FOCUSED_KEY', key: e.row?.key || null });
  }, []);

  const onSelectionChanged = useCallback((args: DataGridTypes.SelectionChangedEvent) => {
    if (!gridFirstLoadCompleted.current || !args.selectedRowKeys.length) return;
    dispatch({ type: 'SELECT_ROW', keys: args.selectedRowKeys });
    dropDownBoxRef.current?.instance().focus();
  }, []);

  const onInput = useCallback((e: DropDownBoxTypes.InputEvent) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (!gridBoxOpened) setGridBoxOpened(true);
      const text = e.component.option('text');
      dataSource.searchValue(text ?? null);
      if (isSearchIncomplete(e.component)) {
        setFocusAfterLoading(true);
        dataSource.load().then((items) => {
          if (items.length > 0) {
            dispatch({ type: 'SET_FOCUSED_KEY', key: items[0].OrderNumber });
            setTimeout(() => {
              dropDownBoxRef.current?.instance().focus();
            });
          }
        }).catch(() => {});
      }
    }, searchTimeout);
  }, [dataSource, gridBoxOpened, searchTimeout, focusAfterLoading]);

  const onOpened = useCallback((e: DropDownBoxTypes.OpenedEvent) => {
    if (!gridFirstLoadCompleted.current) {
      gridFirstLoadCompleted.current = true;
    }
    const _gridFirstLoadCompleted = gridFirstLoadCompleted.current;
    const dropDownBox = e.component;
    function handleOptionChanged(args: DataGridTypes.OptionChangedEvent): void {
      const grid = args.component;
      const triggerCondition = _gridFirstLoadCompleted
        ? args.name === 'opened'
        : args.name === 'focusedRowKey' || args.name === 'focusedRowIndex';
      if (triggerCondition) {
        grid.off('optionChanged', handleOptionChanged);
        requestAnimationFrame(() => {
          grid.focus();
          grid.option('opened', false);
        });
      }
    }

    dataGridRef.current?.instance().on('optionChanged', handleOptionChanged);

    if (gridFirstLoadCompleted.current) {
      dataGridRef.current?.instance().option('opened', true);
    }

    const displayValue = dropDownBox.option('displayValue') as string[];
    const isTextEqualToDisplayValue = dropDownBox.option('text') === displayValue[0];
    const shouldClearSelection = (dropDownBox.option('value') && !dropDownBox.option('text')) || !isTextEqualToDisplayValue;

    if (shouldClearSelection && selection.selectedRowKeys?.length) {
      dispatch({ type: 'RESET' });
    }
  }, []);

  const onClosed = useCallback((e: DropDownBoxTypes.ClosedEvent) => {
    const dropDownBox = e.component;
    const hasLoadedItems = dataGridRef.current?.instance().getVisibleRows().length;
    const text = dropDownBox.option('text');
    const displayValue = dropDownBox.option('displayValue') as string[];
    const resetValue = text && text !== displayValue[0];

    if (!hasLoadedItems) {
      dropDownBox.reset('');
      dataSource.searchValue('');
      dataSource.load()
        .then(() => {})
        .catch(() => {});
      return;
    }

    if (resetValue) {
      const firstKey = dataGridRef.current?.instance().getKeyByRowIndex(0);
      dispatch({ type: 'SELECT_VALUE', value: firstKey });
    }
  }, [dataSource]);

  const onOptionChanged = useCallback((args: DropDownBoxTypes.OptionChangedEvent) => {
    if (args.name === 'text' && !args.value && gridFirstLoadCompleted.current) {
      setTimeout(() => {
        dataGridRef.current?.instance().pageIndex(0).then(() => {
          dataGridRef.current?.instance().option('focusedRowIndex', 0);
        }).catch(() => {});
      }, 1500);
    }
  }, []);

  const dataGridKeyDown = useCallback((e: DataGridTypes.KeyDownEvent) => {
    if (e.event?.key === 'Enter' && selection.focusedRowKey) {
      dispatch({ type: 'SELECT_VALUE', value: selection.focusedRowKey });
    }
  }, [selection.focusedRowKey]);

  const onDropDownBoxKeyDown = useCallback((e: DropDownBoxTypes.KeyDownEvent) => {
    if (e.event?.key !== 'ArrowDown') return;
    if (!gridBoxOpened) {
      setGridBoxOpened(true);
    } else if (dataGridRef.current?.instance()) {
      dataGridRef.current.instance().focus();
    }
  }, [gridBoxOpened]);

  const onOpenedChange = useCallback((isOpened: boolean) => {
    setGridBoxOpened(isOpened);
  }, []);

  return (
    <DropDownBox
      ref={dropDownBoxRef}
      width="40vw"
      dataSource={dropDownBoxDataSource}
      value={selection.dropDownValue}
      valueExpr="OrderNumber"
      opened={gridBoxOpened}
      onOpenedChange={onOpenedChange}
      displayExpr={displayExpr}
      openOnFieldClick={false}
      showClearButton={true}
      acceptCustomValue={true}
      placeholder="Select a value..."
      valueChangeEvent=""
      onInput={onInput}
      onOptionChanged={onOptionChanged}
      onValueChanged={onDropDownValueChanged}
      onKeyDown={onDropDownBoxKeyDown}
      onOpened={onOpened}
      onClosed={onClosed}
      dropDownOptions={dropDownOptions}
    >
      <DataGrid
        ref={dataGridRef}
        dataSource={dataSource}
        height="100%"
        width="100%"
        focusedRowEnabled={true}
        focusedRowKey={selection.focusedRowKey}
        selectedRowKeys={selection.selectedRowKeys}
        autoNavigateToFocusedRow={false}
        remoteOperations={true}
        columnAutoWidth={true}
        onKeyDown={dataGridKeyDown}
        onFocusedRowChanged={onFocusedRowChanged}
        onSelectionChanged={onSelectionChanged}
      >
        <Column dataField="OrderNumber" caption="ID" dataType="number" />
        <Column dataField="OrderDate" dataType="date" />
        <Column dataField="StoreState" dataType="string" />
        <Column dataField="StoreCity" dataType="string" />
        <Column dataField="Employee" dataType="string" />
        <Column dataField="SaleAmount" dataType="number">
          <Format type="currency" precision={2} />
        </Column>
        <Paging enabled={true} pageSize={10} />
        <Selection mode="single" />
        <Scrolling mode="virtual" />
      </DataGrid>
    </DropDownBox>
  );
}

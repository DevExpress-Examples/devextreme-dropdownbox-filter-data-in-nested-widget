$(() => {
  let dataGridInstance;
  let searchTimerId;
  let gridFirstLoadCompleted = false;

  const dataSource = new DevExpress.data.DataSource({
    store: makeAsyncDataSource(),
    searchExpr: ['StoreCity', 'StoreState', 'Employee'],
  });

  const $gridBox = $('#gridBox');

  $gridBox.dxDropDownBox({
    value: 35711,
    valueExpr: 'OrderNumber',
    displayExpr: (item) => (item ? `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>` : ''),
    acceptCustomValue: true,
    openOnFieldClick: false,
    valueChangeEvent: '',
    showClearButton: true,
    dataSource: makeAsyncDataSource(),
    placeholder: 'Select a value...',
    dropDownOptions: { height: 300 },
    onInput: (e) => {
      clearTimeout(searchTimerId);
      searchTimerId = setTimeout(() => {
        const dropDownBox = e.component;
        const text = dropDownBox.option('text');
        const opened = dropDownBox.option('opened');
        dataSource.searchValue(text);
        if (opened && isSearchIncomplete(dropDownBox)) {
          dataSource.load().done((items) => {
            if (items.length > 0 && dataGridInstance) {
              dataGridInstance.option('focusedRowKey', items[0].OrderNumber);
            }
          });
        } else {
          dropDownBox.open();
        }
      }, 500);
    },
    onOpened: (e) => {
      const dropDownBox = e.component;
      if (dropDownBox.isKeyDown) {
        const contentReadyHandler = (args) => {
          const grid = args.component;
          grid.focus();
          grid.off('contentReady', contentReadyHandler);
        };
        if (!gridFirstLoadCompleted) {
          dataGridInstance.on('contentReady', contentReadyHandler);
        } else {
          const optionChangedHandler = (args) => {
            const grid = args.component;
            if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
              grid.off('optionChanged', optionChangedHandler);
              grid.focus();
            }
          };
          dataGridInstance.on('optionChanged', optionChangedHandler);
          dataGridInstance.option('focusedRowIndex', 0);
        }
        dropDownBox.isKeyDown = false;
        return;
      }
      if (gridFirstLoadCompleted && isSearchIncomplete(dropDownBox)) {
        dataSource.load().done((items) => {
          if (items.length > 0) {
            dataGridInstance.option('focusedRowKey', items[0].OrderNumber);
          }
          dropDownBox.focus();
        });
      }
    },
    onClosed: (e) => {
      const dropDownBox = e.component;
      const value = dropDownBox.option('value');
      const searchValue = dataSource.searchValue();
      if (isSearchIncomplete(dropDownBox)) {
        dropDownBox.option('value', value === '' ? null : '');
      }
      if (searchValue) {
        dataSource.searchValue(null);
      }
    },
    onKeyDown: (e) => {
      const dropDownBox = e.component;
      if (e.event.keyCode !== 40) return;
      if (!dropDownBox.option('opened')) {
        dropDownBox.isKeyDown = true;
        dropDownBox.open();
      } else if (dataGridInstance) {
        dataGridInstance.focus();
      }
    },
    contentTemplate: (e, container) => {
      const dropDownBox = e.component;
      const value = dropDownBox.option('value');
      const $dataGridContainer = $('<div>');
      container.append($dataGridContainer);
      $dataGridContainer.dxDataGrid({
        dataSource,
        hoverStateEnabled: true,
        paging: { enabled: true, pageSize: 10 },
        focusedRowIndex: 0,
        focusedRowEnabled: true,
        autoNavigateToFocusedRow: false,
        onContentReady: (_args) => {
          if (!gridFirstLoadCompleted) {
            gridFirstLoadCompleted = true;
            dropDownBox.focus();
          }
        },
        remoteOperations: true,
        scrolling: { mode: 'virtual' },
        selection: { mode: 'single' },
        selectedRowKeys: [value],
        height: '100%',
        width: '100%',
        columnWidth: 100,
        onKeyDown: (args) => {
          const grid = args.component;
          if (args.event.keyCode === 13) {
            grid.selectRows([grid.option('focusedRowKey')], false);
          }
        },
        onSelectionChanged: (args) => {
          const keys = args.selectedRowKeys;
          dropDownBox.option('value', keys.length ? keys[0] : null);
        },
        columns: [
          { dataField: 'OrderNumber', caption: 'ID', dataType: 'number' },
          { dataField: 'OrderDate', dataType: 'date', format: 'shortDate' },
          { dataField: 'StoreCity', dataType: 'string' },
          { dataField: 'StoreState', dataType: 'string' },
          { dataField: 'Employee', dataType: 'string' },
          { dataField: 'SaleAmount', dataType: 'number', format: { type: 'currency', precision: 2 } },
        ],
      });
      dataGridInstance = $dataGridContainer.dxDataGrid('instance');
      dropDownBox.on('valueChanged', (args) => {
        clearTimeout(searchTimerId);
        dataGridInstance.option('selectedRowKeys', args.value ? [args.value] : []);
        dropDownBox.close();
      });
      return container;
    },
  });
});

function makeAsyncDataSource() {
  return DevExpress.data.AspNet.createStore({
    key: 'OrderNumber',
    loadUrl: 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders',
  });
}

function isSearchIncomplete(dropDownBox) {
  let displayValue = dropDownBox.option('displayValue');
  let text = dropDownBox.option('text');
  text = text && text.length && text;
  displayValue = displayValue && displayValue.length && displayValue[0];
  return text !== displayValue;
}

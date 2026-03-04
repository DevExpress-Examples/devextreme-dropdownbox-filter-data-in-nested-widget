import {
  makeAsyncDataSource, displayExpr, performSearch, resetSearchState,
  handleDropDownOpened,
} from './helpers.js';

$(() => {
  let dataGridInstance;
  let searchTimerId;
  const storeKey = 'OrderNumber';
  const url = 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders';

  let searchTimeout = 1000;
  const initialValue = 35709;
  /*
  If the key of the first record is unknown,
  you can request data from the server
  to retrieve it from the first returned item.
  */
  const firstRowKey = 35703;

  const dataSource = new DevExpress.data.DataSource({
    store: makeAsyncDataSource(storeKey, url),
    searchExpr: 'Employee',
  });

  $('#gridBox').dxDropDownBox({
    value: initialValue,
    width: '40vw',
    valueExpr: storeKey,
    displayExpr,
    acceptCustomValue: true,
    openOnFieldClick: false,
    valueChangeEvent: '',
    showClearButton: true,
    dataSource: makeAsyncDataSource(storeKey, url),
    placeholder: 'Select a value...',
    dropDownOptions: { height: 400 },
    onInput: (e) => {
      clearTimeout(searchTimerId);
      searchTimerId = setTimeout(() => {
        const dropDownBox = e.component;
        if (!dropDownBox.option('opened')) dropDownBox.open();

        performSearch({
          dropDownBox, dataSource, dataGridInstance,
        });
      }, searchTimeout);
    },
    onOpened(e) {
      handleDropDownOpened({ e, dataGridInstance });
    },
    onClosed(e) {
      resetSearchState(e, dataSource, dataGridInstance);
    },
    onOptionChanged(e) {
      const gridFirstLoadCompleted = e.component.option('gridFirstLoadCompleted');
      if (e.name === 'text' && !e.value && gridFirstLoadCompleted) {
        dataGridInstance.option('focusedRowKey', firstRowKey);
      }
    },
    onValueChanged(args) {
      clearTimeout(searchTimerId);
      dataGridInstance?.option('selectedRowKeys', args.value ? [args.value] : []);
      if (args.value) {
        args.component.close();
      }
    },
    onKeyDown: (e) => {
      const dropDownBox = e.component;
      if (e.event.keyCode !== 40) return;
      if (!dropDownBox.option('opened')) {
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
        paging: { enabled: true, pageSize: 10 },
        focusedRowEnabled: true,
        focusedRowKey: value,
        autoNavigateToFocusedRow: false,
        onContentReady: () => {
          const gridFirstLoadCompleted = dropDownBox.option('gridFirstLoadCompleted');
          if (!gridFirstLoadCompleted) {
            dropDownBox.option('gridFirstLoadCompleted', true);
          }
        },
        remoteOperations: true,
        scrolling: { mode: 'virtual' },
        selection: { mode: 'single' },
        selectedRowKeys: [value],
        height: '100%',
        width: '100%',
        columnAutoWidth: true,
        onKeyDown: (args) => {
          const grid = args.component;
          if (args.event?.keyCode === 13) {
            grid.selectRows([grid.option('focusedRowKey')], false);
          }
        },
        onFocusedRowChanged: (event) => {
          if (event.component.option('focusAfterLoading')) {
            setTimeout(() => {
              dropDownBox.focus();
            });
            dataGridInstance.option('focusAfterLoading', false);
          }
        },
        onSelectionChanged: (args) => {
          if (!args.component.option('resetSelection')) {
            const keys = args.selectedRowKeys;
            dropDownBox.option('value', keys.length ? keys[0] : null);
            dropDownBox.focus();
          }
          args.component.option('resetSelection', false);
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
      return container;
    },
  });
  $('#searchExprOption').dxSelectBox({
    items: [{
      name: "'Employee'",
      value: 'Employee',
    }, {
      name: "['OrderNumber', 'Employee']",
      value: ['OrderNumber', 'Employee'],
    }, {
      name: "['StoreCity', 'Employee']",
      value: ['StoreCity', 'Employee'],
    }, {
      name: "['OrderNumber','StoreCity', 'StoreState', 'Employee']",
      value: ['OrderNumber', 'StoreCity', 'StoreState', 'Employee'],
    }],
    displayExpr: 'name',
    valueExpr: 'value',
    value: 'Employee',
    onValueChanged(e) {
      dataSource.searchExpr(e.value);
    },
  });
  $('#searchTimeoutOption').dxNumberBox({
    min: 0,
    max: 10000,
    value: 1000,
    showSpinButtons: true,
    step: 100,
    onValueChanged(e) {
      searchTimeout = e.value;
    },
  });
});

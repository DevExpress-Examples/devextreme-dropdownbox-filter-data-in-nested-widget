function isSearchIncomplete(dropDownBox) {
  let displayValue = dropDownBox.option('displayValue');
  let text = dropDownBox.option('text');
  text = text?.length ? text : '';
  displayValue = displayValue && displayValue.length && displayValue[0];
  return text !== displayValue;
}

export function makeAsyncDataSource(key, url) {
  return DevExpress.data.AspNet.createStore({
    key,
    loadUrl: url,
  });
}

export function displayExpr(item) {
  if (!item || typeof item !== 'object') return '';
  return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
}

export function performSearch({ dropDownBox, dataSource, dataGridInstance }) {
  const text = dropDownBox.option('text') || '';
  dataSource.searchValue(text);

  if (isSearchIncomplete(dropDownBox)) {
    dataGridInstance.option('focusAfterLoading', true);
    dataSource.load().then((items) => {
      if (items.length > 0) {
        dataGridInstance.option('focusedRowKey', items[0].OrderNumber);
      }
    });
  }
}

export function resetSearchState(e, dataSource, dataGridInstance) {
  const dropDownBox = e.component;
  const hasLoadedItems = dataGridInstance.getVisibleRows().length;
  const text = dropDownBox.option('text');
  const displayValue = dropDownBox.option('displayValue')[0];
  const resetValue = text && text !== displayValue;

  if (!hasLoadedItems) {
    dropDownBox.reset(null);
    dataSource.searchValue('');
    dataSource.load();
    return;
  }

  if (resetValue) {
    const firstKey = dataGridInstance.getKeyByRowIndex(0);
    dataGridInstance.selectRows(firstKey);
    dataGridInstance.option('focusedRowKey', firstKey);
  }
}

export function handleDropDownOpened({ e, dataGridInstance }) {
  const dropDownBox = e.component;
  const gridFirstLoadCompleted = dropDownBox.option('gridFirstLoadCompleted');

  if (dropDownBox.isKeyDown && !gridFirstLoadCompleted) {
    const optionChangedHandler = (args) => {
      const grid = args.component;
      if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
        grid.off('optionChanged', optionChangedHandler);
        grid.focus();
      }
    };
    dataGridInstance.on('optionChanged', optionChangedHandler);
    dropDownBox.isKeyDown = false;
  }

  const isTextEqualToDisplayValue = dropDownBox.option('text') === dropDownBox.option('displayValue')[0];
  if ((dropDownBox.option('value') && !dropDownBox.option('text')) || !isTextEqualToDisplayValue) {
    if (dataGridInstance.option('selectedRowKeys').length) {
      dataGridInstance.option('resetSelection', true);
      dataGridInstance.option('selectedRowKeys', []);
    }
  }
}

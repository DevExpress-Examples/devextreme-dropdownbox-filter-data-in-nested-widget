let dataGridInstance;
let searchTimerId;
let searchTimeout = 1000;
let searchExpr = "CustomerName";

function getCurrentSearchExpr() {
    return searchExpr && searchExpr.includes(",") ? searchExpr.split(",") : searchExpr;
}

function getGridDataSource() {
    if (!dataGridInstance) {
        return null;
    }

    return dataGridInstance.getDataSource();
}

function gridBoxDisplayExpr(item) {
    if (!item || typeof item !== "object") {
        return "";
    }

    return `${item.CustomerName}: ${item.ShipCountry} - ${item.ShipCity} <${item.OrderID}>`;
}

function isSearchIncomplete(dropDownBox) {
    let displayValue = dropDownBox.option("displayValue");
    let text = dropDownBox.option("text");
    text = text && text.length ? text : "";
    displayValue = displayValue && displayValue.length && displayValue[0];
    return text !== displayValue;
}

function onSearchExprChanged(e) {
    searchExpr = e.value;
    const ds = getGridDataSource();
    if (ds) {
        ds.searchExpr(getCurrentSearchExpr());
    }
}

function onSearchTimeoutChanged(e) {
    searchTimeout = e.value;
}

function performSearch({ dropDownBox, dataSource, grid }) {
    const text = dropDownBox.option("text") || "";
    dataSource.searchValue(text);

    if (isSearchIncomplete(dropDownBox)) {
        grid.option("focusAfterLoading", true);
        const onChanged = () => {
            const items = dataSource.items();
            if (items.length > 0) {
                grid.option("focusedRowKey", items[0].OrderID);
            }
            dropDownBox.focus();
            dataSource.off("changed", onChanged);
        };

        dataSource.on("changed", onChanged);
        dataSource.load();
    }
}

function resetSearchState(e, dataSource, grid) {
    const dropDownBox = e.component;
    const hasLoadedItems = grid.getVisibleRows().length;
    const text = dropDownBox.option("text");
    const displayValue = (dropDownBox.option("displayValue") || [])[0];
    const resetValue = text && text !== displayValue;

    if (!hasLoadedItems) {
        dropDownBox.reset(null);
        dataSource.searchValue("");
        dataSource.load();
        return;
    }

    if (resetValue) {
        const firstKey = grid.getKeyByRowIndex(0);
        grid.selectRows(firstKey);
        grid.option("focusedRowKey", firstKey);
    }
}

function onInput(e) {
    clearTimeout(searchTimerId);
    searchTimerId = setTimeout(() => {
        const dropDownBox = e.component;

        if (!dropDownBox.option("opened")) {
            dropDownBox.open();
        }

        const ds = getGridDataSource();

        performSearch({
            dropDownBox,
            dataSource: ds,
            grid: dataGridInstance
        });
    }, searchTimeout);
}

function onOpened(e) {
    const dropDownBox = e.component;
    const gridFirstLoadCompleted = dropDownBox.option('gridFirstLoadCompleted');

    const handleOptionChanged = (args) => {
        const grid = args.component;
        const triggerCondition = gridFirstLoadCompleted
            ? args.name === 'opened'
            : args.name === 'focusedRowKey' || args.name === 'focusedRowIndex';

        if (triggerCondition) {
            grid.off('optionChanged', handleOptionChanged);

            requestAnimationFrame(() => {
                grid.focus();
                if (gridFirstLoadCompleted) {
                    grid.option('opened', false);
                }
            });
        }
    };

    dataGridInstance.on('optionChanged', handleOptionChanged);

    if (gridFirstLoadCompleted) {
        dataGridInstance.option('opened', true);
    }

    const isTextEqualToDisplayValue = dropDownBox.option('text') === dropDownBox.option('displayValue')[0];
    const shouldClearSelection = (dropDownBox.option('value') && !dropDownBox.option('text')) || !isTextEqualToDisplayValue;

    if (shouldClearSelection && dataGridInstance.option('selectedRowKeys').length) {
        dataGridInstance.option('resetSelection', true);
        dataGridInstance.option('selectedRowKeys', []);
    }
}

function onClosed(e) {
    if (!dataGridInstance) {
        return;
    }

    const ds = getGridDataSource();
    if (!ds) {
        return;
    }

    resetSearchState(e, ds, dataGridInstance);
}

function onOptionChanged(e) {
    if (!dataGridInstance) {
        return;
    }

    const gridFirstLoadCompleted = e.component.option("gridFirstLoadCompleted");
    if (e.name === "text" && !e.value && gridFirstLoadCompleted) {
        dataGridInstance.pageIndex(0).done(() => {
            dataGridInstance.option("focusedRowIndex", 0);
        });
    }
}

function onKeyDown(e) {
    const dropDownBox = e.component;
    if (e.event.keyCode !== 40) {
        return;
    }

    if (!dropDownBox.option("opened")) {
        dropDownBox.option("openedByKeyboard", true);
        dropDownBox.open();
    } else if (dataGridInstance) {
        dataGridInstance.focus();
    }
}

function gridBoxValueChanged(args) {
    clearTimeout(searchTimerId);
    if (dataGridInstance) {
        dataGridInstance.option("selectedRowKeys", args.value ? [args.value] : []);
    }

    if (args.value) {
        args.component.close();
    }
}

function dataGridInitialized(e) {
    dataGridInstance = e.component;
    const ds = getGridDataSource();
    if (ds) {
        ds.searchExpr(getCurrentSearchExpr());
    }
}

function dataGridContentReady(e, dropDownBox) {
    if (!dropDownBox.option("gridFirstLoadCompleted")) {
        dropDownBox.option("gridFirstLoadCompleted", true);
    }
}

function dataGridSelectionChanged(e, dropDownBox) {
    if (!e.component.option("resetSelection")) {
        const keys = e.selectedRowKeys;
        dropDownBox.option("value", keys.length ? keys[0] : null);
        dropDownBox.focus();
    }
    e.component.option("resetSelection", false);
}

function dataGridKeyDown(e) {
    if (e.event && e.event.keyCode === 13) {
        const focusedRowKey = e.component.option("focusedRowKey");
        if (focusedRowKey !== undefined && focusedRowKey !== null) {
            e.component.selectRows([focusedRowKey], false);
        }
    }
}

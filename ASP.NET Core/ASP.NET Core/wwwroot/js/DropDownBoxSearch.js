var dataGrid,
    searchTimer;

let isSearchIncomplete = function (dropDownBox) {
    // compare the last displayed value and the current real text in the input field
    let displayValue = dropDownBox.option("displayValue"),
        text = dropDownBox.option("text");

    text = text && text.length && text; //text[0];
    displayValue = displayValue && displayValue.length && displayValue[0];
    return text !== displayValue;
};


function gridBox_valueChanged(e) {
    clearTimeout(searchTimer);
    dataGrid && dataGrid.option("selectedRowKeys", e.value ? [e.value] : []);
    e.component.close();
}

function gridBox_displayExpr(item) {
    return (
        item &&
        `${item.OrderID}: ${item.CustomerName} - ${item.ShipCountry} <${item.ShipCity}>`
    );
}

function dataGridInitialized(e) {
    dataGrid = e.component;
}

function onInput(e) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
        const dataSource = dataGrid && dataGrid.getDataSource();
        let text = e.component.option("text"),
            opened = e.component.option("opened");
        if (dataSource)
            dataSource.searchValue(text);
        if (opened && isSearchIncomplete(e.component)) {
            dataSource.load().done(() => {
                dataGrid && dataGrid.option("focusedRowIndex", 0);
            });
        } else {
            e.component.open();
        }
    }, 500);
}

function onOpened(e) {
    const dataSource = dataGrid && dataGrid.getDataSource();
    let ddbInstance = e.component;
    if (ddbInstance.isKeyDown) {
        let contentReadyHandler = args => {
            let gridInstance = args.component;
            gridInstance.focus();
            gridInstance.off("contentReady", contentReadyHandler);
        };
        if (!dataGrid.isNotFirstLoad)
            dataGrid.on("contentReady", contentReadyHandler);
        else {
            let optionChangedHandler = (args) => {
                if (args.name === 'focusedRowKey') {
                    args.component.off('optionChanged', optionChangedHandler);
                    args.component.focus();
                }
            };
            dataGrid.on('optionChanged', optionChangedHandler);
            dataGrid.option("focusedRowIndex", 0);
        }
        ddbInstance.isKeyDown = false;
    } else if (dataGrid.isNotFirstLoad && isSearchIncomplete(e.component)) {
        dataSource.load().done(r => {
            dataGrid.option("focusedRowIndex", 0);
            ddbInstance.focus();
        });
    }
}
function onClosed(e) {
    const dataSource = dataGrid && dataGrid.getDataSource();
    if (!dataSource)
        return;
    let ddbInstance = e.component,
        value = ddbInstance.option("value"),
        searchValue = dataSource.searchValue();
    if (isSearchIncomplete(ddbInstance)) {
        ddbInstance.option("value", value === "" ? null : "");
    }
    if (searchValue) {
        dataSource.searchValue(null);
    }
}
function onKeyDown(e) {
    let ddbInstance = e.component;
    if (e.event.keyCode !== 40) return; //not arrow down
    if (!ddbInstance.option("opened")) {
        ddbInstance.isKeyDown = true;
        ddbInstance.open();
    } else dataGrid && dataGrid.focus();
}

function dataGridKeyDown(e) {
    let gridInstance = e.component;
    if (e.event.keyCode === 13) // Enter press
        gridInstance.selectRows(
            [gridInstance.option("focusedRowKey")],
            false
        );
}

function dataGridSelectionChanged(args, ddbInstance) {
    let keys = args.selectedRowKeys,
        hasSelection = keys.length;
    ddbInstance.option("value", hasSelection ? keys[0] : null);
    if (hasSelection)
        ddbInstance.close();
}

function dataGridContentReady(e, ddbInstance) {
    if (!e.component.isNotFirstLoad) {
        e.component.isNotFirstLoad = true;
        ddbInstance.focus();
    }
}
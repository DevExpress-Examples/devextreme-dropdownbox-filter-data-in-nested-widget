

$(function () {
    let dataGrid,
        searchTimer,
        dataSource = new DevExpress.data.DataSource({
            store: makeAsyncDataSource(),
            searchExpr: ["StoreCity", "StoreState", "Employee"]
        });

    $("#gridBox").dxDropDownBox({
        value: 35711,
        valueExpr: "OrderNumber",
        displayExpr: function (item) {
            return (
                item &&
                `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`
            );
        },
        acceptCustomValue: true,
        openOnFieldClick: false,
        valueChangeEvent: "",
        showClearButton: true,
        dataSource: makeAsyncDataSource(),
        placeholder: "Select a value...",
        dropDownOptions: {
            height: 300
        },
        onInput: function (e) {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function () {
                let text = e.component.option("text"),
                    opened = e.component.option("opened");

                dataSource.searchValue(text);
                if (opened && isSearchIncomplete(e.component)) {
                    dataSource.load().done((items) => {
                        if (items.length > 0 && dataGrid)
                            dataGrid.option("focusedRowKey", items[0].OrderNumber)
                    });
                } else {
                    e.component.open();
                }
            }, 500);
        },
        onOpened: function (e) {
            let ddbInstance = e.component;
            if (ddbInstance.isKeyDown) {
                var contentReadyHandler = args => {
                    let gridInstance = args.component;
                    gridInstance.focus();
                    gridInstance.off("contentReady", contentReadyHandler);
                };
                if (!dataGrid.isNotFirstLoad)
                    dataGrid.on("contentReady", contentReadyHandler);
                else {
                    var optionChangedHandler = (args) => {
                        let gridInstance = args.component;
                        if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
                            gridInstance.off('optionChanged', optionChangedHandler);
                            gridInstance.focus();
                        }
                    }
                    dataGrid.on('optionChanged', optionChangedHandler);
                    dataGrid.option("focusedRowIndex", 0)
                }
                ddbInstance.isKeyDown = false;
            } else if (dataGrid.isNotFirstLoad && isSearchIncomplete(ddbInstance)) {
                dataSource.load().done(items => {
                    if (r.length > 0)
                        dataGrid.option("focusedRowKey", items[0].OrderNumber)
                    ddbInstance.focus();
                });
            }
        },
        onClosed: function (e) {
            let ddbInstance = e.component,
                value = ddbInstance.option("value"),
                searchValue = dataSource.searchValue();
            if (isSearchIncomplete(ddbInstance)) {
                ddbInstance.option("value", value === "" ? null : "");
            }
            if (searchValue) {
                dataSource.searchValue(null);
            }
        },
        onKeyDown: function (e) {
            let ddbInstance = e.component;
            if (e.event.keyCode !== 40) return; //not arrow down
            if (!ddbInstance.option("opened")) {
                ddbInstance.isKeyDown = true;
                ddbInstance.open();
            } else dataGrid && dataGrid.focus();
        },
        contentTemplate: function (e, container) {
            let value = e.component.option("value"),
                ddbInstance = e.component;
            $dataGridContainer = $("<div>");
            container.append($dataGridContainer);
            $dataGridContainer.dxDataGrid({
                dataSource: dataSource,
                hoverStateEnabled: true,
                paging: { enabled: true, pageSize: 10 },
                focusedRowIndex: 0,
                focusedRowEnabled: true,
                autoNavigateToFocusedRow: false,
                onContentReady: function (e) {
                    if (!e.component.isNotFirstLoad) {
                        e.component.isNotFirstLoad = true;
                        ddbInstance.focus();
                    }
                },
                remoteOperations: true,
                scrolling: { mode: "virtual" },
                selection: { mode: "single" },
                selectedRowKeys: [value],
                height: "100%",
                width: '100%',
                columnWidth: 100,
                onKeyDown: function (e) {
                    let gridInstance = e.component;
                    if (e.event.keyCode === 13) // Enter press
                        gridInstance.selectRows(
                            [gridInstance.option("focusedRowKey")],
                            false
                        );
                },
                onSelectionChanged: function (e) {
                    let keys = e.selectedRowKeys,
                        hasSelection = keys.length;
                    ddbInstance.option("value", hasSelection ? keys[0] : null);
                },
                columns: [
                    {
                        dataField: "OrderNumber",
                        caption: "ID",
                        dataType: "number"
                    },
                    {
                        dataField: "OrderDate",
                        dataType: "date",
                        format: "shortDate"
                    },
                    {
                        dataField: "StoreCity",
                        dataType: "string"
                    },
                    {
                        dataField: "StoreState",
                        dataType: "string"
                    },
                    {
                        dataField: "Employee",
                        dataType: "string"
                    },
                    {
                        dataField: "SaleAmount",
                        dataType: "number",
                        format: {
                            type: "currency",
                            precision: 2
                        }
                    }
                ]
            });
            dataGrid = $dataGridContainer.dxDataGrid("instance");
            ddbInstance.on("valueChanged", function (args) {
                clearTimeout(searchTimer);
                dataGrid.option("selectedRowKeys", args.value ? [args.value] : []);
                ddbInstance.close();
            });
            return container;
        }
    });
});

function makeAsyncDataSource() {
    return DevExpress.data.AspNet.createStore({
        key: "OrderNumber",
        loadUrl: "https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders"
    });
};
function isSearchIncomplete(dropDownBox) {
    // compare the last displayed value and the current real text in the input field
    let displayValue = dropDownBox.option("displayValue"),
        text = dropDownBox.option("text");
    text = text && text.length && text; //text[0];
    displayValue = displayValue && displayValue.length && displayValue[0];
    return text !== displayValue;
};
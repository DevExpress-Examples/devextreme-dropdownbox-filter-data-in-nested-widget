var DemoApp = angular.module('DemoApp', ['dx']);

DemoApp.controller('DemoController', function DemoController($scope) {
    
    var searchTimer;
    
    var isSearchIncomplete = function(dropDownBox){
        var displayValue = dropDownBox.option("displayValue"),
            text = dropDownBox.option("text");
        
        text = text && text.length && text[0];
        displayValue = displayValue && displayValue.length && displayValue[0];
        
        return text !== displayValue;
    };
    
    var gridDataSource = new DevExpress.data.DataSource({
        searchExpr: ["CompanyName", "City", "Phone"],
        store: new DevExpress.data.CustomStore({
            loadMode: "raw",
            key: "ID",
            load: function() {
                return $.getJSON("data/customers.json");
            }
        })
    });
    
    $scope.gridBoxValue = 11;
    $scope.gridBoxOpened = false;
    $scope.gridSelectedRowKeys = [$scope.gridBoxValue];
    $scope.$watch('gridBoxValue', function() {
        $scope.gridBoxOpened = false;
    });
    
    $scope.gridBoxOptions = {
        bindingOptions: {
            value: "gridBoxValue",
            opened: "gridBoxOpened"
        },
        acceptCustomValue: true,
        openOnFieldClick: false,
        valueChangeEvent: "",
        onInput: function(e){
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                var text = e.component.option("text");
            
                gridDataSource.searchValue(text);
                if ($scope.gridBoxOpened && isSearchIncomplete(e.component)) {
                    gridDataSource.load();
                } else {
                    e.component.open();
                }
            }, 1000);
        },
        onOpened: function(e){
            if (isSearchIncomplete(e.component)){
                gridDataSource.load();
            }
        },
        onClosed: function(e){
            var value = e.component.option("value"),
                searchValue = gridDataSource.searchValue();
        
            if (isSearchIncomplete(e.component)){
                e.component.reset();
                e.component.option("value", value);
            }
        
            if (searchValue) {
                gridDataSource.searchValue(null);
                gridDataSource.load();
            }
        },
        valueExpr: "ID",
        placeholder: "Select a value...",
        displayExpr: "CompanyName",
        onValueChanged: function(e){
            $scope.gridSelectedRowKeys = e.value || [];
        },
        showClearButton: true,
        dataSource: gridDataSource,
        dataGrid: {
            dataSource: gridDataSource,
            columns: ["CompanyName", "City", "Phone"],
            hoverStateEnabled: true,
            paging: { enabled: true, pageSize: 10 },
            scrolling: { mode: "infinite" },
            selection: { mode: "single" },
            height: 265,
            bindingOptions: {
                "selectedRowKeys": "gridSelectedRowKeys"
            },
            onSelectionChanged: function(selectedItems){
                var keys = selectedItems.selectedRowKeys;
                $scope.gridBoxValue = keys.length && keys[0] || null;
            }
        }
    };
});
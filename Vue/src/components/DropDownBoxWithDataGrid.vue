<template>
<div class="dx-viewport demo-container">
  <div class="dx-fieldset">
    <div class="dx-field">
      <div class="dx-field-label">DropDownBox with search and embedded DataGrid</div>
      <div class="dx-field-value">
      <dx-drop-down-box
          value-expr="OrderNumber"
          placeholder="Select a value..."
          valueChangeEvent=""
          :value.sync="gridBoxValue"
          :opened.sync="gridBoxOpened"
          :data-source="dropDownBoxDataSource" 
          :open-on-field-click="false"
          :display-expr="gridBox_displayExpr" 
          :show-clear-button="true" 
          :accept-custom-value="true"
          @value-changed="dropDownBoxValueChanged" 
          @initialized="onBoxInitialized"
          @key-down="onKeyDown" 
          @input="onInput" 
          @opened="onOpened"
          @closed="onClosed"
        >
        <template>
          <dx-data-grid
              height="100%" 
              width="100%" 
              :column-width="100"
              :selected-row-keys.sync="gridBoxValue" 
              :focused-row-index.sync="focusedRowIndex"
              :focused-row-key.sync="focusedRowKey" 
              :data-source="dataSource" 
              :remote-operations="true" 
              :focused-row-enabled="true" 
              :hover-state-enabled="true"
              :auto-navigate-to-focused-row="false"
              @initialized="dataGridOnInitialized"
              @key-down="dataGridOnKeyDown"
              @content-ready="dataGridOnContentReady"
            >
              <dx-column data-field="OrderNumber" caption="ID" data-type="number"></dx-column>
              <dx-column data-field="OrderDate" data-type="date" format="shortDate"></dx-column>
              <dx-column data-field="StoreState" data-type="string"></dx-column>
              <dx-column data-field="StoreCity" data-type="string"></dx-column>
              <dx-column data-field="Employee" data-type="string"></dx-column>
              <dx-column data-field="SaleAmount" data-type="number">
                <dx-format type="currency" :precision="2"></dx-format>
              </dx-column>
              <dx-pager :visible="false"></dx-pager>
              <dx-paging :enabled="true" :page-size="10"></dx-paging>
              <dx-selection mode="single"></dx-selection>
              <dx-scrolling mode="virtual"></dx-scrolling>
          </dx-data-grid>
        </template>
      </dx-drop-down-box>
    </div>
    </div>
  </div>
</div>
</template>
 
<script>
import { DxDataGrid, DxColumn, DxSelection, DxFormat, DxPager, DxPaging, DxScrolling } from 'devextreme-vue/data-grid';
import DxDropDownBox from 'devextreme-vue/drop-down-box';
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import DataSource from 'devextreme/data/data_source';
 
export default {
    components: {
        DxDropDownBox,
        DxDataGrid,        
        DxColumn, 
        DxSelection, 
        DxFormat, 
        DxPager, 
        DxPaging, 
        DxScrolling
    },
    data() {
      return {
        dataGrid: null,
        dropDownBoxDataSource: null,
        searchTimer: null,
        ddbInstance: null,
        dataSource: null,
        gridBoxValue: [35711],
        gridBoxOpened: false,
        focusedRowIndex: 0,
        focusedRowKey: null,
      };
    },
    created() {
      this.dataSource = new DataSource({
        store: this.makeAsyncDataSource(),
        searchExpr: ["StoreCity", "StoreState", "Employee"]
      });
      this.dropDownBoxDataSource = new DataSource({
        store: this.makeAsyncDataSource()
      });
    },
    methods: {
      makeAsyncDataSource() {
        return AspNetData.createStore({
          key: "OrderNumber",
          loadUrl: "https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders"
        });
      },
      onBoxInitialized(e){
        this.ddbInstance = e.component;
      },
      gridBox_displayExpr(item) {
        return (
          item &&
          `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`
        );
      },
      dropDownBoxValueChanged() {
        clearTimeout(this.searchTimer);
        this.gridBoxOpened = false;
      },
      isSearchIncomplete(dropDownBox) {
        // compare the last displayed value and the current real text in the input field
        let displayValue = dropDownBox.option("displayValue"),
          text = dropDownBox.option("text");
        text = text && text.length && text;
        displayValue = displayValue && displayValue.length && displayValue[0];
        return text !== displayValue;
      },
      onInput(e) {
        clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => {
          let text = e.component.option("text"),
            opened = this.gridBoxOpened;
          this.dataSource.searchValue(text);
          if (opened && this.isSearchIncomplete(e.component)) {
            this.dataSource.load().done((items) => {
              if (items.length > 0 && this.dataGrid)
                this.focusedRowKey = items[0].OrderNumber;
            });
          } else {
            this.gridBoxOpened = true;
          }
        }, 500);
      },
      onOpened(e) {
        let ddbInstance = e.component;
        if (ddbInstance.isKeyDown) {
          var contentReadyHandler = args => {
            let gridInstance = args.component;
            gridInstance.focus();
            gridInstance.off("contentReady", contentReadyHandler);
          };
          if (!this.dataGrid.isNotFirstLoad)
            this.dataGrid.on("contentReady", contentReadyHandler);
          else {
            var optionChangedHandler = (args) => {
              let gridInstance = args.component;
              if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
                gridInstance.off('optionChanged', optionChangedHandler);
                gridInstance.focus();
              }
            }
            this.dataGrid.on('optionChanged', optionChangedHandler);
            this.focusedRowIndex = 0;
          }
          ddbInstance.isKeyDown = false;
        } else if (this.dataGrid.isNotFirstLoad && this.isSearchIncomplete(ddbInstance)) {
          this.dataSource.load().done(items => {
            if (items.length > 0)
              this.focusedRowKey = items[0].OrderNumber;
            ddbInstance.focus();
          });
        }
      },
      onClosed(e) {
        let ddbInstance = e.component,
          searchValue = this.dataSource.searchValue();
        if (this.isSearchIncomplete(ddbInstance)) {
          this.gridBoxValue = this.gridBoxValue === "" ? null : "";
        }
        if (searchValue) {
          this.dataSource.searchValue(null);
        }
      },
      onKeyDown(e) {
        let ddbInstance = e.component;
        if (e.event.keyCode !== 40) return; //not arrow down
        if (!this.gridBoxOpened) {
          ddbInstance.isKeyDown = true;
          this.gridBoxOpened = true;
        } else this.dataGrid && this.dataGrid.focus();
      },
      dataGridOnInitialized(e) {
        this.dataGrid = e.component;
      },
      dataGridOnContentReady(e) {
        if (!e.component.isNotFirstLoad) {
          e.component.isNotFirstLoad = true;
          this.ddbInstance.focus();
        }
      },
      dataGridOnKeyDown(e) {
        if (e.event.keyCode === 13) {// Enter press 
          this.gridBoxValue = [this.focusedRowKey];
        }
      }
    }
}
</script>
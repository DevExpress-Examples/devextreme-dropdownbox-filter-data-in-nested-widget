import { Component, AfterViewInit, ViewChild } from '@angular/core';
import * as AspNetData from "devextreme-aspnet-data-nojquery";
import DataSource from 'devextreme/data/data_source';
import { DxDropDownBoxComponent } from 'devextreme-angular';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  dataGrid: any;
  dropDownBoxDataSource: DataSource;
  searchTimer: any;
  ddbInstance: any;
  dataSource: any;
  gridBoxValue: any;
  gridBoxOpened: boolean;
  focusedRowIndex: number;
  focusedRowKey: number;
  @ViewChild("dropDownBox", { static: false }) dropDownBox: DxDropDownBoxComponent;

  constructor() {
    this.focusedRowIndex = 0;
    this.gridBoxValue = [35711];
    this.dataSource = new DataSource({
      store: this.makeAsyncDataSource(),
      searchExpr: ["StoreCity", "StoreState", "Employee"]
    });
    this.dropDownBoxDataSource = new DataSource({
      store: this.makeAsyncDataSource()
    });
    this.gridBoxOpened = false;
  }

  ngAfterViewInit(): void {
    this.ddbInstance = this.dropDownBox.instance;
  }

  makeAsyncDataSource() {
    return AspNetData.createStore({
      key: "OrderNumber",
      loadUrl: "https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders"
    });
  };
  gridBox_displayExpr(item) {
    return (
      item &&
      `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`
    );
  }
  dropDownBoxValueChanged(args) {
    clearTimeout(this.searchTimer);
    this.gridBoxOpened = false;
  }
  isSearchIncomplete(dropDownBox) {
    // compare the last displayed value and the current real text in the input field
    let displayValue = dropDownBox.option("displayValue"),
      text = dropDownBox.option("text");
    text = text && text.length && text;
    displayValue = displayValue && displayValue.length && displayValue[0];
    return text !== displayValue;
  };
  onInput(e: any) {
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
  }
  onOpened(e: any) {
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
          console.log('option_changed', args.name);
          let gridInstance = args.component;
          if (args.name === 'focusedRowKey') {
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
  }
  onClosed(e: any) {
    let ddbInstance = e.component,
      searchValue = this.dataSource.searchValue();
    if (this.isSearchIncomplete(ddbInstance)) {
      this.gridBoxValue = this.gridBoxValue === "" ? null : "";
    }
    if (searchValue) {
      this.dataSource.searchValue(null);
    }
  }
  onKeyDown(e: any) {
    let ddbInstance = e.component;
    if (e.event.keyCode !== 40) return; //not arrow down
    if (!this.gridBoxOpened) {
      ddbInstance.isKeyDown = true;
      this.gridBoxOpened = true;
    } else this.dataGrid && this.dataGrid.focus();
  }
  dataGridOnInitialized(e: any) {
    this.dataGrid = e.component;
  }
  dataGridOnContentReady = (e: any) => {
    if (!e.component.isNotFirstLoad) {
      e.component.isNotFirstLoad = true;
      this.ddbInstance.focus();
    }
  }
  dataGridOnKeyDown(e: any) {
    let gridInstance = e.component;
    if (e.event.keyCode === 13) {// Enter press 
      this.focusedRowIndex = e.component.option('focusedRowIndex')
      this.gridBoxValue = [this.focusedRowKey];
    }
  }
}

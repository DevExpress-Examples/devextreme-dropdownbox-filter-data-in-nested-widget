<template>
  <div class="dx-viewport demo-container">
    <div class="dx-fieldset">
      <div class="dx-field">
        <div class="dx-field-label">DropDownBox with search and embedded DataGrid</div>
        <div class="dx-field-value">
          <DxDropDownBox
            v-model:value="gridBoxValue"
            v-model:opened="gridBoxOpened"
            value-expr="OrderNumber"
            placeholder="Select a value..."
            value-change-event=""
            :data-source="dropDownBoxDataSource"
            :open-on-field-click="false"
            :display-expr="gridBoxDisplayExpr"
            :show-clear-button="true"
            :accept-custom-value="true"
            @value-changed="onValueChanged"
            @key-down="onKeyDown"
            @input="onInput"
            @opened="onOpened"
            @closed="onClosed"
          >
            <template #default>
              <DxDataGrid
                ref="dataGridRef"
                height="100%"
                width="100%"
                :column-width="100"
                v-model:selected-row-keys="gridBoxValue"
                v-model:focused-row-index="focusedRowIndex"
                v-model:focused-row-key="focusedRowKey"
                :data-source="dataSource"
                :remote-operations="true"
                :focused-row-enabled="true"
                :hover-state-enabled="true"
                :auto-navigate-to-focused-row="false"
                @key-down="dataGridKeyDown"
                @content-ready="dataGridContentReady"
              >
                <DxColumn
                  data-field="OrderNumber"
                  caption="ID"
                  data-type="number"
                />
                <DxColumn
                  data-field="OrderDate"
                  data-type="date"
                  format="shortDate"
                />
                <DxColumn
                  data-field="StoreState"
                  data-type="string"
                />
                <DxColumn
                  data-field="StoreCity"
                  data-type="string"
                />
                <DxColumn
                  data-field="Employee"
                  data-type="string"
                />
                <DxColumn
                  data-field="SaleAmount"
                  data-type="number"
                >
                  <DxFormat
                    type="currency"
                    :precision="2"
                  />
                </DxColumn>
                <DxPaging
                  :enabled="true"
                  :page-size="10"
                />
                <DxSelection mode="single"/>
                <DxScrolling mode="virtual"/>
              </DxDataGrid>
            </template>
          </DxDropDownBox>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataSource from 'devextreme/data/data_source';
import DxDropDownBox from 'devextreme-vue/drop-down-box';
import type { DxDataGridTypes } from 'devextreme-vue/data-grid';
import type { DxDropDownBoxTypes } from 'devextreme-vue/drop-down-box';
import { DxDataGrid, DxColumn, DxSelection, DxFormat, DxPaging, DxScrolling } from 'devextreme-vue/data-grid';
import notify from 'devextreme/ui/notify';
import type dxDropDownBox from 'devextreme/ui/drop_down_box';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore third-party store no types
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

const dataGridRef = ref<InstanceType<typeof DxDataGrid> | null>(null);
const gridBoxValue = ref<number[]>([35711]);
const gridBoxOpened = ref<boolean>(false);
const focusedRowIndex = ref<number>(0);
const focusedRowKey = ref<number | null>(null);
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const dataGridFirstLoadCompleted = ref<boolean>(false);
const dataSource = ref<DataSource>(
  new DataSource({
    store: makeAsyncDataSource(),
    searchExpr: ['StoreCity', 'StoreState', 'Employee']
  } as any)
);
const dropDownBoxDataSource = ref<DataSource>(
  new DataSource({
    store: makeAsyncDataSource()
  } as any)
);

function makeAsyncDataSource(): unknown {
  return AspNetData.createStore({
    key: 'OrderNumber',
    loadUrl: 'https://js.devexpress.com/Demos/WidgetsGalleryDataService/api/orders'
  });
}

function gridBoxDisplayExpr(item: OrderItem): string {
  return item ? `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>` : '';
}

function onValueChanged(): void {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  gridBoxOpened.value = false;
}

function isSearchIncomplete(dropDownBox: any): boolean {
  const displayValue = dropDownBox.option('displayValue') as string[] | undefined;
  const text = dropDownBox.option('text') as string | undefined;
  const textValue = text?.length ? text : undefined;
  const displayFirst = displayValue?.length ? displayValue[0] : undefined;
  return textValue !== displayFirst;
}

function onInput(e: DxDropDownBoxTypes.InputEvent): void {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    const text = e.component.option('text') as string | undefined;
    dataSource.value.searchValue(text ?? null);
    if (gridBoxOpened.value && isSearchIncomplete(e.component)) {
      dataSource.value.load().then((items: OrderItem[]) => {
        if (items.length > 0 && dataGridRef.value?.instance) {
          focusedRowKey.value = items[0].OrderNumber;
          focusedRowIndex.value = 0;
        }
      }).catch((error: unknown) => notify(error, 'error', 1000));
    } else {
      gridBoxOpened.value = true;
    }
  }, 500);
}

function onOpened(e: DxDropDownBoxTypes.OpenedEvent): void {
  const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
  if (ddbInstance.isKeyDown) {
    if (!dataGridRef.value?.instance) return;
    const inst = dataGridRef.value?.instance;
    const contentReadyHandler = (
      args: DxDataGridTypes.ContentReadyEvent<OrderItem, number>
    ): void => {
      const gridInstance = args.component;
      gridInstance.focus();
      gridInstance.off('contentReady', contentReadyHandler as any);
    };
    if (!dataGridFirstLoadCompleted.value) {
      inst.on('contentReady', contentReadyHandler as any);
    } else {
      const optionChangedHandler = (
        args: DxDataGridTypes.OptionChangedEvent<OrderItem, number>
      ): void => {
        const gridInstance = args.component;
        if (args.name === 'focusedRowKey' || args.name === 'focusedColumnIndex') {
          gridInstance.off('optionChanged', optionChangedHandler as any);
          gridInstance.focus();
        }
      };
      inst.on('optionChanged', optionChangedHandler as any);
      focusedRowIndex.value = 0;
    }
    ddbInstance.isKeyDown = false;
  } else if (dataGridFirstLoadCompleted.value && isSearchIncomplete(ddbInstance)) {
    void dataSource.value.load().then((items: OrderItem[]) => {
      if (items.length > 0) focusedRowKey.value = items[0].OrderNumber;
      ddbInstance.focus();
    });
  }
}

function onClosed(e: DxDropDownBoxTypes.ClosedEvent): void {
  const ddbInstance = e.component;
  const searchValue = dataSource.value.searchValue();
  if (isSearchIncomplete(ddbInstance)) {
    gridBoxValue.value = [];
  }
  if (searchValue) {
    dataSource.value.searchValue(null);
  }
}

function onKeyDown(e: DxDropDownBoxTypes.KeyDownEvent): void {
  if (e.event?.keyCode !== 40) return;
  const ddbInstance = e.component as dxDropDownBox & { isKeyDown?: boolean };
  if (!gridBoxOpened.value) {
    ddbInstance.isKeyDown = true;
    gridBoxOpened.value = true;
  } else if (dataGridRef.value?.instance) {
    dataGridRef.value.instance.focus();
  }
}

function dataGridContentReady(): void {
  if (!dataGridFirstLoadCompleted.value) {
    dataGridFirstLoadCompleted.value = true;
  }
}

function dataGridKeyDown(e: DxDataGridTypes.KeyDownEvent): void {
  if (e.event?.keyCode === 13 && focusedRowKey.value != null) {
    gridBoxValue.value = [focusedRowKey.value];
    gridBoxOpened.value = false;
  }
}
</script>

<style scoped>
.dx-fieldset { margin: 16px; }
.dx-field-label { font-weight: 600; margin-bottom: 8px; }
</style>

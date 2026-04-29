<template>
  <DxDropDownBox
    ref="dropDownBoxRef"
    width="40vw"
    :data-source="dropDownBoxDataSource"
    :value="dropDownValue"
    value-expr="OrderNumber"
    :display-expr="displayExpr"
    :open-on-field-click="false"
    :show-clear-button="true"
    :accept-custom-value="true"
    v-model:opened="gridBoxOpened"
    placeholder="Select a value..."
    value-change-event=""
    :drop-down-options="dropDownOptions"
    @input="onInput"
    @option-changed="onOptionChanged"
    @value-changed="onDropDownValueChanged"
    @key-down="onDropDownBoxKeyDown"
    @opened="onOpened"
    @closed="onClosed"
  >
    <template #default>
      <DxDataGrid
        ref="dataGridRef"
        :data-source="dataSource"
        height="100%"
        width="100%"
        :focused-row-enabled="true"
        v-model:focused-row-key="focusedRowKey"
        :selected-row-keys="selectedRowKeys"
        :auto-navigate-to-focused-row="false"
        :remote-operations="true"
        :column-auto-width="true"
        @key-down="dataGridKeyDown"
        @content-ready="dataGridContentReady"
        @selection-changed="onSelectionChanged"
      >
        <DxColumn
          data-field="OrderNumber"
          caption="ID"
          data-type="number"
        />
        <DxColumn
          data-field="OrderDate"
          data-type="date"
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DataSource } from 'devextreme-vue/common/data';
import DxDropDownBox, {
  type DxDropDownBoxTypes,
} from 'devextreme-vue/drop-down-box';
import {
  DxDataGrid,
  DxColumn,
  DxSelection,
  DxFormat,
  DxPaging,
  DxScrolling,
  type DxDataGridTypes,
} from 'devextreme-vue/data-grid';
import { isSearchIncomplete, type OrderItem } from '../service';

const props = defineProps<{
  selectedRowKey: number;
  dataSource: DataSource;
  dropDownBoxDataSource: DataSource;
  searchTimeout: number;
  // eslint-disable-next-line no-unused-vars
  displayExpr: (item: OrderItem | null) => string;
}>();

const dropDownValue = ref<number | null>(props.selectedRowKey);
const selectedRowKeys = ref<number[]>([props.selectedRowKey]);
const focusedRowKey = ref<number | null>(props.selectedRowKey);
const gridBoxOpened = ref(false);
const gridFirstLoadCompleted = ref(false);
const searchTimer = ref<ReturnType<typeof setTimeout> | null>(null);

const dropDownBoxRef = ref<DxDropDownBox | null>(null);
const dataGridRef = ref<DxDataGrid | null>(null);

const dropDownOptions = { height: 400 };

function onDropDownValueChanged(
  args: DxDropDownBoxTypes.ValueChangedEvent
): void {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  dropDownValue.value = args.value ?? null;
  selectedRowKeys.value = args.value ? [args.value] : [];
  focusedRowKey.value = args.value ?? null;
  if (args.value) {
    gridBoxOpened.value = false;
  }
}

function onSelectionChanged(args: DxDataGridTypes.SelectionChangedEvent): void {
  if (!gridFirstLoadCompleted.value || !args.selectedRowKeys.length) return;
  const keys = args.selectedRowKeys;
  dropDownValue.value = keys.length ? keys[0] : null;
  selectedRowKeys.value = keys;
  setTimeout(() => {
    dropDownBoxRef.value?.instance?.focus();
  });
}

function onInput(e: DxDropDownBoxTypes.InputEvent): void {
  if (searchTimer.value) clearTimeout(searchTimer.value);
  searchTimer.value = setTimeout(() => {
    if (!gridBoxOpened.value) gridBoxOpened.value = true;
    const text = e.component.option('text');
    props.dataSource.searchValue(text ?? null);
    if (isSearchIncomplete(e.component)) {
      const onChanged = (): void => {
        const items = props.dataSource.items();
        if (items.length > 0) {
          focusedRowKey.value = (items[0] as OrderItem).OrderNumber;
        }
        dropDownBoxRef.value?.instance?.focus();
        props.dataSource.off('changed', onChanged);
      };
      props.dataSource.on('changed', onChanged);
      props.dataSource.load().catch(() => {});
    }
  }, props.searchTimeout);
}

function onOpened(e: DxDropDownBoxTypes.OpenedEvent): void {
  if (!gridFirstLoadCompleted.value) {
    gridFirstLoadCompleted.value = true;
  }
  const _gridFirstLoadCompleted = gridFirstLoadCompleted.value;
  const dropDownBox = e.component;

  function handleOptionChanged(args: DxDataGridTypes.OptionChangedEvent): void {
    const grid = args.component;
    const triggerCondition = _gridFirstLoadCompleted
      ? args.name === 'opened'
      : args.name === 'focusedRowKey' || args.name === 'focusedRowIndex';
    if (triggerCondition) {
      grid.off('optionChanged', handleOptionChanged);
      requestAnimationFrame(() => {
        grid.focus();
        grid.option('opened', false);
      });
    }
  }

  dataGridRef.value?.instance?.on('optionChanged', handleOptionChanged);

  if (gridFirstLoadCompleted.value) {
    dataGridRef.value?.instance?.option('opened', true);
  }

  const displayValue = dropDownBox.option('displayValue') as string[];
  const isTextEqualToDisplayValue =
    dropDownBox.option('text') === displayValue[0];
  const shouldClearSelection =
    (dropDownBox.option('value') && !dropDownBox.option('text')) ||
    !isTextEqualToDisplayValue;

  if (shouldClearSelection && selectedRowKeys.value?.length) {
    selectedRowKeys.value = [];
  }
}

function onClosed(e: DxDropDownBoxTypes.ClosedEvent): void {
  const dropDownBox = e.component;
  const hasLoadedItems = dataGridRef.value?.instance?.getVisibleRows().length;
  const text = dropDownBox.option('text');
  const displayValue = dropDownBox.option('displayValue') as string[];
  const resetValue = text && text !== displayValue[0];

  if (!hasLoadedItems) {
    dropDownBox.reset('');
    props.dataSource.searchValue('');
    props.dataSource
      .load()
      .then(() => {})
      .catch(() => {});
    return;
  }

  if (resetValue) {
    const firstKey = dataGridRef.value?.instance?.getKeyByRowIndex(0);
    dropDownValue.value = firstKey ?? null;
    selectedRowKeys.value = firstKey ? [firstKey] : [];
    focusedRowKey.value = firstKey ?? null;
  }
}

function onOptionChanged(args: DxDropDownBoxTypes.OptionChangedEvent): void {
  if (args.name === 'text' && !args.value && gridFirstLoadCompleted.value) {
    setTimeout(() => {
      dataGridRef.value?.instance
        ?.pageIndex(0)
        .then(() => {
          dataGridRef.value?.instance?.option('focusedRowIndex', 0);
        })
        .catch(() => {});
    }, 500);
  }
}

function dataGridKeyDown(e: DxDataGridTypes.KeyDownEvent): void {
  if (e.event?.key === 'Enter' && focusedRowKey.value) {
    dropDownValue.value = focusedRowKey.value;
    selectedRowKeys.value = [focusedRowKey.value];
  }
}

function onDropDownBoxKeyDown(e: DxDropDownBoxTypes.KeyDownEvent): void {
  if (e.event?.key !== 'ArrowDown') return;
  if (!gridBoxOpened.value) {
    gridBoxOpened.value = true;
  } else if (dataGridRef.value?.instance) {
    dataGridRef.value.instance.focus();
  }
}

function dataGridContentReady(): void {
  if (!gridFirstLoadCompleted.value) {
    gridFirstLoadCompleted.value = true;
  }
}
</script>

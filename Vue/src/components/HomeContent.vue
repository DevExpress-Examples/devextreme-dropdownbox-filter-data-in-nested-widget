<script setup lang="ts">
import 'devextreme/dist/css/dx.light.css';
import { ref } from 'vue';
import { DataSource } from 'devextreme-vue/common/data';
import DxSelectBox, { type DxSelectBoxTypes } from 'devextreme-vue/select-box';
import DxNumberBox from 'devextreme-vue/number-box';
import DropDownGrid from './DropDownBoxWithDataGrid.vue';
import { makeAsyncDataSource, formatDisplayExpr, searchExprOptions } from '../service';

const searchTimeout = ref(1000);
const selectedSearchExpr = ref<string | string[]>('Employee');

const dataSource = new DataSource({
  store: makeAsyncDataSource(),
  searchExpr: 'Employee',
});

const dropDownBoxDataSource = new DataSource({
  store: makeAsyncDataSource(),
});

function onSearchExprChanged(e: DxSelectBoxTypes.ValueChangedEvent): void {
  selectedSearchExpr.value = e.value;
  dataSource.searchExpr(e.value);
}
</script>

<template>
  <div class="dx-viewport demo-container">
    <div class="row">
      <p>DropDownBox with search and embedded DataGrid</p>
      <DropDownGrid
        :selected-row-key="35709"
        :data-source="dataSource"
        :drop-down-box-data-source="dropDownBoxDataSource"
        :search-timeout="searchTimeout"
        :display-expr="formatDisplayExpr"
      />
    </div>

    <div class="options">
      <div class="caption">Search Options</div>
      <div class="option">
        <div>Search Expression</div>
        <DxSelectBox
          id="searchExpr"
          :items="searchExprOptions"
          display-expr="name"
          value-expr="value"
          v-model:value="selectedSearchExpr"
          @value-changed="onSearchExprChanged"
        />
      </div>
      <div class="option">
        <div>Search Timeout</div>
        <DxNumberBox
          id="searchTimeout"
          :min="0"
          :max="10000"
          v-model:value="searchTimeout"
          :show-spin-buttons="true"
          :step="100"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  margin: 40px 20px;
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.row p {
  margin: 0;
}

.options {
  height: 180px;
  width: 25vw;
  padding: 20px;
  background-color: rgb(191 191 191 / 15%);
  position: absolute;
  right: 20px;
  top: 40px;
}

.caption {
  font-weight: 500;
  font-size: 18px;
}

.option {
  margin-top: 10px;
}
</style>

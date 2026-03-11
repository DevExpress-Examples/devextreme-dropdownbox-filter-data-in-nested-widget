import {
  AfterViewInit, Component, inject, ViewChild,
} from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { DxDropDownBoxComponent, DxDataGridComponent } from 'devextreme-angular';
import type { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import type { DxDropDownBoxTypes } from 'devextreme-angular/ui/drop-down-box';
import { AppService } from './app.service';

interface OrderItem {
  OrderNumber: number;
  Employee: string;
  StoreState: string;
  StoreCity: string;
  OrderDate: string;
  SaleAmount: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements AfterViewInit {
  @ViewChild('dropDownBox', { static: false }) dropDownBox!: DxDropDownBoxComponent;

  @ViewChild(DxDataGridComponent) dataGrid!: DxDataGridComponent;

  private readonly appService = inject(AppService);

  resetSelection = false;

  focusAfterLoading = false;

  gridFirstLoadCompleted = false;

  searchTimeout = 1000;

  dataSource: DataSource;

  dropDownBoxDataSource: DataSource;

  searchTimer: ReturnType<typeof setTimeout> | null = null;

  dropDownValue = 35709;

  selectedRowKeys = [35709];

  gridBoxOpened = false;

  focusedRowIndex = 0;

  focusedRowKey: number | null = 35709;

  constructor() {
    this.dataSource = this.appService.createGridDataSource();
    this.dropDownBoxDataSource = this.appService.createDropDownDataSource();
  }

  ngAfterViewInit(): void {
    // Component initialized
  }

  gridBoxDisplayExpr(item: OrderItem): string {
    if (!item || typeof item !== 'object') return '';
    return `${item.Employee}: ${item.StoreState} - ${item.StoreCity} <${item.OrderNumber}>`;
  }

  onDropDownValueChanged(args: DxDropDownBoxTypes.ValueChangedEvent): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.selectedRowKeys = args.value ? [args.value] : [];
    this.focusedRowKey = args.value ? args.value : null;
    if (args.value) {
      args.component.close();
    }
  }

  onFocusedRowChanged(args: DxDataGridTypes.FocusedRowChangedEvent): void {
    if (this.focusAfterLoading) {
      setTimeout(() => {
        this.dropDownBox.instance.focus();
      });
      this.focusAfterLoading = false;
    }
  }

  onSelectionChanged(args: DxDataGridTypes.SelectionChangedEvent): void {
    if (!this.resetSelection) {
      const keys = args.selectedRowKeys;
      this.dropDownValue = keys.length ? keys[0] : null;
      this.dropDownBox.instance.focus();
    }
    this.resetSelection = false;
  }

  private isSearchIncomplete(dropDownBox: any): boolean {
    let displayValue = dropDownBox.option('displayValue');
    const text = dropDownBox.option('text');
    const textValue = text?.length ? text : undefined;
    displayValue = displayValue?.length && displayValue[0];
    return textValue !== displayValue;
  }

  onInput(e: DxDropDownBoxTypes.InputEvent): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (!this.gridBoxOpened) this.gridBoxOpened = true;
      const text = e.component.option('text');
      this.dataSource.searchValue(text ?? null);
      if (this.isSearchIncomplete(e.component)) {
        this.focusAfterLoading = true;
        this.dataSource.load().then((items) => {
          if (items.length > 0) {
            this.focusedRowKey = items[0].OrderNumber;
          }
        }).catch(() => {});
      }
    }, this.searchTimeout);
  }

  onOpened(e: DxDropDownBoxTypes.OpenedEvent): void {
    let gridFirstLoadCompleted = this.gridFirstLoadCompleted;
    const dropDownBox = e.component;
    const handleOptionChanged = (args: DxDataGridTypes.OptionChangedEvent): void => {
      const grid = args.component;
      const triggerCondition = gridFirstLoadCompleted
        ? args.name === 'opened'
        : args.name === 'focusedRowKey' || args.name === 'focusedRowIndex';

      if (triggerCondition) {
        grid.off('optionChanged', handleOptionChanged);
        requestAnimationFrame(() => {
          grid.focus();
          grid.option('opened', false);
        });
      }
    };

    this.dataGrid.instance.on('optionChanged', handleOptionChanged);

    if (this.gridFirstLoadCompleted) {
      // this is used to trigger the optionChanged event
      this.dataGrid.instance.option('opened', true);
    }

    const displayValue = dropDownBox.option('displayValue') as string[];
    const isTextEqualToDisplayValue = dropDownBox.option('text') === displayValue[0];
    const shouldClearSelection = (dropDownBox.option('value') && !dropDownBox.option('text')) || !isTextEqualToDisplayValue;

    if (shouldClearSelection && this.selectedRowKeys?.length) {
      this.resetSelection = true;
      this.selectedRowKeys = [];
    }
  }

  onClosed(e: DxDropDownBoxTypes.ClosedEvent): void {
    const dropDownBox = e.component;
    const hasLoadedItems = this.dataGrid.instance.getVisibleRows().length;
    const text = dropDownBox.option('text');
    const displayValue = dropDownBox.option('displayValue') as string[];
    const resetValue = text && text !== displayValue[0];

    if (!hasLoadedItems) {
      dropDownBox.reset('');
      this.dataSource.searchValue('');
      // eslint-disable-next-line no-void
      void this.dataSource.load();
      return;
    }

    if (resetValue) {
      const firstKey = this.dataGrid.instance.getKeyByRowIndex(0);
      this.selectedRowKeys = [firstKey];
      this.focusedRowKey = firstKey;
    }
  }

  onOptionChanged(args: DxDropDownBoxTypes.OptionChangedEvent): void {
    if (args.name === 'text' && !args.value && this.gridFirstLoadCompleted) {
      setTimeout(() => {
        this.dataGrid.instance.pageIndex(0).then(() => {
          this.focusedRowKey = 35703;
        }).catch(() => {});
      }, 500);
    }
  }

  dataGridContentReady(e: DxDataGridTypes.ContentReadyEvent): void {
    if (!this.gridFirstLoadCompleted) {
      this.gridFirstLoadCompleted = true;
    }
  }

  dataGridKeyDown(e: DxDataGridTypes.KeyDownEvent): void {
    if (e.event?.keyCode === 13 && this.focusedRowKey) {
      this.selectedRowKeys = [this.focusedRowKey];
    }
  }

  onDropDownBoxKeyDown(e: DxDropDownBoxTypes.KeyDownEvent): void {
    const dropDownBox = e.component;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (e.event.keyCode !== 40) return;
    if (!this.gridBoxOpened) {
      dropDownBox.open();
    } else if (this.dataGrid?.instance) {
      this.dataGrid.instance.focus();
    }
  }
}

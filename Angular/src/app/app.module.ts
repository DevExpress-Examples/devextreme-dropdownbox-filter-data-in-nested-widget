import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxTemplateModule } from 'devextreme-angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DropDownGridComponent } from './drop-down-grid/drop-down-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    DropDownGridComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxDropDownBoxModule,
    DxDataGridModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }

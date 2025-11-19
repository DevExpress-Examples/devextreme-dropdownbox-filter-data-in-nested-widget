import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxTemplateModule } from 'devextreme-angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxDropDownBoxModule,
    DxDataGridModule,
    DxTemplateModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }

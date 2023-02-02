import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';

import { AppComponent } from './app.component';

const browser = (window as any).browser;

if (browser) {
  browser.tabs.executeScript({ file: "/assets/js/import-creature.js" });
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TreeModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

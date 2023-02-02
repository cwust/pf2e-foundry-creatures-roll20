import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {

  constructor() { }

  get browser(): any {
    return (window as any).browser;
  }

  private async queryActiveTab() {
    return (await this.browser.tabs.query({ active: true, currentWindow: true }))[0];
  }

  public async sendMessage(command: string, params: any) {
    const currentTab = await this.queryActiveTab();
    return this.browser.tabs.sendMessage(currentTab.id, { command: command, params: params });
  }
}

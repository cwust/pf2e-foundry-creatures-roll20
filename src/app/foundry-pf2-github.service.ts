import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FoundryPF2GithubService {

  constructor(
    private http: HttpClient
  ) { }

  public getSystemPacks(): Observable<any> {
    return this.http.get<any>("https://raw.githubusercontent.com/foundryvtt/pf2e/master/system.json")
    .pipe(map(system => system.packs));
  }

  public listPackItems(packName: string): Observable<any[]> {
    return this.http.get<any[]>(`https://api.github.com/repos/foundryvtt/pf2e/contents/packs/data/${packName}.db?ref=master`)
    .pipe(map(entries => entries.map(entry => ({ 
      name: entry.name,
      path: entry.path
    }))));
  }

  public getCreatureJson(path:string) {
    return this.http.get<any>(`https://raw.githubusercontent.com/foundryvtt/pf2e/master/${path}`);
  }
}

// src/app/services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PackageStateService } from './package-state.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(
    private http: HttpClient,
    private packageState: PackageStateService
  ) {}

  searchPackagesByName(name: string, version?: string): Observable<any> {
    const query = [{
      Name: name,
      ...(version && { Version: version })
    }];
    
    const request = this.http.post<any>(this.apiUrl, query);
    request.subscribe(results => {
      this.packageState.updateSearchResults(results);
    });
    return request;
  }

  searchByRegex(regex: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/byRegEx`, { RegEx: regex });
  }

  getAllPackages(): Observable<any> {
    const query = [{ Name: '*' }];
    const request = this.http.post<any>(this.apiUrl, query);
    request.subscribe(results => {
      this.packageState.updateSearchResults(results);
    });
    return request;
  }
}
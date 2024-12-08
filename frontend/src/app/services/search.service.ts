
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:3000/packages';

  constructor(private http: HttpClient) {}

  searchPackagesByName(name: string): Observable<any> {
    const query = [{ Name: name }];
    return this.http.post<any>(this.apiUrl, query);
  }
}
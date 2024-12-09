import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) {}

  searchPackagesByName(name: string): Observable<any> {
    const query = [{ Name: name }];
    return this.http.post<any>(this.apiUrl, query);
  }

  getAllPackages(): Observable<any> {
    const query = [{ Name: '*' }];
    return this.http.post<any>(this.apiUrl, query);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PackageRating } from '../models/package-ratings.model';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private apiUrl = `${environment.apiUrl}/api/package`;

  constructor(private http: HttpClient) {}

  getPackageRating(id: string): Observable<PackageRating> {
    return this.http.get<PackageRating>(`${this.apiUrl}/${id}/rate`);
  }
}
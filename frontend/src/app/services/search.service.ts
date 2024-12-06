import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private apiUrl = 'http://localhost:3000/api/packages/byRegEx';

    constructor(private http: HttpClient) {}

    searchPackages(regex: string): Observable<any> {
        return this.http.post<any>(this.apiUrl, { RegEx: regex });
    }
}
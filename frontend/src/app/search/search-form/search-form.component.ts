// src/app/search/search-form/search-form.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  packageName: string = '';
  @Output() searchResults = new EventEmitter<any[]>();
  private searchTerms = new Subject<string>();

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => {
        if (!term) {
          return this.searchService.getAllPackages();
        }
        // Parse name@version format
        const [name, version] = term.split('@');
        return this.searchService.searchPackagesByName(name, version);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.emit(results);
      },
      error: (error) => {
        console.error('Search error:', error);
      }
    });
  }

  onSearch(): void {
    this.searchTerms.next(this.packageName);
  }
}
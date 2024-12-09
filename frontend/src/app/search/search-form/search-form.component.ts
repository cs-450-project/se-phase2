import { Component, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  packageName: string = '';
  @Output() searchResults = new EventEmitter<any[]>();
  private searchTerms = new Subject<string>();

  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => 
        term ? this.searchService.searchPackagesByName(term) : this.searchService.getAllPackages()
      )
    ).subscribe(
      (results) => {
        console.log('Search results:', results);
        this.searchResults.emit(results);
      },
      (error) => {
        console.error('Search error:', error);
      }
    );
  }

  onSearch(): void {
    this.searchTerms.next(this.packageName);
  }
}
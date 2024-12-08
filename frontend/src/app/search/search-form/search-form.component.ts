// search-form.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  packageName: string = '';
  @Output() searchResults = new EventEmitter<any[]>();

  constructor(private searchService: SearchService) {}

  onSearch(): void {
    if (this.packageName) {
      this.searchService.searchPackagesByName(this.packageName).subscribe(
        (results) => {
          console.log('Search results:', results);
          this.searchResults.emit(results);
        },
        (error) => {
          console.error('Search error:', error);
        }
      );
    }
  }
}
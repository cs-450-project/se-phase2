import { Component, Output, EventEmitter } from '@angular/core';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent {
  regex: string = '';
  @Output() searchResults = new EventEmitter<any[]>();

  constructor(private searchService: SearchService) {}

  onSearch(): void {
    this.searchService.searchPackages(this.regex).subscribe(
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
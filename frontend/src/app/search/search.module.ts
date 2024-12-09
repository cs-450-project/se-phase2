import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchFormComponent } from './search-form/search-form.component';
import { SearchResultsComponent } from './search-results/search-results.component';

@NgModule({
  declarations: [SearchFormComponent, SearchResultsComponent],
  imports: [CommonModule, FormsModule],
  exports: [SearchFormComponent, SearchResultsComponent]
})
export class SearchModule {}
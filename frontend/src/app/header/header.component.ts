// header.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchModule } from '../search/search.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnDestroy {
  isAboutPage: boolean = false;
  private routerSubscription: Subscription;

  constructor(private router: Router) {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAboutPage = event.urlAfterRedirects === '/about';
      }
    });
  }

  onSearchResults(results: any[]): void {
    // Emit results to main component through a service
    this.router.navigate(['/'], { state: { searchResults: results } });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
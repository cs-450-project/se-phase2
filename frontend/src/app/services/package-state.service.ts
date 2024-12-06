import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackageStateService {
  private refreshTrigger = new Subject<void>();
  refresh$ = this.refreshTrigger.asObservable();

  triggerRefresh() {
    console.log('Triggering refresh');
    this.refreshTrigger.next();
  }
}
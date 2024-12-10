// src/app/services/package-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Package {
  Name: string;
  Version: string;
  ID: string;
}

export interface PackageState {
  searchResults: Package[];
  selectedPackage: Package | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PackageStateService {
  private initialState: PackageState = {
    searchResults: [],
    selectedPackage: null,
    isLoading: false,
    error: null
  };

  private searchResultsSource = new BehaviorSubject<Package[]>([]);
  private selectedPackageSource = new BehaviorSubject<Package | null>(null);
  private loadingSource = new BehaviorSubject<boolean>(false);
  private errorSource = new BehaviorSubject<string | null>(null);
  private refreshSource = new Subject<void>();

  // Observables
  searchResults$ = this.searchResultsSource.asObservable();
  selectedPackage$ = this.selectedPackageSource.asObservable();
  isLoading$ = this.loadingSource.asObservable();
  error$ = this.errorSource.asObservable();
  refresh$ = this.refreshSource.asObservable();

  // State Updates
  updateSearchResults(results: Package[]) {
    this.searchResultsSource.next(results);
    this.errorSource.next(null);
  }

  setSelectedPackage(pkg: Package | null) {
    this.selectedPackageSource.next(pkg);
  }

  setLoading(isLoading: boolean) {
    this.loadingSource.next(isLoading);
  }

  setError(error: string | null) {
    this.errorSource.next(error);
  }

  // Reset
  clearSearchResults() {
    this.searchResultsSource.next([]);
  }

  clearSelectedPackage() {
    this.selectedPackageSource.next(null);
  }

  resetState() {
    this.searchResultsSource.next(this.initialState.searchResults);
    this.selectedPackageSource.next(this.initialState.selectedPackage);
    this.loadingSource.next(this.initialState.isLoading);
    this.errorSource.next(this.initialState.error);
  }

  // Current State Getters
  getCurrentSearchResults(): Package[] {
    return this.searchResultsSource.getValue();
  }

  getSelectedPackage(): Package | null {
    return this.selectedPackageSource.getValue();
  }

  isLoading(): boolean {
    return this.loadingSource.getValue();
  }

  getError(): string | null {
    return this.errorSource.getValue();
  }

  // Refresh
  refresh() {
    this.refreshSource.next();
  }
}
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';

interface DependencyCost {
  standaloneCost: number;
  totalCost: number;
}

interface PackageCosts {
  packageId: string;
  standaloneCost: number;
  totalCost: number;
  dependencyCosts?: {
    [dependencyId: string]: DependencyCost;
  };
}

@Component({
  selector: 'app-package-cost',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cost-card">
      <div class="header">
        <h3>Package Costs</h3>
        <label class="toggle">
          <input type="checkbox" 
                 [(ngModel)]="showDependencies" 
                 (change)="loadCosts()">
          Show Dependencies
        </label>
      </div>
      
      <div *ngIf="isLoading" class="loading">
        <div class="loading-spinner"></div>
        Calculating costs...
      </div>
      <div *ngIf="!isLoading && costs" class="costs">
        <!-- Main package costs -->
        <div class="package-cost main">
          <h4>Main Package <span class="package-id">({{ costs.packageId }})</span></h4>
          <div class="cost-item">
            <span>Total Size:</span>
            <span>{{ formatSize(costs.totalCost) }}</span>
          </div>
          <div class="cost-item">
            <span>Standalone Size:</span>
            <span>{{ formatSize(costs.standaloneCost) }}</span>
          </div>
        </div>
        <!-- Dependencies costs -->
        <div *ngIf="costs.dependencyCosts" class="dependencies">
          <h4>Dependencies</h4>
          <div *ngFor="let dep of getDependencies()" class="package-cost">
            <h5>{{ dep.id }}</h5>
            <div class="cost-item">
              <span>Total Size:</span>
              <span>{{ formatSize(dep.costs.totalCost) }}</span>
            </div>
            <div class="cost-item">
              <span>Standalone Size:</span>
              <span>{{ formatSize(dep.costs.standaloneCost) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .cost-card {
      background: #2d2d2d;
      padding: 15px;
      border-radius: 8px;
      margin: 10px 0;
      color: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .toggle {
      color: #808080;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    input[type="checkbox"] {
      accent-color: #4ec9b0;
    }
    .package-cost {
      margin-bottom: 15px;
      padding: 10px;
      border-bottom: 1px solid #3d3d3d;
    }
    .main {
      background: #363636;
      border-radius: 4px;
    }
    .dependencies {
      margin-top: 20px;
    }
    .cost-item {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
    }
    h4 {
      margin: 0 0 10px 0;
      color: #4ec9b0;
    }
    h5 {
      margin: 0 0 8px 0;
      color: #9cdcfe;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #808080;
      padding: 20px 0;
    }
    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #3d3d3d;
      border-top: 2px solid #4ec9b0;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #f14c4c;
    }
    .package-id {
      color: #808080;
      font-size: 0.9em;
      font-weight: normal;
    }
  `]
})
export class PackageCostComponent implements OnInit, OnChanges {
  @Input() packageId: string = '';
  showDependencies = false;
  costs: PackageCosts | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCosts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['packageId'] && changes['packageId'].currentValue) {
      // Reset state and load new costs
      this.costs = null;
      this.error = null;
      this.loadCosts();
    }
  }

  public loadCosts() {
    if (!this.packageId) return;

    this.isLoading = true;
    this.error = null;

    const url = `${environment.apiUrl}/package/${this.packageId}/cost?dependency=${this.showDependencies}`;

    this.http.get<any>(url)
      .subscribe({
        next: (response) => {
          // Handle the first package ID from response
          const firstPackageId = Object.keys(response)[0];
          const packageData = response[firstPackageId];

          this.costs = {
            packageId: firstPackageId,
            standaloneCost: parseFloat(packageData.standaloneCost),
            totalCost: parseFloat(packageData.totalCost),
            dependencyCosts: Object.entries(response)
              .filter(([key]) => key !== firstPackageId)
              .reduce((acc, [key, value]: [string, any]) => ({
                ...acc,
                [key]: {
                  standaloneCost: parseFloat(value.standaloneCost),
                  totalCost: parseFloat(value.totalCost)
                }
              }), {})
          };

          console.log('Parsed costs:', this.costs);
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load package costs';
          this.isLoading = false;
        }
      });
  }

  public getDependencies() {
    if (!this.costs?.dependencyCosts) return [];
    return Object.entries(this.costs.dependencyCosts).map(([id, costs]) => ({
      id,
      costs
    }));
  }

  public formatSize(size: number | undefined | null): string {
    if (size === undefined || size === null || isNaN(size)) {
      return '0 MB';
    }

    if (size === 0) {
      return '0 MB';
    }

    // Convert to KB if less than 0.01 MB
    if (size < 0.01) {
      const kbSize = size * 1024;
      return `${kbSize.toFixed(2)} KB`;
    }

    return `${size.toFixed(2)} MB`;
  }
}
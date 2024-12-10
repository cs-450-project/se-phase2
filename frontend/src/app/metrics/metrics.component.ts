import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PackageRating } from '../models/package-ratings.model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-container">
      <h2>Package Metrics</h2>
      <div *ngIf="rating" class="metrics-grid">
        <div class="metric-card">
          <h3>Net Score</h3>
          <div class="score">{{ rating.NetScore | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.NetScoreLatency }}ms</div>
        </div>
        
        <div class="metric-card">
          <h3>Bus Factor</h3>
          <div class="score">{{ rating.BusFactor | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.BusFactorLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>Correctness</h3>
          <div class="score">{{ rating.Correctness | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.CorrectnessLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>Ramp Up</h3>
          <div class="score">{{ rating.RampUp | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.RampUpLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>Responsive Maintainer</h3>
          <div class="score">{{ rating.ResponsiveMaintainer | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.ResponsiveMaintainerLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>License Score</h3>
          <div class="score">{{ rating.LicenseScore | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.LicenseScoreLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>Dependency Pinning</h3>
          <div class="score">{{ rating.GoodPinningPractice | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.GoodPinningPracticeLatency }}ms</div>
        </div>

        <div class="metric-card">
          <h3>Code Review</h3>
          <div class="score">{{ rating.PullRequest | number:'1.2-2' }}</div>
          <div class="latency">Latency: {{ rating.PullRequestLatency }}ms</div>
        </div>
      </div>

      <div *ngIf="error" class="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .metrics-container {
      padding: 20px;
      background: #1e1e1e;
      color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    @media (min-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .metric-card {
      padding: 15px;
      border-radius: 8px;
      background: #2d2d2d;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 1px solid #3d3d3d;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    }

    .score {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
      color: #4ec9b0;
    }

    .latency {
      color: #808080;
    }

    .error {
      color: #f14c4c;
      margin-top: 20px;
      font-weight: bold;
    }
  `]
})
export class MetricsComponent implements OnChanges {
  @Input() packageId: string = '';
  rating: PackageRating | null = null;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['packageId'] && changes['packageId'].currentValue) {
      this.loadMetrics();
    }
  }

  private loadMetrics() {
    if (!this.packageId) {
      console.error('No package ID provided');
      return;
    }
    
    console.log('Loading metrics for package:', this.packageId);
    this.error = null;
    this.rating = null;

    this.http.get<PackageRating>(
      `${environment.apiUrl}/package/${this.packageId}/rate`
    ).subscribe({
      next: (response) => {
        this.rating = response;
      },
      error: (err) => {
        this.error = err.status === 404 
          ? `No metrics found for package ${this.packageId}` 
          : `Failed to load package metrics: ${err.error?.message || err.message}`;
        console.error('Error loading metrics:', err);
      }
    });
  }
}
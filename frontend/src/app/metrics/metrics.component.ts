import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageRating } from '../../../models/package-ratings.model';
import { MetricsService } from '../../../services/metrics.service';


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
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-card {
      padding: 15px;
      border-radius: 8px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .score {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }

    .latency {
      font-size: 12px;
      color: #666;
    }

    .error {
      color: red;
      margin-top: 20px;
    }
  `]
})
export class MetricsComponent {
  @Input() packageId: string = '';
  rating: PackageRating | null = null;
  error: string | null = null;

  constructor(private metricsService: MetricsService) {}

  ngOnInit() {
    if (this.packageId) {
      this.loadMetrics();
    }
  }

  private loadMetrics() {
    this.metricsService.getPackageRating(this.packageId)
      .subscribe({
        next: (data) => {
          this.rating = data;
          this.error = null;
        },
        error: (error) => {
          this.error = 'Failed to load package metrics';
          console.error('Error loading metrics:', error);
        }
      });
  }
}
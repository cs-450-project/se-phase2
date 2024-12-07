import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MetricsComponent } from '../metrics/metrics.component';
import { PackageStateService } from '../services/package-state.service';
import { PackageCostComponent } from '../package-cost/package-cost.component';

interface Package {
  Name: string;
  ID: string;
  Version: string;
}

interface PackageQuery {
  Version: string;
  Name: string;
}

interface PackageMetadata {
  Name: string;
  Version: string;
  ID: string;
}

interface PackageData {
  Content: string;
  JSProgram: string;
}

interface PackageDownload {
  metadata: PackageMetadata;
  data: PackageData;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    MetricsComponent, 
    PackageCostComponent,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  packages: Package[] = [];
  selectedPackageId: string | null = null;
  selectedCostId: string | null = null;
  selectedDownloadId: string | null = null;

  constructor(
    private http: HttpClient,
    private packageState: PackageStateService
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    
    // Subscribe to refresh events
    this.packageState.refresh$.subscribe(() => {
      console.log('Refreshing packages');
      this.loadPackages();
    });
  }

  private loadPackages(): void {
    const requestBody: PackageQuery[] = [
      {
        Name: '*',
        Version: '1.0.0-4.2.3'
      },
    ];

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http
      .post<Package[]>('http://localhost:3000/packages', requestBody, { headers })
      .subscribe({
        next: (data) => {
          console.log(data);
          this.packages = data;
        },
        error: (error) => {
          console.error('There was an error!', error);
        }
      });
  }
  downloadPackage(pkg: Package) {
    this.http.get<PackageDownload>(`http://localhost:3000/package/${pkg.ID}`)
      .subscribe({
        next: (response) => {
          const { metadata, data } = response;
          
          if (data.Content) {
            // Download ZIP
            const zipBlob = this.base64ToBlob(data.Content, 'application/zip');
            this.downloadBlob(zipBlob, `${metadata.Name}-${metadata.Version}.zip`);
          }
          
          if (data.JSProgram) {
            // Download JS
            const jsBlob = new Blob([data.JSProgram], { type: 'text/javascript' });
            this.downloadBlob(jsBlob, `${metadata.Name}-${metadata.Version}.js`);
          }
        },
        error: (err) => console.error('Download failed:', err)
      });
  }
  
  private base64ToBlob(base64: string, type: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type });
  }
  
  private downloadBlob(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MetricsComponent } from '../metrics/metrics.component';
import { PackageStateService } from '../services/package-state.service';
import { PackageCostComponent } from '../package-cost/package-cost.component';
import { SearchModule } from '../search/search.module';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

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

interface UpdatePackageRequest {
  metadata: {
    Name: string;
    Version: string;
    ID: string;
  };
  data: {
    Name: string;
    Content?: string;
    URL?: string;
    JSProgram: string;
    debloat: boolean;
  };
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    MetricsComponent, 
    PackageCostComponent,
    SearchModule
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  packages: Package[] = [];
  selectedPackageId: string | null = null;
  selectedCostId: string | null = null;
  selectedDownloadId: string | null = null;
  currentOffset = 0;
  nextOffset: number | null = null;
  pageSize = 10;
  public currentRequest: UpdatePackageRequest | null = null;
  public isUploading = false;
  private searchSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private packageState: PackageStateService,
  ) {}

  ngOnInit(): void {
    this.loadPackages();
    
    // Subscribe to refresh events
    this.packageState.refresh$.subscribe(() => {
      console.log('Refreshing packages');
      this.loadPackages();
    });

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
      .post<Package[]>(`${environment.apiUrl}/packages`, requestBody, { headers })
      .subscribe({
        next: (data) => {
          console.log(data);
          this.packages = data;
        },
        error: (error) => {
          console.error('There was an error!', error);
        },
      });

    this.searchSubscription = this.packageState.searchResults$.subscribe(
      results => {
        this.packages = results;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadPackages(): void {
    this.http
      .post<Package[]>(`${environment.apiUrl}/packages?offset=${this.currentOffset}`, [{ Name: '*', Version: '' }], { observe: 'response' })
      .subscribe({
        next: (response) => {
          if (!response.body) return;
          
          this.packages = response.body;

          const offsetHeader = response.headers.get('offset');

          if (offsetHeader !== null && !isNaN(parseInt(offsetHeader, 10))) {
            this.nextOffset = parseInt(offsetHeader, 10);
          } else {
            this.nextOffset = null;
          }
        },
        error: (error) => console.error('Error:', error)
      });
  }

  nextPage() {
    if (this.nextOffset) {
      this.currentOffset = this.nextOffset;
      this.loadPackages();
    }
  }

  previousPage() {
    if (this.currentOffset > 0) {
      this.currentOffset -= this.pageSize;
      this.loadPackages();
    }
  }

  downloadPackage(pkg: Package) {
    this.http.get<PackageDownload>(`${environment.apiUrl}/package/${pkg.ID}`)
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

  updatePackage(pkg: Package): void {
    this.http
      .get<any>(`${environment.apiUrl}/package/${pkg.ID}`)
      .subscribe({
        next: (response) => {
          if (!response?.metadata || !response?.data) {
            console.error('Invalid package data structure');
            return;
          }

          const newVersion = window.prompt('Enter new package version:', response.metadata.Version);
          if (!newVersion) return;

          const debloat = window.confirm('Do you want to enable package debloating?\nClick Yes for debloating, No to skip debloating.');
          const jsProgram = window.prompt('Enter JavaScript program:', 'console.log("test");');
          if (!jsProgram) return;

          const updateRequest: UpdatePackageRequest = {
            metadata: {
              Name: response.metadata.Name,
              Version: newVersion,
              ID: response.metadata.ID
            },
            data: {
              Name: response.metadata.Name,
              JSProgram: jsProgram,
              debloat: debloat
            }
          };

          if (response.data.URL) {
            updateRequest.data.URL = response.data.URL;
            this.updateUrlPackage(updateRequest);
          } else {
            this.promptForZipAndUpdate(updateRequest);
          }
        },
        error: (error) => {
          console.error('Error fetching package:', error);
        },
      });
  }

  private updateUrlPackage(request: UpdatePackageRequest): void {
    this.isUploading = true;  // Start loading
    
    this.http.post(`${environment.apiUrl}/package/${request.metadata.ID}`, request)
      .subscribe({
        next: () => {
          console.log('Package updated successfully');
          this.packageState.refresh();
        },
        error: (err) => console.error('Error updating package:', err),
        complete: () => {
          this.isUploading = false;  // End loading
        }
      });
  }

  private promptForZipAndUpdate(request: UpdatePackageRequest): void {
    this.currentRequest = request;
    alert('Click the "Upload Update ZIP" button below to select and upload your ZIP file.');
  }

  onUploadClick(): void {
    if (this.currentRequest) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileInput(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.currentRequest) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Content = btoa(
        new Uint8Array(reader.result as ArrayBuffer)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      if (this.currentRequest?.data) {
        this.currentRequest.data.Content = base64Content;
        this.updateUrlPackage(this.currentRequest);
        this.currentRequest = null; // Reset after processing
      }
    };
    reader.readAsArrayBuffer(file);
  }

  onSearchResults(results: Package[]): void {
    this.packages = results;
  }
}
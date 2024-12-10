// package-upload.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PackageStateService } from '../services/package-state.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-package-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-upload.component.html',
  styleUrls: ['./package-upload.component.css'],
  template: `
    <div class="upload-container">
      <h2>Upload Package</h2>
      
      <!-- URL Upload -->
      <div class="upload-section">
        <h3>Upload from URL</h3>
        <input type="text" 
               [(ngModel)]="packageUrl" 
               placeholder="NPM or GitHub URL"
               [disabled]="isLoading">
        <button (click)="uploadFromUrl()" 
                [disabled]="!packageUrl || isLoading">
          Upload from URL
        </button>
      </div>

      <!-- File Upload -->
      <div class="upload-section">
        <h3>Upload ZIP File</h3>
        <input type="file" 
               accept=".zip"
               (change)="onFileSelected($event)"
               [disabled]="isLoading">
        <button (click)="uploadFile()" 
                [disabled]="!selectedFile || isLoading">
          Upload File
        </button>
      </div>

      <!-- JavaScript Program -->
      <div class="form-group">
        <label>JavaScript Program:</label>
        <textarea 
          [(ngModel)]="jsProgram"
          placeholder="Enter JavaScript program..."
          rows="4">
        </textarea>
      </div>

      <!-- Debloat Toggle -->
      <div class="form-group">
        <label class="toggle">
          <input type="checkbox" 
                 [(ngModel)]="debloat">
          Enable Package Debloating
        </label>
      </div>

      <!-- Status Messages -->
      <!-- Using global loading spinner -->
      <div *ngIf="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <span>Uploading package...</span>
      </div>
      <div *ngIf="error" class="status error">
        {{ error }}
      </div>
      <div *ngIf="success" class="status success">
        {{ success }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary-color: #6c5ce7;
      --secondary-color: #a367fc;
      --accent-color: #00cec9;
      --background-dark: #2d3436;
      --text-light: #ffffff;
      --success-color: #00b894;
      --warning-color: #fdcb6e;
      --error-color: #ff7675;
      --focus-outline: 3px solid #00cec9;
    }

    .upload-container {
      padding: 20px;
      background: var(--background-dark);
      color: var(--text-light);
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .upload-section {
      margin: 20px 0;
    }

    input[type="text"],
    input[type="file"],
    textarea {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--accent-color);
      color: var(--text-light);
      border-radius: 4px;
      font-size: 1rem;
    }

    input[type="text"]:focus,
    input[type="file"]:focus,
    textarea:focus,
    button:focus {
      outline: var(--focus-outline);
      outline-offset: 2px;
    }

    button {
      padding: 8px 16px;
      background: var(--primary-color);
      color: var(--text-light);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    button:disabled {
      background: #666;
      cursor: not-allowed;
    }

    button:not(:disabled):hover {
      background: var(--secondary-color);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }

    .status {
      padding: 10px;
      margin-top: 10px;
      border-radius: 4px;
      font-size: 1rem;
    }

    .loading {
      background: #2d2d2d;
    }

    .error {
      background: rgba(255, 0, 0, 0.1);
      color: var(--error-color);
    }

    .success {
      background: rgba(0, 255, 0, 0.1);
      color: var(--success-color);
    }

    .form-group {
      margin-bottom: 15px;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-light);
      cursor: pointer;
      font-size: 1rem;
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 10px 0;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--text-light);
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class PackageUploadComponent {
  packageUrl: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  jsProgram: string = 'console.log("test");';
  debloat: boolean = false;

  constructor(
    private http: HttpClient,
    private packageState: PackageStateService
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    const validZipTypes = [
      'application/zip',
      'application/x-zip',
      'application/x-zip-compressed',
      'application/octet-stream'
    ];

    if (file && validZipTypes.includes(file.type)) {
      // Valid ZIP file
      this.selectedFile = file;
      this.error = null;
    } else {
      this.error = 'Please select a valid ZIP file';
      this.selectedFile = null;
    }
  }

  async uploadFromUrl() {
    if (!this.packageUrl) return;
    
    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      const jsProgram = btoa(this.jsProgram); // Replace with actual program
      await this.http.post(`${environment.apiUrl}/package`, {
        URL: this.packageUrl,
        JSProgram: jsProgram,
        Debloat: this.debloat
      }).toPromise();
      
      this.success = 'Package uploaded successfully!';
      this.packageUrl = '';
      this.packageState.refresh(); // Trigger refresh
    } catch (err: any) {
      this.error = err.error?.message || 'Failed to upload package';
    } finally {
      this.isLoading = false;
    }
  }

  async uploadFile() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.error = null;
    this.success = null;

    try {
      // Convert file to base64
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            // Convert ArrayBuffer to base64
            const base64 = btoa(
              new Uint8Array(reader.result as ArrayBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            resolve(base64);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(this.selectedFile!);
      });

      // Send base64 encoded content
      await this.http.post(`${environment.apiUrl}/package`, {
        Content: base64Content,
        JSProgram: this.jsProgram,
        debloat: this.debloat
      }).toPromise();

      this.success = 'Package uploaded successfully!';
      this.selectedFile = null;
      this.packageState.refresh();
    } catch (err: any) {
      this.error = err.error?.message || 'Failed to upload package';
    } finally {
      this.isLoading = false;
    }
  }
}
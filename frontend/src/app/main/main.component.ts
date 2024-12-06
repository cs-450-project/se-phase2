import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MetricsComponent } from '../metrics/metrics.component';

interface Package {
  name: string;
  id: string;
  version: string;
}

interface PackageQuery {
  Version: string;
  Name: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MetricsComponent],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  packages: Package[] = [];
  selectedPackageId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
        },
      });
  }
}
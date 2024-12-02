import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
})
export class MainComponent implements OnInit {
  packages: Package[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const requestBody: PackageQuery[] = [
      {
        Version: '1.0.0-4.2.3',
        Name: '*',
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
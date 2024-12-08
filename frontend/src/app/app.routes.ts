import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { MainComponent } from './main/main.component';
import { PackageUploadComponent } from './package-upload/package-upload.component';
export const routes: Routes = [
  { path: '', component: MainComponent }, // Default route
  { path: 'about', component: AboutComponent },
  { path: 'upload', component: PackageUploadComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Wildcard route
];
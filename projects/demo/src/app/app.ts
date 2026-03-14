import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor} from '@angular/common';
import { MatflowOverlayModule } from 'matflow-overlay';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgFor,
    MatflowOverlayModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App {
  title = 'Matflow Overlay Demo';

  users = [
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'Manager' },
    { id: 3, name: 'Robert Johnson', role: 'Developer' }
  ];
}

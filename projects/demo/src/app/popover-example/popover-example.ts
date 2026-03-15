import { Component } from '@angular/core';
import { MatflowOverlayModule } from 'matflow-overlay';

@Component({
  selector: 'app-popover-example',
  templateUrl: './popover-example.html',
  styleUrl: './popover-example.scss',
  imports: [
    MatflowOverlayModule
  ],
  standalone: true
})
export class PopoverExample {
  title = 'Matflow Overlay Demo';

  users = [
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'Manager' },
    { id: 3, name: 'Robert Johnson', role: 'Developer' }
  ];
}

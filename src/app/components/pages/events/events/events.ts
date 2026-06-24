import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EventRecord {
  timeStamp: string;
  category: string;
  description: string;
  deviceName: string;
  deviceId: string;
  timeRaised: string;
  hostName: string;
  deviceMac: string;
  clientMac: string;
}

@Component({
  standalone: true,
  selector: 'app-events',
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class Events {
  searchQuery = '';

  events: EventRecord[] = [
    {
      timeStamp: '30-03-2026 12:12:20',
      category: 'Status',
      description: '2FA success for astil.mathew@gmail.com',
      deviceName: 'PIQ Application',
      deviceId: 'BC564Q9',
      timeRaised: '30-03-2026 12:12:20',
      hostName: 'PIQ Hostal-Dubai',
      deviceMac: '17.345:975',
      clientMac: '24.454:35',
    },
    {
      timeStamp: '30-03-2026 12:12:20',
      category: 'Status',
      description: '2FA success for astil.mathew@gmail.com',
      deviceName: 'PIQ Application',
      deviceId: 'BC564Q9',
      timeRaised: '30-03-2026 12:12:20',
      hostName: 'PIQ Hostal-Dubai',
      deviceMac: '17.345:975',
      clientMac: '24.454:35',
    },
  ];

  get filteredEvents(): EventRecord[] {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.events;
    return this.events.filter(e =>
      Object.values(e).some(v => v.toLowerCase().includes(q))
    );
  }

  onDownload(): void {
    console.log('Download clicked');
  }

  onFilter(): void {
    console.log('Filter clicked');
  }

  onRefresh(): void {
    console.log('Refresh clicked');
  }
}
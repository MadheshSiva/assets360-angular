import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LocationHistoryEntry {
  currentLocation: string;
  gpsCoordinates: string;
  locationHistory: string;
  zoneTransitions: string;
  lastSeenLocation: string;
}

@Component({
  standalone: true,
  selector: 'app-asset-location-history',
  imports: [CommonModule],
  templateUrl: './location-history.html',
  styleUrls: ['./location-history.css']
})
export class AssetLocationHistory {
  entries: LocationHistoryEntry[] = [
    {
      currentLocation: 'Dubai Mall - Ground Floor',
      gpsCoordinates: '25.1972, 55.2795',
      locationHistory: '5 location changes',
      zoneTransitions: '2 transitions',
      lastSeenLocation: 'Dubai Mall - Store 12 (2 min ago)'
    },
    {
      currentLocation: 'Marina Mall - Tower A',
      gpsCoordinates: '25.0805, 55.1403',
      locationHistory: '3 location changes',
      zoneTransitions: '1 transition',
      lastSeenLocation: 'Marina Mall - Loading Dock (18 min ago)'
    }
  ];

  onAdd(): void {
    // TODO: open add location history entry flow
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current location history list
  }

  onRefresh(): void {
    // TODO: reload location history from backend
  }

  onDelete(): void {
    // TODO: delete selected entries
  }
}

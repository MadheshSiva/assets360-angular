import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Device {
  model: string;
  type: 'Fixed' | 'Mobile';
  macId: string;
  project: string;
  country: string;
  area: string;
  building: string;
  floor: string;
  zone: string;
  active?: boolean;
}

interface NewDeviceForm {
  model: string;
  type: string;
  macId: string;
  project: string;
  country: string;
  area: string;
  building: string;
  floor: string;
  zone: string;
  active: boolean;
}

@Component({
  standalone: true,
  selector: 'app-devices',
  imports: [CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class Devices {
  searchTerm = '';

  devices: Device[] = [
    {
      model: 'PRO-X100',
      type: 'Fixed',
      macId: '00:1A:2B:3C:4D:5E',
      project: 'OT Management',
      country: 'UAE',
      area: 'Dubai Mall',
      building: 'Ajmal Building',
      floor: 'Ground Floor',
      zone: 'Z1'
    },
    {
      model: 'MOB-G5',
      type: 'Mobile',
      macId: 'BC:89:E4:F1:00:22',
      project: 'OT Management',
      country: 'UAE',
      area: 'Marina Mall',
      building: 'Tower A',
      floor: '1st Floor',
      zone: 'Z3'
    },
    {
      model: 'PRO-X100',
      type: 'Fixed',
      macId: 'AA:BB:CC:DD:EE:FF',
      project: 'OT Management',
      country: 'UAE',
      area: 'Dubai Mall',
      building: 'Ajmal Building',
      floor: 'Ground Floor',
      zone: 'Z1'
    },
    {
      model: 'SENS-V2',
      type: 'Fixed',
      macId: '11:22:33:44:55:66',
      project: 'OT Management',
      country: 'UAE',
      area: 'Yas Mall',
      building: 'Medical Center',
      floor: 'Basement',
      zone: 'Z5'
    },
    {
      model: 'MOB-G5',
      type: 'Mobile',
      macId: 'FF:EE:DD:CC:BB:AA',
      project: 'OT Management',
      country: 'UAE',
      area: 'Dubai Mall',
      building: 'Ajmal Building',
      floor: '2nd Floor',
      zone: 'Z2'
    },
    {
      model: 'PRO-X105',
      type: 'Fixed',
      macId: '55:66:77:88:99:00',
      project: 'OT Management',
      country: 'UAE',
      area: 'Mall of Emirates',
      building: 'West Wing',
      floor: 'Ground Floor',
      zone: 'Z1'
    }
  ];

  filteredDevices: Device[] = [...this.devices];

  showAddModal = false;

  projectOptions: string[] = ['OT Management', 'IT Infrastructure', 'Facilities'];
  countryOptions: string[] = ['UAE', 'Saudi Arabia', 'Qatar', 'Oman'];

  newDevice: NewDeviceForm = this.emptyDeviceForm();

  // Devices added during the current "Add Device" modal session,
  // shown in the in-modal "Device List" preview table before being committed.
  sessionDevices: Device[] = [];

  private emptyDeviceForm(): NewDeviceForm {
    return {
      model: '',
      type: '',
      macId: '',
      project: '',
      country: '',
      area: '',
      building: '',
      floor: '',
      zone: '',
      active: true
    };
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredDevices = [...this.devices];
      return;
    }
    this.filteredDevices = this.devices.filter((d) =>
      Object.values(d).some((value) => String(value).toLowerCase().includes(term))
    );
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.filteredDevices = [...this.devices];
  }

  onAdd(): void {
    this.newDevice = this.emptyDeviceForm();
    this.sessionDevices = [];
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;

    // Commit any devices added during this modal session into the main list
    if (this.sessionDevices.length) {
      this.devices = [...this.devices, ...this.sessionDevices];
      this.onSearch();
      this.sessionDevices = [];
    }
  }

  submitAddDevice(): void {
    const device: Device = {
      model: this.newDevice.model,
      type: this.newDevice.type as 'Fixed' | 'Mobile',
      macId: this.newDevice.macId,
      project: this.newDevice.project,
      country: this.newDevice.country,
      area: this.newDevice.area,
      building: this.newDevice.building,
      floor: this.newDevice.floor,
      zone: this.newDevice.zone,
      active: this.newDevice.active
    };

    // Add to the session preview list and reset the form for the next entry,
    // without closing the modal.
    this.sessionDevices = [...this.sessionDevices, device];
    this.newDevice = this.emptyDeviceForm();
  }

  onUpload(): void {
    // TODO: trigger file upload (e.g. bulk import via Excel/CSV)
  }

  onDownload(): void {
    // TODO: export current device list
  }

  onMore(): void {
    // TODO: open additional options menu
  }

  onEdit(device: Device): void {
    // TODO: open edit dialog / navigate to edit form
  }

  onDelete(device: Device): void {
    this.devices = this.devices.filter((d) => d !== device);
    this.onSearch();
  }
}
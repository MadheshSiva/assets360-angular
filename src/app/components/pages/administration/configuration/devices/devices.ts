import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ImportColumn, ImportFileModal } from 'shared-ui';
import { RowActions } from 'shared-ui';
import { ProjectService, AppProject } from '../../../../services/project.service';
import { CountryService, AppCountry } from '../../../../services/country.service';
import { ProjectAreaService, AppProjectArea } from '../../../../services/project-area.service';
import { BuildingService, AppBuilding } from '../../../../services/building.service';
import { FloorService, AppFloor } from '../../../../services/floor.service';
import { ZoneService, AppZone } from '../../../../services/zone.service';
import { DeviceService, AppDevice, DeviceFormValue } from '../../../../services/device.service';

interface DeviceForm {
  modelId: string;
  type: string;
  uniqueId: string;
  technology: string;
  projectId: string;
  countryId: string;
  areaId: string;
  buildingId: string;
  floorId: string;
  zoneId: string;
  status: 'Active' | 'Inactive';
}

type ToastType = 'success' | 'error';

interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Component({
  standalone: true,
  selector: 'app-devices',
  imports: [CommonModule, FormsModule, ImportFileModal, RowActions],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class Devices {
  private readonly deviceService = inject(DeviceService);
  private readonly projectService = inject(ProjectService);
  private readonly countryService = inject(CountryService);
  private readonly projectAreaService = inject(ProjectAreaService);
  private readonly buildingService = inject(BuildingService);
  private readonly floorService = inject(FloorService);
  private readonly zoneService = inject(ZoneService);

  readonly importColumns: ImportColumn[] = [
    { key: 'model', label: 'Model' },
    { key: 'type', label: 'Type' },
    { key: 'macId', label: 'Unique ID (MAC)' },
    { key: 'project', label: 'Project' },
    { key: 'country', label: 'Country' },
    { key: 'area', label: 'Area' },
    { key: 'building', label: 'Building' },
    { key: 'floor', label: 'Floor' },
    { key: 'zone', label: 'Zone' }
  ];

  showImportModal = false;
  searchTerm = '';

  loading = false;
  loadError: string | null = null;

  devices: AppDevice[] = [];
  filteredDevices: AppDevice[] = [];

  // Full hierarchy, loaded once, used to populate the cascading Project/Country/Area/Building/Floor/Zone
  // selects and to resolve each select's chosen id back to a human-readable name for the request body.
  projects: AppProject[] = [];
  countries: AppCountry[] = [];
  areas: AppProjectArea[] = [];
  buildings: AppBuilding[] = [];
  floors: AppFloor[] = [];
  zones: AppZone[] = [];

  constructor() {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.loadError = null;
    forkJoin({
      devices: this.deviceService.getAll(),
      projects: this.projectService.getAll(),
      countries: this.countryService.getAll(),
      areas: this.projectAreaService.getAll(),
      buildings: this.buildingService.getAll(),
      floors: this.floorService.getAll(),
      zones: this.zoneService.getAll(),
    }).subscribe({
      next: ({ devices, projects, countries, areas, buildings, floors, zones }) => {
        this.devices = devices;
        this.projects = projects;
        this.countries = countries;
        this.areas = areas;
        this.buildings = buildings;
        this.floors = floors;
        this.zones = zones;
        this.onSearch();
        this.loading = false;
      },
      error: () => {
        this.loadError = 'Failed to load devices from the server.';
        this.loading = false;
      },
    });
  }

  // ===== Cascading option lists for the Add/Edit Device form =====

  countryOptionsFor(projectId: string): AppCountry[] {
    return this.countries.filter((c) => c.projectId === projectId);
  }

  areaOptionsFor(countryId: string): AppProjectArea[] {
    return this.areas.filter((a) => a.countryId === countryId);
  }

  buildingOptionsFor(areaId: string): AppBuilding[] {
    return this.buildings.filter((b) => b.areaId === areaId);
  }

  floorOptionsFor(buildingId: string): AppFloor[] {
    return this.floors.filter((f) => f.buildingId === buildingId);
  }

  zoneOptionsFor(floorId: string): AppZone[] {
    return this.zones.filter((z) => z.floorId === floorId);
  }

  onProjectChange(): void {
    this.deviceForm.countryId = '';
    this.onCountryChange();
  }

  onCountryChange(): void {
    this.deviceForm.areaId = '';
    this.onAreaChange();
  }

  onAreaChange(): void {
    this.deviceForm.buildingId = '';
    this.onBuildingChange();
  }

  onBuildingChange(): void {
    this.deviceForm.floorId = '';
    this.onFloorChange();
  }

  onFloorChange(): void {
    this.deviceForm.zoneId = '';
  }

  // ===== Toasts =====

  toasts: ToastMessage[] = [];
  private toastSeq = 0;

  private showToast(text: string, type: ToastType = 'success'): void {
    const id = ++this.toastSeq;
    this.toasts = [...this.toasts, { id, type, text }];
    setTimeout(() => this.dismissToast(id), 4000);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  private extractError(err: unknown, fallback: string): string {
    const body = (err as { error?: { errors?: Record<string, string[]>; message?: string } })?.error;
    if (body?.errors) return Object.values(body.errors).flat().join(' ');
    return body?.message || fallback;
  }

  // ===== Search / list toolbar =====

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredDevices = [...this.devices];
      return;
    }
    this.filteredDevices = this.devices.filter((d) =>
      [d.modelId, d.type, d.uniqueId, d.projectName, d.countryName, d.areaName, d.buildingName, d.floorName, d.zoneName]
        .some((value) => value.toLowerCase().includes(term))
    );
  }

  onRefresh(): void {
    this.searchTerm = '';
    this.loadAll();
  }

  // ===== Add / Edit Device modal =====

  showDeviceModal = false;
  editingId: string | null = null;
  deviceForm: DeviceForm = this.emptyDeviceForm();
  deviceFormError: string | null = null;
  deviceFormSaving = false;

  get isEditMode(): boolean {
    return this.editingId !== null;
  }

  private emptyDeviceForm(): DeviceForm {
    return {
      modelId: '',
      type: '',
      uniqueId: '',
      technology: '',
      projectId: '',
      countryId: '',
      areaId: '',
      buildingId: '',
      floorId: '',
      zoneId: '',
      status: 'Active',
    };
  }

  onAdd(): void {
    this.editingId = null;
    this.deviceForm = this.emptyDeviceForm();
    this.deviceFormError = null;
    this.showDeviceModal = true;
  }

  editRow(device: AppDevice): void {
    this.editingId = device.id;
    this.deviceForm = {
      modelId: device.modelId,
      type: device.type,
      uniqueId: device.uniqueId,
      technology: device.technology,
      projectId: device.projectId,
      countryId: device.countryId,
      areaId: device.areaId,
      buildingId: device.buildingId,
      floorId: device.floorId,
      zoneId: device.zoneId,
      status: device.status === 'Inactive' ? 'Inactive' : 'Active',
    };
    this.deviceFormError = null;
    this.showDeviceModal = true;
  }

  closeDeviceModal(): void {
    if (this.deviceFormSaving) return;
    this.showDeviceModal = false;
    this.editingId = null;
  }

  toggleDeviceFormStatus(): void {
    this.deviceForm.status = this.deviceForm.status === 'Active' ? 'Inactive' : 'Active';
  }

  /** Carries over the extra fields (referenceId, technology, flexi1-20, module, ...) the current
   *  form doesn't expose, so editing a device never blanks out data set elsewhere (e.g. import). */
  private buildFormValue(existing: AppDevice | null): DeviceFormValue {
    const project = this.projects.find((p) => p.id === this.deviceForm.projectId);
    const country = this.countries.find((c) => c.id === this.deviceForm.countryId);
    const area = this.areas.find((a) => a.id === this.deviceForm.areaId);
    const building = this.buildings.find((b) => b.id === this.deviceForm.buildingId);
    const floor = this.floors.find((f) => f.id === this.deviceForm.floorId);
    const zone = this.zones.find((z) => z.id === this.deviceForm.zoneId);

    return {
      referenceId: existing?.referenceId ?? '',
      modelId: this.deviceForm.modelId.trim(),
      type: this.deviceForm.type,
      uniqueId: this.deviceForm.uniqueId.trim(),
      technology: this.deviceForm.technology.trim(),
      projectId: this.deviceForm.projectId,
      projectName: project?.projectName ?? existing?.projectName ?? '',
      description: existing?.description ?? '',
      buildingId: this.deviceForm.buildingId,
      buildingName: building?.buildingName ?? existing?.buildingName ?? '',
      floorId: this.deviceForm.floorId,
      floorName: floor?.floorName ?? existing?.floorName ?? '',
      areaId: this.deviceForm.areaId,
      areaName: area?.areaName ?? existing?.areaName ?? '',
      zoneId: this.deviceForm.zoneId,
      zoneName: zone?.zoneName ?? existing?.zoneName ?? '',
      countryId: this.deviceForm.countryId,
      countryName: country?.countryName ?? existing?.countryName ?? '',
      mydeviceImage: existing?.mydeviceImage ?? '',
      flexi1: existing?.flexi1 ?? '',
      flexi2: existing?.flexi2 ?? '',
      flexi3: existing?.flexi3 ?? [],
      flexi4: existing?.flexi4 ?? '',
      flexi5: existing?.flexi5 ?? '',
      flexi6: existing?.flexi6 ?? '',
      flexi7: existing?.flexi7 ?? '',
      flexi8: existing?.flexi8 ?? '',
      flexi9: existing?.flexi9 ?? '',
      flexi10: existing?.flexi10 ?? '',
      flexi11: existing?.flexi11 ?? '',
      flexi12: existing?.flexi12 ?? '',
      flexi13: existing?.flexi13 ?? '',
      flexi14: existing?.flexi14 ?? '',
      flexi15: existing?.flexi15 ?? '',
      flexi16: existing?.flexi16 ?? '',
      flexi17: existing?.flexi17 ?? '',
      flexi18: existing?.flexi18 ?? '',
      flexi19: existing?.flexi19 ?? '',
      flexi20: existing?.flexi20 ?? '',
      module: existing?.module ?? [],
      status: this.deviceForm.status,
    };
  }

  submitDeviceForm(): void {
    const modelId = this.deviceForm.modelId.trim();
    const uniqueId = this.deviceForm.uniqueId.trim();
    const technology = this.deviceForm.technology.trim();
    if (!modelId || !this.deviceForm.type || !uniqueId || !technology || !this.deviceForm.projectId) {
      this.deviceFormError = 'Model, Type, Unique ID, Technology and Project are required.';
      return;
    }

    const editingId = this.editingId;
    const existing = editingId ? this.devices.find((d) => d.id === editingId) ?? null : null;
    const fields = this.buildFormValue(existing);

    this.deviceFormSaving = true;
    const request$ = editingId ? this.deviceService.update(editingId, fields) : this.deviceService.create(fields);

    request$.subscribe({
      next: (saved) => {
        this.deviceFormSaving = false;
        if (editingId) {
          this.devices = this.devices.map((d) => (d.id === editingId ? saved : d));
          this.onSearch();
          this.showToast(`Device "${saved.modelId}" updated successfully.`, 'success');
          this.showDeviceModal = false;
          this.editingId = null;
          return;
        }

        this.devices = [...this.devices, saved];
        this.onSearch();
        this.showToast(`Device "${saved.modelId}" created successfully.`, 'success');
        this.deviceForm = this.emptyDeviceForm();
      },
      error: (err) => {
        this.deviceFormSaving = false;
        this.deviceFormError = this.extractError(err, editingId ? 'Failed to update device.' : 'Failed to create device.');
        this.showToast(this.deviceFormError, 'error');
      },
    });
  }

  // ===== Delete =====

  deleteTarget: AppDevice | null = null;
  deleteError: string | null = null;
  deleting = false;

  deleteRow(device: AppDevice): void {
    this.deleteTarget = device;
    this.deleteError = null;
  }

  cancelDeleteDevice(): void {
    if (this.deleting) return;
    this.deleteTarget = null;
    this.deleteError = null;
  }

  confirmDeleteDevice(): void {
    const device = this.deleteTarget;
    if (!device) return;

    this.deleting = true;
    this.deleteError = null;

    this.deviceService.delete(device.id).subscribe({
      next: () => this.finishDelete(device),
      error: (err) => {
        // A 404 means it's already gone server-side — treat that as a successful delete too.
        if ((err as { status?: number })?.status === 404) {
          this.finishDelete(device);
          return;
        }
        this.deleting = false;
        this.deleteError = this.extractError(err, 'Failed to delete device. Please try again.');
        this.showToast(this.deleteError, 'error');
      },
    });
  }

  private finishDelete(device: AppDevice): void {
    this.devices = this.devices.filter((d) => d.id !== device.id);
    this.onSearch();
    this.deleting = false;
    this.deleteTarget = null;
    this.showToast(`Device "${device.modelId}" deleted successfully.`, 'success');
  }

  // ===== Import (CSV) — local preview only; see note in devices.html =====

  onUpload(): void {
    this.showImportModal = true;
  }

  onImportRows(rows: Record<string, string>[]): void {
    // Imported rows have no way to resolve real project/country/area/building/floor/zone ids from
    // free-text names, so they can't be persisted through the API yet — kept as a local-only preview.
    this.showImportModal = false;
    this.showToast('Import is not yet connected to the server — rows were not saved.', 'error');
  }

  onDownload(): void {
    // TODO: export current device list
  }

  onMore(): void {
    // TODO: open additional options menu
  }
}

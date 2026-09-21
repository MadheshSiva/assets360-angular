import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

/** UI-friendly model derived from the API's DeviceDto. */
export interface AppDevice {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  referenceId: string;
  modelId: string;
  type: string;
  uniqueId: string;
  technology: string;
  projectId: string;
  projectName: string;
  description: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  areaId: string;
  areaName: string;
  zoneId: string;
  zoneName: string;
  countryId: string;
  countryName: string;
  mydeviceImage: string;
  flexi1: string;
  flexi2: string;
  flexi3: string[];
  flexi4: string;
  flexi5: string;
  flexi6: string;
  flexi7: string;
  flexi8: string;
  flexi9: string;
  flexi10: string;
  flexi11: string;
  flexi12: string;
  flexi13: string;
  flexi14: string;
  flexi15: string;
  flexi16: string;
  flexi17: string;
  flexi18: string;
  flexi19: string;
  flexi20: string;
  module: string[];
  /** e.g. "Active" / "Inactive" — a free-text field on the backend, not a boolean. */
  status: string | null;
}

/**
 * Fields collected from the add/edit device form. Unlike Building/Floor/Zone/Sub-Zone, the
 * backend's PUT requires the *entire* record (including project/country/area/building/floor/zone
 * ids+names) to be resent, not just the editable fields — confirmed against the live API, which
 * 400s on a partial update body (e.g. missing projectId/projectName).
 */
export interface DeviceFormValue {
  referenceId: string;
  modelId: string;
  type: string;
  uniqueId: string;
  technology: string;
  projectId: string;
  projectName: string;
  description: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  areaId: string;
  areaName: string;
  zoneId: string;
  zoneName: string;
  countryId: string;
  countryName: string;
  mydeviceImage: string;
  flexi1: string;
  flexi2: string;
  flexi3: string[];
  flexi4: string;
  flexi5: string;
  flexi6: string;
  flexi7: string;
  flexi8: string;
  flexi9: string;
  flexi10: string;
  flexi11: string;
  flexi12: string;
  flexi13: string;
  flexi14: string;
  flexi15: string;
  flexi16: string;
  flexi17: string;
  flexi18: string;
  flexi19: string;
  flexi20: string;
  module: string[];
  status: string;
}

/** Request body for POST {projectApiUrl}api/devices */
interface CreateDeviceRequest extends DeviceFormValue {
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Request body for PUT {projectApiUrl}api/devices/{id} — the full record, not a partial patch. */
interface UpdateDeviceRequest extends DeviceFormValue {
  updatedBy: string;
}

/** Raw shape returned by the devices API. */
interface DeviceDto {
  id: string;
  referenceId: string;
  modelId: string;
  type: string;
  uniqueId: string;
  technology: string;
  projectId: string;
  projectName: string;
  description: string;
  buildingId: string;
  buildingName: string;
  floorId: string;
  floorName: string;
  areaId: string;
  areaName: string;
  zoneId: string;
  zoneName: string;
  countryId: string;
  countryName: string;
  mydeviceImage: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  flexi1: string;
  flexi2: string;
  flexi3: string[];
  flexi4: string;
  flexi5: string;
  flexi6: string;
  flexi7: string;
  flexi8: string;
  flexi9: string;
  flexi10: string;
  flexi11: string;
  flexi12: string;
  flexi13: string;
  flexi14: string;
  flexi15: string;
  flexi16: string;
  flexi17: string;
  flexi18: string;
  flexi19: string;
  flexi20: string;
  module: string[];
  status: string | null;
  isDeleted: boolean;
}

function toAppDevice(dto: DeviceDto): AppDevice {
  return {
    id: dto.id,
    referenceId: dto.referenceId,
    modelId: dto.modelId,
    type: dto.type,
    uniqueId: dto.uniqueId,
    technology: dto.technology,
    projectId: dto.projectId,
    projectName: dto.projectName,
    description: dto.description,
    buildingId: dto.buildingId,
    buildingName: dto.buildingName,
    floorId: dto.floorId,
    floorName: dto.floorName,
    areaId: dto.areaId,
    areaName: dto.areaName,
    zoneId: dto.zoneId,
    zoneName: dto.zoneName,
    countryId: dto.countryId,
    countryName: dto.countryName,
    mydeviceImage: dto.mydeviceImage,
    flexi1: dto.flexi1,
    flexi2: dto.flexi2,
    flexi3: dto.flexi3 ?? [],
    flexi4: dto.flexi4,
    flexi5: dto.flexi5,
    flexi6: dto.flexi6,
    flexi7: dto.flexi7,
    flexi8: dto.flexi8,
    flexi9: dto.flexi9,
    flexi10: dto.flexi10,
    flexi11: dto.flexi11,
    flexi12: dto.flexi12,
    flexi13: dto.flexi13,
    flexi14: dto.flexi14,
    flexi15: dto.flexi15,
    flexi16: dto.flexi16,
    flexi17: dto.flexi17,
    flexi18: dto.flexi18,
    flexi19: dto.flexi19,
    flexi20: dto.flexi20,
    module: dto.module ?? [],
    status: dto.status,
  };
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private apiUrl = `${environment.projectApiUrl}api/devices`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /api/devices */
  getAll(): Observable<AppDevice[]> {
    return this.http.get<DeviceDto[]>(this.apiUrl).pipe(map((list) => list.map(toAppDevice)));
  }

  /** GET /api/devices/{id} */
  getById(id: string): Observable<AppDevice> {
    return this.http.get<DeviceDto>(`${this.apiUrl}/${id}`).pipe(map(toAppDevice));
  }

  /** GET /api/devices/type/{type} */
  getByType(type: string): Observable<AppDevice[]> {
    return this.http.get<DeviceDto[]>(`${this.apiUrl}/type/${type}`).pipe(map((list) => list.map(toAppDevice)));
  }

  /** POST /api/devices */
  create(fields: DeviceFormValue): Observable<AppDevice> {
    const request: CreateDeviceRequest = {
      ...fields,
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId,
    };
    return this.http.post<DeviceDto>(this.apiUrl, request).pipe(map(toAppDevice));
  }

  /** PUT /api/devices/{id} — the backend requires the full record, ids/names included. */
  update(id: string, fields: DeviceFormValue): Observable<AppDevice> {
    const request: UpdateDeviceRequest = {
      ...fields,
      updatedBy: this.auth.getUserEmail() || 'unknown',
    };
    return this.http.put<DeviceDto>(`${this.apiUrl}/${id}`, request).pipe(map(toAppDevice));
  }

  /** DELETE /api/devices/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

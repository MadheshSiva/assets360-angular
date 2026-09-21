import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

/** UI-friendly model derived from the API's AssetActivityDto. */
export interface AppAssetActivity {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  /** Human-readable code assigned by the backend, e.g. "ACT000003". */
  activityId: string;
  assetId: string;
  assetName: string;
  whoCreatedUpdatedAsset: string;
  changesMade: string;
  timestampLogs: string;
  accessLogs: string;
  createdBy: string;
  createdAt: string;
}

/** Fields collected from the activity form. */
export interface AssetActivityFormValue {
  assetId: string;
  assetName: string;
  whoCreatedUpdatedAsset: string;
  changesMade: string;
  timestampLogs: string;
  accessLogs: string;
}

/** Request body for POST {assetApiUrl}asset/api/asset-activities */
interface CreateAssetActivityRequest extends AssetActivityFormValue {
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Request body for PUT {assetApiUrl}asset/api/asset-activities/{id} */
interface UpdateAssetActivityRequest extends AssetActivityFormValue {
  updatedBy: string;
}

/** Raw shape returned by the asset-activities API. */
interface AssetActivityDto {
  id: string;
  activityId: string;
  assetId: string;
  assetName: string;
  whoCreatedUpdatedAsset: string;
  changesMade: string;
  timestampLogs: string;
  accessLogs: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  isDeleted: boolean;
}

function toAppAssetActivity(dto: AssetActivityDto): AppAssetActivity {
  return {
    id: dto.id,
    activityId: dto.activityId,
    assetId: dto.assetId,
    assetName: dto.assetName,
    whoCreatedUpdatedAsset: dto.whoCreatedUpdatedAsset,
    changesMade: dto.changesMade,
    timestampLogs: dto.timestampLogs,
    accessLogs: dto.accessLogs,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class AssetActivityService {
  private apiUrl = `${environment.assetApiUrl}asset/api/asset-activities`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /asset/api/asset-activities */
  getAll(): Observable<AppAssetActivity[]> {
    return this.http.get<AssetActivityDto[]>(this.apiUrl).pipe(map(list => list.map(toAppAssetActivity)));
  }

  /** POST /asset/api/asset-activities */
  create(fields: AssetActivityFormValue): Observable<AppAssetActivity> {
    const request: CreateAssetActivityRequest = {
      ...fields,
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId
    };
    return this.http.post<AssetActivityDto>(this.apiUrl, request).pipe(map(toAppAssetActivity));
  }

  /** PUT /asset/api/asset-activities/{id} */
  update(id: string, fields: AssetActivityFormValue): Observable<AppAssetActivity> {
    const request: UpdateAssetActivityRequest = {
      ...fields,
      updatedBy: this.auth.getUserEmail() || 'unknown'
    };
    return this.http.put<AssetActivityDto>(`${this.apiUrl}/${id}`, request).pipe(map(toAppAssetActivity));
  }

  /** DELETE /asset/api/asset-activities/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

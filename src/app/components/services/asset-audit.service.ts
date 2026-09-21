import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

/** UI-friendly model derived from the API's AssetAuditDto. */
export interface AppAssetAudit {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  /** Human-readable code assigned by the backend, e.g. "AUD000001". */
  auditId: string;
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  /** ISO date-time string */
  auditStartDate: string;
  /** ISO date-time string, or null if the audit has no end date yet */
  auditEndDate: string | null;
  active: boolean;
  createdBy: string;
  createdAt: string;
}

/** Fields collected from the assets-audit form. */
export interface AssetAuditFormValue {
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  /** ISO date-time string */
  auditStartDate: string;
  /** ISO date-time string, or null if the audit has no end date yet */
  auditEndDate: string | null;
  active: boolean;
}

/** Request body for POST {assetApiUrl}asset/api/asset-audits */
interface CreateAssetAuditRequest extends AssetAuditFormValue {
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Request body for PUT {assetApiUrl}asset/api/asset-audits/{id} */
interface UpdateAssetAuditRequest extends AssetAuditFormValue {
  updatedBy: string;
}

/** Raw shape returned by the asset-audits API. */
interface AssetAuditDto {
  id: string;
  auditId: string;
  assetId: string;
  assetName: string;
  auditCode: string;
  auditName: string;
  auditStartDate: string;
  auditEndDate: string | null;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  isDeleted: boolean;
}

function toAppAssetAudit(dto: AssetAuditDto): AppAssetAudit {
  return {
    id: dto.id,
    auditId: dto.auditId,
    assetId: dto.assetId,
    assetName: dto.assetName,
    auditCode: dto.auditCode,
    auditName: dto.auditName,
    auditStartDate: dto.auditStartDate,
    auditEndDate: dto.auditEndDate,
    active: dto.active,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class AssetAuditService {
  private apiUrl = `${environment.assetApiUrl}asset/api/asset-audits`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /asset/api/asset-audits */
  getAll(): Observable<AppAssetAudit[]> {
    return this.http.get<AssetAuditDto[]>(this.apiUrl).pipe(map(list => list.map(toAppAssetAudit)));
  }

  /** POST /asset/api/asset-audits */
  create(fields: AssetAuditFormValue): Observable<AppAssetAudit> {
    const request: CreateAssetAuditRequest = {
      ...fields,
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId
    };
    return this.http.post<AssetAuditDto>(this.apiUrl, request).pipe(map(toAppAssetAudit));
  }

  /** PUT /asset/api/asset-audits/{id} */
  update(id: string, fields: AssetAuditFormValue): Observable<AppAssetAudit> {
    const request: UpdateAssetAuditRequest = {
      ...fields,
      updatedBy: this.auth.getUserEmail() || 'unknown'
    };
    return this.http.put<AssetAuditDto>(`${this.apiUrl}/${id}`, request).pipe(map(toAppAssetAudit));
  }

  /** DELETE /asset/api/asset-audits/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

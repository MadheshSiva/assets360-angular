import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

/** UI-friendly model derived from the API's AssetAuditAndVerificationDto. */
export interface AppAssetAuditVerification {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  /** Human-readable code assigned by the backend, e.g. "AAV000001". */
  auditVerificationId: string;
  assetId: string;
  assetName: string;
  /** ISO date-time string */
  auditDate: string;
  auditorDetails: string;
  physicalVerificationResult: string;
  discrepanciesFound: string;
  auditHistoryLogs: string;
  createdBy: string;
  createdAt: string;
}

/** Fields collected from the audit & verification form. */
export interface AssetAuditVerificationFormValue {
  assetId: string;
  assetName: string;
  /** ISO date-time string */
  auditDate: string;
  auditorDetails: string;
  physicalVerificationResult: string;
  discrepanciesFound: string;
  auditHistoryLogs: string;
}

/** Request body for POST {assetApiUrl}asset/api/asset-audit-and-verifications */
interface CreateAssetAuditVerificationRequest extends AssetAuditVerificationFormValue {
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Request body for PUT {assetApiUrl}asset/api/asset-audit-and-verifications/{id} */
interface UpdateAssetAuditVerificationRequest extends AssetAuditVerificationFormValue {
  updatedBy: string;
}

/** Raw shape returned by the asset-audit-and-verifications API. */
interface AssetAuditVerificationDto {
  id: string;
  auditVerificationId: string;
  assetId: string;
  assetName: string;
  auditDate: string;
  auditorDetails: string;
  physicalVerificationResult: string;
  discrepanciesFound: string;
  auditHistoryLogs: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  isDeleted: boolean;
}

function toAppAssetAuditVerification(dto: AssetAuditVerificationDto): AppAssetAuditVerification {
  return {
    id: dto.id,
    auditVerificationId: dto.auditVerificationId,
    assetId: dto.assetId,
    assetName: dto.assetName,
    auditDate: dto.auditDate,
    auditorDetails: dto.auditorDetails,
    physicalVerificationResult: dto.physicalVerificationResult,
    discrepanciesFound: dto.discrepanciesFound,
    auditHistoryLogs: dto.auditHistoryLogs,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt
  };
}

@Injectable({ providedIn: 'root' })
export class AssetAuditVerificationService {
  private apiUrl = `${environment.assetApiUrl}asset/api/asset-audit-and-verifications`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /asset/api/asset-audit-and-verifications */
  getAll(): Observable<AppAssetAuditVerification[]> {
    return this.http.get<AssetAuditVerificationDto[]>(this.apiUrl).pipe(map(list => list.map(toAppAssetAuditVerification)));
  }

  /** POST /asset/api/asset-audit-and-verifications */
  create(fields: AssetAuditVerificationFormValue): Observable<AppAssetAuditVerification> {
    const request: CreateAssetAuditVerificationRequest = {
      ...fields,
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId
    };
    return this.http.post<AssetAuditVerificationDto>(this.apiUrl, request).pipe(map(toAppAssetAuditVerification));
  }

  /** PUT /asset/api/asset-audit-and-verifications/{id} */
  update(id: string, fields: AssetAuditVerificationFormValue): Observable<AppAssetAuditVerification> {
    const request: UpdateAssetAuditVerificationRequest = {
      ...fields,
      updatedBy: this.auth.getUserEmail() || 'unknown'
    };
    return this.http.put<AssetAuditVerificationDto>(`${this.apiUrl}/${id}`, request).pipe(map(toAppAssetAuditVerification));
  }

  /** DELETE /asset/api/asset-audit-and-verifications/{id} */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

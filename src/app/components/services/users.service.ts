import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../service/auth/auth.service';

/** UI-friendly user model derived from the API's UserDto. */
export interface AppUser {
  /** Mongo id used for GET/PUT/DELETE by id. */
  id: string;
  /** Human-readable user code assigned by the backend, e.g. "U639244547124592300". */
  userId: string;
  userName: string;
  shortName: string;
  contactNo: string;
  email: string;
  activeDirectoryUserName: string;
  /** The role's business roleId code (AppRole.roleId), not the role's mongo id. */
  userRoleId: string;
  clientId: string;
  tenantId: string;
  status: string;
}

/** Fields collected from the add/edit user form. */
export interface UserFormValue {
  userName: string;
  shortName: string;
  contactNo: string;
  email: string;
  loginPassword: string;
  activeDirectoryUserName: string;
  userRoleId: string;
}

/** Request body for POST {usersApiUrl}api/users */
interface CreateUserRequest extends UserFormValue {
  createdBy: string;
  clientId: string;
  tenantId: string;
}

/** Request body for PUT {usersApiUrl}api/users/{id} */
interface UpdateUserRequest extends UserFormValue {
  updatedBy: string;
  status: string;
}

/** Raw shape returned by the user-account users API. */
interface UserDto {
  id: string;
  userId: string;
  userName: string;
  shortName: string;
  contactNo: string;
  email: string;
  activeDirectoryUserName: string;
  userRoleId: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  clientId: string;
  tenantId: string;
  status: string;
  isDeleted: boolean;
  lastLogin: string | null;
  loginStatus: string;
}

function toAppUser(dto: UserDto): AppUser {
  return {
    id: dto.id,
    userId: dto.userId,
    userName: dto.userName,
    shortName: dto.shortName,
    contactNo: dto.contactNo,
    email: dto.email,
    activeDirectoryUserName: dto.activeDirectoryUserName,
    userRoleId: dto.userRoleId,
    clientId: dto.clientId,
    tenantId: dto.tenantId,
    status: dto.status
  };
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private usersApiUrl = `${environment.usersApiUrl}api/users`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  /** GET /api/users */
  getUsers(): Observable<AppUser[]> {
    return this.http.get<UserDto[]>(this.usersApiUrl).pipe(map(list => list.map(toAppUser)));
  }

  /** GET /api/users/{id} */
  getUser(id: string): Observable<AppUser> {
    return this.http.get<UserDto>(`${this.usersApiUrl}/${id}`).pipe(map(toAppUser));
  }

  /** POST /api/users */
  createUser(fields: UserFormValue): Observable<AppUser> {
    const request: CreateUserRequest = {
      ...fields,
      createdBy: this.auth.getUserEmail() || 'unknown',
      clientId: environment.clientId,
      tenantId: environment.tenantId
    };
    return this.http.post<UserDto>(this.usersApiUrl, request).pipe(map(toAppUser));
  }

  /** PUT /api/users/{id} */
  updateUser(id: string, fields: UserFormValue, status: string = 'Active'): Observable<AppUser> {
    const request: UpdateUserRequest = {
      ...fields,
      updatedBy: this.auth.getUserEmail() || 'unknown',
      status
    };
    return this.http.put<UserDto>(`${this.usersApiUrl}/${id}`, request).pipe(map(toAppUser));
  }

  /** DELETE /api/users/{id} */
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersApiUrl}/${id}`);
  }

  /** Client-side filter over an already-fetched user list. */
  filterUsers(users: AppUser[], term: string): AppUser[] {
    const t = term.trim().toLowerCase();
    if (!t) return users;
    return users.filter(u =>
      u.userId.toLowerCase().includes(t) ||
      u.userName.toLowerCase().includes(t) ||
      u.shortName.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t) ||
      u.contactNo.toLowerCase().includes(t)
    );
  }
}

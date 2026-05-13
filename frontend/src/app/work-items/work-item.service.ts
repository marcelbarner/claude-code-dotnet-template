import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WorkItemDto,
  PagedResponse,
  CreateWorkItemRequest,
  UpdateWorkItemRequest,
} from './work-item.model';

@Injectable({ providedIn: 'root' })
export class WorkItemService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/work-items';

  list(skip = 0, take = 20): Observable<PagedResponse<WorkItemDto>> {
    const params = new HttpParams().set('skip', skip).set('take', take);
    return this.http.get<PagedResponse<WorkItemDto>>(this.base, { params });
  }

  get(id: string): Observable<WorkItemDto> {
    return this.http.get<WorkItemDto>(`${this.base}/${id}`);
  }

  create(request: CreateWorkItemRequest): Observable<WorkItemDto> {
    return this.http.post<WorkItemDto>(this.base, request);
  }

  update(id: string, request: UpdateWorkItemRequest): Observable<WorkItemDto> {
    return this.http.put<WorkItemDto>(`${this.base}/${id}`, request);
  }
}

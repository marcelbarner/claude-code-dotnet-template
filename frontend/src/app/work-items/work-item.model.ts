export enum WorkItemStatus {
  Draft = 0,
  Active = 1,
  Completed = 2,
}

export const WORK_ITEM_STATUS_LABELS: Record<WorkItemStatus, string> = {
  [WorkItemStatus.Draft]: 'Draft',
  [WorkItemStatus.Active]: 'Active',
  [WorkItemStatus.Completed]: 'Completed',
};

export interface WorkItemDto {
  id: string;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  createdUtc: string;
  lastModifiedUtc: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  skip: number;
  take: number;
}

export interface CreateWorkItemRequest {
  title: string;
  description?: string | null;
}

export interface UpdateWorkItemRequest {
  title: string;
  description?: string | null;
  status: WorkItemStatus;
}

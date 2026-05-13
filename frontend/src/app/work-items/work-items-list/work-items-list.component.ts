import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

import { WorkItemService } from '../work-item.service';
import { WorkItemDto, WorkItemStatus, WORK_ITEM_STATUS_LABELS } from '../work-item.model';
import { WorkItemDialogComponent, WorkItemDialogResult } from '../work-item-dialog/work-item-dialog.component';

@Component({
  selector: 'app-work-items-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Work Items</h1>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> New Work Item
        </button>
      </div>

      @if (loading()) {
        <div class="spinner-container">
          <mat-spinner diameter="48" />
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <table mat-table [dataSource]="items()" class="full-width">

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let item">
                  <span class="title-cell">{{ item.title }}</span>
                  @if (item.description) {
                    <span class="description-cell">{{ item.description }}</span>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip [class]="'status-' + item.status">
                    {{ statusLabel(item.status) }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="createdUtc">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let item">{{ item.createdUtc | date:'medium' }}</td>
              </ng-container>

              <ng-container matColumnDef="lastModifiedUtc">
                <th mat-header-cell *matHeaderCellDef>Last Modified</th>
                <td mat-cell *matCellDef="let item">{{ item.lastModifiedUtc ? (item.lastModifiedUtc | date:'medium') : '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let item">
                  <button mat-icon-button color="primary" (click)="openEditDialog(item)" title="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              @if (items().length === 0) {
                <tr class="mat-row">
                  <td [attr.colspan]="displayedColumns.length" class="empty-row">
                    No work items found. Create one to get started.
                  </td>
                </tr>
              }
            </table>
          </mat-card-content>
        </mat-card>

        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[10, 20, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons />
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h1 { margin: 0; font-size: 1.75rem; }
    .spinner-container { display: flex; justify-content: center; margin-top: 64px; }
    .full-width { width: 100%; }
    .title-cell { display: block; font-weight: 500; }
    .description-cell { display: block; font-size: 0.85rem; color: #666; }
    .empty-row { text-align: center; padding: 32px; color: #888; }
    td.mat-column-actions { width: 56px; text-align: right; }
    mat-chip.status-0 { background-color: #e3f2fd; color: #1565c0; }
    mat-chip.status-1 { background-color: #e8f5e9; color: #2e7d32; }
    mat-chip.status-2 { background-color: #f3e5f5; color: #6a1b9a; }
  `],
})
export class WorkItemsListComponent implements OnInit {
  private readonly service = inject(WorkItemService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['title', 'status', 'createdUtc', 'lastModifiedUtc', 'actions'];
  protected readonly items = signal<WorkItemDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly loading = signal(false);

  protected pageSize = 20;
  private currentSkip = 0;

  ngOnInit(): void {
    this.load();
  }

  protected statusLabel(status: WorkItemStatus): string {
    return WORK_ITEM_STATUS_LABELS[status] ?? 'Unknown';
  }

  protected onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentSkip = event.pageIndex * event.pageSize;
    this.load();
  }

  protected openCreateDialog(): void {
    const ref = this.dialog.open<WorkItemDialogComponent, unknown, WorkItemDialogResult>(
      WorkItemDialogComponent,
      { data: {}, disableClose: true }
    );

    ref.afterClosed().subscribe(result => {
      if (!result?.create) return;
      this.service.create(result.create).subscribe({
        next: () => {
          this.snackBar.open('Work item created', 'Dismiss', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Failed to create work item', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  protected openEditDialog(item: WorkItemDto): void {
    const ref = this.dialog.open<WorkItemDialogComponent, unknown, WorkItemDialogResult>(
      WorkItemDialogComponent,
      { data: { workItem: item }, disableClose: true }
    );

    ref.afterClosed().subscribe(result => {
      if (!result?.update) return;
      this.service.update(item.id, result.update).subscribe({
        next: () => {
          this.snackBar.open('Work item updated', 'Dismiss', { duration: 3000 });
          this.load();
        },
        error: () => this.snackBar.open('Failed to update work item', 'Dismiss', { duration: 4000 }),
      });
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.list(this.currentSkip, this.pageSize).subscribe({
      next: res => {
        this.items.set(res.items);
        this.totalCount.set(res.items.length < this.pageSize
          ? this.currentSkip + res.items.length
          : this.currentSkip + res.items.length + 1);
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Failed to load work items', 'Dismiss', { duration: 4000 });
        this.loading.set(false);
      },
    });
  }
}

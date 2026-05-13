import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WorkItemDto, WorkItemStatus, WORK_ITEM_STATUS_LABELS, UpdateWorkItemRequest, CreateWorkItemRequest } from '../work-item.model';

export interface WorkItemDialogData {
  workItem?: WorkItemDto;
}

export interface WorkItemDialogResult {
  create?: CreateWorkItemRequest;
  update?: UpdateWorkItemRequest;
}

@Component({
  selector: 'app-work-item-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.workItem ? 'Edit Work Item' : 'New Work Item' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" placeholder="Enter title" />
          @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
            <mat-error>Title is required</mat-error>
          }
          @if (form.get('title')?.hasError('maxlength')) {
            <mat-error>Title must be 200 characters or fewer</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4" placeholder="Optional description"></textarea>
          @if (form.get('description')?.hasError('maxlength')) {
            <mat-error>Description must be 2000 characters or fewer</mat-error>
          }
        </mat-form-field>

        @if (data.workItem) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              @for (entry of statusOptions; track entry.value) {
                <mat-option [value]="entry.value">{{ entry.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-flat-button color="primary" (click)="save()" [disabled]="form.invalid">
        {{ data.workItem ? 'Save' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 8px; min-width: 420px; padding-top: 8px; }
    .full-width { width: 100%; }
    mat-dialog-content { overflow: visible; }
  `],
})
export class WorkItemDialogComponent {
  protected readonly data: WorkItemDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<WorkItemDialogComponent, WorkItemDialogResult>);
  private readonly fb = inject(FormBuilder);

  protected readonly statusOptions = Object.entries(WORK_ITEM_STATUS_LABELS).map(([value, label]) => ({
    value: Number(value) as WorkItemStatus,
    label,
  }));

  protected readonly form = this.fb.group({
    title: [this.data.workItem?.title ?? '', [Validators.required, Validators.maxLength(200)]],
    description: [this.data.workItem?.description ?? '', [Validators.maxLength(2000)]],
    status: [this.data.workItem?.status ?? WorkItemStatus.Draft],
  });

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    if (this.form.invalid) return;

    const { title, description, status } = this.form.getRawValue();

    if (this.data.workItem) {
      this.dialogRef.close({
        update: { title: title!, description: description || null, status: status! },
      });
    } else {
      this.dialogRef.close({
        create: { title: title!, description: description || null },
      });
    }
  }
}

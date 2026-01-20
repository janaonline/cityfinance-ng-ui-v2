import { DatePipe } from '@angular/common';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GlobalLoaderService } from '../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../core/services/utility.service';
import { MaterialModule } from '../../material.module';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { DialogComponent } from './dialog/dialog.component';
import { EventsService } from './events.service';
import { ARRAY_VALUES, EVENT_STATUS, EventAlert, EventTemplateDialogResponse } from './interface';

const errMsg = 'An unexpected error occurred. Please try again later.';

@Component({
  selector: 'app-events',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    MaterialModule,
    // GlobalLoaderService,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public globalLoader: GlobalLoaderService,
    private utitilyService: UtilityService,
    private eventsService: EventsService,
    private dialog: MatDialog,
  ) {}

  displayedColumns: string[] = [
    'webinarId',
    'title',
    'startAt',
    'endAt',
    'updatedAt',
    // 'desc',
    'eventStatus',
    'redirectionLink',
    'edit',
  ];
  eventsList = signal<EventAlert[]>([]);
  dataSource = new MatTableDataSource<EventAlert>(this.eventsList());
  eventTemplate: FieldConfig[] = [];
  readonly ARRAY_VALUES = ARRAY_VALUES;
  readonly EVENT_STATUS = EVENT_STATUS;

  ngOnInit(): void {
    this.getEventsList();
    this.getEventTemplate();
  }

  openDialog(
    action: 'Create' | 'Edit',
    eventTemplate: FieldConfig[] = structuredClone(this.eventTemplate),
    eventId: string | null = null,
  ) {
    if (!eventTemplate || eventTemplate.length === 0) {
      console.error('Event template is missing or empty.');
      return;
    }

    if (!eventId && action === 'Edit') {
      console.error('Event ID is required for editing an event.');
      this.utitilyService.swalPopup(
        'Error!',
        'Event ID is missing for editing. Please try again.',
        'error',
      );
      return;
    }

    const dialogRef = this.dialog.open(DialogComponent, {
      data: { action, eventTemplate, eventId },
    });

    dialogRef.afterClosed().subscribe((data: EventTemplateDialogResponse) => {
      if (action === 'Create' && data && data.payload) {
        this.createEvent(data.payload);
      } else if (action === 'Edit' && data && data.payload) {
        if (!data.eventId) {
          console.error('No event ID provided for editing.');
          this.utitilyService.swalPopup(
            'Error!',
            'Event ID is missing for editing. Please try again.',
            'error',
          );
          return;
        }
        this.updateEventById(data.eventId, data.payload);
      }
    });
  }

  getEventTemplate() {
    this.eventTemplate = this.eventsService.getEventTemplate();
  }

  // When edit button is clicked
  editEvent(event: EventAlert) {
    this.globalLoader.showLoader();
    const eventTemplate = structuredClone(this.eventTemplate);

    eventTemplate.forEach((question) => {
      const value = event[question.key as keyof EventAlert];
      if (Array.isArray(value) && this.ARRAY_VALUES.includes(question.key)) {
        question.value = value.join(', ');
      } else if (question.key === 'eventStatus') {
        question.value = this.EVENT_STATUS[value as keyof typeof this.EVENT_STATUS];
      } else {
        question.value = value;
      }

      if (question.key === 'webinarId') {
        question.readonly = true;
      }
    });
    this.globalLoader.stopLoader();
    this.openDialog('Edit', eventTemplate, event._id);
  }

  getDate(dateString: string): Date {
    return new Date(dateString);
  }

  getEventsList() {
    this.globalLoader.showLoader();
    this.eventsService.getEvents().subscribe({
      next: (res) => {
        this.eventsList.set(res.data);
        this.dataSource.data = this.eventsList();
        this.globalLoader.stopLoader();
      },
      error: (error: Error) => {
        console.error('Error fetching events list:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup('Failed!', error.message || errMsg, 'error');
      },
    });
  }

  getEventById(eventId: string) {
    this.globalLoader.showLoader();
    this.eventsService.getEventById(eventId).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
      },
      error: (error: Error) => {
        console.error('Error fetching event details:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup('Failed!', error.message || errMsg, 'error');
      },
    });
  }

  createEvent(payload: EventAlert) {
    this.globalLoader.showLoader();

    this.eventsService.createEvent(payload).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Success!',
          `Event ${payload.title} has been created successfully.`,
        );
        this.getEventsList();
      },
      error: (error: Error) => {
        const errorMessage = Array.isArray(error.message)
          ? error.message.join(', ')
          : error.message || errMsg;
        console.error('Error creating event:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup('Failed!', errorMessage, 'error');
      },
    });
  }

  updateEventById(event_id: string, eventData: EventAlert) {
    this.globalLoader.showLoader();
    this.eventsService.updateEventById(event_id, eventData).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Success!',
          `Event ${eventData.title} has been updated successfully.`,
        );
        this.getEventsList();
      },
      error: (error: Error) => {
        const errorMessage = Array.isArray(error.message)
          ? error.message.join(', ')
          : error.message || errMsg;
        console.error('Error updating event:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup('Failed!', errorMessage, 'error');
      },
    });
  }

  removeEventById(event: EventAlert) {
    if (
      window.confirm(`Are you sure you want to delete ${event.title} with id ${event.webinarId}?`)
    ) {
      this.globalLoader.showLoader();
      this.eventsService.removeEventById(event._id).subscribe({
        next: () => {
          this.globalLoader.stopLoader();
          this.utitilyService.swalPopup(
            'Deleted!',
            `Event ${event.title} has been deleted successfully.`,
          );
          this.getEventsList();
        },
        error: (error: Error) => {
          console.error('Error deleting event:');
          this.globalLoader.stopLoader();
          this.utitilyService.swalPopup('Failed!', error.message || errMsg, 'error');
        },
      });
    }
  }
}

import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { GlobalLoaderService } from '../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../core/services/utility.service';
import { MaterialModule } from '../../material.module';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../shared/dynamic-form/dynamic-form.service';
import { FieldConfig } from '../../shared/dynamic-form/field.interface';
import { EventsService } from './events.service';
import { EventAlert } from './interface';

const ARRAY_VALUES = ['buttonLabels', 'imgUrl'];
const ELEMENT_DATA: EventAlert[] = [
  {
    _id: '696df19fbcfb4989d2d9fd6b',
    webinarId: 'ulb_webinar_alert',
    title: 'WEBINAR ALERT',
    startAt: '2025-01-07T11:00:00.000Z',
    endAt: '2025-01-07T12:00:00.000Z',
    updatedAt: '2025-01-07T12:00:00.000Z',
    desc: 'Join our webinar on Jan 7th, 2025 for a deep dive into revenue performance.',
    eventStatus: 1,
    redirectionLink: 'https://tally.so/r/jaZ1xa',
    buttonLabels: ['Register Now', 'Learn More'],
    imgUrl: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  },
  {
    _id: '696dfbca94c37e870d669630',
    webinarId: 'state_webinar_alert',
    title: 'WEBINAR ALERT',
    startAt: '2026-01-27T11:00:00.000Z',
    endAt: '2026-01-27T12:30:00.000Z',
    updatedAt: '2026-01-27T12:30:00.000Z',
    desc: 'Explore Urban Metrics: Webinar on Jan 27th. Decode city finances, compare across states.',
    eventStatus: 2,
    redirectionLink: 'https://tally.so/r/jaZ1xa',
  },
];

@Component({
  selector: 'app-events',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    DatePipe,
    MaterialModule,
    DynamicFormComponent,
    MatCardModule,
    // GlobalLoaderService,
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public globalLoader: GlobalLoaderService,
    private utitilyService: UtilityService,
    private eventsService: EventsService,
    public formService: DynamicFormService,
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
  dataSource = new MatTableDataSource<EventAlert>(ELEMENT_DATA);
  form!: FormGroup;
  questions: FieldConfig[] = [];
  eventBeingEdited: EventAlert | null = null;

  ngOnInit(): void {
    this.getEventsList();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  createEventCta() {
    this.globalLoader.showLoader();
    this.eventsService.getWebinarQuestions().subscribe({
      next: (questions) => {
        this.questions = questions;
        this.form = this.formService.toFormGroup(this.questions);
        this.globalLoader.stopLoader();
      },
      error: () => {
        this.globalLoader.stopLoader();
        console.error('Error fetching form questions:');
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to load form questions. Please try again later.',
          'error',
        );
      },
    });
  }

  editEvent(event: EventAlert) {
    this.eventBeingEdited = event;
    this.globalLoader.showLoader();
    this.eventsService.getWebinarQuestions().subscribe({
      next: (questions) => {
        this.questions = questions;
        this.questions.forEach((question) => {
          const value = event[question.key as keyof EventAlert];
          if (Array.isArray(value) && ARRAY_VALUES.includes(question.key)) {
            question.value = value.join(', ');
          } else {
            question.value = value;
          }

          if (question.key === 'webinarId') {
            question.readonly = true;
          }
        });

        this.form = this.formService.toFormGroup(this.questions);
        this.globalLoader.stopLoader();
      },
      error: () => {
        console.error('Error fetching form questions:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to load form questions. Please try again later.',
          'error',
        );
      },
    });
  }

  saveEvent() {
    // Create new event.
    if (!this.eventBeingEdited) {
      this.createEvent();
    } else {
      const payload = { ...this.form.value };
      ARRAY_VALUES.forEach((key) => {
        if (payload[key]) {
          payload[key] = payload[key].split(',').map((item: string) => item.trim());
        }
      });
      this.updateEventById(this.eventBeingEdited._id, payload);
    }
  }

  createEvent() {
    this.globalLoader.showLoader();
    const payload = { ...this.form.value };
    ARRAY_VALUES.forEach((key) => {
      if (payload[key]) {
        payload[key] = payload[key].split(',').map((item: string) => item.trim());
      }
    });

    this.eventsService.createEvent(payload).subscribe({
      next: (res) => {
        console.log('Event Created:', res);
        this.globalLoader.stopLoader();
        this.eventBeingEdited = null;
      },
      error: () => {
        this.eventBeingEdited = null;
        console.error('Error creating event:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to create event. Please try again later.',
          'error',
        );
      },
    });
  }

  getEventsList() {
    this.globalLoader.showLoader();
    this.eventsService.getEvents().subscribe({
      next: (res) => {
        console.log('Events List:', res);
        this.globalLoader.stopLoader();
      },
      error: () => {
        console.error('Error fetching events list:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to load events. Please try again later.',
          'error',
        );
      },
    });
  }

  getEventById(eventId: string) {
    this.globalLoader.showLoader();
    this.eventsService.getEventById(eventId).subscribe({
      next: (res) => {
        console.log('Event Details:', res);
        this.globalLoader.stopLoader();
      },
      error: () => {
        console.error('Error fetching event details:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to load event details. Please try again later.',
          'error',
        );
      },
    });
  }

  updateEventById(event_id: string, eventData: EventAlert) {
    console.log('event id', event_id);
    this.globalLoader.showLoader();
    this.eventsService.updateEventById(event_id, eventData).subscribe({
      next: (res) => {
        console.log('Event Updated:', res);
        this.globalLoader.stopLoader();
        this.eventBeingEdited = null;
      },
      error: () => {
        this.eventBeingEdited = null;
        console.error('Error updating event:');
        this.globalLoader.stopLoader();
        this.utitilyService.swalPopup(
          'Failed!',
          'Failed to update event. Please try again later.',
          'error',
        );
      },
    });
  }

  removeEventById(event: EventAlert) {
    if (
      window.confirm(`Are you sure you want to delete ${event.title} with id ${event.webinarId}?`)
    ) {
      this.globalLoader.showLoader();
      this.eventsService.removeEventById(event._id).subscribe({
        next: (res) => {
          console.log('Event Deleted:', res);
          this.utitilyService.swalPopup(
            'Deleted!',
            `Event ${event.title} has been deleted successfully.`,
          );
          this.globalLoader.stopLoader();
        },
        error: () => {
          console.error('Error deleting event:');
          this.globalLoader.stopLoader();
          this.utitilyService.swalPopup(
            'Failed!',
            'Failed to delete event. Please try again later.',
            'error',
          );
        },
      });
    }
  }

  buttonClicked() {
    console.log('Form Values:', this.form.value);
  }
}

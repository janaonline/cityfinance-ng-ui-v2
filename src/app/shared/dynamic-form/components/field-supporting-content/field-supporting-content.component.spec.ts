import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DynamicFieldSupportingContentComponent } from './field-supporting-content.component';
import { FieldSupportingContent } from '../../field.interface';

describe('DynamicFieldSupportingContentComponent', () => {
  let fixture: ComponentFixture<DynamicFieldSupportingContentComponent>;
  let componentRef: ComponentRef<DynamicFieldSupportingContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFieldSupportingContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFieldSupportingContentComponent);
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders nothing when supportingContent is undefined', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('renders nothing when supportingContent is an empty array', () => {
    componentRef.setInput('supportingContent', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  describe('position filtering', () => {
    const BEFORE: FieldSupportingContent = {
      type: 'info',
      description: 'Before content',
      position: 'before',
    };
    const AFTER: FieldSupportingContent = {
      type: 'warning',
      description: 'After content',
      position: 'after',
    };

    it('defaults to rendering position="before" items when no position input is set', () => {
      componentRef.setInput('supportingContent', [BEFORE, AFTER]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Before content');
      expect(fixture.nativeElement.textContent).not.toContain('After content');
    });

    it('renders only "after" items when position="after"', () => {
      componentRef.setInput('supportingContent', [BEFORE, AFTER]);
      componentRef.setInput('position', 'after');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Before content');
      expect(fixture.nativeElement.textContent).toContain('After content');
    });

    it('treats an item with no position as "before"', () => {
      const noPosition: FieldSupportingContent = {
        type: 'info',
        description: 'Implicit before',
      };
      componentRef.setInput('supportingContent', [noPosition]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Implicit before');
    });

    it('does not render implicit-before items when position="after"', () => {
      const noPosition: FieldSupportingContent = {
        type: 'info',
        description: 'Should not appear',
      };
      componentRef.setInput('supportingContent', [noPosition]);
      componentRef.setInput('position', 'after');
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Should not appear');
    });
  });

  describe('template-download', () => {
    it('renders the download link with label', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'template-download',
          label: 'Download template',
          url: '/assets/template.xlsx',
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('a'));
      expect(link).toBeTruthy();
      expect(link.nativeElement.getAttribute('href')).toBe('/assets/template.xlsx');
      expect(link.nativeElement.textContent.trim()).toContain('Download template');
    });

    it('renders the optional description', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'template-download',
          label: 'Download template',
          url: '/assets/template.xlsx',
          description: 'Fill in data before uploading.',
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Fill in data before uploading.');
    });

    it('does not render a description element when description is absent', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'template-download',
          label: 'Download',
          url: '/assets/template.xlsx',
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('p'))).toBeNull();
    });

    it('sets target="_blank" and rel="noopener noreferrer" on the link', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'template-download',
          label: 'Download',
          url: '/file.xlsx',
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('a'));
      expect(link.nativeElement.getAttribute('target')).toBe('_blank');
      expect(link.nativeElement.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  describe('info', () => {
    it('renders the info block', () => {
      componentRef.setInput('supportingContent', [
        { type: 'info', description: 'Read this.', title: 'Helpful info' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('.sc-info'));
      expect(el).toBeTruthy();
      expect(el.nativeElement.textContent).toContain('Helpful info');
      expect(el.nativeElement.textContent).toContain('Read this.');
    });

    it('renders without a title', () => {
      componentRef.setInput('supportingContent', [
        { type: 'info', description: 'Just a description.' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.sc-info'))).toBeTruthy();
      expect(fixture.nativeElement.textContent).toContain('Just a description.');
    });

    it('has role="note"', () => {
      componentRef.setInput('supportingContent', [
        { type: 'info', description: 'x' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('[role="note"]'))).toBeTruthy();
    });
  });

  describe('warning', () => {
    it('renders the warning block with title and description', () => {
      componentRef.setInput('supportingContent', [
        { type: 'warning', title: 'Caution', description: 'Watch out.' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(el).toBeTruthy();
      expect(el.nativeElement.textContent).toContain('Caution');
      expect(el.nativeElement.textContent).toContain('Watch out.');
    });

    it('has role="alert"', () => {
      componentRef.setInput('supportingContent', [
        { type: 'warning', description: 'x' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeTruthy();
    });
  });

  describe('sample-columns', () => {
    it('renders the column list', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'sample-columns',
          title: 'Expected columns',
          columns: ['Col A', 'Col B', 'Col C'],
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const el = fixture.debugElement.query(By.css('.sc-sample-columns'));
      expect(el).toBeTruthy();
      expect(el.nativeElement.textContent).toContain('Expected columns');
      const items = el.queryAll(By.css('li'));
      expect(items.length).toBe(3);
      expect(items[0].nativeElement.textContent.trim()).toBe('Col A');
      expect(items[2].nativeElement.textContent.trim()).toBe('Col C');
    });

    it('renders without a title', () => {
      componentRef.setInput('supportingContent', [
        { type: 'sample-columns', columns: ['A'] } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.sc-sample-columns'))).toBeTruthy();
    });
  });

  describe('readonly-card', () => {
    it('renders title, description, and rows', () => {
      componentRef.setInput('supportingContent', [
        {
          type: 'readonly-card',
          title: 'Summary',
          description: 'Card description',
          rows: [
            { label: 'Year', value: '2026' },
            { label: 'State', value: 'Andhra Pradesh' },
          ],
        } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      const card = fixture.debugElement.query(By.css('.card'));
      expect(card).toBeTruthy();
      expect(card.nativeElement.textContent).toContain('Summary');
      expect(card.nativeElement.textContent).toContain('Card description');
      expect(card.nativeElement.textContent).toContain('Year');
      expect(card.nativeElement.textContent).toContain('2026');
      expect(card.nativeElement.textContent).toContain('Andhra Pradesh');
    });

    it('renders without rows', () => {
      componentRef.setInput('supportingContent', [
        { type: 'readonly-card', title: 'No rows' } satisfies FieldSupportingContent,
      ]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.card'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('dl'))).toBeNull();
    });
  });

  describe('multiple items', () => {
    it('renders multiple content items in the same position', () => {
      componentRef.setInput('supportingContent', [
        { type: 'info', description: 'Info text' },
        { type: 'warning', description: 'Warning text' },
      ] satisfies FieldSupportingContent[]);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.sc-info'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeTruthy();
    });
  });
});

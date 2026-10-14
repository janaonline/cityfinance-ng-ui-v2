import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toFormError } from '../../forum-errors';
import { ForumCategory } from '../../forum.models';
import { ForumService } from '../../forum.service';

interface CategoryDraft {
  name: string;
  slug: string;
  description: string;
}

const EMPTY_DRAFT: CategoryDraft = { name: '', slug: '', description: '' };
const byName = (a: ForumCategory, b: ForumCategory) => a.name.localeCompare(b.name);

@Component({
  selector: 'app-forum-admin-categories',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="admin-section" aria-labelledby="category-heading">
      <div class="admin-section-heading">
        <div>
          <p class="eyebrow">Structure</p>
          <h2 id="category-heading">Categories</h2>
          <p>Create topic areas and update how they appear across the forum.</p>
        </div>
      </div>
      <div class="category-admin-grid">
        <form class="forum-form admin-category-form" (submit)="submit($event)">
          <h3>{{ editingId() ? 'Edit category' : 'New category' }}</h3>
          @if (error()) {
            <p class="form-alert" role="alert">{{ error() }}</p>
          }
          <label
            >Name
            <input
              [value]="draft().name"
              (input)="patch('name', $any($event.target).value)"
              minlength="2"
              maxlength="60"
              required
            />
          </label>
          @if (fieldErrors()['name']) {
            <span class="field-error">{{ fieldErrors()['name'] }}</span>
          }
          <label
            >Slug
            <input
              [value]="draft().slug"
              (input)="patch('slug', $any($event.target).value)"
              maxlength="60"
              placeholder="Generated from name if blank"
              [required]="!!editingId()"
            />
          </label>
          @if (fieldErrors()['slug']) {
            <span class="field-error">{{ fieldErrors()['slug'] }}</span>
          }
          <label
            >Description
            <textarea
              [value]="draft().description"
              (input)="patch('description', $any($event.target).value)"
              minlength="2"
              maxlength="240"
              rows="4"
              required
            ></textarea>
          </label>
          @if (fieldErrors()['description']) {
            <span class="field-error">{{ fieldErrors()['description'] }}</span>
          }
          <div class="admin-form-actions">
            <button class="button small" type="submit" [disabled]="pending()">
              {{ pending() ? 'Saving…' : editingId() ? 'Save changes' : 'Add category' }}
            </button>
            @if (editingId()) {
              <button type="button" class="text-action" (click)="reset()" [disabled]="pending()">
                Cancel
              </button>
            }
          </div>
        </form>

        <div class="admin-panel">
          @if (loading()) {
            <div class="loading" role="status">
              <span></span>
              <p>Loading categories…</p>
            </div>
          } @else {
            <div class="admin-table-wrap">
              <table class="admin-table category-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (category of categories(); track category.id) {
                    <tr>
                      <td>
                        <strong>{{ category.name }}</strong
                        ><small>/{{ category.slug }}</small>
                      </td>
                      <td>{{ category.description }}</td>
                      <td>
                        <div class="admin-actions">
                          <button type="button" (click)="edit(category)" [disabled]="pending()">
                            Edit
                          </button>
                          <button
                            type="button"
                            class="danger"
                            (click)="remove(category)"
                            [disabled]="pending()"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3">No categories yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class AdminCategoriesComponent {
  private readonly forum = inject(ForumService);

  protected readonly categories = signal<ForumCategory[]>([]);
  protected readonly loading = signal(true);
  protected readonly draft = signal<CategoryDraft>({ ...EMPTY_DRAFT });
  protected readonly editingId = signal<string | null>(null);
  protected readonly pending = signal(false);
  protected readonly error = signal('');
  protected readonly fieldErrors = signal<Record<string, string>>({});

  constructor() {
    this.forum.getCategories(true).subscribe({
      next: (items) => {
        this.categories.set([...items].sort(byName));
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Could not load categories.').message);
        this.loading.set(false);
      },
    });
  }

  protected patch(key: keyof CategoryDraft, value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected edit(category: ForumCategory): void {
    this.editingId.set(category.id);
    this.draft.set({
      name: category.name,
      slug: category.slug,
      description: category.description,
    });
    this.error.set('');
    this.fieldErrors.set({});
  }

  protected reset(): void {
    this.editingId.set(null);
    this.draft.set({ ...EMPTY_DRAFT });
    this.error.set('');
    this.fieldErrors.set({});
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.pending()) return;
    const id = this.editingId();
    const { name, slug, description } = this.draft();
    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
    };
    this.pending.set(true);
    this.error.set('');
    this.fieldErrors.set({});
    const request$ = id
      ? this.forum.updateCategory(id, payload)
      : this.forum.createCategory(payload);
    request$.subscribe({
      next: (saved) => {
        this.categories.update((items) =>
          (id ? items.map((i) => (i.id === id ? saved : i)) : [...items, saved]).sort(byName),
        );
        this.pending.set(false);
        this.reset();
      },
      error: (err: unknown) => {
        const e = toFormError(err, 'Could not save category.');
        this.error.set(e.message);
        this.fieldErrors.set(e.fields);
        this.pending.set(false);
      },
    });
  }

  protected remove(category: ForumCategory): void {
    if (!window.confirm(`Delete the “${category.name}” category?`)) return;
    this.pending.set(true);
    this.error.set('');
    this.forum.deleteCategory(category.id).subscribe({
      next: () => {
        this.categories.update((items) => items.filter((i) => i.id !== category.id));
        if (this.editingId() === category.id) this.reset();
        this.pending.set(false);
      },
      error: (err: unknown) => {
        this.error.set(toFormError(err, 'Could not delete category.').message);
        this.pending.set(false);
      },
    });
  }
}

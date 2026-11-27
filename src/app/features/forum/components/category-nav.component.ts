import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ForumCategory } from '../forum.models';

@Component({
  selector: 'app-forum-category-nav',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="category-nav" aria-label="Forum categories">
      <a class="category-pill" [class.active]="!active()" routerLink="/forum">All Discussions</a>
      @for (category of categories(); track category.id) {
        <a
          class="category-pill"
          [class.active]="active() === category.slug"
          [routerLink]="['/forum/categories', category.slug]"
          >{{ category.name }}</a
        >
      }
    </nav>
  `,
})
export class CategoryNavComponent {
  readonly categories = input.required<ForumCategory[]>();
  readonly active = input<string | null>(null);
}

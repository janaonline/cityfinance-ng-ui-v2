import { Routes } from '@angular/router';
import { forumAdminGuard } from './forum.guards';

/** Lazy-loaded forum feature, mounted at `/forum` (guarded by `authGuard` in app.routes.ts). */
export const FORUM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./forum-shell.component').then((m) => m.ForumShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Discussion Forum',
        loadComponent: () =>
          import('./pages/forum-home.component').then((m) => m.ForumHomeComponent),
      },
      {
        path: 'categories/:categorySlug',
        title: 'Forum category',
        loadComponent: () =>
          import('./pages/category-page.component').then((m) => m.CategoryPageComponent),
      },
      {
        path: 'threads/new',
        title: 'Start a discussion',
        loadComponent: () =>
          import('./pages/new-thread.component').then((m) => m.NewThreadComponent),
      },
      {
        path: 'threads/:slug',
        title: 'Forum thread',
        loadComponent: () =>
          import('./pages/thread-detail.component').then((m) => m.ThreadDetailComponent),
      },
      {
        path: 'my-threads',
        title: 'My threads',
        loadComponent: () =>
          import('./pages/my-threads.component').then((m) => m.MyThreadsComponent),
      },
      {
        path: 'saved',
        title: 'Saved discussions',
        loadComponent: () =>
          import('./pages/saved-threads.component').then((m) => m.SavedThreadsComponent),
      },
      {
        path: 'unauthorized',
        title: 'Access not granted',
        loadComponent: () =>
          import('./pages/forum-unauthorized.component').then((m) => m.ForumUnauthorizedComponent),
      },
      {
        path: 'admin',
        canActivate: [forumAdminGuard],
        loadComponent: () =>
          import('./pages/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'categories' },
          {
            path: 'categories',
            title: 'Manage categories',
            loadComponent: () =>
              import('./pages/admin/admin-categories.component').then(
                (m) => m.AdminCategoriesComponent,
              ),
          },
          {
            path: 'threads',
            title: 'Manage threads',
            loadComponent: () =>
              import('./pages/admin/admin-threads.component').then((m) => m.AdminThreadsComponent),
          },
        ],
      },
      {
        path: '**',
        title: 'Not found',
        loadComponent: () =>
          import('./pages/forum-not-found.component').then((m) => m.ForumNotFoundComponent),
      },
    ],
  },
];

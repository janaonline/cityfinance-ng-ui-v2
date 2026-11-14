import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ForumViewer } from './forum.models';

/** The signed-in app user as a forum viewer (the login payload carries Mongo `_id` and `role`). */
export function injectForumViewer(): Signal<ForumViewer | null> {
  const auth = inject(AuthService);
  // IUserLoggedInDetails does not declare `_id`, but the API's login payload includes it.
  const user$ = auth.currentUser$ as Observable<unknown> as Observable<ForumViewer | null>;
  return toSignal(user$, {
    initialValue: auth.getCurrentUserSnapshot() as unknown as ForumViewer | null,
  });
}

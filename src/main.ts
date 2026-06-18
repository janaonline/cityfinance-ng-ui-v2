import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Promise.try is a Stage-3 proposal shipped only in Node 24+ / latest browsers.
// pdfjs-dist v4+ calls it internally; polyfill so older environments don't crash.
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function <T>(fn: () => T | PromiseLike<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      try { resolve(fn()); } catch (e) { reject(e); }
    });
  };
}

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalLoaderService {
  loading = signal(false);

  isLayoutVisible = signal(true);

  constructor() { }

  showLoader() {
    this.loading.set(true);
  }

  stopLoader() {
    this.loading.set(false);
  }

  showLayout() {
    this.isLayoutVisible.set(true);
  }

  hideLayout() {
    this.isLayoutVisible.set(false);
  }
}

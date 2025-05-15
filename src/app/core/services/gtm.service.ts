import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GtmService {

  constructor() {
    // const gtmScript = document.createElement('script');
    // gtmScript.async = true;
    // gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5NPJ9V8V';
    // document.head.appendChild(gtmScript);
  }

  initScript() {
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-5NPJ9V8V';
    document.head.appendChild(gtmScript);
  }

  pushEvent(event: any) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(event);
  }
}

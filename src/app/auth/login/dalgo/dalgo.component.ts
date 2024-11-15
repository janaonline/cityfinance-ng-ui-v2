import { Component, OnInit, AfterViewInit } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { SupersetService } from './superset.service';

@Component({
  selector: 'app-dalgo',                 // Component selector to use in templates
  templateUrl: './dalgo.component.html',  // HTML template file for the component
  styleUrls: ['./dalgo.component.scss']   // Stylesheet for the component
})

export class DalgoComponent implements OnInit, AfterViewInit {

  private readonly htmlElementId = 'mohua-superset-container';  // Element ID as a constant
  private readonly supersetDomainUrl = 'https://janaagraha.dalgo.in/';

  private readonly supersetEmbedDashboardId = '6476518a-7dfd-4614-87c2-8a315c9ece25'; // MoHUA dashboard UUID
  //private readonly supersetEmbedDashboardId = '463904ae-53e5-4e86-8f41-314ad84fe11b'; // State dashboard UUID

  /**
   * Constructor to inject the SupersetService to interact with the Superset API.
   * @param supersetService - Service for interacting with Superset API to retrieve tokens
   */
  constructor(private supersetService: SupersetService) { }

  /**
   * ngOnInit lifecycle hook.
   * Called once the component is initialized. It triggers the dashboard embedding process.
   */
  ngOnInit(): void {
    this.initializeEmbeddedDashboard();
  }

  /**
   * ngAfterViewInit lifecycle hook.
   * Called after the component's view has been initialized. Adjusts the iframe to ensure it fills the full container width and height.
   */
  ngAfterViewInit(): void {
    this.adjustIframeDimensions();
  }

  /**
   * Initializes and embeds the Superset dashboard into the DOM.
   * Fetches a guest token, configures the dashboard settings, and embeds it using the Superset Embedded SDK.
   */
  private initializeEmbeddedDashboard(): void {

    /**
     * Fetches a guest token from the backend via SupersetService.
     * @returns {Promise<string>} - Returns a promise resolving to the guest token.
     */
    const fetchGuestToken = () => {
      return this.supersetService.getGuestToken({}).toPromise();
    };

    // Call embedDashboard to embed the Superset dashboard with specified configurations
    embedDashboard({
      id: this.supersetEmbedDashboardId,       // UUID of the dashboard to embed
      supersetDomain: this.supersetDomainUrl,  // Superset domain URL
      mountPoint: document.getElementById(this.htmlElementId) as HTMLElement, // DOM element to mount dashboard
      fetchGuestToken: fetchGuestToken,        // Method to retrieve guest token

      dashboardUiConfig: {
        hideTitle: true,     // Hide the dashboard title
        filters: {
          expanded: true     // Expand filters by default
        },
        urlParams: {         // URL parameters to pass to the dashboard
          foo: 'value1',
          bar: 'value2'
        }
      },
      iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox'] // Extra sandbox options for iframe
    });

  }

  /**
   * Adjusts the iframe dimensions to ensure it fills the entire container.
   * This is done after the view has been initialized, and the iframe is the first child element of the container.
   */
  private adjustIframeDimensions(): void {
    const iframe = document.getElementById(this.htmlElementId)?.children[0] as HTMLIFrameElement;
    if (iframe) {
      iframe.width = "100%";
      iframe.height = "100%";
    }
  }

}
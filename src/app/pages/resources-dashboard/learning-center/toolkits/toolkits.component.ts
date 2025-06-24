import { Component, OnInit } from "@angular/core";

import { Router, RouterModule } from "@angular/router";
import { ResourcesServicesService } from "../../resDashboard-services/resources-services.service";
@Component({
    selector: "app-toolkits",
    templateUrl: "./toolkits.component.html",
    styleUrls: ["./toolkits.component.scss"],
    imports: [RouterModule]
})
export class ToolkitsComponent implements OnInit {
  constructor(
    private router: Router,
    private resources_services: ResourcesServicesService
  ) {
    // this.router.events.subscribe((event:Event)=>{
    //   let urlArray;
    //   if (event instanceof NavigationEnd) {
    //     console.log()
    //     // urlArray = event.url.split("/")
    //     console.log('url', event.url)
    //     if(event.url == '/resources-dashboard/learning-center/toolkits'){
    //       this.isCardShow = true;
    //       console.log('if',   this.isCardShow, event.url)
    //     }
    //   }else {
    //     this.isCardShow = false;
    //     console.log('else',   this.isCardShow, event)
    //   }
    // })
  }
  isCardShow = true;
  cardData = [
    {
      label: "Digital Property Tax Toolkit",
      imgUrl:
        "../../../../assets/new_dashBord_ftr_hdr/shutterstock_546307051/shutterstock_546307051.png",
      link: "",
    },
  ];

  subTabData = [
    {
      name: "Introduction",
      filter: ["innerTab1", "innerTab2", "innerTab3"],
      link: "introduction",
    },
    {
      name: "Score Your Performance",
      link: "score-performance",
    },
    {
      name: "Enumeration",
      filter: ["innerTab7", "innerTab8", "innerTab9"],
      link: "enumeration",
    },
    {
      name: "Valuation",
      filter: ["innerTab10", "innerTab11", "innerTab12"],
      link: "valuation",
    },
    {
      name: "Assessment",
      filter: ["innerTab10", "innerTab11", "innerTab12"],
      link: "assessment",
    },
    {
      name: "Billing and Collection",
      filter: ["innerTab10", "innerTab11", "innerTab12"],
      link: "billingCollection",
    },
    {
      name: "Reporting",
      filter: ["innerTab10", "innerTab11", "innerTab12"],
      link: "reporting",
    },
  ];
  ngOnInit(): void {
    this.isCardShow = true;

    this.resources_services.tooltikCardShow.subscribe((res) => {
      console.log("card", res);
      this.isCardShow = true;
    });

    this.subTabData.forEach(item => {
      if (this.router.url.includes(item?.link)) {
        this.isCardShow = false;
      }
    });
  }

  // navigateTabs(link, i) {
  //   this.subTabData.forEach((elem) => {
  //     if (elem.link == link) {
  //       this.router.navigateByUrl(
  //         `resources-dashboard/learning-center/toolkits/${elem.link} `
  //       );
  //     }
  //   });
  // }
  showIframe = false;
  openScorePer(card) {
    if (card.label == "Municipal Borrowing Readiness Toolkit") {
      return (this.showIframe = true);
    }
    this.resources_services.tooltikCardShow.next(false);
    this.isCardShow = false;
    this.router.navigateByUrl(
      "resources-dashboard/learning-center/toolkits/introduction"
    );
    // setTimeout(()=> {
    //   if(!this.isCardShow){
    //     let intro =  document.getElementById('id_0');
    //     intro.click()
    //   }
    // }, 200)
  }
}

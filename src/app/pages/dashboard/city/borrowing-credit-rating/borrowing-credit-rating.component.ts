import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface IssueDetail {
  dateOfIssue: string;
  maturityDate: string;
  platform: string;
  type: string;
  issueSize: string;
  bidsReceived: string;
  amountAccepted: string;
  greenShoeOption: string;
  greenShoeOptionAmount: string;
  guaranteedByStateGovt: string;
  guaranteeMechanism: string;
}


export interface InstrumentSummary {
  numberOfInstruments: number;
  issueSize: string;
  bidsReceived: string;
}
const SUMMARY_DATA: InstrumentSummary = {
  numberOfInstruments: 4,
  issueSize: 'INR 577 Crores',
  bidsReceived: 'INR 455 Crores'
};
export interface RatingDetail {
  crisil: string;
  care: string;
  icra: string;
  brickwork: string;
  auciteSmera: string;
  indiaRatings: string;
  otherAgencies: string;
  linksToReports: string;
}


export interface ObjectiveDetail {
  objectOfIssue: string;
}

export interface SubscriberDetail {
  whoCanInvest: string;
  detailsOfSubscribers: string;
}

export interface AdvisorDetail {
  transactionAdvisors: string;
  trustee: string;
  registrar: string;
  auditor: string;
  legalCounsel: string;
  escrowBanker: string;
  arranger: string;
}

export interface DocumentAvailable {
  draftMemorandum: string;
  noticesFromPlatforms: string;
  others: string;
}

export interface InstrumentDetail {
  type: string;
  term: string;
  couponRate: string;
  interestPayment: string;
  taxTreatment: string;
  repayment: string;
}
export interface CreditRating {
  agency: string;
  creditRating: string;
  outlook: string;
  type: string;
  amount: string | number;
  date: string;
  link: string;
}

const CREDIT_RATING_DATA: CreditRating[] = [
  {
    agency: "CRISIL",
    creditRating: "AA (Upgraded)",
    outlook: "Stable",
    type: "Corporate Credit Rating",
    amount: "Not applicable",
    date: "02/06/2017",
    link: "https://www.crisil.com/mnt/winshare/Ratings/RatingList/RatingDocs/Ahmedabad_Municipal_Corporation_February_06_2017_RR.html"
  },
  {
    agency: "CRISIL",
    creditRating: "AA- (Affirmed)",
    outlook: "Stable",
    type: "Corporate Credit Rating",
    amount: "Not applicable",
    date: "01/27/2016",
    link: "https://www.crisil.com/mnt/winshare/Ratings/RatingList/RatingDocs/Ahmedabad_Municipal_Corporation_January_27_2016_RR.html"
  },
  {
    agency: "CRISIL",
    creditRating: "AA-",
    outlook: "Not available",
    type: "Corporate Credit Rating",
    amount: "Not applicable",
    date: "09/05/2017",
    link: "https://www.crisil.com/mnt/winshare/Ratings/RatingList/RatingDocs/Ahmedabad_Municipal_Corporation_September_05_2017_RR.html"
  },
  {
    agency: "IRR",
    creditRating: "AA+",
    outlook: "Stable",
    type: "Proposed Bonds",
    amount: 200,
    date: "12/31/2018",
    link: "https://www.indiaratings.co.in/PressRelease?pressReleaseID=35380&title=India-Ratings-Assigns-Ahmedabad-Municipal-Corp%E2%80%99s-Additional-Bonds-%E2%80%98Provisional-IND-AA%2B%28SO%29%E2%80%99%2FStable%3B-Withdraws-Existing-Rating"
  },
  {
    agency: "IRR",
    creditRating: "Withdrawn",
    outlook: "Not applicable",
    type: "Proposed Non-Convertible Debentures",
    amount: 200,
    date: "12/31/2018",
    link: "https://www.indiaratings.co.in/PressRelease?pressReleaseID=35380&title=India-Ratings-Assigns-Ahmedabad-Municipal-Corp%E2%80%99s-Additional-Bonds-%E2%80%98Provisional-IND-AA%2B%28SO%29%E2%80%99%2FStable%3B-Withdraws-Existing-Rating"
  }
];
const ELEMENT_DATA: InstrumentDetail[]= [
  {
    type: 'Unsecure, Listed Taxable, Non Convertible, Redeemable bonds in the nature of debentures',
    term: '10 Years',
    couponRate: '10.23%',
    interestPayment: 'Half Yearly',
    taxTreatment: 'Taxable',
    repayment: 'Bullet Repayment at the end of bond term'
  },
  {
    type: 'Unsecured Listed Taxable Non-Convertible Redeemable Bonds in the nature of Debentures Series- I',
    term: '10 years',
    couponRate: '8.90%',
    interestPayment: 'Half Yearly',
    taxTreatment: 'Taxable',
    repayment: 'Bullet repayment at the end of bond term'
  },
  {
    type: 'Unsecured and Taxable , Non-Convertiable Reedemable Bonds',
    term: '10 years',
    couponRate: '9.38%',
    interestPayment: 'Half Yearly',
    taxTreatment: 'Non- Taxable',
    repayment: 'Bullet repayment at the end of bond term'
  }
];



const ISSUE_DATA: IssueDetail[] = [
  {
    dateOfIssue: '20-08-2019',
    maturityDate: '21-Aug-19',
    platform: 'BSE',
    type: 'Private Placement',
    issueSize: 'INR 100 Crores',
    bidsReceived: 'Not Available',
    amountAccepted: '',
    greenShoeOption: '',
    greenShoeOptionAmount: '',
    guaranteedByStateGovt: 'No',
    guaranteeMechanism:
      'The funds lying in the account in which Property Tax, Fees & User Charges are collected shall be transferred to a separate non-lien escrow account for debt servicing'
  },
  {
    dateOfIssue: '22-02-2018',
    maturityDate: '16-Feb-28',
    platform: 'BSE Bond platform',
    type: 'Private Placement',
    issueSize: 'INR 200 crores',
    bidsReceived: 'INR 455 crores',
    amountAccepted: 'INR 200 crores',
    greenShoeOption: 'Not available',
    greenShoeOptionAmount: 'Not available',
    guaranteedByStateGovt: 'No',
    guaranteeMechanism:
      'Structured payment mechanism, where property tax and fee chargers are deposited in a separate no-lien escrow account'
  },
  {
    dateOfIssue: '14-08-2018',
    maturityDate: '14-Aug-28',
    platform: 'BSE',
    type: 'Private Placement',
    issueSize: 'INR 195 Crore',
    bidsReceived: '',
    amountAccepted: '',
    greenShoeOption: '',
    greenShoeOptionAmount: '',
    guaranteedByStateGovt: 'No',
    guaranteeMechanism:
      'Structured payment mechanism, where property tax and fee chargers are deposited in a separate no-lien escrow account'
  },
  {
    dateOfIssue: '2003',
    maturityDate: '',
    platform: '',
    type: 'Private Placement',
    issueSize: 'INR 82.5 Crore',
    bidsReceived: '',
    amountAccepted: '',
    greenShoeOption: '',
    greenShoeOptionAmount: '',
    guaranteedByStateGovt: '',
    guaranteeMechanism: ''
  }
];

const RATING_DATA: RatingDetail[] =[ {
  crisil: '',
  care: 'AA',
  icra: '',
  brickwork: '',
  auciteSmera: '',
  indiaRatings: 'AA',
  otherAgencies: '',
  linksToReports: ''
},
{
  crisil: 'Not applicable',
  care: 'AA / Stable',
  icra: 'Not applicable',
  brickwork: 'Not applicable',
  auciteSmera: 'Not applicable',
  indiaRatings: 'AA / Stable',
  otherAgencies: '',
  linksToReports: ''
},
{
  crisil: '',
  care: 'AA',
  icra: '',
  brickwork: '',
  auciteSmera: '',
  indiaRatings: 'AA',
  otherAgencies: '',
  linksToReports: ''
}
]

const OBJECTIVE_DATA: ObjectiveDetail[] = [
  {
    objectOfIssue: 'The proceeds of the issue shall be utlized towards capex for implementation of Stratergic Road Development Plan'
  },
  {
    objectOfIssue: 'Various development activities and other works under strategic road development programme including skyways, conflict free corridors etc'
  },
  {
    objectOfIssue: 'The proceeds of the issue shall be utilized towards capex for implementation of Strategic Road Development Plan'
  },
  {
    objectOfIssue: 'Road construction and widening'
  }
];

const SUBSCRIBER_DATA: SubscriberDetail[] = [
  {
    whoCanInvest:
      'Mutual Funds registered with SEBI, Public Financial Institutions, Foreign Portfolio Investors, Shedule commercial banks, Provident funds,State industrial development corporation,Multilateral and Bilateral Development Financial Institutions,Insurance companies, Pension Funds,National Investment Fund, Insurance Funds,Statutory Bodies, Co-operative Bank, Regional Rural Bank, Limited Liability Partnerships, Trusts, Societies and other legal entities.',
    detailsOfSubscribers: 'Not available'
  },
  {
    whoCanInvest: 'Private Placement - Insurance, pension funds, primary dealers, banks etc',
    detailsOfSubscribers: 'Not available'
  },
  {
    whoCanInvest:
      'Mutual Funds registered with SEBI, Public Financial Institutions, Foreign Portfolio Investors, Shedule commercial banks, Provident funds,State industrial development corporation,Multilateral and Bilateral Development Financial Institutions,Insurance companies, Pension Funds,National Investment Fund, Insurance Funds,Statutory Bodies, Co-operative Bank, Regional Rural Bank, Limited Liability Partnerships, Trusts, Societies and other legal entities.',
    detailsOfSubscribers: 'Not available'
  }
];

const ADVISOR_DATA: AdvisorDetail[] = [
  {
    transactionAdvisors: 'SPA Securities Limited',
    trustee: 'SBICAP Trustee Company Limited',
    registrar: 'Karvy FinTech',
    auditor: 'State Audit Department',
    legalCounsel: 'MVKini Law Firm',
    escrowBanker: 'Not Available',
    arranger: 'SBI Capital Market'
  },
  {
    transactionAdvisors: 'SPA Capital Advisors',
    trustee: 'Not available',
    registrar: 'Not available',
    auditor: 'Not available',
    legalCounsel: 'Not available',
    escrowBanker: 'Not available',
    arranger: 'SBI Capital Market'
  },
  {
    transactionAdvisors: 'SPA Securities Limited',
    trustee: 'SBICAP Trustee Company Limited',
    registrar: 'Karvy FinTech',
    auditor: 'State Audit Department',
    legalCounsel: 'MVKini Law Firm',
    escrowBanker: 'Not Available',
    arranger: 'SBI Capital Market'
  }
];

const DOCUMENTS_DATA: DocumentAvailable[] = [
 
  {
    draftMemorandum: 'Not available',
    noticesFromPlatforms: '',
    others: ''
  },
  
];


@Component({
  selector: 'app-borrowing-credit-rating',
  standalone: true,
  imports: [MatTableModule , CommonModule , FormsModule],
  templateUrl: './borrowing-credit-rating.component.html',
  styleUrls: ['./borrowing-credit-rating.component.scss']
})
export class BorrowingCreditRatingComponent implements OnInit {
  selectedTab: 'borrowing' | 'creditRating' = 'borrowing'; 
  displayedColumns: string[] = [
    'type',
    'term',
    'couponRate',
    'interestPayment',
    'taxTreatment',
    'repayment'
  ];
   
  summary = SUMMARY_DATA;
  dataSource = ELEMENT_DATA;
  issueData = ISSUE_DATA;
  ratingData = RATING_DATA;
  objectiveData = OBJECTIVE_DATA;
  subscriberData = SUBSCRIBER_DATA;
  advisorData = ADVISOR_DATA;
  documentsData = DOCUMENTS_DATA;
  creditRatingTable = CREDIT_RATING_DATA;
  years = ['2021', '2020', '2019', '2018', '2017'];
  selectedYear = '2017'; // default

filteredCreditRating: CreditRating[] = [];

ngOnInit() {
  this.filterCreditRatingByYear();  // initialize
}

filterCreditRatingByYear() {
  this.filteredCreditRating = this.creditRatingTable.filter(item => {
    const year = item.date.split('/')[2]; // Extract year from dd/mm/yyyy
    return year === this.selectedYear;
  });
}

  
currentInstrumentPage = 0;
columnsPerPage = 3; // Adjust as needed

get paginatedInstrumentData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.dataSource.slice(start, start + this.columnsPerPage);
}

get totalInstrumentPages() {
  return Math.ceil(this.dataSource.length / this.columnsPerPage);
}
get paginatedIssueData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.issueData.slice(start, start + this.columnsPerPage);
}

get paginatedRatingData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.ratingData.slice(start, start + this.columnsPerPage);
}

get paginatedObjectiveData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.objectiveData.slice(start, start + this.columnsPerPage);
}

get paginatedSubscriberData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.subscriberData.slice(start, start + this.columnsPerPage);
}

get paginatedAdvisorData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.advisorData.slice(start, start + this.columnsPerPage);
}

get paginatedDocumentsData() {
  const start = this.currentInstrumentPage * this.columnsPerPage;
  return this.documentsData.slice(start, start + this.columnsPerPage);
}


incrementPage() {
  if (this.currentInstrumentPage < this.totalInstrumentPages - 1) {
    this.currentInstrumentPage++;
  }
}

decrementPage() {
  if (this.currentInstrumentPage > 0) {
    this.currentInstrumentPage--;
  }
}

  
}



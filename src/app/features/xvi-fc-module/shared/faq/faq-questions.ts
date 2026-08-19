export type FaqQuestion = Readonly<{
  number: number;
  question: string;
  answer: string;
}>;

export type FaqRole = 'ULB' | 'STATE';

export type FaqSection = Readonly<{
  id: string;
  title: string;
  // Omitted for sections shown to every role (e.g. "Logging In").
  role?: FaqRole;
  questions: readonly FaqQuestion[];
}>;

export const FAQ_SECTIONS: readonly FaqSection[] = [
  {
    id: 'logging-in',
    title: 'Logging In',
    questions: [
      {
        number: 1,
        question: 'How do I sign in?',
        answer:
          '<p>Your 15th Finance Commission login credentials will continue to work for the 16th Finance Commission.</p><ul><li><strong>ULBs:</strong> Use your Census ID / SB Code as the username.</li><li><strong>States:</strong> Use the email ID used for the 15th Finance Commission.</li></ul>',
      },
      {
        number: 2,
        question: 'I forgot my password. What should I do?',
        answer:
          '<p>Use the <strong>Forgot Password</strong> option on the login screen. You will receive an OTP on your registered email address to reset your password.</p>',
      },
    ],
  },
  {
    id: 'for-ulbs',
    title: 'For ULBs',
    role: 'ULB',
    questions: [
      {
        number: 1,
        question: 'What grants are available under the 16th Finance Commission?',
        answer:
          "<p>The XVI Finance Commission has recommended four types of grants for ULBs:</p><ol><li><strong>Basic Grants (&#8377;2,32,125 crore):</strong> Available from 2026&ndash;27 onwards and divided equally into:<ul><li><strong>Untied Grants (&#8377;1,16,063 crore)</strong> &mdash; can be used to address local needs, excluding salary and establishment expenses. Spending on road construction and maintenance capped at 20%.</li><li><strong>Tied Grants (&#8377;1,16,063 crore)</strong> &mdash; to be used for sanitation, solid waste management, and water management.</li></ul></li><li><strong>Performance Grants (&#8377;58,032 crore):</strong> Available from 2027&ndash;28 onwards and divided into two components:<ul><li><strong>ULG Performance Component (&#8377;29,016 crore):</strong> Untied grants available to eligible ULBs that achieve a minimum 5% annual increase in Own Source Revenue (OSR).</li><li><strong>State Performance Component (&#8377;29,016 crore):</strong> Untied grants available to ULBs once States transfer a matching grant of minimum 20% of the Union Finance Commission's basic grants to local bodies.</li></ul></li><li><strong>Urbanisation Premium (&#8377;10,000 crore):</strong> A one-time grant of &#8377;2,000 per person (based on the 2011 Census population of the peri-urban villages being merged) for eligible ULGs formed by merging peri-urban villages with cities having a population of more than 1 lakh.</li><li><strong>Special Infrastructure Component (&#8377;56,100 crore):</strong> Available for wastewater management projects in 22 eligible million-plus cities.</li></ol><p>The state-wise and year-wise allocation is displayed in all State DMA logins. The ULB-wise allocation will be displayed in the respective accounts once the state has updated the amounts.</p>",
      },
      {
        number: 2,
        question: 'What do ULBs need to submit to receive Basic Grants?',
        answer:
          "<p>To receive Basic Grants, every ULB must complete the following four submissions:</p><ol><li><strong>Audited Financial Statements (FY 2024&ndash;25):</strong> Upload the audited Receipts and Payments Account, Balance Sheet (with schedules), Income and Expenditure Account (with schedules), Cash Flow Statement, and Auditor's Report. Notes to Accounts and Significant Accounting Policies may also be uploaded, where applicable.</li><li><strong>Provisional Financial Statements (FY 2025&ndash;26):</strong> Upload the provisional Receipts and Payments Account, Balance Sheet (with schedules), Income and Expenditure Account (with schedules), and Cash Flow Statement.</li><li><strong>PFMS Bank Account Details:</strong> Confirm that the ULB has a dedicated PFMS-linked bank account for receiving XVI Finance Commission grants.</li><li><strong>Service Level Benchmarks (SLBs):</strong> Submit data for the 28 prescribed indicators covering water supply, sanitation, sewerage, and solid waste management.</li></ol><p>ATR on SFC recommendations, XIV FC unspent balance declaration and Elected Body Status are to be submitted by the State and do not require any action from the ULB.</p>",
      },
      {
        number: 3,
        question: 'I am a newly formed ULB and do not have a CityFinance account. What should I do?',
        answer:
          '<p>Please contact your State Nodal Department. The State DMA should create your account in the system so that your ULB can log in and begin submitting the required information.</p>',
      },
      {
        number: 4,
        question: 'What if my ULB does not have an elected body, or my compliances are not ready?',
        answer:
          '<p>Basic Grants will be released only after the required entry conditions are met. However, the grant amount is not lost. Once the required conditions are fulfilled, the eligible grant amount can be released.</p>',
      },
      {
        number: 5,
        question: 'How does the system check my documents?',
        answer:
          "<p>To speed up the review of ULB submissions, the system will automatically check every document submitted under the 16th Finance Commission. The system checks whether the uploaded file is the correct financial document for the correct financial year. It will also show how many checks passed and identify any documents that need attention.</p><p>It may flag issues such as poor readability, or an incorrect upload &mdash; such as submitting a trial balance instead of a balance sheet, or an audit certificate instead of an auditor's report.</p>",
      },
      {
        number: 9,
        question: 'How do I check my grant status?',
        answer:
          '<p>The <strong>Fund Status</strong> tracker in your login will show each stage of your submission, from document upload to fund release. This feature is currently under development.</p>',
      },
      {
        number: 10,
        question: 'When will the money arrive?',
        answer:
          '<p>Basic Grants are released in two installments each year. The first instalment is released in June and the second in October. Once the State receives the funds, it must transfer them to eligible ULBs within 10 working days.</p>',
      },
      {
        number: 11,
        question: 'How can I spend the grant money?',
        answer:
          '<p>Each grant has its own spending rules:</p><ol><li><strong>Untied Grants</strong> (Untied Basic Grant and Performance Grants) can be used by ULGs to address local needs and priorities. However, they cannot be used for salaries or establishment expenses. In addition, expenditure on road construction and maintenance is capped at 20% of the Untied allocation. Expenditure on engagement of professional services, as empanelled by the CAG of India, for auditing and accounting functions in respect of ULBs may be borne from the Untied component of the FC-16 grants.</li><li><strong>Tied Grants</strong> (Tied Basic Grant) must be used only for water management, sanitation, and solid waste management.</li></ol>',
      },
      {
        number: 12,
        question: 'How does my ULB qualify for the Performance Grant?',
        answer:
          "<p>The Performance Grant starts from year 2, i.e. 2027-28. It is not available in FY 2026-27. From 2027-28 onwards, your ULB qualifies each year if its Own Source Revenue meets the lower of these two targets:</p><ul><li><strong>Target 1:</strong> 1.05 times the ULB's Own Source Revenue from year T-2.</li><li><strong>Target 2:</strong> 5% annual compounded growth from the ULB's 2025-26 Own Source Revenue.</li></ul><div class=\"faq-example\"><span class=\"faq-example-label\">EXAMPLE</span><p>If your Own Source Revenue is Rs. 100 in FY 2025-26: in FY 2027-28, under Target 1, you must show 1.05 times Rs. 100, i.e. Rs. 105. In FY 2027-28, under Target 2, you must show a 5% compounded growth from 2025-26, i.e. Rs. 105. The ULB only needs to meet whichever target is lower for that year.</p></div><p>For this calculation, Own Source Revenue excludes interest receipts, assigned revenue, loans, and government transfers. The provisional Receipts and Payments statement for FY 2025-26 will be used as the baseline for this calculation.</p>",
      },
      {
        number: 13,
        question: 'My question is not listed here. Whom should I contact?',
        answer:
          '<p>Please write to <a href="mailto:updates@cityfinance.in">updates&#64;cityfinance.in</a>. We will respond within 24 hours.</p>',
      },
    ],
  },
  {
    id: 'for-state-dma',
    title: 'For State DMA Users',
    role: 'STATE',
    questions: [
      {
        number: 1,
        question: "What is the State's role in 16th FC grants?",
        answer:
          '<p>The State DMA reviews ULB submissions, approves the correct ones, and prepares the Claim Letter to send to MoHUA. The State is also responsible for transferring grant money to ULBs within <strong>10 working days</strong> of receiving it.</p><p>Before any ULB in the State can be considered for grants, the State must also submit its own required forms.</p>',
      },
      {
        number: 2,
        question: 'What forms does the State need to submit before ULBs can receive grants?',
        answer:
          '<p>For the 1st installment, the State must submit four forms:</p><ul><li><strong>SFC Status:</strong> Confirms that the State Finance Commission has been constituted.</li><li><strong>Elected Body Status:</strong> Confirms which ULBs have duly elected bodies in place.</li><li><strong>Devolution Formula:</strong> An Excel file showing grant amounts and the devolution formula for each ULB.</li><li><strong>FC Unspent Balance Disclosures:</strong> Confirms that all ULBs in the State have submitted their 14th FC unspent balance disclosures.</li></ul><p>A fifth form, the <strong>Grant Transfer Certificate</strong>, applies from the 2nd installment onwards. This form is currently under development.</p>',
      },
      {
        number: 3,
        question: "What are the State's SFC duties?",
        answer:
          '<p>The State must reconstitute the State Finance Commission every 5 years and table its Action Taken Report in the State Legislature within 6 months of receiving the report. This information should be reported in the SFC form.</p>',
      },
      {
        number: 4,
        question: 'What if the State does not have an SFC constituted?',
        answer:
          '<p>Until the SFC is constituted, the State will remain ineligible to claim local body grants. This also blocks ULBs in the State from receiving grants, because SFC constitution is an entry-level condition for the State to claim local body grants.</p>',
      },
      {
        number: 5,
        question: 'New ULBs have recently been formed in my State. What should I do?',
        answer:
          '<p>Register the new ULBs first. Newly constituted ULBs will not appear in the system until they are registered. Go to <strong>ULB Registration</strong> and provide the required details. The registration will go to CityFinance-Admin for approval. Once approved, the new ULB will be notified directly and can start logging in.</p>',
      },
      {
        number: 6,
        question: 'How should grants be divided among ULBs in the State?',
        answer:
          "<p>If the State has an active SFC recommendation, use that recommendation.</p><p>If not, use the following formula:</p><ul><li>90% based on each ULB's share of the State's total urban population.</li><li>10% based on an Own Source Revenue index.</li></ul><p>This is the same 90:10 formula that the Union Government uses to divide the grant among States.</p>",
      },
      {
        number: 7,
        question: 'What is the FC Unspent Balance form?',
        answer:
          '<p>The FC Unspent Balance form is used by the State to confirm whether ULBs still have any unspent Finance Commission funds from earlier grant periods. Before requesting the 1st installment for 2026-27, the State must confirm that no ULB has unspent funds from the 14th Finance Commission or earlier.</p><p>For the 1st installment, the State can either give a blanket declaration that all ULBs have zero unspent balance, or identify the specific ULBs where bank balance is still left. ULBs constituted after 1 April 2021 are automatically exempt from furnishing these details.</p><p>From 2028-29, the State should not request funds for any ULB with more than 10% unspent 15th Finance Commission funds. From year 4 onward, the State should request funds only for ULBs with no unspent 15th Finance Commission funds at all.</p>',
      },
      {
        number: 8,
        question: 'What is the Claim Letter, and how do I create one?',
        answer:
          '<p>The Claim Letter is the formal request prepared by the State after approving ULB submissions. It asks MoHUA to release the grant.</p><p>Review the ULB submissions and approve them first. The system will then automatically check which approved ULBs are eligible to be included. Once eligibility is determined, you can generate the Claim Letter.</p>',
      },
      {
        number: 9,
        question: 'How many Claim Letters can I generate?',
        answer:
          '<p>You can generate more than one Claim Letter. Approved and eligible ULBs can be processed in batches. As a practical approach, try to keep the number manageable — for example three to five Claim Letters — so that processing does not become burdensome for MoHUA.</p>',
      },
      {
        number: 10,
        question: "Why can't I add a ULB with a pending exemption to the Claim Letter?",
        answer:
          '<p>Only ULBs that are fully compliant, or have an approved exemption, can be included in the Claim Letter. ULBs that have not submitted, or are not eligible, cannot be included.</p>',
      },
      {
        number: 11,
        question: 'How does the Performance Grant work for the State and its ULBs?',
        answer:
          '<p>The Performance Grant starts from year 2, i.e. 2027-28. It is not available in FY 2026-27.</p><p>The grant has two parts of Rs. 29,016 crore each:</p><ul><li><strong>State rule:</strong> The State must transfer at least 20% of the 16th FC Basic Grant to ULBs from its own resources in year T-1.</li><li><strong>ULB rule:</strong> Each ULB must grow its Own Source Revenue by the lower of 1.05 times its Own Source Revenue from year T-2, or 5% compounded growth from its 2025-26 Own Source Revenue.</li></ul>',
      },
      {
        number: 12,
        question: 'What happens if a ULB or State does not meet the Performance Grant conditions?',
        answer:
          '<p>MoHUA redistributes the unused money to ULBs or States that did qualify. The redistribution follows the same formula as the regular grant distribution. It is capped so that no single ULB or State receives more than its own annual Basic Grant for that year through redistribution.</p>',
      },
      {
        number: 13,
        question: 'My question is not listed here. Whom should I contact?',
        answer:
          '<p>Please write to <a href="mailto:updates@cityfinance.in">updates&#64;cityfinance.in</a>. We will respond within 24 hours.</p>',
      },
    ],
  },
];

export type FaqPageCopy = Readonly<{
  subtitle: string;
}>;

export const FAQ_PAGE_COPY: Readonly<Record<FaqRole, FaqPageCopy>> = {
  ULB: {
    subtitle:
      'Common questions about signing in, what your ULB needs to submit, and how grants are released under the 16th Finance Commission.',
  },
  STATE: {
    subtitle:
      "Common questions about the State's role, the forms you must submit, and how the Claim Letter works under the 16th Finance Commission.",
  },
};

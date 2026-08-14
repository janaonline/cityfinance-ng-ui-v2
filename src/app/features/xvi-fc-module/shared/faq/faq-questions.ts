export type FaqQuestion = Readonly<{
  number: number;
  question: string;
  answer: string;
}>;

export type FaqSection = Readonly<{
  id: string;
  title: string;
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
];

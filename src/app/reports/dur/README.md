# DUR report download steps
**Steps:**

- Checkout to `durBulkPdfUpload` in old ui (https://github.com/janaonline/citifinance-ng-ui)
- Run the application, goto `Review Grant Application` and get the DUR response from `network` tab - `data[]`
- Copy and paste the response into ui-v2 in the file `cityfinance-ng-ui-v2\src\app\reports\dur\data\stateUlb.ts`
- Run v2 and open the link http://localhost:4300/reports/dur
- Enjoy :)
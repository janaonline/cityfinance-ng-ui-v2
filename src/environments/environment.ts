const baseUrl = window.location.origin;
//let baseUrl = 'http://localhost:8080';
let GoogleTagID = 'G-803HPPLFMM';
let isProduction: boolean = false;
let STORAGE_BASEURL = 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com';
let env = 'dev';

if (window.location.hostname.includes('staging')) {
  env = 'staging';
} else if (window.location.origin === 'https://cityfinance.in' || window.location.origin === 'https://www.cityfinance.in') {
  env = 'prod';
  isProduction = true;
  GoogleTagID = 'G-5Z5B41B3G4';
  STORAGE_BASEURL = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com';
}

export const environment = {
  api: {
    url: baseUrl + '/api/v1/',
    url2: baseUrl + '/api/v2/',
    url3: baseUrl + '/api/v3/',
  },
  prefixUrl: '/fc',
  environment: env,
  isProduction,
  versionCheckURL: baseUrl + '/version.json',
  STORAGE_BASEURL,
  googleAnalyticsId: GoogleTagID,
  storageType: 'S3Url', // 'S3Url' for S3 storage type, for azure change this to 'BlobUrl'
};

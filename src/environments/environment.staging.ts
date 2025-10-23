export const environment = {
  api: {
    url: 'https://staging.cityfinance.in/api/v1/',
    url2: 'https://staging.cityfinance.in/api/v2/',
    url3: 'https://staging.cityfinance.in/api/v3/',
  },
  prefixUrl: '',
  environment: 'staging_local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: 'G-803HPPLFMM',
  storageType: 'S3Url',
};

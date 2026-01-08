export const environment = {
  api: {
    url: 'http://localhost:8080/api/v1/',
    url2: 'http://localhost:8080/api/v2/',
    url3: 'http://localhost:8080/api/v3/',
  },
  prefixUrl: '',
  environment: 'local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: 'G-803HPPLFMM',
  storageType: 'S3Url',
};

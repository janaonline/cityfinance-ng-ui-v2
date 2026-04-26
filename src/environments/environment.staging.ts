const baseUrl = 'https://staging.cityfinance.in';
export const environment = {
  api: {
    url: baseUrl + '/api/v1/',
    url2: baseUrl + '/api/v2/',
    url3: baseUrl + '/api/v3/',
  },
  ui: { urlV1: baseUrl + '/v1/', urlV2: baseUrl + '/fc/' },
  environment: 'staging_local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: 'G-803HPPLFMM',
  storageType: 'S3Url',
  recaptchaSiteKey: '6LcT9_gUAAAAANrZM5TNnE4OEEC46iFDfcAHZ8lD',
};

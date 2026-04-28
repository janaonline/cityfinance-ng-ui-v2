const baseUrl = 'http://localhost:8080';
export const environment = {
  api: {
    url: 'http://localhost:8080/api/v1/',
    url2: 'http://localhost:3000/api/v2/',
    url3: 'http://localhost:8080/api/v3/',
  },
  ui: { urlV1: 'http://localhost:4200', urlV2: 'http://localhost:8080' },
  environment: 'local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  googleAnalyticsId: '',
  storageType: 'S3Url',
  recaptchaSiteKey: '6LcT9_gUAAAAANrZM5TNnE4OEEC46iFDfcAHZ8lD',
  captchaEnabled: false,
};

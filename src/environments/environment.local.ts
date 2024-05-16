export const environment = {
  api: {
    url: 'http://localhost:8080/api/v1/',
  },
  environment: 'local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  storageType: 'S3Url',
};
export const environment = {
  api: {
    url: 'https://staging.cityfinance.in/api/v1/',
  },
  environment: 'staging_local',
  isProduction: false,
  versionCheckURL: window.location.origin + '/version.json',
  STORAGE_BASEURL: 'https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com',
  storageType: 'S3Url',
};

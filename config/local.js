require('dotenv').config();

module.exports = {
  paths: {
    excel: process.env.EXCEL_PATH,
  },
  mycloud: {
    baseUrl: process.env.MYCLOUD_BASE_URL,
    folderId: process.env.MYCLOUD_FOLDER_ID,
    accessToken: process.env.MYCLOUD_ACCESS_TOKEN
  }

};

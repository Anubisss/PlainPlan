"use strict";

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  MYSQL_URI: process.env.MYSQL_URI,
  PORT: process.env.PORT || "3000",
  EMAIL_FROM_NAME: "PlainPlan",
  EMAIL_FROM_ADDRESS: "",
  AWS_SES_REGION: process.env.AWS_SES_REGION || "eu-west-1",
  WEB_APP_URL: "http://localhost:3001/",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "nzftgiEZgCy7Lm7owJIiR1PcRA3WISdF8iEMo215rqKcgOCTfeaAjsdPIDNHvej",
  ACCESS_TOKEN_EXPIRATION_IN_SECONDS: 60 * 60 * 24 * 7,
};

module.exports = config;

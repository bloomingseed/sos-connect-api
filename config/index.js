var dotenv = require("dotenv");
var _ = require("lodash");

const result = dotenv.config();

let envs;

if (!("error" in result)) {
  envs = result.parsed;
} else {
  envs = {};
  _.each(process.env, (value, key) => (envs[key] = value));
}
const env = process.env.NODE_ENV || "development";
var sequelizeConfig = {};
try{
  sequelizeConfig = require("./config.json")[env];
} catch(e){
  sequelizeConfig = JSON.parse(process.env.sequelizeConfig);
}
envs = { ...envs, env, sequelizeConfig };

console.log("env:", envs);

module.exports = envs;

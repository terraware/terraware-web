/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */

require('dotenv').config()

module.exports = (on, config) => {
  config.env.user = process.env.REACT_APP_TERRAWARE_API_DEFAULT_USER

  config.env.pass = process.env.REACT_APP_TERRAWARE_API_DEFAULT_PASS

  return config
}
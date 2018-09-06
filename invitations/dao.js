/*!
 * Copyright 2018 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const chalk = require("chalk");
const _ = require("underscore");
const logger = require("../logger");
const { Store } = require("../store");
const util = require("../util");

const clientOptions = {
    fetchSize: 999999,
    prepare: true
};

const copyAuthzInvitations = async function(source, target) {
    const query = `
      SELECT *
      FROM "AuthzInvitations"
      WHERE "resourceId"
      IN ?
      LIMIT ${clientOptions.fetchSize}`;
    const insertQuery = `
      INSERT INTO "AuthzInvitations" (
          "resourceId",
          email,
          "inviterUserId",
          role)
          VALUES (?, ?, ?, ?)`;

    let result = await source.client.execute(
        query,
        [Store.getAttribute("allResourceIds")],
        clientOptions
    );
    let invitationEmails = _.pluck(result.rows, "email");
    Store.setAttribute("allInvitationEmails", _.uniq(invitationEmails));

    async function insertAll(targetClient, rows) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            await targetClient.execute(
                insertQuery,
                [row.resourceId, row.email, row.inviterUserId, row.role],
                clientOptions
            );
        }
    }

    logger.info(
        `${chalk.green(`✓`)}  Fetched ${
            result.rows.length
        } AuthzInvitations rows found...`
    );
    if (_.isEmpty(result.rows)) {
        return;
    }
    await insertAll(target.client, result.rows);

    const queryResultOnSource = result;
    result = await target.client.execute(
        query,
        [Store.getAttribute("allResourceIds")],
        clientOptions
    );
    util.compareResults(queryResultOnSource.rows.length, result.rows.length);
};

const copyAuthzInvitationsResourceIdByEmail = async function(source, target) {
    if (_.isEmpty(Store.getAttribute("allInvitationEmails"))) {
        logger.info(
            chalk.cyan(
                `✗  Skipped fetching AuthzInvitationsResourceIdByEmail rows...\n`
            )
        );
        return [];
    }

    const query = `
      SELECT *
      FROM "AuthzInvitationsResourceIdByEmail"
      WHERE email
      IN ?
      LIMIT ${clientOptions.fetchSize}`;
    const insertQuery = `
      INSERT INTO "AuthzInvitationsResourceIdByEmail" (
          email,
          "resourceId")
          VALUES (?, ?)`;

    let result = await source.client.execute(
        query,
        [Store.getAttribute("allInvitationEmails")],
        clientOptions
    );

    async function insertAll(targetClient, rows) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            await targetClient.execute(
                insertQuery,
                [row.email, row.resourceId],
                clientOptions
            );
        }
    }
    logger.info(
        `${chalk.green(`✓`)}  Fetched ${
            result.rows.length
        } AuthzInvitationsResourceIdByEmail rows found...`
    );
    if (_.isEmpty(result.rows)) {
        return;
    }

    await insertAll(target.client, result.rows);

    const queryResultOnSource = result;
    result = await target.client.execute(
        query,
        [Store.getAttribute("allInvitationEmails")],
        clientOptions
    );
    util.compareResults(queryResultOnSource.rows.length, result.rows.length);
};

const copyAuthzInvitationsTokenByEmail = async function(source, target) {
    if (_.isEmpty(Store.getAttribute("allInvitationEmails"))) {
        logger.info(
            chalk.cyan(
                `✗  Skipped fetching AuthzInvitationsTokenByEmail rows...\n`
            )
        );
        return [];
    }
    const query = `
      SELECT * FROM "AuthzInvitationsTokenByEmail"
      WHERE email
      IN ?
      LIMIT ${clientOptions.fetchSize}`;
    const insertQuery = `
      INSERT INTO "AuthzInvitationsTokenByEmail" (
          email,
          "token")
          VALUES (?, ?)`;

    result = await source.client.execute(
        query,
        [Store.getAttribute("allInvitationEmails")],
        clientOptions
    );
    let allInvitationTokens = _.pluck(result.rows, "token");
    Store.setAttribute("allInvitationTokens", _.uniq(allInvitationTokens));

    async function insertAll(targetClient, rows) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            await targetClient.execute(
                insertQuery,
                [row.email, row.token],
                clientOptions
            );
        }
    }
    logger.info(
        `${chalk.green(`✓`)}  Fetched ${
            result.rows.length
        } AuthzInvitationsTokenByEmail rows...`
    );
    if (_.isEmpty(result.rows)) {
        return;
    }

    await insertAll(target.client, result.rows);

    const queryResultOnSource = result;
    result = await target.client.execute(
        query,
        [Store.getAttribute("allInvitationEmails")],
        clientOptions
    );
    util.compareResults(queryResultOnSource.rows.length, result.rows.length);
};

const copyAuthzInvitationsEmailByToken = async function(source, target) {
    if (_.isEmpty(Store.getAttribute("allInvitationTokens"))) {
        logger.info(
            chalk.cyan(
                `✗  Skipped fetching AuthzInvitationsEmailByToken rows...\n`
            )
        );
        return [];
    }

    const query = `
      SELECT *
      FROM "AuthzInvitationsEmailByToken"
      WHERE "token"
      IN ?
      LIMIT ${clientOptions.fetchSize}`;
    const insertQuery = `
      INSERT INTO "AuthzInvitationsEmailByToken" (
          "token",
          email)
          VALUES (?, ?)`;

    let result = await source.client.execute(
        query,
        [Store.getAttribute("allInvitationTokens")],
        clientOptions
    );

    async function insertAll(targetClient, rows) {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            await targetClient.execute(
                insertQuery,
                [row.token, row.email],
                clientOptions
            );
        }
    }

    logger.info(
        `${chalk.green(`✓`)}  Fetched ${
            result.rows.length
        } AuthzInvitationsEmailByToken rows...`
    );
    if (_.isEmpty(result.rows)) {
        return;
    }
    await insertAll(target.client, result.rows);

    const queryResultOnSource = result;
    result = await target.client.execute(
        query,
        [Store.getAttribute("allInvitationTokens")],
        clientOptions
    );
    util.compareResults(queryResultOnSource.rows.length, result.rows.length);
};

module.exports = {
    copyAuthzInvitations,
    copyAuthzInvitationsEmailByToken,
    copyAuthzInvitationsResourceIdByEmail,
    copyAuthzInvitationsTokenByEmail
};

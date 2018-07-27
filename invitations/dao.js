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
let store = require("../store");

const selectAuthzInvitations = function(sourceClient) {
    let query = `SELECT * FROM "AuthzInvitations" WHERE "resourceId" IN ?`;
    return sourceClient.execute(query, [store.allResourceIds]);
};

const insertAuthzInvitations = async function(targetClient, result) {
    if (_.isEmpty(result.rows)) {
        logger.info(`${chalk.green(`✓`)}  No AuthzInvitations rows found...`);
        return;
    }

    store.allInvitationEmails = _.pluck(result.rows, "email");
    let allInserts = [];
    result.rows.forEach(row => {
        allInserts.push({
            query: `INSERT INTO "AuthzInvitations" ("resourceId", email, "inviterUserId", role) VALUES (?, ?, ?, ?)`,
            params: [row.resourceId, row.email, row.inviterUserId, row.role]
        });
    });
    logger.info(`${chalk.green(`✓`)}  Inserting AuthzInvitations...`);
    await targetClient.batch(allInserts, { prepare: true });
};

const selectAuthzInvitationsResourceIdByEmail = function(sourceClient) {
    if (_.isEmpty(store.allInvitationEmails)) {
        return [];
    }
    let query = `SELECT * FROM "AuthzInvitationsResourceIdByEmail" WHERE email IN ?`;
    return sourceClient.execute(query, [store.allInvitationEmails]);
};

const insertAuthzInvitationsResourceIdByEmail = async function(
    targetClient,
    result
) {
    if (_.isEmpty(result.rows)) {
        logger.info(
            `${chalk.green(
                `✓`
            )}  No AuthzInvitationsResourceIdByEmail rows found...`
        );
        return;
    }

    let allInserts = [];
    result.rows.forEach(row => {
        allInserts.push({
            query: `INSERT INTO "AuthzInvitationsResourceIdByEmail" (email, "resourceId") VALUES (?, ?)`,
            params: [row.email, row.resourceId]
        });
    });
    logger.info(
        `${chalk.green(`✓`)}  Inserting AuthzInvitationsResourceIdByEmail...`
    );
    await targetClient.batch(allInserts, { prepare: true });
};

const selectAuthzInvitationsTokenByEmail = function(sourceClient) {
    if (_.isEmpty(store.allInvitationEmails)) {
        return [];
    }
    let query = `SELECT * FROM "AuthzInvitationsTokenByEmail" WHERE email IN ?`;
    return sourceClient.execute(query, [store.allInvitationEmails]);
};

const insertAuthzInvitationsTokenByEmail = async function(
    targetClient,
    result
) {
    store.allInvitationTokens = [];
    if (_.isEmpty(result.rows)) {
        logger.info(
            `${chalk.green(`✓`)}  No AuthzInvitationsTokenByEmail rows found...`
        );
        return;
    }

    store.allInvitationTokens = _.pluck(result.rows, "token");
    let allInserts = [];
    result.rows.forEach(row => {
        allInserts.push({
            query: `INSERT INTO "AuthzInvitationsTokenByEmail" (email, "token") VALUES (?, ?)`,
            params: [row.email, row.token]
        });
    });
    logger.info(
        `${chalk.green(`✓`)}  Inserting AuthzInvitationsTokenIdByEmail...`
    );
    await targetClient.batch(allInserts, { prepare: true });
};
const selectAuthzInvitationsEmailByToken = function(sourceClient) {
    if (_.isEmpty(store.allInvitationTokens)) {
        return [];
    }
    let query = `SELECT * FROM "AuthzInvitationsEmailByToken" WHERE "token" IN ?`;
    return sourceClient.execute(query, [store.allInvitationTokens]);
};

const insertAuthzInvitationsEmailByToken = async function(
    targetClient,
    result
) {
    if (_.isEmpty(result.rows)) {
        logger.info(
            `${chalk.green(`✓`)}  No AuthzInvitationsEmailByToken rows found...`
        );
        return;
    }

    let allInserts = [];
    result.rows.forEach(row => {
        allInserts.push({
            query: `INSERT INTO "AuthzInvitationsEmailByToken" ("token", email) VALUES (?, ?)`,
            params: [row.token, row.email]
        });
    });
    logger.info(
        `${chalk.green(`✓`)}  Inserting AuthzInvitationsEmailByToken...`
    );
    await targetClient.batch(allInserts, { prepare: true });
};

module.exports = {
    selectAuthzInvitations,
    selectAuthzInvitationsEmailByToken,
    selectAuthzInvitationsResourceIdByEmail,
    selectAuthzInvitationsTokenByEmail,
    insertAuthzInvitations,
    insertAuthzInvitationsEmailByToken,
    insertAuthzInvitationsResourceIdByEmail,
    insertAuthzInvitationsTokenByEmail
};
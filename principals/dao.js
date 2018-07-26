const chalk = require("chalk");
const _ = require("underscore");
const logger = require("../logger");
let store = require("../store");
let sourceDatabase = store.sourceDatabase;
let targetDatabase = store.targetDatabase;

const selectAllPrincipals = function(sourceClient) {
    let query = `SELECT * FROM "Principals" WHERE "tenantAlias" = ?`;
    return sourceClient.execute(query, [sourceDatabase.tenantAlias]);
};

const insertAllPrincipals = async function(targetClient, result) {
    if (_.isEmpty(result.rows)) {
        logger.info(`${chalk.green(`✓`)}  No Principals rows found...`);
        return;
    }

    // we'll need to know which principals are users or groups
    result.rows.forEach(row => {
        store.tenantPrincipals.push(row.principalId);
        if (row.principalId.startsWith("g")) {
            store.tenantGroups.push(row.principalId);
        } else if (row.principalId.startsWith("u")) {
            store.tenantUsers.push(row.principalId);
        }
    });

    let allInserts = [];
    result.rows.forEach(row => {
        let insertQuery = `INSERT INTO "Principals" ("principalId", "acceptedTC", "admin:global", "admin:tenant", created, "createdBy", deleted, description, "displayName", email, "emailPreference", joinable, "largePictureUri", "lastModified", locale, "mediumPictureUri", "notificationsLastRead", "notificationsUnread", "publicAlias", "smallPictureUri", "tenantAlias", visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        allInserts.push({
            query: insertQuery,
            params: [
                row.principalId,
                row.acceptedTC,
                row.get("admin:global"),
                row.get("admin:tenant"),
                row.created,
                row.createdBy,
                row.deleted,
                row.description,
                row.displayName,
                row.email,
                row.emailPreference,
                row.joinable,
                row.largePictureUri,
                row.lastModified,
                row.locale,
                row.mediumPictureUri,
                row.notificationsLastRead,
                row.notificationsUnread,
                row.publicAlias,
                row.smallPictureUri,
                row.tenantAlias,
                row.visibility
            ]
        });
    });
    logger.info(`${chalk.green(`✓`)}  Inserting Principals...`);
    await targetClient.batch(allInserts, { prepare: true });
};

const selectPrincipalsByEmail = function(sourceClient) {
    let query = `SELECT * FROM "PrincipalsByEmail" WHERE "principalId" IN ? ALLOW FILTERING`;
    return sourceClient.execute(query, [store.tenantPrincipals]);
};

const insertAllPrincipalsByEmail = async function(targetClient, result) {
    if (_.isEmpty(result.rows)) {
        logger.info(`${chalk.green(`✓`)}  No PrincipalsByEmail rows found...`);
        return;
    }

    let allInserts = [];
    result.rows.forEach(row => {
        allInserts.push({
            query: `INSERT INTO "PrincipalsByEmail" (email, "principalId") VALUES (?, ?)`,
            params: [row.email, row.principalId]
        });
    });
    logger.info(`${chalk.green(`✓`)}  Inserting PrincipalsByEmail...`);
    await targetClient.batch(allInserts, { prepare: true });
};

module.exports = {
    insertAllPrincipals,
    insertAllPrincipalsByEmail,
    selectAllPrincipals,
    selectPrincipalsByEmail
};

/**
 * Part of beWork, NorJS Timecard Sample App for NorJS Edge Backend.
 *
 * Commercial dual licence option available from Sendanor.com.
 * 
 * @license GPL
 * @file
 */

/**
 * Action types
 *
 * @enum {string}
 * @readonly
 */
export const BeWorkAction = {

    /**
     * @member {BeWorkAction|string}
     */
    CREATE_PROJECT : "createProject",

    /**
     * @member {BeWorkAction|string}
     */
    EDIT_PROJECT : "editProject",

    /**
     * @member {BeWorkAction|string}
     */
    LIST_PROJECTS : "listProjects",

    /**
     * @member {BeWorkAction|string}
     */
    LIST_RECORDS : "listRecords",

    /**
     * @member {BeWorkAction|string}
     */
    START_NEW_RECORD : "startNewRecord",

    /**
     * @member {BeWorkAction|string}
     */
    STOP_RECORD : "stopRecord",

    /**
     * @member {BeWorkAction|string}
     */
    EDIT_RECORD : "editRecord",

    /**
     * @member {BeWorkAction|string}
     */
    DELETE_RECORD : "deleteRecord"

};

// noinspection JSUnusedGlobalSymbols
export default BeWorkAction;

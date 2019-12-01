/**
 * Part of beWork, NorJS Timecard Sample App for NorJS Edge Backend.
 * 
 * Commercial dual licence option available from Sendanor.com.
 * 
 * @license GPL
 * @file
 */

import BeViewControllerName from "../BeViewControllerName";
import LogUtils from "@norjs/utils/Log";
import { NrRequest, NrRequestMethod } from "@norjs/ui/models/NrRequest";
import _ from 'lodash';
import BeWorkRecord from "./BeWorkRecord";
import NrTimecardService from "@norjs/timecard-service";
import { TIMECARD_PGCONFIG } from "../../be-env";
import BeWorkAction from "./BeWorkAction";
import { BeWorkProject } from "./BeWorkProject";
import AssertUtils from "@norjs/utils/src/AssertUtils";
import BeWorkViewName from "./BeWorkViewName";
import moment from "moment";

/**
 *
 * @type {NrTimecardService}
 */
const TIMECARD_SERVICE = new NrTimecardService(TIMECARD_PGCONFIG);

const nrLog = LogUtils.getLogger(BeViewControllerName.CHAT);

/**
 * The response to the view controller's renderer
 *
 * @typedef {Object} BeWorkViewResponse
 * @property [view] {BeWorkViewName|undefined} The view name
 * @property [date] {string|undefined} The date to display for records view
 * @property [project] {BeWorkProject|undefined} The project
 */

/**
 * @implements {NrViewController}
 */
export class BeWorkViewController {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return BeViewControllerName.WORK_TIME;
    }

    /**
     * This is a helper function for the static class.
     *
     * @returns {typeof BeWorkViewController}
     */
    get Class () {
        return BeWorkViewController;
    }

    /**
     * The name of the class.
     *
     * @returns {string}
     */
    get nrName () {
        return this.Class.nrName;
    }

    /**
     *
     */
    constructor () {

        /**
         *
         * @member {NrSession}
         * @private
         */
        this._session = undefined;

        /**
         *
         * @member {BeEventManager|undefined}
         * @private
         */
        this._eventManager = undefined;

    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * NorJS uses this to bind the session. See ./beWorkViewModule.js
     *
     * @param session {NrSession}
     */
    setSession (session) {

        if (session !== this._session) {

            this._session = session;

            nrLog.trace(`Session set as `, session);

        }

    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * NorJS binds the eventManager throught this method
     *
     * @param eventManager {BeEventManager}
     */
    setEventManager (eventManager) {

        if (this._eventManager !== eventManager) {

            this._eventManager = eventManager;

        }

    }

    /**
     *
     */
    init () {



    }

    /**
     *
     */
    destroy () {

        this._session = undefined;
        this._eventManager = undefined;

    }

    /**
     *
     * @returns {boolean}
     */
    isAuthenticated () {

        return this._session ? this._session.isAuthenticated() : false;

    }

    /**
     *
     * @returns {boolean}
     */
    hasSession () {

        return !!this._session;

    }

    /**
     *
     * @param request {NrRequest}
     * @return {Promise<BeWorkViewResponse>}
     */
    async onRequest (request) {

        if (request.method === NrRequestMethod.GET) {
            return {view: undefined};
        }

        nrLog.trace(`request.method = `, request.method);

        const action = _.get(request, 'payload.action');

        switch (action) {

            case BeWorkAction.LIST_PROJECTS:
                return {view: BeWorkViewName.LIST_PROJECTS};

            case BeWorkAction.LIST_RECORDS:
                const date = _.get(request, 'payload.date');
                const projectId = _.get(request, 'payload.project.id');
                if (!projectId) {
                    return {view: BeWorkViewName.LIST_PROJECTS, date};
                }
                const project = await this.getProject(projectId);
                return {view: BeWorkViewName.LIST_RECORDS, date, project};

            case BeWorkAction.CREATE_PROJECT:
                return await this._createProject(request);

            case BeWorkAction.EDIT_PROJECT:
                return await this._editProject(request);

            case BeWorkAction.START_NEW_RECORD:
                return await this._startNewRecord(request);

            case BeWorkAction.STOP_RECORD:
                return await this._stopRecord(request);

            case BeWorkAction.EDIT_RECORD:
                return await this._editRecord(request);

            case BeWorkAction.DELETE_RECORD:
                return await this._deleteRecord(request);

        }

        return {view: undefined};

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise<BeWorkViewResponse>}
     * @private
     */
    async _createProject (request) {

        const label = _.get(request, 'payload.label');
        const clientId = _.get(request, 'payload.clientId');
        const lunchMinutes = _.get(request, 'payload.lunchMinutes');

        AssertUtils.isStringWithMinLength(label, 1);
        AssertUtils.isString(clientId);
        AssertUtils.isNumber(lunchMinutes);

        await TIMECARD_SERVICE.createProject(
            this.getUserId(),
            label,
            clientId,
            lunchMinutes
        );

        return {view: BeWorkViewName.LIST_PROJECTS};

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise.<BeWorkViewResponse>}
     * @private
     */
    async _editProject (request) {

        const project = _.get(request, 'payload.project');

        const label = _.get(request, 'payload.label');
        const clientId = _.get(request, 'payload.clientId');
        const lunchMinutes = _.get(request, 'payload.lunchMinutes');

        AssertUtils.isStringWithMinLength(label, 1);
        AssertUtils.isString(clientId);
        AssertUtils.isNumber(lunchMinutes);

        // FIXME: Verify that this project belongs to the same user

        const updatedRecord = await TIMECARD_SERVICE.updateProject(
            project.id,
            {
                label,
                clientId,
                lunchMinutes
            }
        );

        nrLog.trace(`${this.nrName}._editProject(): Updated as `, updatedRecord);

        return {view: BeWorkViewName.LIST_PROJECTS};

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise<BeWorkViewResponse>}
     * @private
     */
    async _startNewRecord (request) {

        let date = _.get(request, 'payload.date');

        const project = _.get(request, 'payload.project');

        // FIXME: Make sure this project belongs to this user

        const userId = this.getUserId();

        const projectId = project.id;

        const description = '';

        const lunchMinutes = project.lunchMinutes;

        const isSameDay = this.isSameDay(date);

        if (!isSameDay) {
            date = date ? moment(date).set({hour:8,minute:0,second:0,millisecond:0}).toISOString() : undefined;
        }

        const record = await TIMECARD_SERVICE.createRecord(
            userId,
            projectId,
            date ? date : TIMECARD_SERVICE.NOW,
            isSameDay ? undefined : (date ? date : undefined),
            description,
            lunchMinutes
        );

        return {
            view: BeWorkViewName.LIST_RECORDS,
            date,
            project: await this.getProject(projectId)
        };

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise<BeWorkViewResponse>}
     * @private
     */
    async _stopRecord (request) {

        const date = _.get(request, 'payload.date');

        const record = _.get(request, 'payload.record');

        nrLog.trace(`${this.nrName}._stopRecord(): record = `, record);

        if (!record) {
            throw new TypeError(`${this.nrName}._stopRecord(): No current period`);
        }

        if (!record.id) {
            throw new TypeError(`${this.nrName}._stopRecord(): No current period id`);
        }

        const updatedRecord = await TIMECARD_SERVICE.updateRecord(
            record.id,
            {
                endTime: TIMECARD_SERVICE.NOW
            }
        );

        return {
            view: BeWorkViewName.LIST_RECORDS,
            date,
            project: await this.getProject(updatedRecord.projectId)
        };

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise.<BeWorkViewResponse>}
     * @private
     */
    async _editRecord (request) {

        const record = _.get(request, 'payload.record');

        AssertUtils.isObject(record);
        AssertUtils.isUuidString(record.id);

        const startTime = _.get(request, 'payload.startTime');
        const endTime = _.get(request, 'payload.endTime');
        const description = _.get(request, 'payload.description');
        const lunchMinutes = _.get(request, 'payload.lunchMinutes');

        AssertUtils.isDateString(startTime);
        AssertUtils.isDateString(endTime);
        AssertUtils.isString(description);
        AssertUtils.isNumber(lunchMinutes);


        // FIXME: Verify that this record belongs to the same user

        const updatedRecord = await TIMECARD_SERVICE.updateRecord(
            record.id,
            {
                startTime,
                endTime,
                description,
                lunchMinutes
            }
        );

        nrLog.trace(`${this.nrName}._updateRecord(): Updated as `, updatedRecord);

        return {
            view: BeWorkViewName.LIST_RECORDS,
            date: updatedRecord.startTime,
            project: await this.getProject(updatedRecord.projectId)
        };

    }

    /**
     *
     * @param request {NrRequest}
     * @returns {Promise.<BeWorkViewResponse>}
     * @private
     */
    async _deleteRecord (request) {

        const record = _.get(request, 'payload.record');

        nrLog.trace(`${this.nrName}._deleteRecord(): record = `, record);

        if (!record) {
            throw new TypeError(`${this.nrName}._deleteRecord(): No current period`);
        }

        if (!record.id) {
            throw new TypeError(`${this.nrName}._deleteRecord(): No current period id`);
        }

        // FIXME: Verify that this record belongs to the same user

        const updatedRecord = await TIMECARD_SERVICE.updateRecord(
            record.id,
            {
                deleted: true
            }
        );

        nrLog.trace(`${this.nrName}._deleteRecord(): Deleted as `, updatedRecord);

        return {
            view: BeWorkViewName.LIST_RECORDS,
            date: updatedRecord.startTime,
            project: await this.getProject(record.projectId)
        };

    }

    /**
     *
     * @returns {string}
     */
    getUserId () {
        return _.get(this._session, 'user.id');
    }

    /**
     *
     * @param projectId {string}
     * @returns {Promise<BeWorkProject | undefined>}
     */
    async getProject (projectId) {

        const project = await TIMECARD_SERVICE.fetchProject(projectId);

        if (project === undefined) {
            return undefined;
        }

        return new BeWorkProject({
            id: project.id,
            userId: project.userId,
            clientId: project.clientId,
            label: project.label,
            lunchMinutes: project.lunchMinutes
        });

    }

    /**
     *
     * @returns {Promise<BeWorkProject|undefined>}
     */
    async getLatestProject () {

        const project = await TIMECARD_SERVICE.getUsersLatestProject(this.getUserId());

        if (project === undefined) {
            return undefined;
        }

        return new BeWorkProject({
            id: project.id,
            userId: project.userId,
            clientId: project.clientId,
            label: project.label,
            lunchMinutes: project.lunchMinutes
        });

    }

    /**
     *
     * @returns {Promise<Array.<BeWorkProject>>}
     */
    async getProjects () {

        /**
         *
         * @type {Array<NrTimecardProject>}
         */
        const projects = await TIMECARD_SERVICE.searchProjects(this.getUserId());

        return _.map(
            projects,
            project => new BeWorkProject({
                id: project.id,
                userId: project.userId,
                clientId: project.clientId,
                label: project.label,
                lunchMinutes: project.lunchMinutes
            })
        );

    }

    /**
     *
     * @param projectId {string}
     * @param date {string}
     * @returns {Promise<Array.<BeWorkRecord>>}
     */
    async getRecords (projectId, date) {

        AssertUtils.isUuidString(projectId);

        /**
         *
         * @type {Array<NrTimecardRecord>}
         */
        const records = await TIMECARD_SERVICE.searchRecords(
            this.getUserId(),
            projectId,
            moment(date).startOf('day').toISOString(),
            moment(date).endOf('day').toISOString()
        );

        return _.map(
            records,
            record => new BeWorkRecord({
                id: record.id,
                userId: record.userId,
                projectId: record.projectId,
                startTime: record.startTime ? record.startTime : undefined,
                endTime: record.endTime ? record.endTime : undefined,
                description: record.description,
                lunchMinutes: record.lunchMinutes
            })
        );

    }

    getShortWeekDay (date) {
        return `common.weekday.short.${_.toLower(moment(date).format("dddd"))}`;
    }

    getDateString (date) {
        return moment(date).format("D.M.Y");
    }

    getHoursString (date) {
        return moment(date).format("HH:mm");
    }

    isSameDay (date) {
        return date ? moment(date).isSame(new Date(), "day") : true;
    }

}

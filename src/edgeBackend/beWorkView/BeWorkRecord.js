/**
 * Part of beWork, NorJS Timecard Sample App for NorJS Edge Backend.
 * 
 * Commercial dual licence option available from Sendanor.com.
 * 
 * @license GPL
 * @file
 */

import _ from "lodash";
import moment from "moment";
import WaObjectType from "../../../../WaObjectType";
import AssertUtils from "@norjs/utils/src/AssertUtils";

/**
 * This is a data model for a work period.
 *
 * @implements {NrModel}
 */
export class BeWorkRecord {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return WaObjectType.WORK_RECORD;
    }

    /**
     *
     * @returns {typeof BeWorkRecord}
     */
    get Class () {
        return BeWorkRecord;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @returns {string}
     */
    get nrName () {
        return this.Class.nrName;
    }

    /**
     *
     * @param id {string}
     * @param userId {string}
     * @param projectId {string}
     * @param [startTime] {string}
     * @param [endTime] {*|undefined}
     * @param [description] {string}
     * @param [lunchMinutes] {number}
     */
    constructor ({
        id,
        userId,
        projectId,
        startTime = undefined,
        endTime = undefined,
        description = undefined,
        lunchMinutes = undefined
    } = {}) {

        if ( !( id && _.isString(id) ) ) {
            throw new TypeError(`new ${BeWorkRecord.nrName}(): id invalid: "${id}"`);
        }

        if ( !( userId && _.isString(userId) ) ) {
            throw new TypeError(`new ${BeWorkRecord.nrName}(): userId invalid: "${userId}"`);
        }

        if ( !( projectId && _.isString(projectId) ) ) {
            throw new TypeError(`new ${BeWorkRecord.nrName}(): projectId invalid: "${projectId}"`);
        }

        if (startTime !== undefined) AssertUtils.isDateString(startTime);
        if (endTime !== undefined) AssertUtils.isDateString(endTime);
        if (description !== undefined) AssertUtils.isString(description);
        if (lunchMinutes !== undefined) AssertUtils.isNumber(lunchMinutes);

        /**
         *
         * @member {string}
         * @protected
         */
        this._id = id;

        /**
         *
         * @member {string}
         * @protected
         */
        this._userId = userId;

        /**
         *
         * @member {string}
         * @protected
         */
        this._projectId = projectId;

        /**
         *
         * @member {string}
         * @protected
         */
        this._startTime = startTime;

        /**
         *
         * @member {string}
         * @private
         */
        this._endTime = endTime;

        /**
         *
         * @member {string}
         * @private
         */
        this._description = description;

        /**
         *
         * @member {number}
         * @private
         */
        this._lunchMinutes = lunchMinutes;

    }

    /**
     *
     * @returns {string}
     */
    get type () {
        return WaObjectType.WORK_RECORD;
    }

    /**
     *
     * @returns {string}
     */
    get id () {
        return this._id;
    }

    /**
     *
     * @returns {string}
     */
    get userId () {
        return this._userId;
    }

    /**
     *
     * @returns {string}
     */
    get projectId () {
        return this._projectId;
    }

    /**
     *
     * @returns {string}
     */
    get startTime () {
        return this._startTime;
    }

    /**
     *
     * @returns {string|undefined}
     */
    get endTime () {
        return this._endTime;
    }

    /**
     *
     * @returns {string|undefined}
     */
    get description () {
        return this._description;
    }

    /**
     *
     * @returns {number|undefined}
     */
    get lunchMinutes () {
        return this._lunchMinutes;
    }

    /**
     * Total hours without lunch time
     *
     * @returns {number}
     */
    get hours () {

        const duration = moment.duration(moment(this._endTime ? this._endTime : Date.now()).diff(moment(this._startTime)));

        const hours = duration.asHours() - (this.lunchMinutes / 60);

        return hours < 0 ? 0 : hours;

    }

    /**
     *
     * @returns {Object}
     */
    valueOf () {
        return {
            type: this.type,
            id: this._id,
            userId: this._userId,
            projectId: this._projectId,
            startTime: this._startTime,
            endTime: this._endTime,
            description: this._description,
            lunchMinutes: this._lunchMinutes
        };
    }

    /**
     *
     * @returns {Object}
     */
    toJSON () {
        return this.valueOf();
    }

    /**
     *
     * @param modelValue {*}
     * @returns {BeWorkRecord}
     */
    static parseValue (modelValue) {

        if ( !modelValue ) {
            throw new TypeError(`${this.nrName}.parseValue(): modelValue was not defined`);
        }

        if ( modelValue instanceof BeWorkRecord ) {
            return modelValue;
        }

        const {
            type
            , id
            , userId
            , projectId
            , startTime
            , endTime
            , description
            , lunchMinutes
        } = modelValue;

        if ( type !== WaObjectType.WORK_RECORD ) {
            throw new TypeError(`${this.nrName}.parseValue(): value's type is not correct: "${type}"`);
        }

        return new BeWorkRecord({
            id           : id,
            userId       : userId,
            projectId    : projectId,
            startTime    : startTime,
            endTime      : endTime,
            description  : description,
            lunchMinutes : lunchMinutes
        });

    }

}

// noinspection JSUnusedGlobalSymbols
export default BeWorkRecord;

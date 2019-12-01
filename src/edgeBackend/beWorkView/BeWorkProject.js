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
export class BeWorkProject {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return WaObjectType.WORK_PROJECT;
    }

    /**
     *
     * @returns {typeof BeWorkProject}
     */
    get Class () {
        return BeWorkProject;
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
     * @param clientId {string}
     * @param [label] {string}
     * @param [lunchMinutes] {number}
     */
    constructor ({
        id,
        userId,
        clientId = undefined,
        label = undefined,
        lunchMinutes = undefined
    } = {}) {

        AssertUtils.isUuidString(id);
        AssertUtils.isUuidString(userId);
        if (clientId !== undefined) AssertUtils.isString(clientId);
        if (label !== undefined) AssertUtils.isString(label);
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
        this._clientId = clientId;

        /**
         *
         * @member {string}
         * @private
         */
        this._label = label;

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
        return WaObjectType.WORK_PROJECT;
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
    get clientId () {
        return this._clientId;
    }

    /**
     *
     * @returns {string|undefined}
     */
    get label () {
        return this._label;
    }

    /**
     *
     * @returns {string|undefined}
     */
    get lunchMinutes () {
        return this._lunchMinutes;
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
            clientId: this._clientId,
            label: this._label,
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
     * @returns {BeWorkProject}
     */
    static parseValue (modelValue) {

        if ( !modelValue ) {
            throw new TypeError(`${this.nrName}.parseValue(): modelValue was not defined`);
        }

        if ( modelValue instanceof BeWorkProject ) {
            return modelValue;
        }

        const {
            type
            , id
            , userId
            , clientId
            , label
            , lunchMinutes
        } = modelValue;

        if ( type !== WaObjectType.WORK_PROJECT ) {
            throw new TypeError(`${this.nrName}.parseValue(): value's type is not correct: "${type}"`);
        }

        return new BeWorkProject({
            id           : id,
            userId       : userId,
            clientId     : clientId,
            label        : label,
            lunchMinutes : lunchMinutes
        });

    }

}

// noinspection JSUnusedGlobalSymbols
export default BeWorkProject;

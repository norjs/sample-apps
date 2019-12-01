/**
 * Part of beWork, NorJS Timecard Sample App for NorJS Edge Backend.
 * 
 * Commercial dual licence option available from Sendanor.com.
 * 
 * @license GPL
 * @file
 */

import _ from 'lodash';
import LogUtils from "@norjs/utils/Log";
import {NrDiv} from "@norjs/ui/models/views/NrDiv";
import NrIconValue from "@norjs/ui/models/NrIconValue";
import WaId from "../../../../WaId";
import {NrIcon} from "@norjs/ui/models/NrIcon";
import {NrForm} from "@norjs/ui/models/views/NrForm";
import NrTextField from "@norjs/ui/models/views/fields/NrTextField";
import {NrRequest} from "@norjs/ui/models/NrRequest";
import BePath from "../BePath";
import WaTranslation from "../../../../WaTranslation";
import NrButton from '@norjs/ui/models/views/NrButton';
import { NrDateTimeField } from "@norjs/ui/models/views/fields/NrDateTimeField";
import { NrGrid } from "@norjs/ui/models/views/NrGrid";
import BeWorkAction from "./BeWorkAction";
import { NrNumberField } from "@norjs/ui/models/views/fields/NrNumberField";
import BeWorkViewName from "./BeWorkViewName";
import moment from "moment";

const nrLog = LogUtils.getLogger("BeWorkViewTemplate");

/**
 * @implements {NrViewTemplate}
 */
export class BeWorkViewTemplate {

    /**
     *
     * @returns {string}
     */
    static get nrName () {
        return "BeWorkViewTemplate";
    }

    /**
     *
     * @returns {typeof BeWorkViewTemplate}
     */
    get Class () {
        return BeWorkViewTemplate;
    }

    /**
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
         * @member {BeWorkViewController|undefined}
         * @private
         */
        this._controller = undefined;

    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param controller {BeWorkViewController}
     */
    setController (controller) {

        if (controller !== this._controller) {

            this._controller = controller;

            nrLog.trace(`Controller set as `, controller);

        }

    }

    /**
     * Init is called when the view template initializes for the first time
     */
    init () {

    }

    /**
     * Destroy is called after the session is destroyed.
     */
    destroy () {

        this._controller = undefined;

    }

    /**
     * Called each time the view is rendered.
     *
     * @param view {string|undefined}
     * @param project {BeWorkProject|undefined}
     * @param date {string|undefined}
     * @returns {Promise<NrModel | NrDiv | NrDiv>}
     */
    async render (
        {
            view = undefined,
            project = undefined,
            date = undefined
        } = {}
    ) {

        if (!date) {
            date = moment().toISOString();
        }

        if (!this._controller) {
            throw new TypeError(`${this.nrName}.render(): No controller`);
        }

        if ( !this._controller.isAuthenticated() ) {
            // FIXME: Send an error message instead @see https://github.com/norjs/work-assistant/issues/22
            return new NrDiv({
                content: []
            });
        }

        nrLog.trace(`Rendering authenticated view`);

        if (view === BeWorkViewName.LIST_PROJECTS) {

            /**
             *
             * @type {Array<BeWorkProject>}
             */
            const projects = await this._controller.getProjects();

            return this._renderProjectsView(projects);

        }

        if (view === BeWorkViewName.LIST_RECORDS && project) {

            const records = await this._controller.getRecords(project.id, date);

            return this._renderRecordsView(project, date, records);

        }

        const latestProject = await this._controller.getLatestProject();

        if (latestProject) {

            const records = await this._controller.getRecords(latestProject.id, date);

            return this._renderRecordsView(latestProject, date, records);

        }

        /**
         *
         * @type {Array<BeWorkProject>}
         */
        const projects = await this._controller.getProjects();

        if (projects.length === 1) {

            const records = await this._controller.getRecords(projects[0].id, date);

            return this._renderRecordsView(projects[0], date, records);

        }

        return this._renderProjectsView(projects);

    }

    /**
     * Called each time the view is rendered.
     *
     * @param projects {Array.<BeWorkProject>}
     * @returns {NrDiv}
     */
    _renderProjectsView (projects) {

        return new NrDiv({
            id: WaId.WORK_VIEW,
            content: [

                new NrGrid({
                    id: 'projects-view-buttons',
                    columns: [
                        "auto",
                        ""
                    ],
                    content: [
                        [

                            new NrTextField({
                                id: 'listProjects',
                                icon: new NrIcon({
                                    value: NrIconValue.LIST
                                }),
                                placeholder: WaTranslation.WORK_RECORD_LIST_PROJECTS_BUTTON_LABEL,
                                readOnly: true
                            }),

                            new NrButton({
                                id: 'newProject',
                                name: 'newProject',
                                style: NrButton.Style.ACCEPT,
                                label: WaTranslation.WORK_RECORD_CREATE_PROJECT_BUTTON_LABEL,
                                icon: new NrIcon({
                                    value: NrIconValue.PLUS
                                }),
                                click: this._createProjectForm()
                            })

                        ]
                    ]
                }),

                this._renderProjectGrid(projects)

            ]

        });

    }

    /**
     * Renders the view for records
     *
     * @param project {BeWorkProject}
     * @param date {string}
     * @param records {Array<BeWorkRecord>}
     * @returns {NrDiv}
     */
    _renderRecordsView (project, date, records) {

        const isSameDay = this._controller.isSameDay(date);

        const totalHours = _.reduce(records, (sum, record) => sum + record.hours, 0);

        return new NrDiv({
            id: WaId.WORK_VIEW,
            content:
                _.concat(

                    new NrGrid({
                        id: 'work-records-buttons',
                        columns: [
                            "",
                            "auto",
                            ""
                        ],
                        content: [
                            [

                                new NrButton({
                                    id: 'listProjects',
                                    style: NrButton.Style.DEFAULT,
                                    label: WaTranslation.WORK_RECORD_LIST_PROJECTS_BUTTON_LABEL,
                                    icon: new NrIcon({
                                        value: NrIconValue.BACK
                                    }),
                                    click: this._goListProjectsView()
                                }),

                                new NrTextField({
                                    value: project.label,
                                    icon: new NrIcon({
                                        value: NrIcon.Value.BOOK
                                    }),
                                    readOnly: true
                                }),

                                new NrButton({
                                    id: 'newWorkRecord',
                                    name: 'newWorkRecord',
                                    style: NrButton.Style.ACCEPT,
                                    label: isSameDay ? WaTranslation.WORK_RECORD_EDIT_START_RECORDING : WaTranslation.WORK_RECORD_ADD_RECORD,
                                    icon: new NrIcon({
                                        value: NrIconValue.PLUS
                                    }),
                                    click: this._onStartNewRecordClick(project, date)
                                })

                            ]
                        ]
                    }),

                    new NrGrid({
                        id: 'work-records-date',
                        columns: [
                            "",
                            "auto",
                            ""
                        ],
                        content: [
                            [

                                new NrButton({
                                    id: 'previousWorkRecords',
                                    style: NrButton.Style.ICON,
                                    icon: new NrIcon({
                                        value: NrIconValue.CARET_LEFT
                                    }),
                                    click: this._goListRecordsView(project, moment(date).subtract(1, 'days').toISOString() )
                                }),

                                new NrGrid({
                                    columns: [
                                        "-",
                                        "",
                                        "-"
                                    ],
                                    content: [
                                        [

                                            new NrTextField({
                                                value: this._controller.getShortWeekDay(date),
                                                readOnly: true
                                            }),

                                            new NrTextField({
                                                value: this._controller.getDateString(date),
                                                readOnly: true
                                            }),

                                            new NrTextField({
                                                value: `${totalHours.toFixed(2)} h`,
                                                readOnly: true
                                            })

                                        ]

                                    ]
                                }),

                                new NrButton({
                                    id: 'nextWorkRecords',
                                    style: NrButton.Style.ICON,
                                    icon: new NrIcon({
                                        value: NrIconValue.CARET_RIGHT
                                    }),
                                    click: this._goListRecordsView(project, moment(date).add(1, 'days').toISOString() )
                                })

                            ]
                        ]
                    }),

                    this._renderRecordGrid(records, project, date),

                )
        });

    }

    /**
     *
     * @param project {BeWorkProject}
     * @param records {Array.<BeWorkRecord>}
     * @param date {string}
     * @returns {NrGrid}
     * @private
     */
    _renderRecordGrid (records, project, date) {

        return new NrGrid({

            id: `work-record-grid`,

            columns: [
                "auto",
                "-",
                "auto",
                "-",
                "-",
                ""
            ],

            content: _.map(records, record => this._renderRecordRow(record, project, date))

        });

    }

    /**
     *
     * @param record {BeWorkRecord}
     * @param project {BeWorkProject}
     * @param date {string}
     * @returns {Array.<NrModel>}
     * @private
     */
    _renderRecordRow (record, project, date) {

        // noinspection JSValidateTypes
        return _.filter([

            new NrTextField({
                name: "startTime",
                value: this._controller.getHoursString(record.startTime),
                readOnly: true
            }),

            new NrTextField({
                name: "endTime",
                value: this._controller.getHoursString(record.endTime),
                readOnly: true
            }),

            new NrTextField({
                name: "hours",
                placeholder: WaTranslation.WORK_TIME_HOURS,
                value: `${record.hours.toFixed(2)} h`,
                readOnly: true
            }),

            new NrNumberField({
                name: "lunchMinutes",
                icon: new NrIcon({
                    value: NrIconValue.FOOD
                }),
                value: record.lunchMinutes,
                readOnly: true
            }),

            new NrTextField({
                name: "startTime",
                value: record.description,
                icon: new NrIcon({
                    value: NrIcon.Value.INFO
                }),
                readOnly: true
            }),

            record.endTime
                ? new NrButton({
                    style: NrButton.Style.ICON,
                    label: '',
                    icon: new NrIcon({
                        value: NrIconValue.EDIT
                    }),
                    click: this._editRecordForm(record, project)
                })
                : new NrButton({
                    style: NrButton.Style.ACCEPT,
                    icon: new NrIcon({
                        value: NrIcon.Value.STOP
                    }),
                    click: this._onStopRecordClick(record, date)
                })

        ], item => !!item);

    }

    /**
     *
     * @param projects {Array.<BeWorkProject>}
     * @returns {NrGrid}
     * @private
     */
    _renderProjectGrid (projects) {

        return new NrGrid({

            id: `work-project-grid`,

            columns: [
                "",
                "auto",
                "-",
                "-",
                ""
            ],

            content:  _.map(projects, project => this._renderProjectRow(project))

        });

    }

    /**
     *
     * @param project {BeWorkProject}
     * @returns {Promise.<Array.<NrModel>>}
     * @private
     */
    _renderProjectRow (project) {

        // noinspection JSValidateTypes
        return _.filter([

            new NrButton({
                style: NrButton.Style.ICON,
                label: '',
                icon: new NrIcon({
                    value: NrIconValue.FORWARD
                }),
                click: this._goListRecordsView(project, moment().toISOString())
            }),

            new NrTextField({
                name: "label",
                value: project.label,
                icon: new NrIcon({
                    value: NrIconValue.BOOK
                }),
                readOnly: true
            }),

            new NrTextField({
                name: "clientId",
                value: project.clientId,
                icon: new NrIcon({
                    value: NrIconValue.ADDRESS_BOOK
                }),
                readOnly: true
            }),

            new NrNumberField({
                name: "lunchMinutes",
                icon: new NrIcon({
                    value: NrIconValue.FOOD
                }),
                value: project.lunchMinutes,
                readOnly: true
            }),

            new NrButton({
                style: NrButton.Style.ICON,
                label: '',
                icon: new NrIcon({
                    value: NrIconValue.EDIT
                }),
                click: this._editProjectForm(project)
            })

        ], item => !!item);

    }

    /**
     *
     * @param record {BeWorkRecord}
     * @param date {string}
     * @returns {NrRequest}
     * @private
     */
    _onStopRecordClick (record, date) {
        return new NrRequest({
            href: BePath.WORK,
            method: NrRequest.Method.POST,
            payload: {
                action: BeWorkAction.STOP_RECORD,
                record: record,
                date
            }
        });
    }

    /**
     *
     * @returns {NrRequest}
     * @private
     */
    _goListProjectsView () {
        return new NrRequest({
            href: BePath.WORK,
            method: NrRequest.Method.POST,
            payload: {
                action: BeWorkAction.LIST_PROJECTS
            }
        });
    }

    /**
     *
     * @param project {BeWorkProject}
     * @param date {string}
     * @returns {NrRequest}
     * @private
     */
    _goListRecordsView (project, date) {
        return new NrRequest({
            href: BePath.WORK,
            method: NrRequest.Method.POST,
            payload: {
                action: BeWorkAction.LIST_RECORDS,
                project,
                date
            }
        });
    }

    /**
     *
     * @param record {BeWorkRecord}
     * @returns {NrRequest}
     * @private
     */
    _onDeleteRecordClick (record) {
        return new NrRequest({
            href: BePath.WORK,
            method: NrRequest.Method.POST,
            payload: {
                action: BeWorkAction.DELETE_RECORD,
                record: record
            }
        });
    }

    /**
     *
     * @param project {BeWorkProject}
     * @param date {string}
     * @returns {NrRequest}
     * @private
     */
    _onStartNewRecordClick (project, date) {
        return new NrRequest({
            href: BePath.WORK,
            method: NrRequest.Method.POST,
            payload: {
                action: BeWorkAction.START_NEW_RECORD,
                project,
                date
            }
        });
    }

    /**
     *
     * @returns {NrForm}
     * @private
     */
    _createProjectForm () {

        return new NrForm({
            label: WaTranslation.WORK_CREATE_PROJECT_FORM_LABEL,
            icon: new NrIcon({
                value: NrIcon.Value.BOOK
            }),
            content: [

                new NrTextField({
                    name: "label",
                    label: WaTranslation.WORK_CREATE_PROJECT_FIELD_LABEL_FIELD,
                    value: ''
                }),

                new NrTextField({
                    name: "clientId",
                    label: WaTranslation.WORK_CREATE_PROJECT_FIELD_CLIENT_ID_FIELD,
                    value: ''
                }),

                new NrNumberField({
                    name: "lunchMinutes",
                    label: WaTranslation.WORK_CREATE_PROJECT_FIELD_LUNCH_MINUTES_FIELD,
                    value: 30
                })

            ],
            cancel: new NrRequest({
                href: BePath.WORK,
                method: NrRequest.Method.POST,
                payload: {
                    action: BeWorkAction.LIST_PROJECTS
                }
            }),
            submit: new NrRequest({
                href: BePath.WORK,
                method: NrRequest.Method.POST,
                payload: {
                    action: BeWorkAction.CREATE_PROJECT
                }
            })
        });

    }

    /**
     *
     * @returns {NrForm}
     * @private
     */
    _editProjectForm (project) {

        return new NrForm({
            label: WaTranslation.WORK_EDIT_PROJECT_FORM_LABEL,
            icon: new NrIcon({
                value: NrIcon.Value.BOOK
            }),
            content: [

                new NrTextField({
                    name: "label",
                    label: WaTranslation.WORK_EDIT_PROJECT_FIELD_LABEL_FIELD,
                    value: project.label
                }),

                new NrTextField({
                    name: "clientId",
                    label: WaTranslation.WORK_EDIT_PROJECT_FIELD_CLIENT_ID_FIELD,
                    value: project.clientId
                }),

                new NrNumberField({
                    name: "lunchMinutes",
                    label: WaTranslation.WORK_EDIT_PROJECT_FIELD_LUNCH_MINUTES_FIELD,
                    value: project.lunchMinutes
                })

            ],
            cancel: new NrRequest({
                href: BePath.WORK,
                method: NrRequest.Method.POST,
                payload: {
                    action: BeWorkAction.LIST_PROJECTS
                }
            }),
            submit: new NrRequest({
                href: BePath.WORK,
                method: NrRequest.Method.POST,
                payload: {
                    action: BeWorkAction.EDIT_PROJECT,
                }
            }),
            payload: {
                project
            }
        });

    }

    /**
     *
     * @param record {BeWorkRecord}
     * @param project {BeWorkProject}
     * @returns {NrDiv}
     * @private
     */
    _editRecordForm (record, project) {

        return new NrDiv({
            content: [

                new NrGrid({

                    columns: [
                        "auto",
                        ""
                    ],

                    content: [

                        [
                            new NrDiv({}),

                            new NrButton({
                                label: WaTranslation.WORK_RECORD_EDIT_DELETE_LABEL,
                                icon: new NrIcon({
                                    value: NrIconValue.TRASH
                                }),
                                click: this._onDeleteRecordClick(record)
                            })
                        ]

                    ]

                }),

                new NrForm({
                    label: WaTranslation.WORK_RECORD_EDIT_FORM_LABEL,
                    icon: new NrIcon({
                        value: NrIcon.Value.CLOCK
                    }),
                    content: [

                        new NrTextField({
                            name: "description",
                            label: WaTranslation.WORK_TIME_DESCRIPTION,
                            value: record.description,
                            icon: new NrIcon({
                                value: NrIcon.Value.INFO
                            })
                        }),

                        new NrDateTimeField({
                            label: WaTranslation.WORK_RECORD_EDIT_START_TIME,
                            name: "startTime",
                            icon: new NrIcon({
                                value: NrIcon.Value.PLAY
                            }),
                            value: record.startTime
                        }),

                        new NrDateTimeField({
                            label: WaTranslation.WORK_RECORD_EDIT_END_TIME,
                            name: "endTime",
                            icon: new NrIcon({
                                value: NrIcon.Value.STOP
                            }),
                            value: record.endTime
                        }),

                        new NrTextField({
                            name: "hours",
                            label: WaTranslation.WORK_TIME_HOURS,
                            value: `${record.hours.toFixed(2)} h`,
                            icon: new NrIcon({
                                value: NrIcon.Value.CLOCK
                            }),
                            readOnly: true
                        }),

                        new NrNumberField({
                            name: "lunchMinutes",
                            label: WaTranslation.WORK_TIME_LUNCH_MINUTES,
                            icon: new NrIcon({
                                value: NrIconValue.FOOD
                            }),
                            value: record.lunchMinutes
                        })

                    ],
                    cancel: new NrRequest({
                        href: BePath.WORK,
                        method: NrRequest.Method.POST,
                        payload: {
                            action: BeWorkAction.LIST_RECORDS
                        }
                    }),
                    submit: new NrRequest({
                        href: BePath.WORK,
                        method: NrRequest.Method.POST,
                        payload: {
                            action: BeWorkAction.EDIT_RECORD
                        }
                    }),
                    payload: {
                        record,
                        project
                    }
                })

            ]

        });

    }

}

// noinspection JSUnusedGlobalSymbols
export default BeWorkViewTemplate;

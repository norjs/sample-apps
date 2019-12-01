/**
 * Part of beWork, NorJS Timecard Sample App for NorJS Edge Backend.
 * 
 * Commercial dual licence option available from Sendanor.com.
 * 
 * @license GPL
 * @file
 */

import {BeWorkViewController} from "./BeWorkViewController";
import {BeWorkViewTemplate} from "./BeWorkViewTemplate";
import {NrViewComponent} from "@norjs/ui/models/NrViewComponent";

/**
 *
 *
 * @type {NrViewComponent}
 */
export const beWorkView = new NrViewComponent({
    template: BeWorkViewTemplate,
    controller: BeWorkViewController,
    templateBindings: {
        ".setController": "$controller"
    },
    controllerBindings: {
        ".setSession": "$session",
        ".setEventManager" : "$eventManager"
    }
});

// noinspection JSUnusedGlobalSymbols
export default beWorkView;

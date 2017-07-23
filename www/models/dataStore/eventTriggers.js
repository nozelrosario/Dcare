/* Enables Data Store to suooprt Triggers/Data Events. Multiple actions can also be registered against a single event.
 * Supported Triggers are [before/after]save,insert,update,delete
 * Extra Triggers can be added by extending the "triggers" property in child dataAdapter
 */

app.classes.data.eventTriggers = new Module({
    supportedTriggers: {
        // DB Related
        "before-save": true,
        "after-save": true,
        "before-insert": true,
        "after-insert": true,
        "before-update": true,
        "after-update": true,
        "before-delete": true,
        "after-delete": true,
        // Sync Relate
        "sync-started": true,
        "sync-complete": true,
        "sync-error": true
    },
    /* Add a event trigger [Supports multiple Actions for a single trigger event, just call method 
     *   multiple times]
     *   @params : trigger : {string} event trigger
     *             triggerName : unique name for the trigger.
     *             action : {function} Callback function to be executed when event triggers
     *   @example : dataStoreObject.addTrigger("before-save", "log_evt_before_save", function(evtData) { 
     *                console.log("Trigger=" + evtData.trigger + " TriggerName=" + evtData.triggerName + "Data=" + evtData.data );
     *              });
     */
    addTrigger: function (trigger, triggerName, action) {
        "use strict";
        var registeredActions;
        if (!this.triggers) this.triggers = {}; //Create an empty Dynamic Object to hold Trigger Actions
        if (this.supportedTriggers[trigger]) {
            registeredActions = (this.triggers[trigger] && this.triggers[trigger].length > 0) ? this.triggers[trigger] : [];
            registeredActions.push({ name: triggerName, action: action });
            this.triggers[trigger] = registeredActions;
        } else {
            app.log.error("Trigger : " + trigger + " not supported!!");
        }
    },
    /* Removes a trigger
     *   @params : trigger : {string} event trigger 
     *             triggerName : unique name of the trigger to be removed [ skipping this argument will delete all triggers]
     *   @example :  dataStoreObject.removeTrigger("before-save", "log_evt_before_save");
     */
    removeTrigger: function (trigger, triggerName) {
        "use strict";
        if (!this.triggers) this.triggers = {};     //Create an empty Dynamic Object to hold Trigger Actions
        if (triggerName && triggerName !== "") {    // NR: Remove specific Trigger
            var registeredActions;            
            if (this.triggers[trigger] && this.triggers[trigger].length > 0) {
                registeredActions = this.triggers[trigger];
                for (var i = 0; i < registeredActions.length; i++) {
                    if ((registeredActions[i]).name == triggerName) {
                        (this.triggers[trigger]).splice(i, 1);
                    }
                }
            }
        } else {                                    // Remove all Triggers
            if (this.triggers[trigger]) {
                this.triggers[trigger] = true;
            }
        }
    },
    /* fires a trigger and executes associated actions
     *   @params : trigger : {string} event trigger 
     *             eventData : {Object} event data object, can be used to pass data to event
     *   @example: this.trigger("before-save", { data: {...} });           
     */
    trigger: function (trigger, eventData) {
        "use strict";
        var registeredActions;
        var deferredTrigger = $.Deferred();
        if (!this.triggers) this.triggers = {}; //Create an empty Dynamic Object to hold Trigger Actions
        if (!eventData) eventData = {};     // create Event Data object if its null
        eventData.trigger = trigger;
        if (this.triggers[trigger] && this.triggers[trigger].length > 0) {
            registeredActions = this.triggers[trigger];
            var unifiedTriggerInvoker = [];
            for (var i = 0; i < registeredActions.length; i++) {
                eventData.triggerName = (registeredActions[i]).name;
                app.log.info("Executing trigger [" + eventData.triggerName + "] on [" + eventData.trigger + "] for Data-Store: [" + this.dataStoreName + "]");
                unifiedTriggerInvoker.push((registeredActions[i]).action.call(this, eventData));
            }
            $.when.apply($, unifiedTriggerInvoker).then(function () {
                // All trigger executions succeded [results in argument object]
                deferredTrigger.resolve();
            }).fail(function () {
                //Some/all trigger executions failed  [results in argument object]
                deferredTrigger.reject();
            });
        } else {
            deferredTrigger.resolve();
        }
        return deferredTrigger;
    }
});
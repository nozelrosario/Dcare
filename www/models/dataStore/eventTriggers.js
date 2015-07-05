/* Enables Data Store to suooprt Triggers/Data Events. Multiple actions can also be registered against a single event.
 * Supported Triggers are [before/after]save,insert,update,delete
 * Extra Triggers can be added by extending the "triggers" property in child dataAdapter
 */

app.classes.data.eventTriggers = new Module({
    triggers: {
        "before-save": true,
        "after-save": true,
        "before-insert": true,
        "after-insert": true,
        "before-update": true,
        "after-update": true,
        "before-delete": true,
        "after-delete": true
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
        if (this.triggers[trigger]) {
            registeredActions = (this.triggers[trigger].length > 0) ? this.triggers[trigger] : [];
            registeredActions.push({ name: triggerName, action: action });
            this.triggers[trigger] = registeredActions;
        }
    },
    /* Removes a trigger
     *   @params : trigger : {string} event trigger 
     *             triggerName : unique name of the trigger to be removed [ skipping this argument will delete all triggers]
     *   @example :  dataStoreObject.removeTrigger("before-save", "log_evt_before_save");
     */
    removeTrigger: function (trigger, triggerName) {
        "use strict";
        if (triggerName && triggerName !== "") {
            var registeredActions;
            if (this.triggers[trigger] && this.triggers[trigger].length > 0) {
                registeredActions = this.triggers[trigger];
                for (var i = 0; i < registeredActions.length; i++) {
                    if ((registeredActions[i]).name == triggerName) {
                        (this.triggers[trigger]).splice(i, 1);
                    }
                }
            }
        } else {
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
        if (!eventData) eventData = {};     // create Event Data object if its null
        eventData.trigger = trigger;
        if (this.triggers[trigger].length > 0) {
            registeredActions = this.triggers[trigger];
            for (var i = 0; i < registeredActions.length; i++) {
                eventData.triggerName = (registeredActions[i]).name;
                (registeredActions[i]).action.call(this, eventData);
            }
        }
    }
});
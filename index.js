var GitHubApi = require("github");
var _ = require('lodash');

var pickResultData = [
    'id',
    'description',
    'owner.login',
    'files.raw_url',
    'html_url',
    'created_at'
];

module.exports = {
    /**
     * Pick API result.
     *
     * @param input
     * @returns {{}}
     */
    pickResultData: function (input) {
        var result = {};

        pickResultData.forEach(function (dataKey) {
            if (!_.isUndefined(_.get(input, dataKey, undefined))) {

                _.set(result, dataKey, _.get(input, dataKey));
            }
        });

        return result;
    },

    /**
     * Authenticate gitHub user.
     *
     * @param dexter
     * @param github
     */
    gitHubAuthenticate: function (dexter, github) {

        if (dexter.environment('GitHubUserName') && dexter.environment('GitHubPassword')) {

            github.authenticate({
                type: dexter.environment('GitHubType') || "basic",
                username: dexter.environment('GitHubUserName'),
                password: dexter.environment('GitHubPassword')
            });
        } else {
            this.fail('A GitHubUserName and GitHubPassword environment variable is required for this module');
        }
    },

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var github = new GitHubApi({
            // required 
            version: "3.0.0"
        });

        this.gitHubAuthenticate(dexter, github);

        if (!step.input('files').first()) {

            this.fail('[files] inputs variable need for this module');
        } else {
            github.gists.create(_.pick(step.inputs(), ['files', 'description', 'public']), function (err, gistInfo) {

                err ? this.fail(err) : this.complete(this.pickResultData(gistInfo));
            }.bind(this));
        }
    }
};

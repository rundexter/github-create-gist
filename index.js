var _ = require('lodash'),
    util = require('./util.js'),
    GitHubApi = require("github"),
    github = new GitHubApi({ version: '3.0.0' });

var pickInputs = {
        'files': { key: 'files', type: 'object', validate: { req: true } },
        'public': { key: 'public', type: 'boolean' },
        'description': 'description'
    },
    pickOutputs = {
        'id': 'id',
        'owner': 'owner.login',
        'files.raw_url': 'files.raw_url',
        'description': 'description',
        'html_url': 'html_url',
        'created_at': 'created_at'
    };

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('github').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        github.authenticate({
            type: 'oauth',
            token: _.get(credentials, 'access_token')
        });

        github.gists.create(inputs, function (error, gistInfo) {

            error ? this.fail(error) : this.complete(util.pickOutputs(gistInfo, pickOutputs));
        }.bind(this));
    }
};

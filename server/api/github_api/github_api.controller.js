var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    // pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "Cerebro" // GitHub is happy with a unique user agent
    },
    // Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

// TODO: optional authentication here depending on desired endpoints. See below in README.

GitHubApi.prototype.cerebro_user_name = function (username,cb) {
    github.users.getForUser({username: username}, function (err, response) {
        if (err) {
            cb(new Error('Ahhh'))
        } else {
            cb(null,response.data.name)
        }
    });
};

module.exports = {github: github};

/**
 * @param {string} host 
 */
function UseMailgunMxFor(host) {
    var buildHost = function (firstString, secondString) {
        if (secondString === '@') {
            return firstString;
        }

        return firstString + '.' + secondString;
    }

    return [
        MX(host, 10, 'mxa.eu.mailgun.org.'),
        MX(host, 10, 'mxb.eu.mailgun.org.'),

        CNAME(buildHost('email', host), 'eu.mailgun.org.'),

        SPF_BUILDER({
            label: host,
            parts: [
                'v=spf1',
                'include:mailgun.org',
                '-all'
            ]
        })
    ]
};
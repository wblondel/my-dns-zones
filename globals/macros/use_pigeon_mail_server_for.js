/**
 * @param {string} host 
 */
function UsePigeonMailServerFor(host) {
    var buildHost = function (firstString, secondString) {
        if (secondString === '@') {
            return firstString;
        }

        return firstString + '.' + secondString;
    }

    return [
        MX(host, 10, 'pigeon.williamblondel.fr.'),

        CNAME(buildHost('autoconfig', host), 'pigeon.williamblondel.fr.'),
        CNAME(buildHost('autodiscover', host), 'pigeon.williamblondel.fr.'),
        CNAME(buildHost('_dmarc', host), '_dmarc.williamblondel.fr.'),
        CNAME(buildHost('mta-sts', host), 'mta-sts.williamblondel.fr.'),
        CNAME(buildHost('_mta-sts', host), '_mta-sts.williamblondel.fr.'),
        CNAME(buildHost('_smtp._tls', host), '_smtp._tls.williamblondel.fr.'),

        SRV(buildHost('_autodiscover._tcp', host), 0, 1, 443, 'pigeon.williamblondel.fr.'),

        SPF_BUILDER({
            label: host,
            parts: [
                'v=spf1',
                'a',
                'mx',
                '-all'
            ],
        }),
    ]
};
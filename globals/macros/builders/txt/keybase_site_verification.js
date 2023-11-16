/**
 * @param {string} domain 
 */
function IncludeKeybaseSiteVerification(domain) {
    var key = 'keybase-site-verification';

    var entries = {
        'williamblondel.fr': 'C_z29b6Vah7pgfISyRn2Uxd8iq4M-f3Osvr2uWbPg3E',
    };

    return TXT('@', [key, entries[domain]].join('='))
}
/**
 * @param {string} domain 
 */
function IncludeMicrosoftSiteVerification(domain) {
    var key = 'MS';

    var entries = {
        'williamblondel.fr': 'A8E96F2D3E9EA3076A9575F6BC91467586875ECB',
    };

    return TXT('@', [key, entries[domain]].join('='))
}
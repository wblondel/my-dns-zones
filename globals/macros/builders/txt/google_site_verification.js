/**
 * @param {string} domain 
 */
function IncludeGoogleSiteVerification(domain) {
    var key = 'google-site-verification';

    var entries = {
        'nocontexthumans.com': 'uI73RR9Zq9XnKrmb6a5UyPAa8Gu486RIlEnxfo9u4wc',
        'parisb.rest': 'QOVw2HWb4ekFhgRvyT5hS1NSx8JAdtD3ezwLaRHOJpg',
        'williamblondel.com': 'GEYEnGb82U27JpPR3oG-FzJ8Im49KiyCa3rGzcViDmk',
        'williamblondel.fr': 'AsBRY1djNmUyPuEhPpftRTPafx6j2EtGl6xWFFAsZ0c',
        'williamblondel.me': 'UCT4g0KPI-XFFSlHuRavg5Sl374ijtHdq76eKL4xDtw',
        'williamgeraldblondel.com': '-PHdusIhuUxLTmvLTE_HPP-Owr0QC6P6h4pJCnwehCI',
    };

    return TXT('@', [key, entries[domain]].join('='))
}
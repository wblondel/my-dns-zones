/**
 * Create records to map a domain to Hashnode.
 * The function supports sub-domains.
 * 
 * @param {string} host 
 * @param {boolean} withWww
 */
function UseHashnodeFor(host, withWww) {
    var buildHost = function (firstString, secondString) {
        if (secondString === '@') {
            return firstString;
        }

        return firstString + '.' + secondString;
    }

    /* 
     * No AAAA record because Vercel, which hosts Hashnode, doesn't support IPv6 yet
     * https://github.com/orgs/vercel/discussions/47
     * ETA is Q1 2024
     */
    return [
        A(host, '76.76.21.21'),
        withWww ? CNAME(buildHost('www', host), 'hashnode.network.') : null,     
    ].filter(Boolean)
};
/**
 * @param {string} name 
 */
function IncludeWebServerARecords(name) {
    return [
        A(name, '161.97.87.85'),
        AAAA(name, '2a02:c207:2045:4811::1'),
    ]
}

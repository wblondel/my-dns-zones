/**
 * @param {string} name 
 */
function IncludeMailServerARecords(name) {
    return [
        A(name, '193.168.147.152'),
        AAAA(name, '2a07:abc4::1:618'),
    ]
}

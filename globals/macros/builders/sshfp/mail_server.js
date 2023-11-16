/**
 * @param {string} name 
 */
function IncludeMailServerSshfpRecords(name) {
    return [
        SSHFP(name, 1, 1, 'fcd31da29964e28fa7d59f69e3aef77ae2bff7e6'),
        SSHFP(name, 1, 2, '22af3e9509de337aa5d1ee849003150e933acd8cdb72cf8297b9a86be2e90d46'),
        SSHFP(name, 2, 1, 'bfd1f51210737cc23b6e8420d1d58382ab8b379d'),
        SSHFP(name, 2, 2, 'bbe88aabb8825890db3a9eba28df4028fa0dea8174749f0d78a33075acc8e355'),
        SSHFP(name, 3, 1, '1a0615b312eb0ac6cb7d3df02aab73971ba0703d'),
        SSHFP(name, 3, 2, '9909ee3c7c96145a7d9426663674b926245d41bdde51da26d5a2c0b354cd7bca'),
        SSHFP(name, 4, 1, 'abc4a738000a6c2c1609a33471b5225d9a256076'),
        SSHFP(name, 4, 2, '0f853ea80b97a72e526e35f2e88f11a16deae91153dc7ebab8b372a7b11a2a73')
    ];
};
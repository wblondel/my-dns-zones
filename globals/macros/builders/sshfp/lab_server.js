/**
 * @param {string} name 
 */
function IncludeLabServerSshfpRecords(name) {
    return [
        SSHFP(name, 1, 1, 'c199c31d6dda601b550ce21684c22c2eb5e73906'),
        SSHFP(name, 1, 2, 'f3c1c352e512b2ebc51004102ac960aca4ddd62e54d97d6b73d83164b0640517'),
        SSHFP(name, 2, 1, '85ee9b5a0119e0a5da2aa1ef9f868c894d85e9d7'),
        SSHFP(name, 2, 2, '7e9ac9e43c2985b0dda8809152cf1a721eb3e1be38a545296fb88cf8a0aac4a9'),
        SSHFP(name, 3, 1, '58b1b683460c409bf192771379036512791b9a21'),
        SSHFP(name, 3, 2, '1f1c6bb4b84c3c2b01e2c3f2c4bbe3960dbaa563d0db4d282eecca2036508d5b'),
        SSHFP(name, 4, 1, 'ea86fa8eddfa8bde27128d14b42237e1542c7ff3'),
        SSHFP(name, 4, 2, '3460c9e2e4d7f2fbf98a99c48eeb65f90f8a085127ee6b64de2530599c614a08')
    ];
};
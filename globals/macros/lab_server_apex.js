var LAB_SERVER_APEX = [
    IncludeLabServerARecords('@'),
    IncludeLabServerSshfpRecords('@'),

    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.fr',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),
];
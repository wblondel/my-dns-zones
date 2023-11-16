var WEB_SERVER_APEX = [
    IncludeWebServerARecords('@'),
    IncludeWebServerSshfpRecords('@'),

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
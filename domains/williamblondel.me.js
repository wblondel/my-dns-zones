// TODO: develop provider for https://www.spaceship.com
D('williamblondel.me', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP
    CNAME('www', '@'),

    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('williamblondel.me', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.me',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamblondel.me')
);
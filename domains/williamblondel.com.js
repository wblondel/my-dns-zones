// TODO: develop provider for registrar https://www.spaceship.com
D('williamblondel.com', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP
    CNAME('www', '@'),

    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('williamblondel.com', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamblondel.com')
);
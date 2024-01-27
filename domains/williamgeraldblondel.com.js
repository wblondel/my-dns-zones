// TODO: develop provider for registrar https://www.spaceship.com
D('williamgeraldblondel.com', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP
    CNAME('www', '@'),

    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('williamgeraldblondel.com', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamgeraldblondel.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamgeraldblondel.com')
);
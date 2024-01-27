// TODO: develop provider for registrar https://www.spaceship.com
D('nocontexthumans.com', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP
    CNAME('www', '@'),

    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('nocontexthumans.com', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@nocontexthumans.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    IncludeGoogleSiteVerification('nocontexthumans.com')
);
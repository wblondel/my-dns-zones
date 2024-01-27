// TODO: develop provider for registrar https://www.sav.com/
D('parisb.rest', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP: Fly.io IPs
    A('@', '66.241.125.221'), // shared
    AAAA('@', '2a09:8280:1::f:c9e1'), // dedicated
    CNAME('www', '@'),

    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('parisb.rest', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@parisb.rest',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    IncludeGoogleSiteVerification('parisb.rest')
);
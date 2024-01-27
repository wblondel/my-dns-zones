// TODO: develop provider for registrar https://www.spaceship.com
D('williamblondel.com', REG_NONE, DnsProvider(DSP_DESEC),
    // HTTP: Fly.io IPs
    A('@', '66.241.124.243'), // shared
    AAAA('@', '2a09:8280:1::4e:f3c1'), // dedicated
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
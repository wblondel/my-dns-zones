D('williamgeraldblondel.com', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),

    // HTTP: Fly.io IPs
    A('@', '66.241.124.243'), // shared
    AAAA('@', '2a09:8280:1::4e:f3c1'), // dedicated
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
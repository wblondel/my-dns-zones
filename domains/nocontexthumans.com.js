D('nocontexthumans.com', REG_NONE,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),

    // HTTP: Fly.io IPs
    A('@', '66.241.124.243'), // shared
    AAAA('@', '2a09:8280:1::4e:f3c1'), // dedicated
    CNAME('www', '@'),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@nocontexthumans.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: [
            'letsencrypt.org'
        ],
    }),

    // Site verification
    IncludeGoogleSiteVerification('nocontexthumans.com')
);
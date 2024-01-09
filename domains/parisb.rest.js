// TODO: develop provider for https://www.sav.com/
D('parisb.rest', REG_NONE, DnsProvider(DSP_DESEC),
    // Fly.io IPs
    A('@', '66.241.125.221'), // shared
    AAAA('@', '2a09:8280:1::f:c9e1'), // dedicated
    
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.fr',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),
    
    IncludeGoogleSiteVerification('parisb.rest'),
    IncludeDkimDomainKey('parisb.rest', 'DKIM1', 'rsa', 's', 'email', false)
);
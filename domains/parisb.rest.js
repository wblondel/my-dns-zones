D('parisb.rest', REG_NONE, DnsProvider(DSP_DESEC),
    //WEB_SERVER_APEX,

    A('@', '66.241.125.221'),
    AAAA('@', '2a09:8280:1::f:c9e1'),
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
    IncludeDkimDomainKey('parisb.rest')
);
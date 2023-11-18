D('parisb.rest', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('parisb.rest'),
    IncludeDkimDomainKey('parisb.rest')
);
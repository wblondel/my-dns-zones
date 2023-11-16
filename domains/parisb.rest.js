D('parisb.rest', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('parisb.rest'),
    IncludeDkimDomainKey('parisb.rest')
);
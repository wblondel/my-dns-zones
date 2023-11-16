D('nocontexthumans.com', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    
    IncludeGoogleSiteVerification('nocontexthumans.com'),
    IncludeDkimDomainKey('nocontexthumans.com')
);
D('nocontexthumans.com', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),
    
    IncludeGoogleSiteVerification('nocontexthumans.com'),
    IncludeDkimDomainKey('nocontexthumans.com')
);
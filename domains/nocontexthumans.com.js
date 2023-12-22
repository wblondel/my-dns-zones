// TODO: develop provider for https://www.spaceship.com
D('nocontexthumans.com', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),
    
    IncludeGoogleSiteVerification('nocontexthumans.com'),
    IncludeDkimDomainKey('nocontexthumans.com')
);
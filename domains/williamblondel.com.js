D('williamblondel.com', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamblondel.com'),
    IncludeDkimDomainKey('williamblondel.com')
);
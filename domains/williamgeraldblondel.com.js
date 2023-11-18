D('williamgeraldblondel.com', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamgeraldblondel.com'),
    IncludeDkimDomainKey('williamgeraldblondel.com')
);
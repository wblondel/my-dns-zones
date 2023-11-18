D('williamblondel.me', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamblondel.me'),
    IncludeDkimDomainKey('williamblondel.me')
);
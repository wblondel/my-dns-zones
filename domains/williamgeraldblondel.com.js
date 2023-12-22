// TODO: develop provider for https://www.spaceship.com
D('williamgeraldblondel.com', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamgeraldblondel.com'),
    IncludeDkimDomainKey('williamgeraldblondel.com')
);
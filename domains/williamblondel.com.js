// TODO: develop provider for https://www.spaceship.com
D('williamblondel.com', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamblondel.com'),
    IncludeDkimDomainKey('williamblondel.com', 'DKIM1', 'rsa', 's', 'email', false)
);
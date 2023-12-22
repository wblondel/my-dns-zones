// TODO: develop provider for https://www.spaceship.com
D('williamblondel.me', REG_NONE, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    UsePigeonMailServerFor('@'),

    CNAME('www', '@'),

    IncludeGoogleSiteVerification('williamblondel.me'),
    IncludeDkimDomainKey('williamblondel.me', 'DKIM1', 'rsa', 's', 'email', false)
);
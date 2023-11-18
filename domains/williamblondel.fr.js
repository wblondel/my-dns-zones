D('williamblondel.fr', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    WEB_SERVER_SUBDOMAIN,
    I_AM_PIGEON_MAIL_SERVER,
    UsePigeonMailServerFor('einstein'),
    
    CNAME('www', '@'),
    CNAME('actes', 'einstein'),

    MX('@', 10, 'pigeon.williamblondel.fr.'),

    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    IncludeGoogleSiteVerification('williamblondel.fr'),
    IncludeKeybaseSiteVerification('williamblondel.fr'),
    IncludeMicrosoftSiteVerification('williamblondel.fr'),
    IncludeDkimDomainKey('williamblondel.fr'),
    IncludeDkimDomainKey('einstein.williamblondel.fr')
);
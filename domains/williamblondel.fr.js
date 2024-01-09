D('williamblondel.fr', REG_OVH, DnsProvider(DSP_DESEC),
    WEB_SERVER_APEX,
    WEB_SERVER_SUBDOMAIN,
    I_AM_PIGEON_MAIL_SERVER,
    UsePigeonMailServerFor('einstein'),
    
    CNAME('www', '@'),

    // Fly.io IPs
    A('actes', '66.241.125.129'), // shared
    AAAA('actes', '2a09:8280:1::15:da5e'), // dedicated

    MX('@', 10, 'pigeon.williamblondel.fr.'),

    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    IncludeGoogleSiteVerification('williamblondel.fr'),
    IncludeKeybaseSiteVerification('williamblondel.fr'),
    IncludeMicrosoftSiteVerification('williamblondel.fr'),
    IncludeDkimDomainKey('williamblondel.fr', 'DKIM1', 'rsa', 's', 'email', false),
    IncludeDkimDomainKey('einstein.williamblondel.fr', 'DKIM1', 'rsa', 's', 'email', false)
);
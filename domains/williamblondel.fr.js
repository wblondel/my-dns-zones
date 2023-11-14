D('williamblondel.fr', REG_OVH, DnsProvider(DSP_DESEC),
    CONTABO_WEB_SERVER_APEX,
    CONTABO_WEB_SERVER_SUBDOMAIN,
    I_AM_PIGEON_MAIL_SERVER,
    
    CNAME('www', '@'),
    CNAME('actes', 'einstein'),

    MX('@', 10, 'pigeon.williamblondel.fr.'),

    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    TXT('@', 'google-site-verification=AsBRY1djNmUyPuEhPpftRTPafx6j2EtGl6xWFFAsZ0c'),
    TXT('@', 'keybase-site-verification=C_z29b6Vah7pgfISyRn2Uxd8iq4M-f3Osvr2uWbPg3E'),
    TXT('@', 'MS=A8E96F2D3E9EA3076A9575F6BC91467586875ECB')
);
var USE_PIGEON_MAIL_SERVER = [
    MX('@', 10, 'pigeon.williamblondel.fr.'),

    CNAME('autoconfig', 'pigeon.williamblondel.fr.'),
    CNAME('autodiscover', 'pigeon.williamblondel.fr.'),
    CNAME('_dmarc', '_dmarc.williamblondel.fr.'),
    CNAME('mta-sts', 'mta-sts.williamblondel.fr.'),
    CNAME('_mta-sts', '_mta-sts.williamblondel.fr.'),
    CNAME('_smtp._tls', '_smtp._tls.williamblondel.fr.'),

    SRV('_autodiscover._tcp', 0, 1, 443, 'pigeon.williamblondel.fr.'),

    TXT('@', 'v=spf1 mx -all')
];
var I_AM_PIGEON_MAIL_SERVER = [
    IncludeMailServerARecords('pigeon'),

    CNAME('autodiscover', 'pigeon'),
    CNAME('autoconfig', 'pigeon'),
    /* TODO: make mailcow host this file instead */
    CNAME('mta-sts', 'wblondel.github.io.'),

    SRV('_submission._tcp', 0, 1, 587, 'pigeon.williamblondel.fr.'),
    SRV('_smtps._tcp', 0, 1, 465, 'pigeon.williamblondel.fr.'),
    SRV('_sieve._tcp', 0, 1, 4190, 'pigeon.williamblondel.fr.'),
    SRV('_pop3._tcp', 0, 1, 110, 'pigeon.williamblondel.fr.'),
    SRV('_pop3s._tcp', 0, 1, 995, 'pigeon.williamblondel.fr.'),
    SRV('_imap._tcp', 0, 1, 143, 'pigeon.williamblondel.fr.'),
    SRV('_imaps._tcp', 0, 1, 993, 'pigeon.williamblondel.fr.'),
    SRV('_carddavs._tcp', 0, 1, 443, 'pigeon.williamblondel.fr.'),
    SRV('_caldavs._tcp', 0, 1, 443, 'pigeon.williamblondel.fr.'),
    SRV('_autodiscover._tcp', 0, 1, 443, 'pigeon.williamblondel.fr.'),

    TLSA('_995._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_993._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_587._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_465._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_443._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_4190._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_25._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_143._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),
    TLSA('_110._tcp.pigeon', 3, 1, 1, '74a1fbad23b52e8188b4fdefa6dc677877250f14d8552cc7cde0d8eb146c2801'),

    SPF_BUILDER({
        label: '@',
        parts: [
            'v=spf1',
            'a',
            'mx',
            // See https://www.mailhardener.com/blog/why-mailhardener-recommends-spf-softfail-over-fail
            '~all'
        ],
    }),
    
    DMARC_BUILDER({
        policy: 'reject',
        percent: 100,
        alignmentSPF: 's',
        alignmentDKIM: 's',
        rua: [
            'mailto:26e6fd52@in.mailhardener.com',
            'mailto:dmarc-rua@williamblondel.fr'
        ],
        ruf: [
            'mailto:26e6fd52@in.mailhardener.com',
            'mailto:dmarc-ruf@williamblondel.fr'
        ],
        failureOptions: '1'
    }),

    TXT('_mta-sts', 'v=STSv1; id=202110111304'),
    TXT('_smtp._tls', 'v=TLSRPTv1; rua=mailto:26e6fd52@in.mailhardener.com,mailto:tls-reports@williamblondel.fr'),

    /*
     * Wildcard record is cleaner but bad actors may try to exploit it.
     * https://mxtoolbox.com/problem/dmarc/dmarc-external-validation
     */
    TXT('parisb.rest._report._dmarc', 'v=DMARC1'),
    TXT('nocontexthumans.com._report._dmarc', 'v=DMARC1'),
    TXT('humansnocontext.com._report._dmarc', 'v=DMARC1'),
    TXT('williamgeraldblondel.com._report._dmarc', 'v=DMARC1'),
    TXT('williamblondel.me._report._dmarc', 'v=DMARC1'),
    TXT('williamblondel.com._report._dmarc', 'v=DMARC1'),

    TXT('_carddavs._tcp', 'path=/SOGo/dav/'),
    TXT('_caldavs._tcp', 'path=/SOGo/dav/'),

    TXT('_token._dnswl', 'vpazhfyv3wzniifjf1f3bg579hy9x3ws'),

    IncludeMailServerSshfpRecords('pigeon'),
];
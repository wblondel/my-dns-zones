var I_AM_PIGEON_MAIL_SERVER = [
    A('pigeon', '193.168.147.152'),
    AAAA('pigeon', '2a07:abc4::1:618'),

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

    TXT('@', 'v=spf1 mx -all'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzT5Lk7vu33GtlbexF1lYjvLfTaJ2vmtFFgaz0e07W3RzYXz/MRZ3OZUmOuxxipuyu/wJRkJdYZ7KfjBvBLGC1D1VxLM5woDwalvFQYxperCw+9lA4mgNh2gA5CQkwSzAfZXRv+GSzurp/XmYQSbO+mtK71VK2Rz5R9wDjK73wIoHA2ZW/dAnf5uWfj/Me6Uf5GU1J2kjjr5iYhjYAQ/iMF23zUvrt3R1s8sE8TUbwe3eaw7V04hwMpIqngvTHEv+Jkzv+Zu9umylVBjWKIeLbvV1qGZtiznlWChhFFj3jPBcaAOHGrwutWzVMLSQKPseCkjBtd/igQTW7K4HTXJoKwIDAQAB'),
    
    DMARC_BUILDER({
        policy: 'reject',
        percent: 100,
        alignmentSPF: 's',
        alignmentDKIM: 's',
        rua: [
            'mailto:dmarc-rua@williamblondel.fr'
        ],
        ruf: [
            'mailto:dmarc-ruf@williamblondel.fr'
        ],
        failureOptions: '1'
    }),

    TXT('_mta-sts', 'v=STSv1; id=202110111304'),
    TXT('_smtp._tls', 'v=TLSRPTv1; rua=mailto:tls-reports@williamblondel.fr'),

    /* Wildcard record is cleaner but bad actors may try to exploit it. */
    TXT('parisb.rest._report._dmarc', 'v=DMARC1'),
    TXT('nocontexthumans.com._report._dmarc', 'v=DMARC1'),
    TXT('humansnocontext.com._report._dmarc', 'v=DMARC1'),
    TXT('williamgeraldblondel.com._report._dmarc', 'v=DMARC1'),
    TXT('williamblondel.me._report._dmarc', 'v=DMARC1'),
    TXT('williamblondel.com._report._dmarc', 'v=DMARC1'),

    TXT('_carddavs._tcp', 'path=/SOGo/dav/'),
    TXT('_caldavs._tcp', 'path=/SOGo/dav/'),

    TXT('_token._dnswl', 'vpazhfyv3wzniifjf1f3bg579hy9x3ws'),

    SSHFP('pigeon', 1, 1, 'dd7c94a57191f31a0ba6fbac80fd5fbb24193e05'),
    SSHFP('pigeon', 1, 2, '84c1eba3537839e7c62e94294a6051106cab83f28fe53b30d437be749d7df5e8'),
    SSHFP('pigeon', 2, 1, '3972861c0cb1e2767343971d30ba74eae238e715'),
    SSHFP('pigeon', 2, 2, '55355fc036de3c14a618dbb569ab10801905121fa2d5b1c223fea10fceb14599'),
    SSHFP('pigeon', 3, 1, '89deeb4af3d7ad64df35ffa2291eae68a80766a1'),
    SSHFP('pigeon', 3, 2, 'e6c012db7d44f94a5a09dced22dac4fe45cfa10b4dfce666daea212f5dbbbc38'),
    SSHFP('pigeon', 4, 1, '56362c792465195f7e3d62eeee19b669de085ac0'),
    SSHFP('pigeon', 4, 2, '3410da58588af3d36aa17044f99c5c804b7d42a311a70906de71ecaa0022f1a2')
];
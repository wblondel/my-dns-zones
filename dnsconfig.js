/*
   dnsconfig.js: dnscontrol configuration file.
*/

// Providers:

var REG_NONE = NewRegistrar('none', 'NONE');
var deSEC = NewDnsProvider('desec', 'DESEC');

// "macro" for records that can be mixed into any zone

var CONTABO_WEB_SERVER_APEX = [
    A('@', '161.97.87.85'),
    AAAA('@', '2a02:c207:2045:4811::1'),

    CAA('@', 'issue', 'letsencrypt.org'),

    SSHFP('@', 1, 1, 'fd45e0017294086203f789a1f76f08aabeedd905'),
    SSHFP('@', 1, 2, '748b03f80a8f0ac2de539b25700ca5490aa66b195b42c11116245275de9e4b34'),
    SSHFP('@', 3, 1, '90cb1ed8b5b0df85f9c7960affadb830c01dac4d'),
    SSHFP('@', 3, 2, '81f50b99333c33280efb03523081b842e08ee13a11232ffe391f9e972f0cdf4e'),
    SSHFP('@', 4, 1, '7e1caf2f5673ea1d06153b460754001331d3f5fe'),
    SSHFP('@', 4, 2, 'f1d0e73421f54f148ea04762c717aa6ead3ff4680476b2c4ca6c192f1d19207f')
];

var CONTABO_WEB_SERVER_SUBDOMAIN = [
    A('einstein', '161.97.87.85'),
    AAAA('einstein', '2a02:c207:2045:4811::1'),

    SSHFP('einstein', 1, 1, 'fd45e0017294086203f789a1f76f08aabeedd905'),
    SSHFP('einstein', 1, 2, '748b03f80a8f0ac2de539b25700ca5490aa66b195b42c11116245275de9e4b34'),
    SSHFP('einstein', 3, 1, '90cb1ed8b5b0df85f9c7960affadb830c01dac4d'),
    SSHFP('einstein', 3, 2, '81f50b99333c33280efb03523081b842e08ee13a11232ffe391f9e972f0cdf4e'),
    SSHFP('einstein', 4, 1, '7e1caf2f5673ea1d06153b460754001331d3f5fe'),
    SSHFP('einstein', 4, 2, 'f1d0e73421f54f148ea04762c717aa6ead3ff4680476b2c4ca6c192f1d19207f')
];

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


// Domains:

DEFAULTS(
    DefaultTTL('1h')
);

D('parisb.rest', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('dkim._domainkey', 'v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2D+UGR/gmJLW04N2RY4DyBFsjByEJ4p5d1gpLvAEZLWX+S+a4JEf8JIRO7LxBI8ZXnlIW50mwqImgMwbSTCJ1law0/XVMiEUlIk6/C+rqNf5WyZNYHmRhvFHSCLrPq/jdzK5cPdZMqIA/RzwcN/m95GfAurkGq58Y/iZkv6WtZaynWdrkwgK99rLSruqR4LLH6memJo7dDlmRJ6GZ8PkGuBHXCSrRv18xX0PdUowl8hZm8VRvx8OWw1L0hPUJ392SKqYjN7p4JHjtxORQdDmQF/FVH8+Xgw9Bgpbns/OYWXFz/ZxNPy4tibAxtGLfKVDcf5ZGPp75i9ity1s672g3wIDAQAB')
);

D('nocontexthumans.com', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=uI73RR9Zq9XnKrmb6a5UyPAa8Gu486RIlEnxfo9u4wc'),
    TXT('dkim._domainkey', 'v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs8vJ5LfGUt2fZ3MzoO5i2BP0WTeXFkuxbS6YlznFPUj7uQ/MC2k1UC8vB6n7BmUZM2cMYLvQs8Dk1LrsFThHx6bm7gb1RrhFv7qHFi3YNhDySEbJRDrvyGIYDjznsAkvfqUYwd7fOnDuDeX7KnZ9izJZFsfpceCnWLUGiY49WoADUFWJAyDTqMCHkAeO5QOW5HiiilS8FWhyd7EtkZ5WVEdpP9yPawf2a25nqcR7seHib5SGBcZ06nbN13DhuHHR7WAWDQjYw2rWvlTBK6EMDNZBYuhp7AgwN240KxtEzkzzNEf5eBqNt1bI87bBKF4LU6/+VHhk7qkmluL8HfByRwIDAQAB')
);

D('humansnocontext.com', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=7MDxCh8kAIR12Y-WiLIJV1c9QyZE_1UEboJy0HYz6wo'),
    TXT('dkim._domainkey', 'v=DKIM1;k=rsa;t=s;s=email;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApvhI9PJ9HFGyzn9RSAjckdx+9KNn1F/VBhtQEMC09OjX0asqYbduE4cKCTRh70DiaPvcqMMH6Re/h8V6BjwU15XcYzhI80xxY3kWYq/ZyiLLGUR3LSP1otGXtVQM3J70yTmb9WpM7Bqd0sU7NdR/OxIGJAGMZQ1a1DKWNn0Jx22BmzTx8TNVz2NhAwlXlt7sxH8bqapc/r20nyOvuODxZvrr6M+jyfPur8Qx5K2lFF3tfnOpu3K/Z45I3huYRDj4GH23reW+JRlx1OyANWn01+JM8RyVnc8s1b7cRylI94eyrF6LE9/xsAw8gG+qYJatXEMOZsbWK799dtog7PqPoQIDAQAB')
);

D('williamgeraldblondel.com', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=-PHdusIhuUxLTmvLTE_HPP-Owr0QC6P6h4pJCnwehCI'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6nkxbCRXW5aigVBTS5u7/xdZ8a2gKMuCj/C5LIQKWhKuv0sEHjnj8oqQeyxxsJrmBv/2tUyY9DnZoZcMfN7fh7GnVbg0BMaIurXnUXkxfeDUCtklnW390gLGHVzdZnJVoYi6XQ6KwRCqvmANAgFltv76+m8ANxoo5N660URWzSJsqw7jSiHUzYhFZXienU94ePNH1SSrRXJSdksGuvp4j14gNoHGdWcn4g2KGayNxuAyj1Vxuxq+i5DYaoX+UXpUz//vgebk2aoITAL5Ugp9LNbvRftQFeAMMAwvn2yKw9aUBtzPMlARmboc440M+/hCk2DQOqMisKuIDIhtFrj4EQIDAQAB')
);

D('williamblondel.me', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=UCT4g0KPI-XFFSlHuRavg5Sl374ijtHdq76eKL4xDtw'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoAemeKbfFtMNbp+bdnO57sed2oZjEgbMoziagHpENsTmwC4w4/lb8IeAtdPIawrT/cNMV9IKcj1rRQPZWBbzqLOz+RKjc+Y44aMflZTI+a6HYCt/mrkwwDpb4Ecw0UfFUrVs6vvmv8UGx7dAUBkzyw9ddpbqavqzmqFO/7+YygiUf3eArA3PjdDBKjAMfc5xeiNoiaa4MnpleyZpVduB9D8421tJThUabuqQ+JdYJyzgUlhiK+Vv2tX/oYoM1u1ud0j30N9g/2b9Otom4VDdew2kdSv00/GtBldErRHDuT995oqXFCr+5twp56g2E87qSqI9ZJxwhqjDCBawgjVFoQIDAQAB')
);

D('williamblondel.com', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=GEYEnGb82U27JpPR3oG-FzJ8Im49KiyCa3rGzcViDmk'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2bz9Hm77fkCIgqqnFqtWyfmOLiZxYQmL64Dzhfqo2WefcUfYeXqwUn0sTaajJPF9arXpSWyuFUcKnNx6pNKnYPlR/9RVU+N+WGk6ZinlzEpkLrG753nhQyukiLWV4QJNRoNpI3uCALYWRmcT5ua/plS1+RniJ5ojZvVHiIOE3fdzlfTldhO3mHJ6MCStX+CYYdaauNsA31W8SvkllkEKoFYaQCgojs6nKNHKnk2L1X/NXMPQZ53ItysvvoDrT+tikQcVcYqMC4kmb1cCb/tT/oXdMM88Ff+1HJoTy8uhEQdpi1fTItYgKPEnoD6TxtjSmLPlwwBq8bA4H5I3QfMEvQIDAQAB')
);

D('williamblondel.fr', REG_NONE, DnsProvider(deSEC),
    CONTABO_WEB_SERVER_APEX,
    CONTABO_WEB_SERVER_SUBDOMAIN,
    I_AM_PIGEON_MAIL_SERVER,
    
    CNAME('www', '@'),
    CNAME('actes', 'einstein'),

    MX('@', 10, 'pigeon.williamblondel.fr.'),

    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    TXT('@', 'google-site-verification=AsBRY1djNmUyPuEhPpftRTPafx6j2EtGl6xWFFAsZ0c'),
    TXT('@', 'keybase-site-verification=C_z29b6Vah7pgfISyRn2Uxd8iq4M-f3Osvr2uWbPg3E')
);

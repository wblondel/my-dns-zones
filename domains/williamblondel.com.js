D('williamblondel.com', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),

    // PulseHeberg
    A('@', '45.155.168.42'),
    AAAA('@', '2a09:6382::42'),
    CNAME('www', '@'),

    // Infomaniak email services
    CNAME('autoconfig', 'infomaniak.com.'),
    CNAME('autodiscover', 'infomaniak.com.'),
    MX('@', 5, 'mta-gw.infomaniak.ch.'),

    SPF_BUILDER({
        label: '@',
        parts: [
            'v=spf1',
            'include:spf.infomaniak.ch',
            '-all'
        ],
    }),

    DMARC_BUILDER({
        policy: 'reject',
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

    DKIM_BUILDER({
        selector: '20260214',
        version: 'DKIM1',
        pubkey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3YafTHO0+Q6/wts1GfNffKLpDhHktu2sKsfQ3mTSIZz92p8Xb1xTl0y07yO7Hmv70EKcCJKtToO9TuAta8DJAtgUaB+tbdNy8yMVsSToRDIhv5kuBAODsGiJteBaCuQLZ8qk6wIcr5ZQdl1G6Diwlu/ev+/YyrfDX75FWLjZ/yqOErQu4ZV7tCD7RqbhA3DqnA2HwLWrl6I+9QSXv8ykgj5SIPNRmLjR5QE3vIlnQimUDhJgHJ+zU6RmvQKragut1exFgYrJjzHabWcIQHbjBpdS1rhnYaevC3pU8spK009jPLL1DWL/kJigZEvglQkd0b1S1XGD0CMvBOGKETrPmQIDAQAB',
        flags: ['s'],
    }),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: [
            'letsencrypt.org'
        ],
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamblondel.com')
);
D('williamgeraldblondel.com', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),

    // PulseHeberg
    A('@', '45.155.168.42'),
    AAAA('@', '2a09:6382::42'),
    CNAME('www', '@'),

    // Infomaniak email service
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
        pubkey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4adgkdunphgGtGlFsdiIl4KgFT+NQP9mfGvS9r9s13xN4ieH4dWbvpJI9SP2asGw6gi873dAjQoq1u6vgjUoa3n3mWUdbexIWO4C6NMIV6sH70JtOvmXG3+0Od9TwWWupffkJPm/bHdnXeC0D8Gui0/Z2nMLFkQ8HcKKu2RXde0Ip9kGSykVMhIZawBk/guvxq4v/W6wLRWTl+IpQw8U7qa9CpdQLQA1AgMnnOa9N++DeyPVnuPdQbliYDiOWwN28+8e7t0xoBicCPdelNxn1+hLPZq773kYShgXPPV7yTNSMqAhzPT7tCbdO0xc4PD15lnlibYr+5FqV9imoqqyOwIDAQAB',
        flags: ['s'],
    }),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamgeraldblondel.com',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: [
            'letsencrypt.org'
        ],
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamgeraldblondel.com')
);
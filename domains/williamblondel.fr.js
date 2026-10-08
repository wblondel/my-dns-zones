D('williamblondel.fr', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),

    // GitHub Pages
    A('@', '185.199.108.153'),
    A('@', '185.199.109.153'),
    A('@', '185.199.110.153'),
    A('@', '185.199.111.153'),
    AAAA('@', '2606:50c0:8000::153'),
    AAAA('@', '2606:50c0:8001::153'),
    AAAA('@', '2606:50c0:8002::153'),
    AAAA('@', '2606:50c0:8003::153'),
    CNAME('www', 'wblondel.github.io.'),

    // HTTP: Fly.io IPs for my Caddy-only go-link/URL shortener service
    // see https://github.com/wblondel/actes.williamblondel.fr
    A('actes', '66.241.125.129'), // shared
    AAAA('actes', '2a09:8280:1::15:da5e'), // dedicated

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

    DKIM_BUILDER({
        selector: '20250331',
        version: 'DKIM1',
        pubkey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyy/QMzMsURR/kTCL0o14DXHHcLBqsogQmLeuyAMTBc1apLjfPS+heq7RXjnvFDyAOVQiPw+Fe/1aYEUUq3Z/2xkU5vLSh2B2pF0tBpZTCamhV6z1n8b6/jZCu/LgLXzbWwLTpBSaQz6VS+xHaS1li9F9XAewmVlVpzUgxm7oPy1lBzkGPauyEPaAqedOtw2M4Pbv4R28CiNvRpgcSYfNqo5RU2vV8oF5DV1PfwAnflnhxt2fpgOkMNNaAAb/gWWXfYC/Umkk4eprEQGx68cNrAkeVMj+IccE7jRE3lxLBukAC/JZtGTHfor3vaaVv8ecjOOAjc5XipSGwFqkUQKWmwIDAQAB',
        flags: ['s'],
    }),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.fr',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: [
            'letsencrypt.org'
        ],
    }),

    // Site verification
    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    TXT('_acme-challenge', 'E75XRtzVbGYQZl_CSCO704CJhlFdfvDuTfck06AePMw'),
    IncludeGoogleSiteVerification('williamblondel.fr'),
    IncludeKeybaseSiteVerification('williamblondel.fr'),
    IncludeMicrosoftSiteVerification('williamblondel.fr')
);
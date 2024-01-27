D('williamblondel.fr', REG_OVH, DnsProvider(DSP_DESEC),
    // HTTP: Hashnode blog
    UseHashnodeFor('@', true),

    // HTTP: Fly.io IPs for my Caddy-only go-link/URL shortener service
    // see https://github.com/wblondel/actes.williamblondel.fr
    A('actes', '66.241.125.129'), // shared
    AAAA('actes', '2a09:8280:1::15:da5e'), // dedicated

    // Configure emails
    I_AM_PIGEON_MAIL_SERVER,
    MX('@', 10, 'pigeon.williamblondel.fr.'),
    IncludeDkimDomainKey('williamblondel.fr', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.fr',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    // Site verification
    TXT('@', 'abuseipdb-verification=s5qjw8Yf'),
    IncludeGoogleSiteVerification('williamblondel.fr'),
    IncludeKeybaseSiteVerification('williamblondel.fr'),
    IncludeMicrosoftSiteVerification('williamblondel.fr')
);
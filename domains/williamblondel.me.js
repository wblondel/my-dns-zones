D('williamblondel.me', REG_DYNADOT,
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

    DKIM_BUILDER({
        selector: '20260214',
        version: 'DKIM1',
        pubkey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm9yQL135A8AapixmyI6Jyn/QSYsqf0YYSxlfmkXgVMGT9LKhAsIPZUQbTnGYOjyYPeicv9R1/VHcS3NZknJLsiL/wOlH73/fqbSkiQ4owchmuqUShuckAeAj5FXs2Vr4LnZwlmI5K80CpGicLcZqqcBvGoITE+8JIC9hheKaJI8DjXLr78fXkGYPMoAoT4cKuVMR6kWIkWyllhMO1pvCIUPqOU1F4+XzFDGkg+vzKApVCigVWGfWQzFSgAexsLqhV9hvN3s8lF2wl/lM9F8BaePrKMsQ+jgvU0idRdosZ4GSFjggzuNr5szX39DRwFBrT+rOeQ6Ap6PFDPbWViwmawIDAQAB',
        flags: ['s'],
    }),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.me',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: [
            'letsencrypt.org'
        ],
    }),

    // Site verification
    IncludeGoogleSiteVerification('williamblondel.me')
);
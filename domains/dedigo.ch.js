D('dedigo.ch', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_DESEC, 2),
    
    // Configure emails
    UsePigeonMailServerFor('@'),
    IncludeDkimDomainKey('dedigo.ch', 'DKIM1', 'rsa', 's', 'email', false),

    // CAA
    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@dedigo.ch',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    })
)
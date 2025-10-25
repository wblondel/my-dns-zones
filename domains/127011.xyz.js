D('127011.xyz', REG_DYNADOT,
    // DNS Zone locations
    DnsProvider(DSP_CLOUDFLARE, 2),
    DefaultTTL(1),

    // Infomaniak emails
    CNAME('autoconfig', 'infomaniak.com.'),
    CNAME('autodiscover', 'infomaniak.com.'),
    MX('@', 5, 'mta-gw.infomaniak.ch.'),

    SPF_BUILDER({
        label: '@',
        parts: [
            'v=spf1',
            'include:spf.infomaniak.ch',
            // See https://www.mailhardener.com/blog/why-mailhardener-recommends-spf-softfail-over-fail
            '~all'
        ],
    }),

    DKIM_BUILDER({
        selector: "20250405",
        flags: ['s'],
        pubkey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsz2wuRJwhqnY/MbFX0jgSWaM7k2I5jalXWbEkFvllniHQJJE3bFCDbJu3lNRbtfUAA4W5zax5w/ZYudweFSQAxAogheod3s6DzkahbSpPMrPB63Ehq16JO5f+XYlGap/WE9dezthhwivKpgv3wiePeCIAgLRnkHsQzKkLNqtjKS++jN7OJtEd/9UOq1ejTWxOZCDnRnOYP5Q0eVZm+Xgcc80B/tdYz6gfhRptBSZ8079A5hk1bKv9V/9CUk/440WxuvEEQs20NHCkwz0B5d8bRC+gMRBghIxened8WtmhBATpulZXIem+TICfxEpTU7VyvVmlPvyn0nIaaWn7bKzdwIDAQAB",
    })
);
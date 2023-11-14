var CONTABO_WEB_SERVER_APEX = [
    A('@', '161.97.87.85'),
    AAAA('@', '2a02:c207:2045:4811::1'),

    CAA_BUILDER({
        label: '@',
        iodef: 'mailto:security@williamblondel.fr',
        iodef_critical: true,
        issue: [
            'letsencrypt.org'
        ],
        issuewild: 'none',
    }),

    SSHFP('@', 1, 1, 'fd45e0017294086203f789a1f76f08aabeedd905'),
    SSHFP('@', 1, 2, '748b03f80a8f0ac2de539b25700ca5490aa66b195b42c11116245275de9e4b34'),
    SSHFP('@', 3, 1, '90cb1ed8b5b0df85f9c7960affadb830c01dac4d'),
    SSHFP('@', 3, 2, '81f50b99333c33280efb03523081b842e08ee13a11232ffe391f9e972f0cdf4e'),
    SSHFP('@', 4, 1, '7e1caf2f5673ea1d06153b460754001331d3f5fe'),
    SSHFP('@', 4, 2, 'f1d0e73421f54f148ea04762c717aa6ead3ff4680476b2c4ca6c192f1d19207f')
];
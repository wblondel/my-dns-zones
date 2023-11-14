D('williamblondel.me', REG_OVH, DnsProvider(DSP_DESEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=UCT4g0KPI-XFFSlHuRavg5Sl374ijtHdq76eKL4xDtw'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoAemeKbfFtMNbp+bdnO57sed2oZjEgbMoziagHpENsTmwC4w4/lb8IeAtdPIawrT/cNMV9IKcj1rRQPZWBbzqLOz+RKjc+Y44aMflZTI+a6HYCt/mrkwwDpb4Ecw0UfFUrVs6vvmv8UGx7dAUBkzyw9ddpbqavqzmqFO/7+YygiUf3eArA3PjdDBKjAMfc5xeiNoiaa4MnpleyZpVduB9D8421tJThUabuqQ+JdYJyzgUlhiK+Vv2tX/oYoM1u1ud0j30N9g/2b9Otom4VDdew2kdSv00/GtBldErRHDuT995oqXFCr+5twp56g2E87qSqI9ZJxwhqjDCBawgjVFoQIDAQAB')
);
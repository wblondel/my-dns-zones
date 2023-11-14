D('williamblondel.com', REG_OVH, DnsProvider(DSP_DESEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=GEYEnGb82U27JpPR3oG-FzJ8Im49KiyCa3rGzcViDmk'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2bz9Hm77fkCIgqqnFqtWyfmOLiZxYQmL64Dzhfqo2WefcUfYeXqwUn0sTaajJPF9arXpSWyuFUcKnNx6pNKnYPlR/9RVU+N+WGk6ZinlzEpkLrG753nhQyukiLWV4QJNRoNpI3uCALYWRmcT5ua/plS1+RniJ5ojZvVHiIOE3fdzlfTldhO3mHJ6MCStX+CYYdaauNsA31W8SvkllkEKoFYaQCgojs6nKNHKnk2L1X/NXMPQZ53ItysvvoDrT+tikQcVcYqMC4kmb1cCb/tT/oXdMM88Ff+1HJoTy8uhEQdpi1fTItYgKPEnoD6TxtjSmLPlwwBq8bA4H5I3QfMEvQIDAQAB')
);
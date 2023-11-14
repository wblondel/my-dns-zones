D('williamgeraldblondel.com', REG_OVH, DnsProvider(DSP_DESEC),
    CONTABO_WEB_SERVER_APEX,
    USE_PIGEON_MAIL_SERVER,

    CNAME('www', '@'),
    TXT('@', 'google-site-verification=-PHdusIhuUxLTmvLTE_HPP-Owr0QC6P6h4pJCnwehCI'),
    TXT('dkim._domainkey', 'v=DKIM1; k=rsa; t=s; s=email; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6nkxbCRXW5aigVBTS5u7/xdZ8a2gKMuCj/C5LIQKWhKuv0sEHjnj8oqQeyxxsJrmBv/2tUyY9DnZoZcMfN7fh7GnVbg0BMaIurXnUXkxfeDUCtklnW390gLGHVzdZnJVoYi6XQ6KwRCqvmANAgFltv76+m8ANxoo5N660URWzSJsqw7jSiHUzYhFZXienU94ePNH1SSrRXJSdksGuvp4j14gNoHGdWcn4g2KGayNxuAyj1Vxuxq+i5DYaoX+UXpUz//vgebk2aoITAL5Ugp9LNbvRftQFeAMMAwvn2yKw9aUBtzPMlARmboc440M+/hCk2DQOqMisKuIDIhtFrj4EQIDAQAB')
);
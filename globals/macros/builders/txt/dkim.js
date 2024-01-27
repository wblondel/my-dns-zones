/**
 * @param {string} domain
 * @param {string} v
 * @param {string} k
 * @param {string} t
 * @param {string} s
 * @param {boolean} spacesSeparator
 */
function IncludeDkimDomainKey(domain, v, k, t, s, spacesSeparator) {
    var common = [
        v ? 'v='+v+';' : null,
        k ? 'k='+k+';' : null,
        t ? 't='+t+';' : null,
        s ? 's='+s+';' : null
    ].filter(Boolean);

    var keys = {
        'nocontexthumans.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs8vJ5LfGUt2fZ3MzoO5i2BP0WTeXFkuxbS6YlznFPUj7uQ/MC2k1UC8vB6n7BmUZM2cMYLvQs8Dk1LrsFThHx6bm7gb1RrhFv7qHFi3YNhDySEbJRDrvyGIYDjznsAkvfqUYwd7fOnDuDeX7KnZ9izJZFsfpceCnWLUGiY49WoADUFWJAyDTqMCHkAeO5QOW5HiiilS8FWhyd7EtkZ5WVEdpP9yPawf2a25nqcR7seHib5SGBcZ06nbN13DhuHHR7WAWDQjYw2rWvlTBK6EMDNZBYuhp7AgwN240KxtEzkzzNEf5eBqNt1bI87bBKF4LU6/+VHhk7qkmluL8HfByRwIDAQAB',
        'parisb.rest': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2D+UGR/gmJLW04N2RY4DyBFsjByEJ4p5d1gpLvAEZLWX+S+a4JEf8JIRO7LxBI8ZXnlIW50mwqImgMwbSTCJ1law0/XVMiEUlIk6/C+rqNf5WyZNYHmRhvFHSCLrPq/jdzK5cPdZMqIA/RzwcN/m95GfAurkGq58Y/iZkv6WtZaynWdrkwgK99rLSruqR4LLH6memJo7dDlmRJ6GZ8PkGuBHXCSrRv18xX0PdUowl8hZm8VRvx8OWw1L0hPUJ392SKqYjN7p4JHjtxORQdDmQF/FVH8+Xgw9Bgpbns/OYWXFz/ZxNPy4tibAxtGLfKVDcf5ZGPp75i9ity1s672g3wIDAQAB',
        'williamblondel.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2bz9Hm77fkCIgqqnFqtWyfmOLiZxYQmL64Dzhfqo2WefcUfYeXqwUn0sTaajJPF9arXpSWyuFUcKnNx6pNKnYPlR/9RVU+N+WGk6ZinlzEpkLrG753nhQyukiLWV4QJNRoNpI3uCALYWRmcT5ua/plS1+RniJ5ojZvVHiIOE3fdzlfTldhO3mHJ6MCStX+CYYdaauNsA31W8SvkllkEKoFYaQCgojs6nKNHKnk2L1X/NXMPQZ53ItysvvoDrT+tikQcVcYqMC4kmb1cCb/tT/oXdMM88Ff+1HJoTy8uhEQdpi1fTItYgKPEnoD6TxtjSmLPlwwBq8bA4H5I3QfMEvQIDAQAB',
        'williamblondel.fr': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzT5Lk7vu33GtlbexF1lYjvLfTaJ2vmtFFgaz0e07W3RzYXz/MRZ3OZUmOuxxipuyu/wJRkJdYZ7KfjBvBLGC1D1VxLM5woDwalvFQYxperCw+9lA4mgNh2gA5CQkwSzAfZXRv+GSzurp/XmYQSbO+mtK71VK2Rz5R9wDjK73wIoHA2ZW/dAnf5uWfj/Me6Uf5GU1J2kjjr5iYhjYAQ/iMF23zUvrt3R1s8sE8TUbwe3eaw7V04hwMpIqngvTHEv+Jkzv+Zu9umylVBjWKIeLbvV1qGZtiznlWChhFFj3jPBcaAOHGrwutWzVMLSQKPseCkjBtd/igQTW7K4HTXJoKwIDAQAB',
        'williamblondel.me': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoAemeKbfFtMNbp+bdnO57sed2oZjEgbMoziagHpENsTmwC4w4/lb8IeAtdPIawrT/cNMV9IKcj1rRQPZWBbzqLOz+RKjc+Y44aMflZTI+a6HYCt/mrkwwDpb4Ecw0UfFUrVs6vvmv8UGx7dAUBkzyw9ddpbqavqzmqFO/7+YygiUf3eArA3PjdDBKjAMfc5xeiNoiaa4MnpleyZpVduB9D8421tJThUabuqQ+JdYJyzgUlhiK+Vv2tX/oYoM1u1ud0j30N9g/2b9Otom4VDdew2kdSv00/GtBldErRHDuT995oqXFCr+5twp56g2E87qSqI9ZJxwhqjDCBawgjVFoQIDAQAB',
        'williamgeraldblondel.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6nkxbCRXW5aigVBTS5u7/xdZ8a2gKMuCj/C5LIQKWhKuv0sEHjnj8oqQeyxxsJrmBv/2tUyY9DnZoZcMfN7fh7GnVbg0BMaIurXnUXkxfeDUCtklnW390gLGHVzdZnJVoYi6XQ6KwRCqvmANAgFltv76+m8ANxoo5N660URWzSJsqw7jSiHUzYhFZXienU94ePNH1SSrRXJSdksGuvp4j14gNoHGdWcn4g2KGayNxuAyj1Vxuxq+i5DYaoX+UXpUz//vgebk2aoITAL5Ugp9LNbvRftQFeAMMAwvn2yKw9aUBtzPMlARmboc440M+/hCk2DQOqMisKuIDIhtFrj4EQIDAQAB'
    }

    var txtSelector = 'dkim._domainkey';

    var parts = domain.split('.');

    if (parts.length > 2) {
        txtSelector += '.' + parts.slice(0, -2).join('.');
    }

    return TXT(txtSelector, common.concat(keys[domain]).join(spacesSeparator ? ' ' : ''));
}
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
        'nocontexthumans.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs66CtO7nC90ZaxaMVuT5wBfQJpVT8PmEFsWogL6OW0/ZAp9nVyKxVR8pT58Rg7cOg0/zKoqa6K4AhEufZRJjbhrJpBOvfyypnHXJ/hc2hlWtUVK0PK14tSjvukL6iUvVega5BOKOoV3armQ0JFmhoTsKjwyEQmV9ymY8NsWebsBInV8sJLK5yp3u0t3DEbjY4kuygqgIQ6rN01sxfNhuFc4o6YHMe+tWrTWlTZ9HbCRZ4TMhn2VdPqjkpdoo1uc6wIaG6bQk5JEq1atL87RT2PKI0tBJB31wIxVEgNIPvmdFsx7agOrIKBARojpM8GhhrO9gGiX1jCvepjvJ0Ut4oQIDAQAB',
        'williamblondel.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs66CtO7nC90ZaxaMVuT5wBfQJpVT8PmEFsWogL6OW0/ZAp9nVyKxVR8pT58Rg7cOg0/zKoqa6K4AhEufZRJjbhrJpBOvfyypnHXJ/hc2hlWtUVK0PK14tSjvukL6iUvVega5BOKOoV3armQ0JFmhoTsKjwyEQmV9ymY8NsWebsBInV8sJLK5yp3u0t3DEbjY4kuygqgIQ6rN01sxfNhuFc4o6YHMe+tWrTWlTZ9HbCRZ4TMhn2VdPqjkpdoo1uc6wIaG6bQk5JEq1atL87RT2PKI0tBJB31wIxVEgNIPvmdFsx7agOrIKBARojpM8GhhrO9gGiX1jCvepjvJ0Ut4oQIDAQAB',
        'williamblondel.fr': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs66CtO7nC90ZaxaMVuT5wBfQJpVT8PmEFsWogL6OW0/ZAp9nVyKxVR8pT58Rg7cOg0/zKoqa6K4AhEufZRJjbhrJpBOvfyypnHXJ/hc2hlWtUVK0PK14tSjvukL6iUvVega5BOKOoV3armQ0JFmhoTsKjwyEQmV9ymY8NsWebsBInV8sJLK5yp3u0t3DEbjY4kuygqgIQ6rN01sxfNhuFc4o6YHMe+tWrTWlTZ9HbCRZ4TMhn2VdPqjkpdoo1uc6wIaG6bQk5JEq1atL87RT2PKI0tBJB31wIxVEgNIPvmdFsx7agOrIKBARojpM8GhhrO9gGiX1jCvepjvJ0Ut4oQIDAQAB',
        'williamblondel.me': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs66CtO7nC90ZaxaMVuT5wBfQJpVT8PmEFsWogL6OW0/ZAp9nVyKxVR8pT58Rg7cOg0/zKoqa6K4AhEufZRJjbhrJpBOvfyypnHXJ/hc2hlWtUVK0PK14tSjvukL6iUvVega5BOKOoV3armQ0JFmhoTsKjwyEQmV9ymY8NsWebsBInV8sJLK5yp3u0t3DEbjY4kuygqgIQ6rN01sxfNhuFc4o6YHMe+tWrTWlTZ9HbCRZ4TMhn2VdPqjkpdoo1uc6wIaG6bQk5JEq1atL87RT2PKI0tBJB31wIxVEgNIPvmdFsx7agOrIKBARojpM8GhhrO9gGiX1jCvepjvJ0Ut4oQIDAQAB',
        'williamgeraldblondel.com': 'p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs66CtO7nC90ZaxaMVuT5wBfQJpVT8PmEFsWogL6OW0/ZAp9nVyKxVR8pT58Rg7cOg0/zKoqa6K4AhEufZRJjbhrJpBOvfyypnHXJ/hc2hlWtUVK0PK14tSjvukL6iUvVega5BOKOoV3armQ0JFmhoTsKjwyEQmV9ymY8NsWebsBInV8sJLK5yp3u0t3DEbjY4kuygqgIQ6rN01sxfNhuFc4o6YHMe+tWrTWlTZ9HbCRZ4TMhn2VdPqjkpdoo1uc6wIaG6bQk5JEq1atL87RT2PKI0tBJB31wIxVEgNIPvmdFsx7agOrIKBARojpM8GhhrO9gGiX1jCvepjvJ0Ut4oQIDAQAB'
    }

    var txtSelector = 'dkim._domainkey';

    var parts = domain.split('.');

    if (parts.length > 2) {
        txtSelector += '.' + parts.slice(0, -2).join('.');
    }

    return TXT(txtSelector, common.concat(keys[domain]).join(spacesSeparator ? ' ' : ''));
}
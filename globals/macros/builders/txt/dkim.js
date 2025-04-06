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
        'dedigo.ch': 'p=MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAp6kxkLyegxKbIAowHh7IAjzpSU0i6VkGB8mraDNsexNKy1zj6CDEh+w1eFDSjFXmc020gh8I3DgMZ5P5Nhfq6+0Kfmx+EhOChqZSJ8hYuQnfNi2k0th+iXRFl1URFGOLJlUtPpOW7G0ZgqYsID2oCp8FhpA/QPfW86eNEP7ICQqEQ9PCXXCtXlaCLQFrXOn45q9PRSxXwo/iXHPLEh3eEk+Su8ROg0zV5lgzhegC6lcciFWe+2jLtT4kOrnLB1VHh60vAra8LY3BgvhIyzaIBkIdMFXIiU+a3SJqxH95kW393TVUR7efLfk5pwBgbiOE9/hHr7nFf74J0rM/ZtqWpfLkouyJErx/R6SrWRATjgdhvRpcra7oBLv+vkazLunvlfa6irpeX9BFHmpCC7lEUF/3OLGDT4ig64O98Afws0Cx2LLvNRpiP7JNmEd+HuPs/2V/2QuVDeL4zSP2g8vTEV3Yl9p6TtEHPcAzuX8Zp7FYShKjj6pPy7m0l5cvtQEx1dz4XJbfBUV40G6iXgr1BCCgjmXZx+mw/y/GLMcqBZR44U9ZXH9YDWh3XzRyh1aysmMe9W3aIZnyLhX/7hR4IxDmJm+lW+CPHHVH1VlvrrItFv6O/eOBB4kssz6qmKljeXYoCR9eOPtdzg3cZr92LaqDCVCnu7rezGBAgI2CkLcCAwEAAQ==',
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
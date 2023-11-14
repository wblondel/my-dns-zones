/*
   dnsconfig.js: dnscontrol configuration file.
*/

// Providers:
require('./globals/providers.js');

// "macro" for records that can be mixed into any zone
require_glob('./globals/macros/', false);

// Domains:
DEFAULTS(
    DefaultTTL('1h')
);

require_glob('./domains/', false);
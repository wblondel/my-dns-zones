// Shows the status.json written by scripts/domain-health.sh. Everything that comes from
// that file is rendered as text (never as HTML): the notes include text from external APIs.
// This is a module (see index.html): it is strict, and its constants stay out of the global scope.

const STALE_AFTER_HOURS = 36;
const SEVERITY = { FAIL: 0, WARN: 1, OK: 2 };
const LABEL = { OK: 'OK', WARN: 'Warning', FAIL: 'Failing' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function cell(label, ...children) {
  const td = el('td');
  td.dataset.label = label;
  td.append(...children);
  return td;
}

function plural(count, word) {
  return count + ' ' + word + (count === 1 ? '' : 's');
}

function formatUtc(date) {
  return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
}

function formatAge(ms) {
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return 'less than an hour ago';
  if (hours < 48) return plural(hours, 'hour') + ' ago';
  return plural(Math.floor(hours / 24), 'day') + ' ago';
}

function resultKey(domain) {
  // Anything unexpected is shown as a failure rather than hidden.
  return Object.hasOwn(SEVERITY, domain.result) ? domain.result : 'FAIL';
}

function textOrDash(value) {
  return value ? el('span', null, value) : el('span', 'muted', '—');
}

function dnssecNode(domain) {
  const label = domain.dnssec === 'valid' ? 'Valid' : domain.dnssec === 'off' ? 'Off' : '—';
  const node = el('span', null, label);
  if (domain.dnssec_expected) node.append(el('span', 'muted', ' · '), el('span', 'muted nowrap', 'expected'));
  return node;
}

function expiresNode(domain, status) {
  if (!domain.expires) return el('span', 'muted', '—');
  const node = el('span', null, domain.expires);
  if (typeof domain.days_left === 'number') {
    const tone = domain.days_left < status.fail_days ? 'low' : domain.days_left < status.warn_days ? 'soon' : 'muted';
    node.append(el('span', 'muted', ' · '), el('span', tone + ' nowrap', plural(domain.days_left, 'day') + ' left'));
  }
  return node;
}

function renderRows(domain, status) {
  const key = resultKey(domain);
  const rows = [];

  const tool = el('a', 'tool', 'DNSViz');
  tool.href = 'https://dnsviz.net/d/' + encodeURIComponent(domain.domain) + '/dnssec/';
  tool.target = '_blank';
  tool.rel = 'noopener noreferrer';

  const name = el('span', null);
  name.append(el('span', 'name', domain.domain), tool);

  const row = el('tr', 'row');
  row.append(
    cell('Domain', name),
    cell('Status', el('span', 'pill ' + key.toLowerCase(), LABEL[key])),
    cell('Registrar', textOrDash(domain.registrar)),
    cell('DNS provider', textOrDash((domain.dns_providers || []).join(', '))),
    cell('Lookup', el('span', null, domain.dns || '—')),
    cell('DNSSEC', dnssecNode(domain)),
    cell('Expires', expiresNode(domain, status)),
  );
  rows.push(row);

  if (domain.notes) {
    const note = el('tr', 'notes');
    const td = el('td', null, domain.notes);
    td.colSpan = 7;
    note.append(td);
    rows.push(note);
  }
  return rows;
}

function render(status) {
  const domains = status.domains.slice().sort((a, b) =>
    SEVERITY[resultKey(a)] - SEVERITY[resultKey(b)] ||
    (a.days_left ?? Infinity) - (b.days_left ?? Infinity) ||
    a.domain.localeCompare(b.domain));

  const failing = domains.filter((d) => resultKey(d) === 'FAIL').length;
  const warning = domains.filter((d) => resultKey(d) === 'WARN').length;

  const summary = document.getElementById('summary');
  if (failing > 0) {
    summary.className = 'summary fail';
    summary.textContent = plural(failing, 'domain') + ' failing' +
      (warning > 0 ? ', ' + plural(warning, 'warning') : '');
  } else if (warning > 0) {
    summary.className = 'summary warn';
    summary.textContent = plural(warning, 'domain') + ' with a warning';
  } else {
    summary.className = 'summary ok';
    summary.textContent = 'All ' + plural(domains.length, 'domain') + ' healthy';
  }

  const generated = new Date(status.generated_at);
  const updated = document.getElementById('updated');
  if (Number.isNaN(generated.getTime())) {
    updated.textContent = 'Last check time unknown';
  } else {
    const age = Date.now() - generated.getTime();
    updated.textContent = 'Last checked ' + formatAge(age) + ' (' + formatUtc(generated) + '). ' +
      'Expiry: warning under ' + plural(status.warn_days, 'day') + ', failure under ' + plural(status.fail_days, 'day') + '.';
    if (age > STALE_AFTER_HOURS * 3600000) {
      const stale = document.getElementById('stale');
      stale.textContent = 'This data is stale: the last check ran ' + formatAge(age) +
        '. The scheduled workflow may have stopped, check the workflow runs below.';
      stale.hidden = false;
    }
  }

  const body = document.querySelector('#domains tbody');
  body.replaceChildren(...domains.flatMap((d) => renderRows(d, status)));
  document.getElementById('domains').hidden = false;
}

function fail(message) {
  const summary = document.getElementById('summary');
  summary.className = 'summary fail';
  summary.textContent = message;
}

fetch('status.json', { cache: 'no-store' })
  .then((response) => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(render)
  .catch((error) => fail('Could not load the status (' + error.message + ')'));

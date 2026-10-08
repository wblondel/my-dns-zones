// Every line marked "// sink" must be flagged as an error by Biome (scripts/lint.sh checks it).
// This file is never loaded by a page. See .biome/no-html-sinks.grit and biome.jsonc.
el.innerHTML = x; // sink
el.innerHTML += x; // sink
el . innerHTML = x; // sink
const html = el.innerHTML; // sink
parent.outerHTML = x; // sink
parent.outerHTML += x; // sink
el.insertAdjacentHTML('beforeend', x); // sink
el.insertAdjacentHTML ('beforeend', x); // sink
document.write(x); // sink
document . write (x); // sink
document.writeln(x); // sink
window.document.write(x); // sink
const a = new Function("return 1"); // sink
const b = new Function ("return 1"); // sink
const c = new  Function("return 1"); // sink
const d = Function("return 1"); // sink
const e = window.Function("return 1"); // sink
const f = new /* a comment */ Function("return 1"); // sink
const g = new // sink
  Function("return 1");
const h = new globalThis.Function("return 1"); // sink
el["innerHTML"] = x; // sink
el['innerHTML'] = x; // sink
el["innerHTML"] += x; // sink
const i = el["innerHTML"]; // sink
el["outerHTML"] = x; // sink
el["insertAdjacentHTML"]("beforeend", x); // sink
el[`innerHTML`] = x; // sink
eval("1"); // sink
window.eval("1"); // sink

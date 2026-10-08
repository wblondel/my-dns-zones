// None of this may be flagged as an error: the words are only in comments, strings and names.
// innerHTML, outerHTML, insertAdjacentHTML, document.write, new Function(
const label = "innerHTML is forbidden, so are new Function( and document.write(";
const innerHTMLLength = 1;
const functionName = 'Function';
const retrieval = (x) => x;
function helper() { return retrieval(innerHTMLLength); }
const fn = function () { return 1; };
const o = { write: (s) => s, Function: 1 };
o.write(fn());
el.textContent = label + functionName + helper();
el.append(document.createTextNode(label));

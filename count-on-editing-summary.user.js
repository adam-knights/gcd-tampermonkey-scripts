// ==UserScript==
// @name         Count on editing summary
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Show a count of pending on editing summary page
// @author       Adam Knights
// @match        https://www.comics.org/queues/editing/
// @grant        none
// @require https://code.jquery.com/jquery-3.5.1.js
// ==/UserScript==

/* eslint-env jquery */

function sumCounts() {
  let rows = $('table.border-gray-200 tr');

  if (rows.length === 0) {
    return 0;
  }

  let count = $.map(rows, r => $.map($(r).find('td:eq(0)'), c => parseInt($(c).text().trim()))).reduce((a, b) => isNaN(a) && isNaN(b) ? 0 : isNaN(a) ? b : isNaN(b) ? a : a + b);
  return isNaN(count) ? 0 : count;
}

(async function() {
  'use strict';

  let total = sumCounts();
  $('h1').text($('h1').text() + `(Pending count is ${total} IMPs)`);
})();
// ==UserScript==
// @name         Compare characters helper
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Helper to show possible errors when migrating characters
// @author       Adam Knights
// @match        https://www.comics.org/changeset/*/compare/
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

function getCountHtml(countLeft, countRight) {
  let leftText = countLeft;
  let rightText = countRight;
  let trClass = "border flex flex-col max-sm:border sm:table-row";
  if (countLeft < countRight) {
    rightText = `<span class="added">${countRight}</span>`;
    trClass = trClass + " changed";
  }
  else if (countLeft > countRight) {
    rightText = `<span class="deleted">${countRight}</span>`;
    trClass = trClass + " changed";
  }

  return `<tr class="${trClass}"><td class="field_name">Char Count</td><td>${leftText}</td><td>${rightText}</td></tr>`;
}

function insertCompareHtml(insertBefore, thingsOnLeftNotInRight, thingsOnRightNotInLeft) {
  if (thingsOnLeftNotInRight.length === 0 && thingsOnRightNotInLeft.length === 0) {
    return;
  }

  let leftText = '';
  let rightText = '';

  if (thingsOnLeftNotInRight.length > 0) {
      leftText = thingsOnLeftNotInRight.sort().join('<br>');
  }

  if (thingsOnRightNotInLeft.length > 0) {
      rightText = thingsOnRightNotInLeft.sort().join('<br>');
  }

  insertBefore.before(`<tr class="border flex flex-col max-sm:border sm:table-row changed"><td class="field_name">Character Diffs</td><td>${leftText}</td><td>${rightText}</td></tr>`);
  return;
}

function parse(str) {
let result = [], item = '', depth = 0;

function push() { if (item) result.push(item.trim()); item = ''; }

for (let i = 0; i < str.length; i++) {
  const c = str[i]
  if (!depth && (c === ';' || c === '\n')) push();
  else {
    item += c;
    if (c === '[' || c === '(') depth++;
    if (c === ']' || c === ')') depth--;
  }
}

push();
return result;
}

(async function() {
  'use strict';

  $('tr.flex-col td:contains(Characters)').each(function() {
      // Check this is a change, and not a new addition
      if ($(this).first().parent().parent().children().first().children().last().text().trim() === 'Added') {
        return;
      }

      let left = $(this).next().text().trim();
      let right = $(this).next().next().text().trim();

      if (!left || !right) {
        return;
      }

      // Handle the compare helper that shows disambiguations, for now we ignore that
      left = left.split("For information")[0];
      right = right.split("For information")[0];

      const countLeft = 1 + (left.match(new RegExp(";", "g")) || []).length;
      const countRight = 1 + (right.match(new RegExp(";", "g")) || []).length;
      $(this).parent().before(getCountHtml(parseInt(countLeft), parseInt(countRight)));

      const leftChars = parse(left);
      const rightChars = parse(right);

      const thingsOnLeftNotInRight = leftChars.filter(x => !rightChars.includes(x));
      const thingsOnRightNotInLeft = rightChars.filter(x => !leftChars.includes(x));

      insertCompareHtml($(this).parent(), thingsOnLeftNotInRight, thingsOnRightNotInLeft);
  });
})();
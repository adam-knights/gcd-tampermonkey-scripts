// ==UserScript==
// @name         Migrate features too
// @namespace    http://tampermonkey.net/
// @version      0.5.0
// @description  Take editor text credits and move to creators
// @author       Adam Knights
// @match        https://www.comics.org/changeset/*/edit/
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

function getMigrateButtonHtml(storyId, nextPos) {
    return `<form id="adam-inserted-migrate-${storyId}-${nextPos}" class="story_button" method="POST" style="color: red" action="/story/revision/${storyId}/migrate/">
        <button class="btn-blue-editing inline"><input type="submit" value="Migrate Feature" style="color: red"></button>
      </form>`;
}

(async function() {
    'use strict';

    let csrfCopy = $('[name="csrfmiddlewaretoken"]').eq(-2);

    let nextPos = 0;
    $('input[value="Edit"]').eq(0).closest('table').find('tr').each((index, element) => {
        const hasMigrateAlready = $(element).find('input[value="Migrate Credits"]').length === 1;

        const hasFeatureObjectAlready = $(element).find('a[href*="feature"]').length >= 1;

        const hasNoFeature = $(element).find('span:contains("no feature")').length === 1;

        console.log(element);

        if (!hasMigrateAlready && !hasFeatureObjectAlready && !hasNoFeature) {
            const storyId = $(element).find('input[value="Edit"]').eq(0).attr('name').substring(5); // edit_ = 5 chars
            $(element).find('td').last().append(getMigrateButtonHtml(storyId, nextPos));
            $(`#adam-inserted-migrate-${storyId}-${nextPos}`).prepend(csrfCopy.clone());
            nextPos++;
        }
    });
})();
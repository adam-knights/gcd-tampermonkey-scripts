// ==UserScript==
// @name         Migrate features too
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Take editor text credits and move to creators
// @author       Adam Knights
// @match        https://www.comics.org/changeset/*/edit/
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

function getMigrateButtonHtml(storyId, nextPos) {
    return `<form id="adam-inserted-migrate-${storyId}-${nextPos}" class="story_button" method="POST" style="color: red" action="/story/revision/${storyId}/migrate/">
        <input type="submit" value="Migrate Feature" style="color: red">
      </form>`;
}

(async function() {
    'use strict';

    let csrfCopy;
    if ($('.story_list').length >= 4) {
        csrfCopy = $('.story_list').eq(3).find('[name="csrfmiddlewaretoken"]').eq(0);
    } else if ($('.story_list').length === 2) {
        csrfCopy = $('.story_list').eq(1).find('[name="csrfmiddlewaretoken"]').eq(0);
    } else {
        return;
    }

    let nextPos = 0;
    $('.story_list').eq(1).find('tr').each((index, element) => {
        const hasMigrateAlready = $(element).find('input[value="Migrate Credits"]').length === 1;

        const hasFeatureObjectAlready = $(element).find('a[href*="feature"]').length >= 1;

        const hasNoFeature = $(element).find('span:contains("no feature")').length === 1;

        if (!hasMigrateAlready && !hasFeatureObjectAlready && !hasNoFeature) {
            const storyId = $(element).find('input[value="Edit"]').eq(0).attr('name').substring(5); // edit_ = 5 chars
            $(element).find('td').last().append(getMigrateButtonHtml(storyId, nextPos));
            $(`#adam-inserted-migrate-${storyId}-${nextPos}`).prepend(csrfCopy.clone());
            nextPos++;
        }
    });
})();
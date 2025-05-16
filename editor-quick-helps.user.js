// ==UserScript==
// @name         Editor quick helps
// @namespace    http://tampermonkey.net/
// @version      0.4.1
// @description  Various quick helpers such as add assign button to top of page for editors
// @author       Adam Knights
// @match        https://www.comics.org/changeset/*/compare/
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.js
// ==/UserScript==

/* eslint-env jquery */

(async function() {
    'use strict';

    var $ = window.jQuery;

    // Add series search button on new series changesets
    if ($('h1 a').length > 0 && $('h1 a').prop('href').includes('/series/revision/')) {
        let series = $('h1 a').text().replace(' ', '+');
        if (series.includes('(')) {
            series = series.split('(')[0].trim();
        }
        $(`<a href="/searchNew/?q=${series}&selected_facets=facet_model_name_exact:series" class="btn-blue-editing inline" target="_blank">Search for similar series</a>`).insertAfter('h1');
    }

    // Add creator search button on new creator changesets
    if ($('h1 a').length > 0 && $('h1 a').prop('href').includes('/creator/revision/')) {
        let creator = $('h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${creator}&selected_facets=facet_model_name_exact:creator" class="btn-blue-editing inline" target="_blank">Search for similar creator</a>`).insertAfter('h1');
    }

    // Add feature search button on new feature changesets
    if ($('h1 a').length > 0 && $('h1 a').prop('href').includes('/feature/revision/')) {
        let feature = $('h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${feature}&selected_facets=facet_model_name_exact:feature" class="btn-blue-editing inline" target="_blank">Search for similar feature</a>`).insertAfter('h1');
    }

    // Add character search button on new feature changesets
    if ($('h1 a').length > 0 && $('h1 a').prop('href').includes('/character/revision/')) {
        let character = $('h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${character}&selected_facets=facet_model_name_exact:character" class="btn-blue-editing inline" target="_blank">Search for similar character</a>`).insertAfter('h1');
    }

    // Add group search button on new group changesets
    if ($('h1 a').length > 0 && $('h1 a').prop('href').includes('/group/revision/')) {
        let group = $('h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${group}&selected_facets=facet_model_name_exact:group" class="btn-blue-editing inline" target="_blank">Search for similar group</a>`).insertAfter('h1');
    }

    // Add assign to top of changeset pages where one exists at the bottom
    if ($('button[name="assign"]').length > 0) {
        $(`<button id="topAssign" class="btn-blue-editing" type="button"> Assign </button>`).insertAfter('h1');
        $('#topAssign').click(() => $('button[name="assign"]').click());
    }

    // Add approve to top of changeset pages where one exists at the bottom, where it saves scrolling on things like covers
    if ($('button[name="approve"]').length > 0) {
        $(`<button id="topApprove" class="btn-blue-editing" type="button"> Approve </button>`).insertAfter('h1');
        $('#topApprove').click(() => $('button[name="approve"]').click());
    }
})();
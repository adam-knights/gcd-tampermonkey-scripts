// ==UserScript==
// @name         Editor quick helps
// @namespace    http://tampermonkey.net/
// @version      0.3
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
    if ($('.body_content h1 a').length > 0 && $('.body_content h1 a').prop('href').includes('/series/revision/')) {
        let series = $('.body_content h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${series}&selected_facets=facet_model_name_exact:series" target="_blank">Search for similar series</a>`).insertAfter('.body_content h1')
    }

    // Add creator search button on new creator changesets
    if ($('.body_content h1 a').length > 0 && $('.body_content h1 a').prop('href').includes('/creator/revision/')) {
        let creator = $('.body_content h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${creator}&selected_facets=facet_model_name_exact:creator" target="_blank">Search for similar creator</a>`).insertAfter('.body_content h1')
    }

    // Add feature search button on new feature changesets
    if ($('.body_content h1 a').length > 0 && $('.body_content h1 a').prop('href').includes('/feature/revision/')) {
        let feature = $('.body_content h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${feature}&selected_facets=facet_model_name_exact:feature" target="_blank">Search for similar feature</a>`).insertAfter('.body_content h1')
    }

    // Add character search button on new feature changesets
    if ($('.body_content h1 a').length > 0 && $('.body_content h1 a').prop('href').includes('/character/revision/')) {
        let character = $('.body_content h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${character}&selected_facets=facet_model_name_exact:character" target="_blank">Search for similar character</a>`).insertAfter('.body_content h1')
    }

    // Add character search button on new group changesets
    if ($('.body_content h1 a').length > 0 && $('.body_content h1 a').prop('href').includes('/group/revision/')) {
        let group = $('.body_content h1 a').text().replace(' ', '+');
        $(`<a href="/searchNew/?q=${group}&selected_facets=facet_model_name_exact:group" target="_blank">Search for similar group</a>`).insertAfter('.body_content h1')
    }

    // Add assign to top of changeset pages where one exists at the bottom
    if ($('input[name="assign"]').length > 0) {
        $(`<input id="topAssign" type="button" value="${$('input[name="assign"]').val()}">`).insertAfter('.body_content h1');
        $('#topAssign').click(() => $('input[name="assign"]').click());
    }
})();
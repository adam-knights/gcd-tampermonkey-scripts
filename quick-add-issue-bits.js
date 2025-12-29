// ==UserScript==
// @name         Quick add issue bits
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Take editor text credits and move to creators
// @author       Adam Knights
// @match        https://www.comics.org/series/*/add_issue/*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

function getWednesdayDate() {
    let d = new Date();
    d.setDate(d.getDate() + (3 + 7 - d.getDay()) % 7); // Get next wednesday or today if wednesday
    return d;
}

function getWednesday() {
    let d = getWednesdayDate();
    let dd = d.getDate();
    let mm = d.getMonth() + 1;
    dd = (dd > 9 ? '' : '0') + dd;
    mm = (mm > 9 ? '' : '0') + mm;
    return `${d.getFullYear()}-${mm}-${dd}`;
}

function getPublicationDate(offset) {
    const d = getWednesdayDate();
    const m = (d.getMonth() + offset) % 12;
    const addYear = m < d.getMonth() ? 1 : 0;
    const p = new Date(d.getFullYear() + addYear, m, 1);
    const monthName = p.toLocaleString('default', { month: 'long' });

    return `${monthName} ${p.getFullYear()}`;
}

function brandBoomEmblemAfterHtml() {
  return `<span class="select2-selection__clear" title="Remove all items" data-select2-id="29">×</span><li class="select2-selection__choice" title="&lt;img class=&quot;inline&quot; src=&quot;https://files1.comics.org/CACHE/images/img/gcd/generic_images/32/32211/81a1031ec49523d2db3507e67f55b51d.jpg&quot;&gt; Boom! Studios [Rectangle]" data-select2-id="28"><span class="select2-selection__choice__remove" role="presentation">×</span><span><img class="inline" src="https://files1.comics.org/CACHE/images/img/gcd/generic_images/32/32211/81a1031ec49523d2db3507e67f55b51d.jpg"> Boom! Studios [Rectangle]</span></li><li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="0" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" placeholder="" style="width: 0.75em;"></li>`;
}

function brandBoomEmblemSelectHtml() {
    return `<option value="6418" data-select2-id="25">&lt;img class="inline">Boom! Studios [Rectangle]</option>`;
}

function brandMarvelEmblemAfterHtml() {
  return `<span class="select2-selection__clear" title="Remove all items" data-select2-id="95">×</span><li class="select2-selection__choice" title="&lt;img class=&quot;inline&quot; src=&quot;https://files1.comics.org/CACHE/images/img/gcd/generic_images/16/16302/28aa2d56f6b4dcab3996a647f4aa54a0.jpg&quot;&gt; Marvel [in horizontal box]" data-select2-id="94"><span class="select2-selection__choice__remove" role="presentation">×</span><span><img class="inline" src="https://files1.comics.org/CACHE/images/img/gcd/generic_images/16/16302/28aa2d56f6b4dcab3996a647f4aa54a0.jpg"> Marvel [in horizontal box]</span></li><li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="0" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" placeholder="" style="width: 0.75em;"></li>`;
}

function brandMarvelEmblemSelectHtml() {
    return `<option value="5218" data-select2-id="91">&lt;img class="inline">Marvel [in horizontal box]</option>`;
}

function getNextIssueNumber() {
    const optionLen = $('#id_after option').length;

    if (optionLen === 1) {
        return '1';
    }

    let last = $('#id_after option:last').text();
    let matches = last.match(/#(\d+)/g);

    if (matches === null || matches.length === 0) {
        return '';
    }

    let issue = matches[0].substring(1);
    return Number(issue) + 1;
}

function getMarvelButtonHtml() {
    return `<input id="marvelButton" class="btn-blue-editing inline" type="button" value="Marvel for ${getWednesday()}" style="color: blue; margin-right:10px">`;
}


function getBoomButtonHtml() {
    return `<input id="boomButton" class="btn-blue-editing inline" type="button" value="Boom! Studios for ${getWednesday()}" style="color: blue">`;
}

function fillBoxesMarvel() {
    let wednesday = getWednesday();

    $('#id_number').val(getNextIssueNumber()).trigger('input');
    $('#id_indicia_publisher').val("401").change();

    $('select[name="brand_emblem"]').append(brandMarvelEmblemSelectHtml());
    $('select[name="brand_emblem"]').next().find('ul.select2-selection__rendered').html(brandMarvelEmblemAfterHtml());
    $('select[name="brand_emblem"] option[value="5218"]').attr("selected", true)

    $('#id_publication_date').val(getPublicationDate(2)).trigger('input');
    $('#id_on_sale_date').val(wednesday).trigger('input');
}

function fillBoxesBoom() {
    let wednesday = getWednesday();

    $('#id_number').val(getNextIssueNumber()).trigger('input');
    $('#id_indicia_publisher').val("75").change();

    $('select[name="brand_emblem"]').append(brandBoomEmblemSelectHtml());
    $('select[name="brand_emblem"]').next().find('ul.select2-selection__rendered').html(brandBoomEmblemAfterHtml());
    $('select[name="brand_emblem"] option[value="6418"]').attr("selected", true)


    $('#id_publication_date').val(getPublicationDate(0)).trigger('input');
    $('#id_on_sale_date').val(wednesday).trigger('input');
}

(async function() {
    'use strict';

    $(getMarvelButtonHtml()).insertBefore($('.editing').first());
    $(getBoomButtonHtml()).insertBefore($('.editing').first());

    $('#marvelButton').click(() => fillBoxesMarvel());
    $('#boomButton').click(() => fillBoxesBoom());
})();
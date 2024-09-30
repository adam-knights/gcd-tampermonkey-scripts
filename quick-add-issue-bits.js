// ==UserScript==
// @name         Quick add issue bits
// @namespace    http://tampermonkey.net/
// @version      0.1.1
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
    return `<input id="marvelButton" type="button" value="Marvel for ${getWednesday()}" style="color: blue; margin-right:10px">`;
}

function getBoomButtonHtml() {
    return `<input id="boomButton" type="button" value="Boom! Studios for ${getWednesday()}" style="color: blue">`;
}

function fillBoxesMarvel() {
    let wednesday = getWednesday();

    $('#id_number').val(getNextIssueNumber()).trigger('input');
    $('#id_indicia_publisher').val("401").change();
    $('#id_brand').val("5218").change();
    $('#id_publication_date').val(getPublicationDate(2)).trigger('input');
    $('#id_on_sale_date').val(wednesday).trigger('input');
}

function fillBoxesBoom() {
    let wednesday = getWednesday();

    $('#id_number').val(getNextIssueNumber()).trigger('input');
    $('#id_indicia_publisher').val("75").change();
    $('#id_brand').val("6418").change();
    $('#id_publication_date').val(getPublicationDate(0)).trigger('input');
    $('#id_on_sale_date').val(wednesday).trigger('input');
}

(async function() {
    'use strict';

    $(getMarvelButtonHtml()).insertBefore($('.edit').first());
    $(getBoomButtonHtml()).insertBefore($('.edit').first());

    $('#marvelButton').click(() => fillBoxesMarvel());
    $('#boomButton').click(() => fillBoxesBoom());
})();
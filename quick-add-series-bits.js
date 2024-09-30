// ==UserScript==
// @name         Quick add series bits
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  try to take over the world!
// @author       Adam Knights
// @match        https://www.comics.org/series/add/publisher/*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

function getWednesdayDate() {
    let d = new Date();
    d.setDate(d.getDate() + (3 + 7 - d.getDay()) % 7); // Get next wednesday or today if wednesday
    return d;
}

function getModernUSLimitedButtonHtml() {
    return `<input id="modernUSLimitedButton" type="button" value="US Limited" style="color: blue; margin-right:10px">`;
}

function getModernUSOngoingButtonHtml() {
    return `<input id="modernUSOngoingButton" type="button" value="US Ongoing" style="color: blue; margin-right:10px">`;
}

function getModernUSOneShotButtonHtml() {
    return `<input id="modernUSOneShotButton" type="button" value="US One-Shot" style="color: blue; margin-right:10px">`;
}

function fillBoxesUSModern() {
    let pathSplit = location.pathname.split("/");
    let isMarvel = (pathSplit !== null && pathSplit.length >= 5 && pathSplit[4] === '78');

    let d = getWednesdayDate();
    const m = (d.getMonth() + (isMarvel ? 2 : 0)) % 12;
    const addYear = m < d.getMonth() ? 1 : 0;
    const dd = new Date(d.getFullYear() + addYear, m, 1);

    $('#id_color').val('color');
    $('#id_dimensions').val('standard Modern Age US');
    $('#id_paper_stock').val('glossy');
    $('#id_binding').val('saddle-stitched');

    $('#id_publication_type').val("2").change();
    $('#id_year_began').val(`${dd.getFullYear()}`);
    $('#id_language').val("25").change();
    $('#id_has_indicia_printer').prop('checked', true);
    $('#id_has_isbn').prop('checked', false);
}

function fillBoxesUSModernLimited() {
    fillBoxesUSModern();
    $('#id_publishing_format').val('limited series');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesUSModernOngoing() {
    fillBoxesUSModern();
    $('#id_publishing_format').val('ongoing series');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesUSModernOneShot() {
    $('#id_reservation_requested').prop('checked', true);
    fillBoxesUSModern();
    $('#id_publishing_format').val('one-shot');
    $('#id_is_singleton').prop('checked', true);

    let d = getWednesdayDate();
    $('#id_year_ended').val($('#id_year_began').val());
    $('#id_is_current').prop('checked', false);
}

(async function() {
    'use strict';

    $(getModernUSLimitedButtonHtml()).insertBefore($('.edit').first());
    $(getModernUSOngoingButtonHtml()).insertBefore($('.edit').first());
    $(getModernUSOneShotButtonHtml()).insertBefore($('.edit').first());

    $('#modernUSLimitedButton').click(() => fillBoxesUSModernLimited());
    $('#modernUSOngoingButton').click(() => fillBoxesUSModernOngoing());
    $('#modernUSOneShotButton').click(() => fillBoxesUSModernOneShot());
})();
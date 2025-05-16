// ==UserScript==
// @name         Quick add series bits
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Add buttons to top of series add page to help auto populate for each type
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
    return `<input id="modernUSLimitedButton" class="btn-blue-editing inline" type="button" value="Magazine Limited" style="color: blue; margin-right:10px">`;
}

function getModernUSOngoingButtonHtml() {
    return `<input id="modernUSOngoingButton" class="btn-blue-editing inline" type="button" value="Magazine Ongoing" style="color: blue; margin-right:10px">`;
}

function getModernUSOneShotButtonHtml() {
    return `<input id="modernUSOneShotButton" class="btn-blue-editing inline" type="button" value="Magazine One-Shot" style="color: blue; margin-right:10px">`;
}

function getCollectedTPCurrentButtonHtml() {
    return `<input id="collectedTPCurrentButton" class="btn-blue-editing inline" type="button" value="TP Current" style="color: blue; margin-right:10px">`;
}

function getCollectedTPSingletonButtonHtml() {
    return `<input id="collectedTPSingletonButton" class="btn-blue-editing inline" type="button" value="TP Singleton" style="color: blue; margin-right:10px">`;
}

function getCollectedHCCurrentButtonHtml() {
    return `<input id="collectedHCCurrentButton" class="btn-blue-editing inline" type="button" value="HC Current" style="color: blue; margin-right:10px">`;
}

function getCollectedHCSingletonButtonHtml() {
    return `<input id="collectedHCSingletonButton" class="btn-blue-editing inline" type="button" value="HC Singleton" style="color: blue; margin-right:10px">`;
}

function fillBoxesUSModern() {
    let pathSplit = location.pathname.split("/");
    let isMarvel = (pathSplit !== null && pathSplit.length >= 5 && pathSplit[4] === '78');

    let d = getWednesdayDate();
    const m = (d.getMonth() + (isMarvel ? 2 : 0)) % 12;
    const addYear = m < d.getMonth() ? 1 : 0;
    const dd = new Date(d.getFullYear() + addYear, m, 1);

    $('#id_color').val('color');
    $('#id_paper_stock').val('glossy');

    $('#id_year_began').val(`${dd.getFullYear()}`);
    $('#id_language').val("25").change();
    $('#id_has_indicia_printer').prop('checked', true);

    return isMarvel;
}

function fillBoxesMagazine(isMarvel) {
    $('#id_binding').val('saddle-stitched');
    $('#id_dimensions').val('standard Modern Age US');
    $('#id_publication_type').val("2").change();
    $('#id_has_isbn').prop('checked', false);

    if (isMarvel) {
        $('#id_has_indicia_frequency').prop('checked', true);
        $('#id_has_rating').prop('checked', true);
    } else {
        $('#id_has_indicia_frequency').prop('checked', false);
        $('#id_has_rating').prop('checked', false);
    }
}

function fillBoxesTP(isMarvel) {
    $('#id_binding').val('trade paperback');
    $('#id_publication_type').val("1").change();
    $('#id_dimensions').val('standard Modern Age US');
    $('#id_has_indicia_frequency').prop('checked', false);
    $('#id_has_isbn').prop('checked', true);

    if (isMarvel) {
        $('#id_has_rating').prop('checked', true);
    } else {
        $('#id_has_rating').prop('checked', false);
    }
}

function fillBoxesHC(isMarvel) {
    $('#id_binding').val('hardcover');
    $('#id_publication_type').val("1").change();
    $('#id_dimensions').val('');
    $('#id_has_indicia_frequency').prop('checked', false);
    $('#id_has_isbn').prop('checked', true);

    if (isMarvel) {
        $('#id_has_rating').prop('checked', true);
    } else {
        $('#id_has_rating').prop('checked', false);
    }
}

function fillBoxesUSModernLimited() {
    $('#id_reservation_requested').prop('checked', false);
    const isMarvel = fillBoxesUSModern();
    fillBoxesMagazine(isMarvel);
    $('#id_publishing_format').val('limited series');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesUSModernOngoing() {
    $('#id_reservation_requested').prop('checked', false);
    const isMarvel = fillBoxesUSModern();
    fillBoxesMagazine(isMarvel);
    $('#id_publishing_format').val('ongoing series');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesUSModernOneShot() {
    $('#id_reservation_requested').prop('checked', true);
    const isMarvel = fillBoxesUSModern();
    fillBoxesMagazine(isMarvel);
    $('#id_publishing_format').val('one-shot');
    $('#id_is_singleton').prop('checked', true);

    let d = getWednesdayDate();
    $('#id_year_ended').val($('#id_year_began').val());
    $('#id_is_current').prop('checked', false);
}

function fillBoxesCollectedTPCurrent() {
    $('#id_reservation_requested').prop('checked', false);
    const isMarvel = fillBoxesUSModern();
    fillBoxesTP(isMarvel);
    $('#id_publishing_format').val('collected edition');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesCollectedTPSingleton() {
    $('#id_reservation_requested').prop('checked', true);
    const isMarvel = fillBoxesUSModern();
    fillBoxesTP(isMarvel);
    $('#id_publishing_format').val('collected edition');
    $('#id_is_singleton').prop('checked', true);

    let d = getWednesdayDate();
    $('#id_year_ended').val($('#id_year_began').val());
    $('#id_is_current').prop('checked', false);
}

function fillBoxesCollectedHCCurrent() {
    $('#id_reservation_requested').prop('checked', false);
    const isMarvel = fillBoxesUSModern();
    fillBoxesHC(isMarvel);
    $('#id_publishing_format').val('collected edition');
    $('#id_is_singleton').prop('checked', false);
    $('#id_year_ended').val('');
    $('#id_is_current').prop('checked', true);
}

function fillBoxesCollectedHCSingleton() {
    $('#id_reservation_requested').prop('checked', true);
    const isMarvel = fillBoxesUSModern();
    fillBoxesHC(isMarvel);
    $('#id_publishing_format').val('collected edition');
    $('#id_is_singleton').prop('checked', true);

    let d = getWednesdayDate();
    $('#id_year_ended').val($('#id_year_began').val());
    $('#id_is_current').prop('checked', false);
}

(async function() {
    'use strict';

    $(getModernUSLimitedButtonHtml()).insertBefore($('.editing').first());
    $(getModernUSOngoingButtonHtml()).insertBefore($('.editing').first());
    $(getModernUSOneShotButtonHtml()).insertBefore($('.editing').first());
    $(getCollectedTPCurrentButtonHtml()).insertBefore($('.editing').first());
    $(getCollectedTPSingletonButtonHtml()).insertBefore($('.editing').first());
    $(getCollectedHCCurrentButtonHtml()).insertBefore($('.editing').first());
    $(getCollectedHCSingletonButtonHtml()).insertBefore($('.editing').first());

    $('#modernUSLimitedButton').click(() => fillBoxesUSModernLimited(false));
    $('#modernUSOngoingButton').click(() => fillBoxesUSModernOngoing(false));
    $('#modernUSOneShotButton').click(() => fillBoxesUSModernOneShot(false));
    $('#collectedTPCurrentButton').click(() => fillBoxesCollectedTPCurrent());
    $('#collectedTPSingletonButton').click(() => fillBoxesCollectedTPSingleton());
    $('#collectedHCCurrentButton').click(() => fillBoxesCollectedHCCurrent());
    $('#collectedHCSingletonButton').click(() => fillBoxesCollectedHCSingleton());
})();
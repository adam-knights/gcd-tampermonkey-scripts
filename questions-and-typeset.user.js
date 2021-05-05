// ==UserScript==
// @name         Questions and typeset
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds button to sequence editing to populate with ?'s and typeset
// @author       Adam Knights
// @match        https://www.comics.org/story/revision/*/edit/*
// @match        https://www.comics.org/issue/revision/*/add_story/*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

function getQuestionsButtonHtml() {
    return `<input id="questionsButton" type="button" value="?s and typeset" style="color: blue">`;
}

function fillBoxes() {
if (!$('#id_no_script').is(':checked') && !$('#id_script').val()) {
    $('#id_script').val('?');
}
if (!$('#id_no_pencils').is(':checked') && !$('#id_pencils').val()) {
    $('#id_pencils').val('?');
}
if (!$('#id_no_inks').is(':checked') && !$('#id_inks').val()) {
    $('#id_inks').val('?');
}
if (!$('#id_no_colors').is(':checked') && !$('#id_colors').val()) {
    $('#id_colors').val('?');
}
if (!$('#id_no_letters').is(':checked') && !$('#id_letters').val()) {
    $('#id_letters').val('typeset');
}
if (!$('#id_no_editing').is(':checked') && !$('#id_editing').val()) {
    $('#id_editing').val('?');
}
}

(async function() {
'use strict';

$('#id_letters').parent().append(getQuestionsButtonHtml());

$('#questionsButton').click(() => fillBoxes());
})();
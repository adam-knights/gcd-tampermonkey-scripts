// ==UserScript==
// @name         Add new shortcuts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show a count of pending on editing summary page
// @author       Adam Knights
// @match        https://www.comics.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.js
// ==/UserScript==

/* eslint-env jquery */

function getLinkEl(name, link) {
    return `<li><a href="${link}">${name}</a></li>`;
}

(async function() {
    'use strict';

    $('.search_bar ul').append(getLinkEl('Add New', '/add/'));
    $('.search_bar ul').append(getLinkEl('Add Character', '/character/add/'));
    $('.search_bar ul').append(getLinkEl('Add Creator', '/creator/add/'));
})();
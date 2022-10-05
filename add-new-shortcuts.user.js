// ==UserScript==
// @name         Add new shortcuts
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Show a count of pending on editing summary page
// @author       Adam Knights
// @match        https://www.comics.org/*
// @grant        none
// ==/UserScript==

function getLinkEl(name, link) {
    return `<li><a href="${link}">${name}</a></li>`;
}

(async function() {
    'use strict';

    document.querySelector('.search_bar ul').innerHTML += getLinkEl('Add New', '/add/');
    document.querySelector('.search_bar ul').innerHTML += getLinkEl('Add Character', '/character/add/');
    document.querySelector('.search_bar ul').innerHTML += getLinkEl('Add Creator', '/creator/add/');
})();
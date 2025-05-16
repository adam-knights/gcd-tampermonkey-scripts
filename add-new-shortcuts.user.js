// ==UserScript==
// @name         Add new shortcuts
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Add extra add shortcuts
// @author       Adam Knights
// @match        https://www.comics.org/*
// @grant        none
// ==/UserScript==

function getLinkEl(name, link) {
    return `<a class="hover:bg-blue-400 " href="${link}">${name}</a>`;
}

(async function() {
    'use strict';

    const liOne = document.createElement('li');
    liOne.innerHTML += getLinkEl('Add Character', '/character/add/');
    document.querySelector('.bg-blue-200 ul li:nth-child(9)').after(liOne);

    const liTwo = document.createElement('li');
    liTwo.innerHTML += getLinkEl('Add Creator', '/creator/add/');
    document.querySelector('.bg-blue-200 ul li:nth-child(10)').after(liTwo);
})();
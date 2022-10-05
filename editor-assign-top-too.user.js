// ==UserScript==
// @name         Editor assign top too
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds assign button to top of page for editors
// @author       Adam Knights
// @match        https://www.comics.org/changeset/*/compare/
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

(async function() {
    'use strict';

    if ($('input[name="assign"]').length > 0) {
        $(`<input id="topAssign" type="button" value="Assign">`).insertAfter('.body_content h1');
        $('#topAssign').click(() => $('input[name="assign"]').click());
    }
})();
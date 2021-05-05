// ==UserScript==
// @name         Editors 2 Objects
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Take editor text credits and move to creators
// @author       Adam Knights
// @match        https://www.comics.org/issue/revision/*/edit/?edit_issue_*
// @match        https://www.comics.org/issue/*/add_variant_issue/?add*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

// @require https://code.jquery.com/jquery-3.5.1.js

var getHTML = function ( url, callback ) {

	// Feature detection
	if ( !window.XMLHttpRequest ) return;

	// Create new request
	var xhr = new XMLHttpRequest();

	// Setup callback
	xhr.onload = function() {
		if ( callback && typeof( callback ) === 'function' ) {
			callback( this.responseXML );
		}
	}

	// Get the HTML
	xhr.open( 'GET', url );
	xhr.responseType = 'document';
	xhr.send();

};

function triggerMostButtons (jNode) {
    triggerMouseEvent (jNode[0], "mouseover");
    triggerMouseEvent (jNode[0], "mousedown");
    triggerMouseEvent (jNode[0], "mouseup");
    triggerMouseEvent (jNode[0], "click");
}

function triggerMouseEvent (node, eventType) {
    var clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent (eventType, true, true);
    node.dispatchEvent (clickEvent);
}

function simulateKeyPress(node, key) {
  node.dispatchEvent(new KeyboardEvent('keyup', {'key':key}))
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCreditDesc(editorSplit) {
    let bracketOne = editorSplit.length < 2 ? '' : editorSplit[1].split(')')[0].trim();
    let bracketTwo = editorSplit.length < 3 ? '' : editorSplit[2].split(')')[0].trim();

    if (bracketOne === '') {
        return '';
    }

    if (bracketTwo === '') {
        return bracketOne.toLowerCase() === 'credited' ? '' : bracketOne;
    }

    if (bracketOne === 'credited') {
       return bracketTwo;
    }

    if (bracketTwo === 'credited') {
       return bracketOne;
    }

    return `${bracketOne}, ${bracketTwo}`;
}

function addMigrationInfoLine(line, isError, highlight) {
    console.log(line);
    let style = isError ? ' style="color:red"' : highlight ? ' style="color:blueviolet"' : '';
    $('#editor_info_text_id').append(`<p${style}>${line}</p>`);
}

function handleFailToAddEditorObject(errorInfo) {
    addMigrationInfoLine(errorInfo, true, false);
    $('.delete-row').last().trigger('click');
}

async function migrateEditor(editor, previousEditorsCount, markCredited) {
    let editorSplit = editor.split('(');

    let name = editorSplit[0].trim();

    if ((editor.match(/\(/g) || []).length > 2) {
        handleFailToAddEditorObject(`Too many brackets for ${name}`);
        return;
    }

    let creditDesc = getCreditDesc(editorSplit);

    triggerMostButtons($('.select2-selection.select2-selection--single.modelselect2.form-control').last());
    await sleep(200);

    $('span > .select2-search__field').val(name); // Use span parent here to make sure we dont get the indicia printer dropdown
    simulateKeyPress($('span > .select2-search__field').get(0), name.slice(-1));
    await sleep(2000);

    if ($('.select2-results__options li').length === 0 || $('.select2-results__options li').text() === 'No results found') {
        handleFailToAddEditorObject(`No matches found for '${name}'`);
        return;
    } else if ($('.select2-results__options li').length > 1) {
        addMigrationInfoLine(`'${name}' had more than one match (${$('.select2-results__options li').length} matches)`, false, true);
        let matchNames = $.map(document.getElementsByClassName('select2-results__options')[0].getElementsByTagName("li"), x => x.innerText).join(', ');
        addMigrationInfoLine(`Matches were: "${matchNames}", '${$('.select2-results__options li').first().text()}' was chosen`, false, true);
    }

    triggerMostButtons($('.select2-results__options li').first());
    await sleep(200);

    $(`#id_issue_credit_revisions-${previousEditorsCount}-credit_type`).val($(`#id_issue_credit_revisions-${previousEditorsCount}-credit_type option`).last().val());
    if (markCredited) {
        $(`#id_issue_credit_revisions-${previousEditorsCount}-is_credited`).prop('checked', true);
    }
    $(`#id_issue_credit_revisions-${previousEditorsCount}-credit_name`).val(creditDesc);

    addMigrationInfoLine(`${name} successfully added`, false, false);
}

async function migrateEditors(markCredited) {
    $('#migrate_button_id').prop('disabled', true);
    $('#migrate_uncredited_button_id').prop('disabled', true);
    $('#copy_editors_from_main_button_id').prop('disabled', true);

    let editorText = $('#id_editing').val();

    if (editorText.length === 0) {
        addMigrationInfoLine('No text editors');
        return;
    }

    let editors = editorText.split(';');

    let removeButtonCount = $('.delete-row').length;
    console.log(`${removeButtonCount - 1} existing editors detected`);
    let existingEditorCount = removeButtonCount - 1;

    console.log(`Text editors were: ${editors}`);

    for (let i = 0; i < editors.length; i++) {
        await migrateEditor(editors[i], i + existingEditorCount, markCredited);

        $('.add-row').trigger('click');
        await sleep(200);
    }
    $('.delete-row').last().trigger('click');

    $('#id_editing').focus();
}

function addEditorsFromMainIssue(mainIssueLink) {
    getHTML(mainIssueLink, mainIssue => {
        let editing = $(mainIssue).find('#issue_data_list').next().children('.credit_def').text();

        if (editing === '') {
            addMigrationInfoLine('Main issue found, but no editors on it', false, true);
            return;
        }
        addMigrationInfoLine(`Editors found on main issue: ${editing}`, false, false);

        $('#migrate_uncredited_button_id').after(`<input id="copy_editors_from_main_button_id" type="button" value="Copy from Main" style="margin-right: 10px"><input type="hidden" id="hidden_input_editing_id">`);
        $('#hidden_input_editing_id').val(editing);
        $('#copy_editors_from_main_button_id').click(() => $('#id_editing').val($('#hidden_input_editing_id').val()));
    });
}

function searchAndAddEditorsOptionForVariant() {
    if (window.location.pathname.includes('add_variant_issue')) {
        let matches = window.location.pathname.match(/^\/issue\/(\d+)/);
        if (matches.length == 2) {
            let issueId = matches[1];

            addEditorsFromMainIssue(`/issue/${issueId}`);
        }
    } else {
        let matches = window.location.pathname.match(/^\/issue\/revision\/(\d+)/);
        if (matches.length == 2) {
            let revisionId = matches[1];
            getHTML(`/issue/revision/${revisionId}/preview/`, res => {
                let variantInfoDiv = $(res).find('.issue_level_content:contains("This issue is a variant of")');
                if (variantInfoDiv.length === 0) {
                    return;
                }

                let link = $(variantInfoDiv).children('a').first().attr('href');
                addEditorsFromMainIssue(link);
            });
        }
    }
}

(async function() {
    'use strict';

    $('#id_editing').closest('tr').after($('<tr id="migrate_editors_id"><th style="width:150px"><label>Migrate:</label></th></tr>'));
    $('#migrate_editors_id').append('<td><input id="migrate_button_id" type="button" value="Migrate" style="margin-right: 10px"><input id="migrate_uncredited_button_id" type="button" value="Migrate Uncredited" style="margin-right: 10px"><br><span id="editor_info_text_id" class="helptext"></span></td>');

    $('#migrate_button_id').click(() => migrateEditors(true));
    $('#migrate_uncredited_button_id').click(() => migrateEditors(false));

    searchAndAddEditorsOptionForVariant();
})();
// ==UserScript==
// @name         Copy and paste story complete
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Adds button to copy a story on edit story page, works to paste on new story from 'add story'. TODO: copy story from view of a comic
// @author       Adam Knights
// @require      https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js
// @match        https://www.comics.org/story/revision/*/edit/*
// @match        https://www.comics.org/issue/revision/*/add_story/*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */
/* esline-env localforage */

// @require https://code.jquery.com/jquery-3.5.1.js

function featureHtml(featureId, position, name) {
  return `<option value="${featureId}" selected="" data-select2-id="${position}">${name}</option>`;
}

(async function() {
    'use strict';

    var pathname = window.location.pathname; // Returns path only (/path/example.html)

    var $form; // storing the form element in a variable //
    if (pathname.includes('story/revision')) {
       $form = $('form[action*="process"]')
    } else if (pathname.includes('add_story')) {
        $form = $('form[action*="add_story"]')
    }

    // this will add the buttons at the top of the form //
    $("div.edit").prepend('<button type="button" id="copy" style="margin-right: 10px"><i class="far fa-copy" style="color: blue"></i> Copy Data</button><button type="button" id="paste"><i class="fas fa-paste"  style="color: blue"></i> Paste Data</button>');

    $("#copy").click(async function (e) {
        // this will save the form data, serialized as an array in a cookie named formData
        var nonCreatorObjectForm = $form.serializeArray().filter(f => f.name !== 'sequence_number' && f.name !== 'csrfmiddlewaretoken' && f.name !== 'feature_object' && !f.name.includes('story_credit_revisions') && f.name !== 'creator_help');
        var featureObjectForm = $form.serializeArray().filter(f => f.name === 'feature_object');

        // Exclude fields we don't need to keep size down
        var creatorObjectForm = $form.serializeArray().filter(f => f.name.includes('story_credit_revisions') && f.name !== 'story_credit_revisions-MIN_NUM_FORMS' && f.name !== 'story_credit_revisions-MAX_NUM_FORMS' && !f.name.includes('-story_revision') && !f.name.includes('-id') && !f.name.includes('-DELETE'));

        // Genre is a special case
        var genreObjectForm = $('#id_genre_to option').length === 0 ? '' : $('#id_genre_to option').map((i, el) => ({ t: $(el).attr('title'), v: $(el).attr('value') })).get();

        for (let i = 0; i < featureObjectForm.length; i++) {
            featureObjectForm[i].friendlyFeatureName = $(`select[name="feature_object"] option[value="${featureObjectForm[i].value}"]`).text();
        }

        for (let i = 0; i < creatorObjectForm.length; i++) {
            // Store friendly names for creator name and signatures
            if (creatorObjectForm[i].name.includes('-creator')) {
              creatorObjectForm[i].cn = $(`#id_${creatorObjectForm[i].name}`).next().find('.select2-selection__rendered').attr('title');
            }

            if (creatorObjectForm[i].name.includes('-signature')) {
              creatorObjectForm[i].sn = $(`#id_${creatorObjectForm[i].name}`).next().find('[title="Remove all items"]').next().text();
            }

            // Make creator objects much smaller
            creatorObjectForm[i].name = creatorObjectForm[i].name.replace('story_credit_revisions', 's_c_r');
            if (creatorObjectForm[i].value === "") {
              delete creatorObjectForm[i].value;
            }
        }

        await localforage.setItem('gcd_form_noncreator', nonCreatorObjectForm);
        await localforage.setItem('gcd_form_featureobject', featureObjectForm);
        await localforage.setItem('gcd_form_creatorobject', creatorObjectForm);
        await localforage.setItem('gcd_form_genre', genreObjectForm);
    });

    $("#paste").click(async function (e) {

        const gcd_form_noncreator = await localforage.getItem('gcd_form_noncreator');
        if (gcd_form_noncreator) {
            for (let i = 0; i < gcd_form_noncreator.length; i++) {
                let controlName = gcd_form_noncreator[i].name;
                let controlValue = gcd_form_noncreator[i].value;

                $("#id_" + controlName).val(controlValue);
                $("#wmd-input-id_" + controlName).val(controlValue);
            }
        }

        const gcd_form_genre = await localforage.getItem('gcd_form_genre');
        if (gcd_form_genre) {
            for (let i = 0; i < gcd_form_genre.length; i++) {
              $('#id_genre_to').append(`<option value="${gcd_form_genre[i].v}" title="${gcd_form_genre[i].t}">${gcd_form_genre[i].t}</option>`);
              $(`#id_genre_from option[value="${gcd_form_genre[i].v}"]`).remove()
            }
        }

        let gcd_form_creatorobject = await localforage.getItem('gcd_form_creatorobject');
        console.log(gcd_form_creatorobject);
        if (gcd_form_creatorobject) {
            const totalFormsRequired = Number(gcd_form_creatorobject.find(f => f.name === 's_c_r-TOTAL_FORMS').value);
            // First make the empty names tables
            for (let i = 1; i < totalFormsRequired; i++) {
                $('.add-row').click();
            }

            for (let i = 0; i < gcd_form_creatorobject.length; i++) {
                let controlName = gcd_form_creatorobject[i].name.replace('s_c_r', 'story_credit_revisions');

                let controlValue = gcd_form_creatorobject[i].value ?? "";

                if (controlName === 'story_credit_revisions-INITIAL_FORMS') {
                  controlValue = "0";
                }

                if (controlName.includes('-creator')) {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="" data-select2-id="7">${gcd_form_creatorobject[i].cn}</option>`);
                    continue;
                }

                if (controlName.includes('-signature') && controlValue !== "") {
                    $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="" data-select2-id="42">${gcd_form_creatorobject[i].sn}</option>`);
                }

                if (controlName.includes('-is_credited') || controlName.includes('-is_signed') || controlName.includes('uncertain')) {
                    if (controlValue === 'on') {
                      $(`#id_${controlName}`).prop('checked', true).change();
                    } else {
                        $(`#id_${controlName}`).prop('checked', false);
                    }
                    continue;
                }

                $("#id_" + controlName).val(controlValue);
                $("#wmd-input-id_" + controlName).val(controlValue);
            }
        }

        const gcd_form_featureobject = await localforage.getItem('gcd_form_featureobject');
        if (gcd_form_featureobject) {
            for (let i = 0; i < gcd_form_featureobject.length; i++) {
                let controlName = gcd_form_featureobject[i].name;
                let controlValue = gcd_form_featureobject[i].value;
                let friendlyName = gcd_form_featureobject[i].friendlyFeatureName;

                let nextPosition = $('select[name="feature_object"] option').length + 1;
                $('select[name="feature_object"]').append(featureHtml(controlValue, nextPosition, friendlyName));
            }
        }
    });

})();
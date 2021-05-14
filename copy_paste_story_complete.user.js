// ==UserScript==
// @name         Copy and paste story complete
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds button to copy a story on edit story page, works to paste on new story from 'add story'. TODO: copy story from view of a comic
// @author       Adam Knights
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// @match        https://www.comics.org/story/revision/*/edit/*
// @match        https://www.comics.org/issue/revision/*/add_story/*
// @grant        none
// ==/UserScript==

/* eslint-env jquery */
/* eslint-env js-cookie */

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

    $("#copy").click(function (e) {
        // this will save the form data, serialized as an array in a cookie named formData
        var nonCreatorObjectForm = $form.serializeArray().filter(f => f.name !== 'sequence_number' && f.name !== 'csrfmiddlewaretoken' && f.name !== 'feature_object' && !f.name.includes('story_credit_revisions') && f.name !== 'creator_help');
        var featureObjectForm = $form.serializeArray().filter(f => f.name === 'feature_object');

        // Exclude fields we don't need to keep size down
        var creatorObjectForm = $form.serializeArray().filter(f => f.name.includes('story_credit_revisions') && f.name !== 'story_credit_revisions-MIN_NUM_FORMS' && f.name !== 'story_credit_revisions-MAX_NUM_FORMS' && !f.name.includes('-story_revision') && !f.name.includes('-id') && !f.name.includes('-DELETE'));

        // Genre is a special case
        var genreObjectForm = $('#id_genre_to option').length === 0 ? '' : $('#id_genre_to option').map((i, el) => ({ t: $(el).attr('title'), v: $(el).attr('value') })).get();
        console.log(genreObjectForm);

        for (let i = 0; i < featureObjectForm.length; i++) {
            featureObjectForm[i].friendlyFeatureName = $(`select[name="feature_object"] option[value="${featureObjectForm[i].value}"]`).text();
        }

        // Need to make creator objects much smaller
        for (let i = 0; i < creatorObjectForm.length; i++) {
            if (creatorObjectForm[i].name.includes('-creator')) {
              creatorObjectForm[i].cn = $(`#id_${creatorObjectForm[i].name}`).next().find('.select2-selection__rendered').attr('title');
            }

            if (creatorObjectForm[i].name.includes('-signature')) {
              creatorObjectForm[i].sn = $(`#id_${creatorObjectForm[i].name}`).next().find('[title="Remove all items"]').next().text();
            }

            creatorObjectForm[i].name = creatorObjectForm[i].name.replace('story_credit_revisions', 's_c_r');
            if (creatorObjectForm[i].value === "") {
              delete creatorObjectForm[i].value;
            }
        }

        var formNCOJson = JSON.stringify(nonCreatorObjectForm);
        if (formNCOJson.length > 4096) {
          console.log(`Will not work as NCO form length > 4096. Length is ${formNCOJson.length}`);
        }
        Cookies.set('formDataNCO', formNCOJson, {
            expires: 365
        });

        var formFOJson = JSON.stringify(featureObjectForm);
        if (formFOJson.length > 4096) {
          console.log(`Will not work as FO form length > 4096. Length is ${formFOJson.length}`);
        }
        Cookies.set('formDataFO', formFOJson, {
            expires: 365
        });

        var formCOJson = JSON.stringify(creatorObjectForm);
        if (formCOJson.length > 4096) {
          console.log(`Will not work as FO form length > 4096. Length is ${formCOJson.length}`);
        }
        Cookies.set('formDataCO', formCOJson, {
            expires: 365
        });

        if (genreObjectForm !== '') {
          var formGenreJson = JSON.stringify(genreObjectForm);
            console.log(formGenreJson);
          if (formGenreJson.length > 4096) {
              console.log(`Will not work as FO form length > 4096. Length is ${formGenreJson.length}`);
          }
          Cookies.set('formDataGenre', formGenreJson, {
              expires: 365
          });
        }
    });

    $("#paste").click(function (e) {
        let $form_cookie_nco = Cookies.get('formDataNCO');

        if (!($form_cookie_nco === 'null' || $form_cookie_nco === undefined || $form_cookie_nco === null)) {
            let $fields = JSON.parse($form_cookie_nco);

            for (let i = 0; i < $fields.length; i++) {
                let controlName = $fields[i].name;
                let controlValue = $fields[i].value;

                $("#id_" + controlName).val(controlValue);
                $("#wmd-input-id_" + controlName).val(controlValue);
            }
        }

        let $form_cookie_fo = Cookies.get('formDataFO');

        if (!($form_cookie_fo === 'null' || $form_cookie_fo === undefined || $form_cookie_fo === null)) {
            let $fields = JSON.parse($form_cookie_fo);

            for (let i = 0; i < $fields.length; i++) {
                let controlName = $fields[i].name;
                let controlValue = $fields[i].value;
                let friendlyName = $fields[i].friendlyFeatureName;

                let nextPosition = $('select[name="feature_object"] option').length + 1;
                $('select[name="feature_object"]').append(featureHtml(controlValue, nextPosition, friendlyName));
            }
        }

        let $form_cookie_genre = Cookies.get('formDataGenre');

        if (!($form_cookie_genre === 'null' || $form_cookie_genre === undefined || $form_cookie_genre === null)) {
            let $fields = JSON.parse($form_cookie_genre);

            for (let i = 0; i < $fields.length; i++) {
              $('#id_genre_to').append(`<option value="${$fields[i].v}" title="${$fields[i].t}">${$fields[i].t}</option>`);
              $(`#id_genre_from option[value="${$fields[i].v}"]`).remove()
            }
        }

        let $form_cookie_co = Cookies.get('formDataCO');

        if (!($form_cookie_co === 'null' || $form_cookie_co === undefined || $form_cookie_co === null)) {
            let $fields = JSON.parse($form_cookie_co);

            const totalFormsRequired = Number($fields.find(f => f.name === 's_c_r-TOTAL_FORMS').value);
            // First make the empty names tables
            for (let i = 1; i < totalFormsRequired; i++) {
                //$('.formset_row-story_credit_revisions').last().after(creatorObjectHtml(i));
                $('.add-row').click();
            }

            for (let i = 0; i < $fields.length; i++) {
                let controlName = $fields[i].name.replace('s_c_r', 'story_credit_revisions');

                let controlValue = $fields[i].value ?? "";

                if (controlName === 'story_credit_revisions-INITIAL_FORMS') {
                  controlValue = "0";
                }

                if (controlName.includes('-creator')) {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="" data-select2-id="7">${$fields[i].cn}</option>`);
                    continue;
                }

                if (controlName.includes('-signature') && controlValue !== "") {
                    $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="" data-select2-id="42">${$fields[i].sn}</option>`);
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
    });

})();
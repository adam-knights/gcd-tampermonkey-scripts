// ==UserScript==
// @name         Copy and paste story complete
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Adds button to copy a story on edit story page, works to paste on new story from 'add story'.
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
  
  function universeHtml(featureId, position, name) {
    return `<option value="${featureId}" selected="" data-select2-id="${position}">${name}</option>`;
  }
  
  async function pasteCharactersWithUniversesAndGroups() {
      let gcd_form_universeobject = await localforage.getItem('gcd_form_universeobject');
      if (gcd_form_universeobject) {
          for (let i = 0; i < gcd_form_universeobject.length; i++) {
              let controlValue = gcd_form_universeobject[i].value;
              let friendlyName = gcd_form_universeobject[i].friendlyUniverseName;
  
              let nextPosition = $('select[name="universe"] option').length + 11;
              $('select[name="universe"]').append(universeHtml(controlValue, nextPosition, friendlyName));
          }
      }
  
      let gcd_form_groupobject = await localforage.getItem('gcd_form_groupobject');
  
      if (gcd_form_groupobject) {
          const totalGroupFormsRequired = Number(gcd_form_groupobject.find(f => f.name === 's_g_r-TOTAL_FORMS').value);
          // First make the empty groups tables
          for (let i = 1; i < totalGroupFormsRequired; i++) {
              $('.add-row').eq(2).click(); // There are 3 now, this is currently the last one
          }
      }
  
      let gcd_form_characterobject = await localforage.getItem('gcd_form_characterobject');
  
      if (gcd_form_characterobject) {
          const totalCharacterFormsRequired = Number(gcd_form_characterobject.find(f => f.name === 's_c_r-TOTAL_FORMS').value);
          // First make the empty characters tables
          for (let i = 1; i < totalCharacterFormsRequired; i++) {
              $('.add-row').eq(1).click(); // There are 3 now, this is currently the middle one
          }
      }
  
      if (gcd_form_characterobject) {
          for (let i = 0; i < gcd_form_characterobject.length; i++) {
              let controlName = gcd_form_characterobject[i].name.replace('s_c_r', 'story_character_revisions');
  
              let controlValue = gcd_form_characterobject[i].value ?? "";
  
              if (controlName === 'story_character_revisions-INITIAL_FORMS') {
                  controlValue = "0";
              }
  
              if (controlName.endsWith('-character')) {
                  $(`#id_${controlName} option`).removeAttr('selected')
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_characterobject[i].cn}</option>`);
                  continue;
              }
  
              if (controlName.endsWith('-universe')) {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_characterobject[i].un}</option>`);
                  continue;
              }
  
              if (controlName.endsWith('-group')) {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_characterobject[i].gn}</option>`);
                  continue;
              }
  
              if (controlName.endsWith('-group_universe')) {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_characterobject[i].gun}</option>`);
                  continue;
              }
  
              if (controlName.includes('-additional_information') || controlName.includes('-is_flashback') || controlName.includes('-is_origin') || controlName.includes('-is_death')) {
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
  
      if (gcd_form_groupobject) {
          for (let i = 0; i < gcd_form_groupobject.length; i++) {
              let controlName = gcd_form_groupobject[i].name.replace('s_g_r', 'story_group_revisions');
  
              let controlValue = gcd_form_groupobject[i].value ?? "";
  
              if (controlName === 'story_group_revisions-TOTAL_FORMS') {
                  continue;
              }
  
              if (controlName === 'story_group_revisions-INITIAL_FORMS') {
                  controlValue = "0";
              }
  
              if (controlName.endsWith('-universe') && controlValue !== "") {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_groupobject[i].un}</option>`);
                  continue;
              }
  
              if (controlName.endsWith('-group') && controlValue !== "") {
                  $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_groupobject[i].gn}</option>`);
                  continue;
              }
  
              $("#id_" + controlName).val(controlValue);
              $("#wmd-input-id_" + controlName).val(controlValue);
          }
      }
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
  
      $('<button type="button" id="paste">Paste Characters Only</button>').insertBefore("#characters tr:first td span.helptext");
  
      $("#copy").click(async function (e) {
          // this will save the form data, serialized as an array into local / indexedb storage
          var nonObjectForm = $form.serializeArray().filter(f => f.name !== 'sequence_number' && f.name !== 'csrfmiddlewaretoken' && f.name !== 'feature_object' && !f.name.includes('story_credit_revisions') && f.name !== 'universe' && !f.name.includes('story_character_revisions') && !f.name.includes('story_group_revisions') && f.name !== 'creator_help' && f.name !== 'character_help' && f.name !== 'language_code');
          var featureObjectForm = $form.serializeArray().filter(f => f.name === 'feature_object');
  
          // Exclude fields we don't need to keep size down
          var creatorObjectForm = $form.serializeArray().filter(f => f.name.includes('story_credit_revisions') && f.name !== 'story_credit_revisions-MIN_NUM_FORMS' && f.name !== 'story_credit_revisions-MAX_NUM_FORMS' && !f.name.includes('-story_revision') && !f.name.includes('-id') && !f.name.includes('-DELETE'));
  
          var universeObjectForm = $form.serializeArray().filter(f => f.name === 'universe');
  
          // We only pickup saved characters, not those in the appearing_characters select, those are ignored
          var characterObjectForm = $form.serializeArray().filter(f => f.name.includes('story_character_revisions') && f.name !== 'story_character_revisions-MIN_NUM_FORMS' && f.name !== 'story_character_revisions-MAX_NUM_FORMS' && !f.name.includes('-story_revision') && !f.name.includes('-id') && !f.name.includes('-DELETE'));
  
          // We only pickup saved groups too, note characters above have attached groups, this is the groups at the bottom of the page
          var groupObjectForm = $form.serializeArray().filter(f => f.name.includes('story_group_revisions') && f.name !== 'story_group_revisions-MIN_NUM_FORMS' && f.name !== 'story_group_revisions-MAX_NUM_FORMS' && !f.name.includes('-story_revision') && !f.name.includes('-id') && !f.name.includes('-DELETE'));
  
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
  
          for (let i = 0; i < universeObjectForm.length; i++) {
              universeObjectForm[i].friendlyUniverseName = $(`select[name="universe"] option[value="${universeObjectForm[i].value}"]`).text();
          }
  
          for (let i = 0; i < characterObjectForm.length; i++) {
              // Store friendly name for character
              if (characterObjectForm[i].name.endsWith('-character') && characterObjectForm[i].value) {
                characterObjectForm[i].cn = $(`#id_${characterObjectForm[i].name}`).next().find('.select2-selection__rendered').attr('title');
              }
  
              // Store friendly name for character universe
              if (characterObjectForm[i].name.endsWith('-universe') && characterObjectForm[i].value) {
                characterObjectForm[i].un = $(`select[name="${characterObjectForm[i].name}"] option[value="${characterObjectForm[i].value}"]`).text();
              }
  
              // Store friendly name for character group
              if (characterObjectForm[i].name.endsWith('-group') && characterObjectForm[i].value) {
                characterObjectForm[i].gn = $(`select[name="${characterObjectForm[i].name}"] option[value="${characterObjectForm[i].value}"]`).text();
              }
  
              // Store friendly names for character group universe
              if (characterObjectForm[i].name.endsWith('-group_universe') && characterObjectForm[i].value) {
                characterObjectForm[i].gun = $(`select[name="${characterObjectForm[i].name}"] option[value="${characterObjectForm[i].value}"]`).text();
              }
  
              // Make character objects much smaller
              characterObjectForm[i].name = characterObjectForm[i].name.replace('story_character_revisions', 's_c_r');
              if (characterObjectForm[i].value === "") {
                delete characterObjectForm[i].value;
              }
          }
  
          for (let i = 0; i < groupObjectForm.length; i++) {
              // Store friendly name for group
              if (groupObjectForm[i].name.endsWith('-group') && groupObjectForm[i].value) {
                groupObjectForm[i].gn = $(`select[name="${groupObjectForm[i].name}"] option[value="${groupObjectForm[i].value}"]`).text();
              }
  
              // Store friendly name for group universe
              if (groupObjectForm[i].name.endsWith('-universe') && groupObjectForm[i].value) {
                groupObjectForm[i].un = $(`select[name="${groupObjectForm[i].name}"] option[value="${groupObjectForm[i].value}"]`).text();
              }
  
              // Make group objects much smaller
              groupObjectForm[i].name = groupObjectForm[i].name.replace('story_group_revisions', 's_g_r');
              if (groupObjectForm[i].value === "") {
                delete groupObjectForm[i].value;
              }
          }
  
          await localforage.setItem('gcd_form_noncreator', nonObjectForm);
          await localforage.setItem('gcd_form_featureobject', featureObjectForm);
          await localforage.setItem('gcd_form_creatorobject', creatorObjectForm);
          await localforage.setItem('gcd_form_universeobject', universeObjectForm);
          await localforage.setItem('gcd_form_characterobject', characterObjectForm);
          await localforage.setItem('gcd_form_groupobject', groupObjectForm);
          await localforage.setItem('gcd_form_genre', genreObjectForm);
      });
  
      $("#paste").click(async function (e) {
          const gcd_form_noncreator = await localforage.getItem('gcd_form_noncreator');
          if (gcd_form_noncreator) {
              for (let i = 0; i < gcd_form_noncreator.length; i++) {
                  let controlName = gcd_form_noncreator[i].name;
                  let controlValue = gcd_form_noncreator[i].value;
  
                  if (controlValue === 'on') {
                      $(`#id_${controlName}`).prop('checked', true).change();
                  }
  
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
  
          if (gcd_form_creatorobject) {
              const totalFormsRequired = Number(gcd_form_creatorobject.find(f => f.name === 's_c_r-TOTAL_FORMS').value);
              // First make the empty names tables
              for (let i = 1; i < totalFormsRequired; i++) {
                  $('.add-row').first().click();
              }
  
              for (let i = 0; i < gcd_form_creatorobject.length; i++) {
                  let controlName = gcd_form_creatorobject[i].name.replace('s_c_r', 'story_credit_revisions');
  
                  let controlValue = gcd_form_creatorobject[i].value ?? "";
  
                  if (controlName === 'story_credit_revisions-INITIAL_FORMS') {
                    controlValue = "0";
                  }
  
                  if (controlName.includes('-creator')) {
                    $(`#id_${controlName} option`).removeAttr('selected')
                    $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_creatorobject[i].cn}</option>`);
                      continue;
                  }
  
                  if (controlName.includes('-signature') && controlValue !== "") {
                      $(`#id_${controlName}`).append(`<option value="${controlValue}" selected="">${gcd_form_creatorobject[i].sn}</option>`);
                  }
  
                  if (controlName.includes('-is_credited') || controlName.includes('-is_signed') || controlName.includes('uncertain') || controlName.includes('-is_sourced')) {
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
  
          await pasteCharactersWithUniversesAndGroups();
  
          const gcd_form_featureobject = await localforage.getItem('gcd_form_featureobject');
          if (gcd_form_featureobject) {
              for (let i = 0; i < gcd_form_featureobject.length; i++) {
                  let controlValue = gcd_form_featureobject[i].value;
                  let friendlyName = gcd_form_featureobject[i].friendlyFeatureName;
  
                  let nextPosition = $('select[name="feature_object"] option').length + 1;
                  $('select[name="feature_object"]').append(featureHtml(controlValue, nextPosition, friendlyName));
              }
          }
      });
  
      $("#characters").on('click', '#paste', async function (e) {
          // Check there aren't existing characters
          var characterObjectForm = $form.serializeArray().filter(f => f.name.includes('story_character_revisions-TOTAL_FORMS'));
          if (characterObjectForm.length > 0)
          {
              var totalForms = Number(characterObjectForm[0].value)
              if (totalForms > 1)
              {
                  alert("Cannot paste characters when characters already added, please remove and save and come back in");
                  return;
              }
          }
  
          await pasteCharactersWithUniversesAndGroups();
      });
  
  })();
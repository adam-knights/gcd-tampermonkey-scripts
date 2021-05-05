// ==UserScript==
// @name         Pending Page Sort
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Adds sorting to all tables on the pending page
// @author       Adam Knights
// @match        https://www.comics.org/queues/pending/
// @require      https://code.jquery.com/jquery-3.5.1.js
// @grant        none
// ==/UserScript==

/* eslint-env jquery */

function addCssClasses() {
    $(`<style type='text/css'>
    .headerSortDown:after,
    .headerSortUp:after {
        content: ' ';
        position: relative;
        left: 2px;
        border: 8px solid transparent;
    }

    .headerSortDown:after {
        top: 10px;
        border-top-color: silver;
    }

    .headerSortUp:after {
        bottom: 15px;
        border-bottom-color: silver;
    }

    .headerSortDown,
    .headerSortUp {
        padding-right: 10px;
        cursor: pointer;
    }
    </style>`).appendTo("head");
}

function comparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index);
        var valB = getCellValue(b, index);
        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB);
    }
}

function lastActivityComparer(index) {
    return function(a, b) {
        var valA = getCellValue(a, index);
        var valB = getCellValue(b, index);

        var tA = getTimeValue(valA);
        var tB = getTimeValue(valB);

        if (tA.year !== tB.year) {
            return tA.year - tB.year;
        }
        if (tA.month !== tB.month) {
            return tA.month - tB.month;
        }
        if (tA.week !== tB.week) {
            return tA.week - tB.week;
        }
        if (tA.day !== tB.day) {
            return tA.day - tB.day;
        }
        if (tA.hour !== tB.hour) {
            return tA.hour - tB.hour;
        }
        if (tA.minute !== tB.minute) {
            return tA.minute - tB.minute;
        }

        return tA.second - tB.second;
    }
}

function getCellValue(row, index){
    return $(row).children('td').eq(index).text();
}

function getTimeValue(val) {
    var trimmed = val.trim();
    var partsOnly = trimmed.substring(0, trimmed.length - 4);

    var split = partsOnly.split(',');
    const time = { year: 0, month: 0, week: 0, day: 0, hour: 0, minute: 0, second: 0 };
    for (const s of split) {
        const t = s.trim().toLowerCase();

        let timeValue;
        if (t.startsWith('a')) {
            timeValue = 1;
        } else {
            timeValue = t.match(/(^\d+)\s/)[1];
        }

        if (t.includes('year')) {
            time.year = parseInt(timeValue);
        } else if (t.includes('month')) {
            time.month = parseInt(timeValue);
        } else if (t.includes('week')) {
            time.week = parseInt(timeValue);
        } else if (t.includes('day')) {
            time.day = parseInt(timeValue);
        } else if (t.includes('hour')) {
            time.hour = parseInt(timeValue);
        } else if (t.includes('minute')) {
            time.minute = parseInt(timeValue);
        } else if (t.includes('second')) {
            time.second = parseInt(timeValue);
        }
    }

    return time;
}

(async function() {
    'use strict';

    addCssClasses();

    $(`th:not(:contains("Last Activity"))`).addClass('headerSortDown');
    $(`th:contains("Last Activity")`).addClass('headerSortUp');

    $('th').click(function(){
        var table = $(this).parents('table').eq(0);
        var rows;

        if ($(this).is(':contains("Last Activity")')) {
            rows = table.find('tr:gt(0)').toArray().sort(lastActivityComparer($(this).index()));
            this.asc = $(this).hasClass('headerSortUp');
        } else {
            rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()));
            this.asc = !this.asc;
        }

        if (!this.asc){
            rows = rows.reverse();
            $(this).removeClass('headerSortDown');
            $(this).addClass('headerSortUp');
        } else {
            $(this).removeClass('headerSortUp');
            $(this).addClass('headerSortDown');
        }
        for (var i = 0; i < rows.length; i++) {
            table.append(rows[i]);
        }
    });

})();
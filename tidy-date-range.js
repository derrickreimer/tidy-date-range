/* =====================================================================
 * tidy-date-range.js v0.0.1
 * http://github.com/djreimer/tidy-date-range
 * =====================================================================
 * Copyright (c) 2014 Derrick Reimer
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ===================================================================== */

;(function($, window, document, undefined) {
  var pad = function(s) {
    return ("0" + s).slice(-2);
  }

  var Calendar = function(year, month, selectedRange) {
    this.year = year;
    this.month = month;
    this.selectedRange = selectedRange;
    this.dayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this.names = ['January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'];
    this.$el = $("<table class='tdr-calendar'></table>");
  }

  Calendar.prototype = {
    constructor: Calendar

  , firstDay: function() {
      return new Date(this.year, this.month - 1, 1);
    }

  , firstDow: function() {
      return this.firstDay().getDay();
    }

  , dayCount: function() {
      if (this.month == 2 && this.isLeapYear()) return 29;
      return this.dayCounts[this.month - 1];
    }

  , isLeapYear: function() {
      return (
        this.year % 4 == 0 && this.year % 100 != 0
      ) || (
        this.year % 400 == 0
      );
    }

  , name: function() {
      return this.names[this.month - 1] + " " + this.year;
    }

  , render: function() {
      var day = 1, 
          weeks = "<tr>", 
          chrome = "", 
          date = "";

      // Loop over weeks
      for (var i = 0; i <= 6; i++) {
        // Loop over days of the week
        for (var j = 0; j <= 6; j++) {
          weeks += "<td>";
          date = this.year + "-" + pad(this.month) + "-" + pad(day);

          if (day <= this.dayCount() && (i > 0 || j >= this.firstDow())) {
            weeks += "<a href='#' data-date='"+ date + "'>" + day + "</a>";
            day++;
          }
          
          weeks += "</td>";
        }

        // Stop if we are out of days
        if (day > this.dayCount()) {
          break;
        } else {
          weeks += "</tr><tr>";
        }
      }

      weeks += "</tr>";

      chrome += "<thead>";
      chrome += "<tr><th class='month' colspan='7'>" + this.name() + "</th></tr>"
      chrome += "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>";
      chrome += "</thead>";
      chrome += "<tbody>" + weeks + "</tbody>";

      this.$el.html(chrome);
    }
  }

  // Public: Constructs a new date range.
  //
  // from - A String of the form "2014-02-04" 
  //        marking the start of the range.
  // to   - A String of the form "2014-02-04"
  //        marking the end of the range.
  //
  // Returns nothing.
  var DateRange = function(from, to) {
    this.setFrom(from);
    this.setTo(to);
  }

  DateRange.prototype = {
    constructor: DateRange

  , setFrom: function(str) {
      this.__from = this.parseDate(str);
    }

  , setTo: function(str) {
      this.__to = this.parseDate(str);
    }

  , getFrom: function() {
      return this.__from;
    }

  , getTo: function() {
      return this.__to;
    }

  , now: function() {
      var date = new Date();
      var year = date.getFullYear();
      var month = pad(date.getMonth() + 1);
      var day = pad(date.getDate());
      return [year, month, day].join("-");
    }

  , parseDate: function(date) {
      if (date == "" || date == undefined) return undefined;

      var parts = date.split("-");
      var year = parseInt(parts[0]);
      var month = parseInt(parts[1]);
      var day = parseInt(parts[2]);

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return undefined;
      }

      return [year, month, day];
    }

  , arrayToDate: function(arr) {
      return new Date(arr[0], arr[1] - 1, arr[2]);
    }

  , isValid: function() {
      var from = this.getFrom(), to = this.getTo();
      if (from == undefined || to == undefined) return false;
      if (this.arrayToDate(from) > this.arrayToDate(to)) return false;
      return true;
    }

  , includes: function(str) {
      if (!this.isValid()) return false;

      var dateArray = this.parseDate(str);
      if (dateArray == undefined) return false;

      var date = this.arrayToDate(dateArray);
      var from = this.arrayToDate(this.getFrom());
      var to = this.arrayToDate(this.getTo());
      return (from <= date && to >= date);
    }
  }

  window.Calendar = Calendar;
  window.DateRange = DateRange;

  $.fn.tidydaterange = function(options) {
    return this.each(function() {

    });
  }
}(jQuery, window, document));
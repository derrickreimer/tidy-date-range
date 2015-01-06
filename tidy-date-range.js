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
  var Day = function(month, number) {
    this.month = month;
    this.number = number;
  }

  Day.pad = function(s) {
    return ("0" + s).slice(-2);
  }

  Day.fromString = function(str) {
    if (str == "" || str == undefined) return undefined;

    var parts = str.split("-");
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]);
    var day = parseInt(parts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
    return new Day(new Month(year, month), day);
  }

  Day.fromDate = function(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return new Day(new Month(year, month), day);
  }

  Day.now = function() {
    return Day.fromDate(new Date());
  }

  Day.prototype = {
    constructor: Day

    , daysFromNow: function(days) {
      var date = this.toDate();
      var time = date.getTime();
      newTime = time + (days * 86400000);
      return Day.fromDate(new Date(newTime));
    }

    , toDate: function() {
      return new Date(this.month.year, this.month.number - 1, this.number);
    }

    , toString: function() {
      var year = this.month.year;
      var month = Day.pad(this.month.number);
      var day = Day.pad(this.number);
      return [year, month, day].join("-");
    }

    , toHuman: function() {
      return Month.shortNames[this.month.number - 1] + " " + this.number + ", " + this.month.year;
    }

    , toSlashed: function() {
      return [this.month.number, this.number, this.month.year].join("/");
    }
  }

  var Month = function(year, number) {
    this.year = year;
    this.number = number;
    this.dayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }

  Month.names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  Month.shortNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
  ];

  Month.prototype = {
    constructor: Month

    , name: function() {
      return Month.names[this.number - 1] + " " + this.year;
    }

    , shortName: function() {
      return Month.shortNames[this.number - 1] + " " + this.year;
    }

    , dayCount: function() {
      if (this.number == 2 && this.isLeapYear()) return 29;
      return this.dayCounts[this.number - 1];
    }

    , isLeapYear: function() {
      return (
        this.year % 4 == 0 && this.year % 100 != 0
        ) || (
        this.year % 400 == 0
        );
    }

    , firstDay: function() {
      return new Date(this.year, this.number - 1, 1);
    }

    , firstDayOfTheWeek: function() {
      return this.firstDay().getDay();
    }

    , previous: function() {
      if (this.number == 1) {
        return new Month(this.year - 1, 12);
      } else {
        return new Month(this.year, this.number - 1);
      }
    }

    , next: function() {
      if (this.number == 12) {
        return new Month(this.year + 1, 1);
      } else {
        return new Month(this.year, this.number + 1);
      }
    }
  }

  var Calendar = function(month) {
    this.month = month;
    this.$el = $("<table class='tdr-calendar'></table>");
  }

  Calendar.prototype = {
    constructor: Calendar

    , applyRange: function(range, isSelecting) {
      var now = Day.now().toDate();

      this.$el.find("[data-date]").each(function(index) {
        var $this = $(this);
        var day = Day.fromString($this.data("date"));

        if (range.includes(day)) {
          $this.addClass("selected");
        } else {
          $this.removeClass("selected");
        }

        var date = day.toDate();

        if (date > now || (isSelecting && date < range.from.toDate())) {
          $this.addClass("disabled");
        } else {
          $this.removeClass("disabled");
        }
      })
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
          date = this.month.year + "-" + Day.pad(this.month.number) + "-" + Day.pad(day);

          if (day <= this.month.dayCount() && (i > 0 || j >= this.month.firstDayOfTheWeek())) {
            weeks += "<a href='#' data-date='"+ date + "'>" + day + "</a>";
            day++;
          }

          weeks += "</td>";
        }

        // Stop if we are out of days
        if (day > this.month.dayCount()) {
          break;
        } else {
          weeks += "</tr><tr>";
        }
      }

      weeks += "</tr>";

      chrome += "<thead>";
      chrome += "<tr><th class='month' colspan='7'>" + this.month.name() + "</th></tr>"
      chrome += "<tr><th>S</th><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th></tr>";
      chrome += "</thead>";
      chrome += "<tbody>" + weeks + "</tbody>";

      this.$el.html(chrome);
    }

    , onSelect: function(handler) {
      this.$el.on("click", "a[data-date]:not(.disabled)", function() {
        var day = Day.fromString($(this).data("date"));
        handler(day);
        return false;
      });
    }
  }

  var DateRange = function(from, to) {
    this.from = from;
    this.to = to;
  }

  DateRange.default = function() {
    var now = Day.now();
    return new DateRange(now.daysFromNow(-30), now);
  }

  DateRange.prototype = {
    constructor: DateRange

    , isValid: function() {
      if (this.from == undefined || this.to == undefined) return false;
      if (this.from.toDate() > this.to.toDate()) return false;
      return true;
    }

    , includes: function(day) {
      if (!this.isValid()) return false;
      var date = day.toDate();
      return (this.from.toDate() <= date && this.to.toDate() >= date);
    }
  }

  var Control = function(parent, options) {
    var that = this
      , range;

    this.options = options || {};

    range = new DateRange(
      Day.fromString(this.options.from),
      Day.fromString(this.options.to)
    )

    this.range = range.isValid() ? range : DateRange.default();
    this.calendars = [];
    this.visibleMonth = this.range.to.month;
    this.isSelecting = false;

    this.$parent = $(parent);
    this.$el = $("<div class='tdr-control'></div>");
    this.$dropdown = $("<a href='#' class='tdr-dropdown'></div>");
    this.$popover = $("<div class='tdr-popover'></div>");
    this.$previous = $("<a href='#' class='tdr-shift-button previous'></a>");
    this.$next = $("<a href='#' class='tdr-shift-button next'></a>");
    this.$calendars = $("<div class='tdr-calendars'></div>");
    this.$controls = $(
      "<div class='tdr-controls'>" +
      "<div class='tdr-range-inputs'>" +
      "<label>Date Range</label>" +
      "<input type='text' name='from' value='' class='tdr-date' />" +
      "<span class='tdr-dash'>&mdash;</span>" +
      "<input type='text' name='to' value='' class='tdr-date' />" +
      "</div>" +
      "<div class='tdr-buttons'>" +
      "<a href='#' data-tidydaterange='apply' class='tdr-button'>Apply</a>" +
      "</div>" +
      "</div>"
    );

    this.$el.append(this.$dropdown);
    this.$el.append(this.$popover);
    this.$popover.append(this.$previous);
    this.$popover.append(this.$next);
    this.$popover.append(this.$calendars);
    this.$popover.append(this.$controls);

    this.$dropdown.on("click", function() {
      that.$el.toggleClass("open");
      return false;
    });

    $("html").on("click.tidydaterange", function() {
      that.$el.removeClass("open");
    });

    $("body").on("click.tidydaterange", ".tdr-popover", function(e) {
      e.stopPropagation();
    });

    this.$parent.html(this.$el);

    this.$previous.on("click", function() {
      that.shiftPrevious();
      return false;
    });

    this.$next.on("click", function() {
      that.shiftNext();
      return false;
    });

    this.$el.on("change", "input[name='from']", function(e) {
      that.updateFrom(e.currentTarget.value);
    });

    this.$el.on("change", "input[name='to']", function(e) {
      that.updateTo(e.currentTarget.value);
    });

    this.$el.on("click", "[data-tidydaterange='apply']", function() {
      that.$parent.trigger("apply");
      return false;
    });

    this.render();
  }

  Control.prototype = {
    constructor: Control

    , renderCalendars: function() {
      var that = this
        , c3 = new Calendar(this.visibleMonth)
        , c2 = new Calendar(c3.month.previous())
        , c1 = new Calendar(c2.month.previous());

      // Define calendar set
      this.calendars = [c1, c2, c3];

      // Render the calendars
      for (var i = 0; i < this.calendars.length; i++) {
        this.calendars[i].render();
      }

      var that = this;

      // Bind events
      $.each(this.calendars, function(index) {
        this.onSelect(function(day) {
          that.range.to = day;

          if (that.isSelecting) {
            that.isSelecting = false;
          } else {
            that.range.from = day;
            that.isSelecting = true;
          }

          that.render();
        })
      });

      // Place rendered calendars on the DOM
      this.$calendars.html("");
      for (var i = 0; i < this.calendars.length; i++) {
        this.$calendars.append(this.calendars[i].$el);
      }
    }

    , updateFrom: function(from) {
      this.range.from = Day.fromDate(new Date(from));
      if (this.range.isValid()) {
        this.applyRange(this.range);
        this.$parent.data("from", this.range.from.toString());
      }
    }

    , updateTo: function(to) {
      this.range.to = Day.fromDate(new Date(to));
      if (this.range.isValid()) {
        this.applyRange(this.range);
        this.$parent.data("to", this.range.to.toString());
      }
    }

    , applyRange: function(range) {
      // Update calendars
      for (var i = 0; i < this.calendars.length; i++) {
        this.calendars[i].applyRange(this.range, this.isSelecting);
      }

      // Update dropdown label
      this.$dropdown.html(
        "<span class='label'>" +
        this.range.from.toHuman() + " &mdash; " + this.range.to.toHuman() +
        "</span><span class='arrow'></span>"
      );
    }

    , render: function() {
      this.renderCalendars();
      this.applyRange();
      this.$parent.data("from", this.range.from.toString());
      this.$parent.data("to", this.range.to.toString());
      this.$controls.find("input[name='from']").val(this.range.from.toSlashed());
      this.$controls.find("input[name='to']").val(this.range.to.toSlashed());
      return this;
    }

    , setVisibleMonth: function(month) {
      this.visibleMonth = month;
      this.render();
    }

    , shiftNext: function() {
      this.setVisibleMonth(this.visibleMonth.next());
      return this;
    }

    , shiftPrevious: function() {
      this.setVisibleMonth(this.visibleMonth.previous());
      return this;
    }

    , getRange: function() {
      return this.range;
    }
  }

  $.fn.tidydaterange = function(options) {
    return this.each(function() {
      var $this = $(this)
        , data = $this.data('tidydaterange');
      if (!data) $this.data('tidydaterange', (data = new Control(this, options)));
      if (typeof options == 'string') return data[options].call(data);
    });
  }
}(jQuery, window, document));
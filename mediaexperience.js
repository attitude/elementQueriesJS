/*jslint browser: true*/
/*!
 * mediaexperienceJS v0.3.2
 *
 * Copyright 2014 Martin Adamko
 * Released under the MIT license
 *
 */
(function ($, window, document) {
    'use strict';
    /**
     * @constructor
     */
    var console = window.console,
        MediaExperience = function (elem, options) {
            this.elem = elem;
            this.$elem = $(elem);
            this.options = options;

            // Distinc
            this.$elem.addClass('responds-to-media-experience');

            // Customization of the plugin on a per-element basis.
            // <div data-mediaexperience-options='{prefix: "device"}'></div>
            this.metadata = this.$elem.data('mediaexperience-options');
        },
        // Array of all media experience instances
        allMediaExperienceElements = [],
        // timeout for onresize events
        windowResizeTimeout,

        // Trigger Custom Event
        // Shim:
        shimTriggerMediaExperienceChanged = function shimTriggerMediaExperienceChanged() {
            var e = document.createEvent('Event');

            e.initEvent(MediaExperience.prototype.eventName, true, false);
            window.dispatchEvent(e);
        },
        // Modern browsers: CustomEvent
        triggerMediaExperienceChanged = function triggerMediaExperienceChanged() {
            var e = new window.CustomEvent(MediaExperience.prototype.eventName, {
                'bubbles': true
            });

            window.dispatchEvent(e);
        },
        // Function to call after timeout on window resize
        triggerResize = function triggerResize() {
            var i, // iterator
                j, // iterator
                l, // length
                n, // length
                // groups of active instances by number of parents
                mediaExperienceParents = {
                    'counts': [],
                    'parentsCountOf': []
                },
                parentsCount;

            l = allMediaExperienceElements.length;

            for (i = 0; i < l; i += 1) {
                parentsCount = allMediaExperienceElements[i].$elem.parents('.responds-to-media-experience').length;

                // Create empty array if not yet exists...
                if (mediaExperienceParents.parentsCountOf[parentsCount] === undefined) {
                    mediaExperienceParents.parentsCountOf[parentsCount] = [];
                }
                // ... and rememter the element's index
                mediaExperienceParents.parentsCountOf[parentsCount].push(i);

                // Remember what possible counts we encountered
                if (mediaExperienceParents.counts.indexOf(parentsCount) === -1) {
                    mediaExperienceParents.counts.push(parentsCount);
                }
            }

            // Sort number of parents
            mediaExperienceParents.counts.sort();

            // console.log(mediaExperienceParents);

            l = mediaExperienceParents.counts.length;

            for (i = 0; i < l; i += 1) {
                parentsCount = mediaExperienceParents.counts[i];

                // console.log('parentsCountOf:' + parentsCount);

                n = mediaExperienceParents.parentsCountOf[parentsCount].length;

                for (j = 0; j < n; j += 1) {
                    // console.log('iteration: ' + j);
                    allMediaExperienceElements[mediaExperienceParents.parentsCountOf[parentsCount][j]].resize();
                }
            }

            MediaExperience.triggerEvent();
        };

    // the plugin prototype
    MediaExperience.prototype = {
        timeout: 200,
        eventName: 'mediaexperiencechanged',
        defaults: {
            horizontalModule: 80,
            verticalModule: 80,
            prefix: 'media-experience',
            useBreakpoints: true,
            calculateVertical: false,
            useSince: 'since',
            // Columns to be true
            breakpoints: {
                'watch': 0, // too tiny
                'phone': 4, // mobile first
                'phone--small': 4, // 80 x   0...4 =    0 <= ? < 320
                'phone--medium': 6, // 80 x   5...6 =  320 <= ? < 480
                'phone--large': 9, // 80 x   7...9 =  480 <= ? < 720
                'tablet': 9, // 80 x  9 =  720
                'tablet--small': 10, // 80 x  9...10 =  720 <= ? <  800
                'tablet--medium': 11, // 80 x  9...10 =  720 <= ? <  800
                'tablet--large': 13, // 80 x 11...12 =  800 <= ? <  960
                'desktop': 13, // 80 x 13 =  960
                'desktop--small': 14, // 80 x 13...14 =  960 <= ? < 1120
                'desktop--medium': 18, // 80 x 15...18 = 1120 <= ? < 1440
                'desktop--large': 24, // 80 x 17...24 = 1440 <= ? < 1920
                'oversized-desktop': 24 // 80 x 24 = 1920
            }
        },

        init: function () {
            // Introduce defaults that can be extended either
            // globally or using an object literal.
            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            this.regex = new RegExp('\\b' + this.config.prefix + '-\\S+', 'g');
            this.resize();

            MediaExperience.triggerEvent();

            return this;
        },

        resize: function () {
            var self = this,
                classes = [],
                width,
                widths,
                height,
                heights,
                lastBreakpoint,
                lastMajorBreakpoint,
                lastMajorHeightBreakpoint,
                attrname;

            if ($(self.$elem).hasClass('media-experience-disabled')) {
                return;
            }

            // console.log($(self.$elem));
            // console.trace();

            width = $(self.$elem).width();
            widths = parseInt(width / self.config.horizontalModule, 10);
            classes.push(self.config.prefix + '-width-' + widths);

            if (!!self.config.calculateVertical) {
                console.log(self.$elem[0].nodeName.toLowerCase());
                if (self.$elem[0].nodeName.toLowerCase() === 'body') {
                    height = $(window).height();
                } else {
                    height = $(self.$elem).height();
                }
                heights = parseInt(height / self.config.verticalModule, 10);
                classes.push(self.config.prefix + '-height-' + heights);
            }

            if (self.config.useBreakpoints) {
                lastBreakpoint = lastMajorBreakpoint = lastMajorHeightBreakpoint = 0;

                for (attrname in self.config.breakpoints) {
                    if (self.config.breakpoints.hasOwnProperty(attrname)) {
                        // console.log('lastMajorBreakpoint', lastMajorBreakpoint, 'lastBreakpoint', lastBreakpoint, 'widths', widths, attrname, self.config.breakpoints[attrname]);
                        // Variations of the major breakpoint
                        if (attrname.match(/--/)) {
                            if (lastBreakpoint <= widths && widths < self.config.breakpoints[attrname]) {
                                classes.push(self.config.prefix + '-' + attrname);
                            }

                            if (!!self.config.calculateVertical) {
                                if (lastBreakpoint <= heights && heights < self.config.breakpoints[attrname]) {
                                    classes.push(self.config.prefix + '-' + attrname + '-height');
                                }
                            }
                        } else {
                            if (self.config.breakpoints[attrname] <= widths) {
                                // Major breakpoints
                                if (self.config.useSince && typeof self.config.useSince === 'string') {
                                    // All major breakpoints: mobile first approach
                                    classes.push(self.config.prefix + '-' + self.config.useSince + '-' + attrname);
                                }

                                if (self.config.breakpoints[attrname] <= widths) {
                                    // Only current major breakpoint (remember it)
                                    lastMajorBreakpoint = attrname;
                                }
                            }

                            if (!!self.config.calculateVertical && self.config.breakpoints[attrname] <= heights) {
                                // Major breakpoints
                                if (self.config.useSince && typeof self.config.useSince === 'string') {
                                    // All major breakpoints: mobile first approach
                                    classes.push(self.config.prefix + '-' + self.config.useSince + '-' + attrname + '-height');
                                }

                                if (self.config.breakpoints[attrname] <= heights) {
                                    // Only current major breakpoint (remember it)
                                    lastMajorHeightBreakpoint = attrname;
                                }
                            }
                        }

                        lastBreakpoint = self.config.breakpoints[attrname];
                    }
                }
            }

            // Add current major breakpoint
            classes.push(self.config.prefix + '-' + lastMajorBreakpoint);

            if (self.config.calculateVertical) {
                // Add current major vertical breakpoint
                classes.push(self.config.prefix + '-' + lastMajorHeightBreakpoint + '-height');
                // Orientation
                classes.push(self.config.prefix + '-orientation-' + (width > height ? 'horizontal' : 'vertical'));
            }

            // Build the classes
            classes = classes.join(' ');

            // Remove old prefix-matching classes and add new
            self.$elem.removeClass(function (index, css) {
                return (css.match(self.regex) || []).join(' ');
            }).addClass(classes);

            // console.log(widths, heights, self.config.horizontalModule, self.config.verticalModule);
            // console.log('resize();');
        }
    };

    MediaExperience.triggerEvent = function () {
        if (window.CustomEvent) {
            triggerMediaExperienceChanged();
        } else {
            // Fallback
            shimTriggerMediaExperienceChanged();
        }

        return;
    };

    MediaExperience.defaults = MediaExperience.prototype.defaults;

    // Fire only after all window.on('resize') events finished.
    $(window).on('resize', function runOnWindowResize() {
        // Remove previous timer if still within previous timeout
        window.clearTimeout(windowResizeTimeout);
        // Set new timeout to call function
        windowResizeTimeout = window.setTimeout(triggerResize, MediaExperience.prototype.timeout);
    });

    $.fn.mediaExperience = function newMediaExperience(options) {
        this.each(function () {
            var v = new MediaExperience(this, options).init();

            allMediaExperienceElements.push(v);
        });

        return this;
    };

    // Allows overwriting of any sitewide plugin aspect like timeout
    window.MediaExperience = MediaExperience;
}(window.jQuery, window, document));

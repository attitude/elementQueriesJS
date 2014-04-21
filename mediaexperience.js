/*!
 * mediaexperienceJS v0.2.0
 *
 * Copyright 2014 Martin Adamko
 * Released under the MIT license
 *
 */
;(function( $, window, document ){
    /**
     * @constructor
     */
    var MediaExperience = function( elem, options ){
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;

        // Distinc
        this.$elem.addClass('responds-to-media-experience');

        // Customization of the plugin on a per-element basis.
        // <div data-mediaexperience-options='{prefix: "device"}'></div>
        this.metadata = this.$elem.data( 'mediaexperience-options' );
    },
        // Array of all media experience instances
        allMediaExperienceElements = [],
        // timeout for onresize events
        windowResizeTimeout;

    // the plugin prototype
    MediaExperience.prototype = {
        timeout: 200,
        defaults: {
            horizontalModule: 80,
            verticalModule: 80,
            prefix: "media-experience",
            useBreakpoints: true,
            calculateVertical: false,
            useSince: 'since',
            // Columns to be true
            breakpoints: {
              'phone':               0, // mobile first
                'phone--small':      4, // 80 x   0...4 =    0 <= ? < 320
                'phone--medium':     6, // 80 x   5...6 =  320 <= ? < 480
                'phone--large':      9, // 80 x   7...9 =  480 <= ? < 720
              'tablet':               9, // 80 x  9 =  720
                'tablet--small':     10, // 80 x  9...10 =  720 <= ? <  800
                'tablet--medium':    11, // 80 x  9...10 =  720 <= ? <  800
                'tablet--large':     13, // 80 x 11...12 =  800 <= ? <  960
              'desktop':             13, // 80 x 13 =  960
                'desktop--small':    14, // 80 x 13...14 =  960 <= ? < 1120
                'desktop--medium':   18, // 80 x 15...18 = 1120 <= ? < 1440
                'desktop--large':    24, // 80 x 17...24 = 1440 <= ? < 1920
              'oversized-desktop':   24  // 80 x 24 = 1920
            }
        },

        init: function() {
            // Introduce defaults that can be extended either
            // globally or using an object literal.
            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            this.regex  = new RegExp('\\b'+ this.config.prefix + '-\\S+', 'g');
            this.resize();

            return this;
        },

        resize: function() {
            var self = this;

            if ($(self.$elem).hasClass('media-experience-disabled')) {
                return;
            }

            var classes = [];

            var widths  = parseInt($(self.$elem).width() / self.config.horizontalModule, 10);
            classes.push(self.config.prefix+'-width-'+widths);

            if (!! self.config.calculateVertical) {
                var heights = parseInt($(self.$elem).height() / self.config.verticalModule, 10);
                classes.push(self.config.prefix+'-height-'+heights);
            }

            if (self.config.useBreakpoints) {
                var lastBreakpoint = 0;
                var lastMajorBreakpoint = 0;

                for (var attrname in self.config.breakpoints) {
                    // console.log('lastMajorBreakpoint', lastMajorBreakpoint, 'lastBreakpoint', lastBreakpoint, 'widths', widths, attrname, self.config.breakpoints[attrname])

                    if (attrname.match(/--/)) {
                        // Variations of the major breakpoint
                        if (lastBreakpoint <= widths && widths < self.config.breakpoints[attrname]) {
                            classes.unshift(self.config.prefix+'-'+attrname);
                        }
                    } else if (self.config.breakpoints[attrname] <= widths) {
                        // Major breakpoints
                        if (self.config.useSince && typeof self.config.useSince === 'string') {
                            // All major breakpoints: mobile first approach
                            classes.push(self.config.prefix+'-'+self.config.useSince+'-'+attrname);
                        }

                        if (self.config.breakpoints[attrname] <= widths) {
                            // Only current major breakpoint (remember it)
                            lastMajorBreakpoint = attrname;
                        }
                    }

                    lastBreakpoint = self.config.breakpoints[attrname];
                }
            }

            // Add current major breakpoint
            classes.unshift(self.config.prefix+'-'+lastMajorBreakpoint);

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

    MediaExperience.defaults = MediaExperience.prototype.defaults;

    // Fire only after all window.on('resize') events finished.
    $(window).on('resize', function runOnWindowResize(){
        // Remove previous timer if still within previous timeout
        clearTimeout(windowResizeTimeout);
        // Set new timeout to call function
        windowResizeTimeout = setTimeout(triggerResize, MediaExperience.prototype.timeout);
    });

    // Function to call after timeout on window resize
    function triggerResize() {
        var i, // iterator
            j, // iterator
            l, // length
            n, // length
            // groups of active instances by number of parents
            mediaExperienceParents = {
                'indexes': [],
                'indexItems': []
            },
            // stores count of parents (num of instances depending on)
            parentsCount;

        l = allMediaExperienceElements.length;

        for (i = 0; i < l; i++) {
            parentsCount = allMediaExperienceElements[i].$elem.parents('.responds-to-media-experience').length;

            if (typeof mediaExperienceParents.indexItems[parentsCount]==='undefined') {
                mediaExperienceParents.indexItems[parentsCount] = [];
                mediaExperienceParents.indexes.push(parentsCount);
            }

            mediaExperienceParents.indexItems[parentsCount].push(i);
        }

        // Sort number of parents
        mediaExperienceParents.indexes.sort();

        // console.log(mediaExperienceParents);

        l = mediaExperienceParents.indexes.length;

        for (i = 0; i < l; i++) {
            parentsCount = mediaExperienceParents.indexes[i];

            // console.log('parentsCount:' + parentsCount);

            n = mediaExperienceParents.indexItems[parentsCount].length;

            for (j = 0; j < n; j++) {
                // console.log('iteration: ' + j);
                allMediaExperienceElements[j].resize();
            }
        }
    }

    $.fn.mediaExperience = function newMediaExperience(options) {
        var newElement = this.each(function() {
            var v = new MediaExperience(this, options).init();

            allMediaExperienceElements.push(v);
        });

        return this;
    };

    // Allows overwriting of any sitewide plugin aspect like timeout
    window.MediaExperience = MediaExperience;
})( jQuery, window , document );

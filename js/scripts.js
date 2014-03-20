var mediaExperience = function(options, breakpoints) {
    // Construct The object
    var self = {
        target: null,
        regex:  null,
        options: {
            horizontalModule: 80,
            verticalModule: 80,
            prefix: "media-experience",
            target: "body",
            timeout: 300,
            useBreakpoints: true,
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
            var self = this;

            self.target = $(self.options.target);
            self.regex  = new RegExp('\\b'+ self.options.prefix + '-\\S+', 'g');

            self.resize();

            console.log('init()');
        },
        resize: function() {
            var self = this;

            if ($(self.target).hasClass(self.options.prefix+'-disabled')) {
                return;
            }

            var widths  = parseInt($(self.target).width() / self.options.horizontalModule);
            var heights = parseInt($(self.target).height() / self.options.verticalModule);

            var classes = [];

            classes.push(self.options.prefix+'-width-'+widths);
            classes.push(self.options.prefix+'-height-'+heights);

            if (self.options.useBreakpoints) {
                var lastBreakpoint = 0;
                var lastMajorBreakpoint = 0;

                for (var attrname in self.options.breakpoints) {
                    // console.log('lastMajorBreakpoint', lastMajorBreakpoint, 'lastBreakpoint', lastBreakpoint, 'widths', widths, attrname, self.options.breakpoints[attrname])

                    if (attrname.match(/--/)) {
                        // Variations of the major breakpoint
                        if (lastBreakpoint <= widths && widths < self.options.breakpoints[attrname]) {
                            classes.unshift(self.options.prefix+'-'+attrname);
                        }
                    } else if (self.options.breakpoints[attrname] <= widths) {
                        // Major breakpoints
                        if (self.options.useSince && typeof self.options.useSince === 'string') {
                            // All major breakpoints: mobile first approach
                            classes.push(self.options.prefix+'-'+self.options.useSince+'-'+attrname);
                        }

                        if (self.options.breakpoints[attrname] <= widths) {
                            // Only current major breakpoint (remember it)
                            lastMajorBreakpoint = attrname;
                        }
                    }

                    lastBreakpoint = self.options.breakpoints[attrname];
                }
            }

            // Add current major breakpoint
            classes.unshift(self.options.prefix+'-'+lastMajorBreakpoint);

            // Build the classes
            classes = classes.join(' ');

            // Remove old prefix-matching classes and add new
            self.target.removeClass(function (index, css) {
                return (css.match(self.regex) || []).join(' ');
            }).addClass(classes);

            // console.log(widths, heights, self.options.horizontalModule, self.options.verticalModule);

            console.log('resize();');
        }
    };

    // Merge passed options
    if (typeof options === 'object') {
        for (var attrname in options) {
            self.options[attrname] = options[attrname];
        }
    };

    // Merge passed breakpoints
    if (typeof breakpoints === 'object') {
        for (var attrname in breakpoints) {
            self.options.breakpoints[attrname] = breakpoints[attrname];
        }
    };

    // Init object
    self.init();

    // Fire on resize end
    var trigger;
    function triggerResize() {self.resize();}

    window.onresize = function(){
        clearTimeout(trigger);
        trigger = setTimeout(triggerResize, self.options.timeout);
    };

    return self;
};

var bodyWatcher = mediaExperience({useBreakpoints: true, prefix: "media-experience", timeout: 200});

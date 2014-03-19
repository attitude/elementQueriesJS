var mediaExperience = function(options, breakpoints) {
    // Construct The object
    var self = {
        target: null,
        regex:  null,
        options: {
            useBreakpoints: true,
            module: 80,
            modules: 12,
            target: "body",
            prefix: "media"
        },
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

            var widths  = parseInt($(self.target).width() / self.options.module);
            var heights = parseInt($(self.target).height() / self.options.module);

            var classes = [];

            classes.push(self.options.prefix+'-width-'+widths);
            classes.push(self.options.prefix+'-height-'+heights);

            if (self.options.useBreakpoints) {
                var lastBreakpoint = 0;

                for (var attrname in self.breakpoints) {

                        if (attrname.match(/--/)) {
                            // console.log('lastBreakpoint', lastBreakpoint, 'widths', widths, attrname, self.breakpoints[attrname])
                            if (lastBreakpoint <= widths && widths < self.breakpoints[attrname]) {
                                classes.push(self.options.prefix+'-experience-'+attrname);
                            }
                        } else if (self.breakpoints[attrname] <= widths) {
                            classes.push(self.options.prefix+'-experience-'+attrname);
                        }

                    lastBreakpoint = self.breakpoints[attrname];
                }
            }

            // Min widths
            // for(var i=1; (i <= widths && i < self.options.modules); i++) {
            //     classes.push(self.options.prefix+'-min-width-'+i);
            // }

            // Max widths
            // for(var i=widths+1; i <= self.options.modules; i++ ) {
            //     classes.push(self.options.prefix+'-max-width-'+i);
            // }

            // Min heights
            // for(var i=1; (i <= heights && i < self.options.modules); i++) {
            //     classes.push(self.options.prefix+'-min-height-'+i);
            // }

            // Max heights
            // for(var i=heights+1; i <= self.options.modules; i++ ) {
            //     classes.push(self.options.prefix+'-max-height-'+i);
            // }

            classes = classes.join(' ');

            self.target.removeClass(function (index, css) {
                return (css.match(self.regex) || []).join(' ');
            }).addClass(classes);

            // console.log(widths, heights, self.options.module);

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
            self.breakpoints[attrname] = breakpoints[attrname];
        }
    };

    // Init object
    self.init();

    // Fire on resize end
    var trigger;
    function triggerResize() {self.resize();}

    window.onresize = function(){
        clearTimeout(trigger);
        trigger = setTimeout(triggerResize, 300);
    };

    return self;
};

var bodyWatcher = mediaExperience({useBreakpoints: true, prefix: "media", module: 80, modules: 16});

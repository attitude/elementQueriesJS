mediaexperience.JS
==================

Media queries in javascript with noscript and IE fallback.
Only 2 KB when minified, 0.89 KB gzipped.

Any element can be watched for changes of width and height. This way you can
design experience on element level instead of screen level.

## Idea

If you use [Modernizr.js][] you are already familiar with principle of
conditional CSS classes to enhance user experience. If you're not, you're
missing out and you definitely should.

This plugin works on same principle: let javascript watch elements (yes, you
can use it for element queries) and by defining conditional CSS, respond to
it appropriately.

## Usage

```html
<!-- Include jQuery dependency -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.11.0.min.js"><\/script>')</script>

<!-- Include mediaexperience.js -->
<script src="//js/mediaexperience.min.js"></script>

<!-- Add instances to watch for elements -->
<script type="text/javascript">
    $('body').mediaExperience({useBreakpoints: true, prefix: "media-experience"});
    $('#search').mediaExperience({prefix: "el"});
</script>
```

# Demo

[Temporary demo](http://www.martinadamko.sk/projects/mediaexperience.js/)

## Why

This plugin needs javascript, but you are not tied to use javascript at all.
Writing conditional CSS for this plugin has few other beneficial side-effects:

1. You can use any server-side to render classes needed to display the
   site correctly and thus support even legacy devides.
1. By adding 'media-experience-disabled' class you can pause this plugin from
   processing.
1. You can even add experience switcher independent from the screen size that
   could allow users to switch best experience they need even without javascript.
1. Works in older IE's (but can be disabled while serving predefined experience)

> **Tip:** You are even encouraged to serve prefilled classes on elements you
> plan to watch. Use Developer tools to inspect element and apply generated
> classes to enable state you're on by default.

If javascript is enabled and this plugin is present, it jumps right in
and sets the correct classes for you.

## PHP media experience switcher example

This example is simple, but illustrates the use of the conditional classes in
your project for enhancing user's experience.

```php
<?php

if (isset($_GET['experience'])) {
    if ($_GET['experience']==='desktop') {
        $experience_classes = "responds-to-media-experience media-experience-desktop media-experience-desktop--small media-experience-width-13 media-experience-since-phone media-experience-since-tablet media-experience-since-desktop";
    } elseif ($_GET['eperience']==='phone') {
        $experience_classes = "media-experience-phone media-experience-phone--small media-experience-width-3 media-experience-since-phone";
    }
} else {
    // Default/initial experience is set to tablet
    $experience_classes = "responds-to-media-experience media-experience-tablet media-experience-tablet--small media-experience-width-9 media-experience-since-phone media-experience-since-tablet";
}
?><body class="<?=$experience_classes?>">
...
</body>
```

Renders by default as:

```html
<body class="media-experience-tablet
             media-experience-tablet--small
             media-experience-width-9
             media-experience-since-phone
             media-experience-since-tablet
">...</body>
```

On the other hand, request with `?experience=phone` will result in:

```html
<body class="media-experience-phone
             media-experience-phone--small
             media-experience-width-3
             media-experience-since-phone
">...</body>
```

> **Tip:** you can use `COOKIES` or `SESSION` to remember the user's preference
> for current session (or serve `m.yoursite.com` with the mobile classes set and
> without this plugin using same, probably already cached CSS).

## Changelog

- v0.2.2 - Add height breakpoints + orientation classes
- v0.2.1 - Fixes to previous release
- v0.2.0 - Complete rewrite
  - More instances = element queries
  - [Google Closure Compiler][GCC] used to [minify javascript][GCCApp]
- v0.1.0 Proof of concept

## Notes

**IMPORTANT:** This is not a replacement for media queries.

Media queries are great, but I find one thing wrong about building responsive
sites using media queries: they can't be turned off. You might say to serve
media queries as separate file and just not include it to turn them off. It's
easier said than done.

Building mobile-first responsive website is basically:

   1. write `@media (min-width: 60em) { #element {...} }`
   1. repeat for each element, each device size...

With this plugin it's same as `.media-experience-since-tablet #element { ... }`.
`since-tablet` is more semantic and you can change WHAT is tablet just by
changing plugin's module (which is 80 by the way).

Having width-9 means there is space for 9 columns available for extra control.

IE support as a side effect of writing CSS (is whath `.no-js` on `<html>` tag
is for H5BP's Modernizr).

## jQuery dependency

This is in the state of development. That's why I have used jQuery for
faster development and testing this approach.

Enjoy!

[@martin_adamko][me]

[me]:     http://twitter.com/martin_adamko
[GCC]:    http://dl.google.com/closure-compiler/compiler-latest.zip
[GCCApp]: http://closure-compiler.appspot.com/

[Modernizr.js]: http://modernizr.com

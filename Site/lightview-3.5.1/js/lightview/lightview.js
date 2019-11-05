/*!
 * Lightview - The jQuery Lightbox - v3.5.1
 * (c) 2008-2016 Nick Stakenburg
 *
 * http://projects.nickstakenburg.com/lightview
 *
 * License: http://projects.nickstakenburg.com/lightview/license
 */
;var Lightview = {
    version: '3.5.1',

    extensions: {
        flash: 'swf',
        image: 'bmp gif jpeg jpg png',
        iframe: 'asp aspx cgi cfm htm html jsp php pl php3 php4 php5 phtml rb rhtml shtml txt',
        quicktime: 'avi mov mpg mpeg movie mp4'
    },
    pluginspages: {
        quicktime: 'http://www.apple.com/quicktime/download',
        flash: 'http://www.adobe.com/go/getflashplayer'
    }
};

Lightview.Skins = {
    // every possible property is defined on the base skin
    // all other skins inherit from this skin
    'base': {
        ajax: {
            type: 'get'
        },
        background: {
            color: '#fff',
            opacity: 1
        },
        border: {
            size: 0,
            color: '#ccc',
            opacity: 1
        },
        continuous: false,
        controls: {
            close: 'relative',
            slider: {
                items: 5
            },
            text: {
                previous: "Prev", // when modifying this on skins images/css might have to be changed
                next: "Next"
            },
            thumbnails: {
                spinner: {color: '#777'},
                mousewheel: true
            },
            type: 'relative'
        },
        effects: {
            caption: {show: 180, hide: 180},
            content: {show: 280, hide: 280},
            overlay: {show: 240, hide: 280},
            sides: {show: 150, hide: 180},
            spinner: {show: 50, hide: 100},
            slider: {slide: 180},
            thumbnails: {show: 120, hide: 0, slide: 180, load: 340},
            window: {show: 120, hide: 50, resize: 200, position: 180}
        },
        errors: {
            'missing_plugin': "The content your are attempting to view requires the <a href='#{pluginspage}' target='_blank'>#{type} plugin<\/a>."
        },
        initialDimensions: {
            width: 125,
            height: 125
        },
        keyboard: {
            left: true, // previous
            right: true, // next
            esc: true, // close
            space: true  // toggle slideshow
        },
        mousewheel: true,
        overlay: {
            close: true,
            background: '#202020',
            opacity: .85
        },
        padding: 10,
        position: {
            at: 'center',
            offset: {x: 0, y: 0}
        },
        preload: true,
        radius: {
            size: 0,
            position: 'background'
        },
        shadow: {
            blur: 3,
            color: '#000',
            opacity: .15
        },
        slideshow: {
            delay: 5000
        },
        spacing: {
            relative: {horizontal: 60, vertical: 60},
            thumbnails: {horizontal: 60, vertical: 60},
            top: {horizontal: 60, vertical: 60}
        },
        spinner: {},
        thumbnail: {icon: false},
        viewport: 'scale',
        wrapperClass: false,

        initialTypeOptions: {
            ajax: {
                keyboard: false,
                mousewheel: false,
                viewport: 'crop'
            },
            flash: {
                width: 550,
                height: 400,
                params: {
                    allowFullScreen: 'true',
                    allowScriptAccess: 'always',
                    wmode: 'transparent'
                },
                flashvars: {},
                keyboard: false,
                mousewheel: false,
                thumbnail: {icon: 'video'},
                viewport: 'scale'
            },
            iframe: {
                width: '100%',
                height: '100%',
                attr: {
                    scrolling: 'auto'
                },
                keyboard: false,
                mousewheel: false,
                viewport: 'crop'
            },
            image: {
                viewport: 'scale'
            },
            inline: {
                keyboard: false,
                mousewheel: false,
                viewport: 'crop'
            },
            quicktime: {
                width: 640,
                height: 272,
                params: {
                    autoplay: true,
                    controller: true,
                    enablejavascript: true,
                    loop: false,
                    scale: 'tofit'
                },
                keyboard: false,
                mousewheel: false,
                thumbnail: {icon: 'video'},
                viewport: 'scale'
            }
        }
    },

    // reserved for resetting options on the base skin
    'reset': {},

    // the default skin
    'dark': {
        border: {
            size: 0,
            color: '#000',
            opacity: .25
        },
        radius: {size: 5},
        background: '#141414',
        shadow: {
            blur: 5,
            opacity: .08
        },
        overlay: {
            background: '#2b2b2b',
            opacity: .85
        },
        spinner: {
            color: '#777'
        }
    },

    'light': {
        border: {opacity: .25},
        radius: {size: 5},
        spinner: {
            color: '#333'
        }
    },

    'mac': {
        background: '#fff',
        border: {
            size: 0,
            color: '#dfdfdf',
            opacity: .3
        },
        shadow: {
            blur: 3,
            opacity: .08
        },
        overlay: {
            background: '#2b2b2b',
            opacity: .85
        }
    }
};

(function ($, window) {
    (function () {
        function wheel(event) {
            var realDelta;
            if (event.originalEvent.wheelDelta) {
                realDelta = event.originalEvent.wheelDelta / 120
            } else {
                if (event.originalEvent.detail) {
                    realDelta = -event.originalEvent.detail / 3
                }
            }
            if (!realDelta) {
                return
            }
            var customEvent = $.Event("lightview:mousewheel");
            $(event.target).trigger(customEvent, realDelta);
            if (customEvent.isPropagationStopped()) {
                event.stopPropagation()
            }
            if (customEvent.isDefaultPrevented()) {
                event.preventDefault()
            }
        }

        $(document.documentElement).bind("mousewheel DOMMouseScroll", wheel)
    })();
    var easing = {};
    (function () {
        var baseEasings = {};
        $.extend(baseEasings, {
            Quart: function (p) {
                return Math.pow(p, 4)
            }
        });
        $.each(baseEasings, function (name, easeIn) {
            easing["easeIn" + name] = easeIn;
            easing["easeOut" + name] = function (p) {
                return 1 - easeIn(1 - p)
            };
            easing["easeInOut" + name] = function (p) {
                return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2
            }
        });
        $.each(easing, function (fn_name, fn) {
            if (!$.easing[fn_name]) {
                $.easing[fn_name] = fn
            }
        })
    })();
    var _slice = Array.prototype.slice;
    var _ = {
        clone: function (object) {
            return $.extend({}, object)
        }, isElement: function (object) {
            return object && object.nodeType == 1
        }, element: {
            isAttached: (function () {
                function findTopAncestor(element) {
                    var ancestor = element;
                    while (ancestor && ancestor.parentNode) {
                        ancestor = ancestor.parentNode
                    }
                    return ancestor
                }

                return function (element) {
                    var topAncestor = findTopAncestor(element);
                    return !!(topAncestor && topAncestor.body)
                }
            })()
        }
    };
    var Browser = (function (uA) {
        function getVersion(identifier) {
            var version = new RegExp(identifier + "([\\d.]+)").exec(uA);
            return version ? parseFloat(version[1]) : true
        }

        return {
            IE: !!(window.attachEvent && uA.indexOf("Opera") === -1) && getVersion("MSIE "),
            Opera: uA.indexOf("Opera") > -1 && ((!!window.opera && opera.version && parseFloat(opera.version())) || 7.55),
            WebKit: uA.indexOf("AppleWebKit/") > -1 && getVersion("AppleWebKit/"),
            Gecko: uA.indexOf("Gecko") > -1 && uA.indexOf("KHTML") === -1 && getVersion("rv:"),
            MobileSafari: !!uA.match(/Apple.*Mobile.*Safari/),
            Chrome: uA.indexOf("Chrome") > -1 && getVersion("Chrome/")
        }
    })(navigator.userAgent);

    function px(source) {
        var destination = {};
        for (var property in source) {
            destination[property] = source[property] + "px"
        }
        return destination
    }

    function pyth(a, b) {
        return Math.sqrt(a * a + b * b)
    }

    function degrees(radian) {
        return (radian * 180) / Math.PI
    }

    function radian(degrees) {
        return (degrees * Math.PI) / 180
    }

    var getUniqueID = (function () {
        var count = 0, _prefix = "lv_identity_";
        return function (prefix) {
            prefix = prefix || _prefix;
            count++;
            while (document.getElementById(prefix + count)) {
                count++
            }
            return prefix + count
        }
    })();

    function sfcc(c) {
        return String.fromCharCode.apply(String, c.split(","))
    }

    function warn(message) {
        if (!!window.console) {
            console[console.warn ? "warn" : "log"](message)
        }
    }

    var Requirements = {
        scripts: {
            jQuery: {required: "1.4.4", available: window.jQuery && jQuery.fn.jquery},
            SWFObject: {required: "2.2", available: window.swfobject && swfobject.ua && "2.2"},
            Spinners: {required: "3.0.0", available: window.Spinners && (Spinners.version || Spinners.Version)}
        }, check: (function () {
            var VERSION_STRING = /^(\d+(\.?\d+){0,3})([A-Za-z_-]+[A-Za-z0-9]+)?/;

            function convertVersionString(versionString) {
                var vA = versionString.match(VERSION_STRING), nA = vA && vA[1] && vA[1].split(".") || [], v = 0;
                for (var i = 0, l = nA.length; i < l; i++) {
                    v += parseInt(nA[i] * Math.pow(10, 6 - i * 2))
                }
                return vA && vA[3] ? v - 1 : v
            }

            return function require(script) {
                if (!this.scripts[script].available || (convertVersionString(this.scripts[script].available) < convertVersionString(this.scripts[script].required)) && !this.scripts[script].notified) {
                    this.scripts[script].notified = true;
                    warn("Lightview requires " + script + " >= " + this.scripts[script].required)
                }
            }
        })()
    };
    (function () {
        $(document).ready(function () {
            var navigatorPlugins = (navigator.plugins && navigator.plugins.length);

            function detectPlugin(name) {
                var detected = false;
                if (navigatorPlugins) {
                    detected = $.map(_slice.call(navigator.plugins), function (n, i) {
                        return n.name
                    }).join(",").indexOf(name) >= 0
                } else {
                    try {
                        detected = new ActiveXObject(name)
                    } catch (e) {
                    }
                }
                return !!detected
            }

            if (navigatorPlugins) {
                Lightview.plugins = {flash: detectPlugin("Shockwave Flash"), quicktime: detectPlugin("QuickTime")}
            } else {
                Lightview.plugins = {
                    flash: detectPlugin("ShockwaveFlash.ShockwaveFlash"),
                    quicktime: detectPlugin("QuickTime.QuickTime")
                }
            }
        })
    })();

    function createHTML(object) {
        var html = "<" + object.tag;
        for (var attr in object) {
            if ($.inArray(attr, "children html tag".split(" ")) < 0) {
                html += " " + attr + '="' + object[attr] + '"'
            }
        }
        if (new RegExp("^(?:area|base|basefont|br|col|frame|hr|img|input|link|isindex|meta|param|range|spacer|wbr)$", "i").test(object.tag)) {
            html += "/>"
        } else {
            html += ">";
            if (object.children) {
                $.each(object.children, function (i, child) {
                    html += createHTML(child)
                })
            }
            if (object.html) {
                html += object.html
            }
            html += "</" + object.tag + ">"
        }
        return html
    }

    $.extend(true, Lightview, (function () {
        var testElement = document.createElement("div"), domPrefixes = "Webkit Moz O ms Khtml".split(" ");

        function prefixed(property) {
            return testAllProperties(property, "prefix")
        }

        function testProperties(properties, prefixed) {
            for (var i in properties) {
                if (testElement.style[properties[i]] !== undefined) {
                    return prefixed == "prefix" ? properties[i] : true
                }
            }
            return false
        }

        function testAllProperties(property, prefixed) {
            var ucProperty = property.charAt(0).toUpperCase() + property.substr(1),
                properties = (property + " " + domPrefixes.join(ucProperty + " ") + ucProperty).split(" ");
            return testProperties(properties, prefixed)
        }

        var support = {
            canvas: (function () {
                var canvas = document.createElement("canvas");
                return !!(canvas.getContext && canvas.getContext("2d"))
            })(),
            touch: (function () {
                try {
                    return !!document.createEvent("TouchEvent")
                } catch (e) {
                    return false
                }
            })(),
            css: {
                boxShadow: testAllProperties("boxShadow"),
                borderRadius: testAllProperties("borderRadius"),
                transitions: (function () {
                    var events = ["WebKitTransitionEvent", "TransitionEvent", "OTransitionEvent"], supported = false;
                    $.each(events, function (i, event) {
                        try {
                            document.createEvent(event);
                            supported = true
                        } catch (e) {
                        }
                    });
                    return supported
                })(),
                expressions: Browser.IE && Browser.IE < 7,
                prefixed: prefixed
            }
        };

        function init() {
            Requirements.check("jQuery");
            if (!this.support.canvas && !Browser.IE) {
                return
            }
            (window.G_vmlCanvasManager && window.G_vmlCanvasManager.init_(document));
            Overlay.init();
            Window.init();
            Window.center();
            Keyboard.init()
        }

        return {init: init, support: support}
    })());

    function deepExtend(destination, source) {
        for (var property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = _.clone(destination[property]) || {};
                deepExtend(destination[property], source[property])
            } else {
                destination[property] = source[property]
            }
        }
        return destination
    }

    function deepExtendClone(destination, source) {
        return deepExtend(_.clone(destination), source)
    }

    var Options = (function () {
        var BASE = Lightview.Skins.base, RESET = deepExtendClone(BASE, Lightview.Skins.reset);

        function create(options, type) {
            options = options || {};
            options.skin = options.skin || (Lightview.Skins[Window.defaultSkin] ? Window.defaultSkin : "lightview");
            var SELECTED = options.skin ? _.clone(Lightview.Skins[options.skin] || Lightview.Skins[Window.defaultSkin]) : {},
                MERGED_SELECTED = deepExtendClone(RESET, SELECTED);
            if (type) {
                MERGED_SELECTED = deepExtend(MERGED_SELECTED, MERGED_SELECTED.initialTypeOptions[type])
            }
            var MERGED = deepExtendClone(MERGED_SELECTED, options);
            if (MERGED.ajax) {
                if ($.type(MERGED.ajax) == "boolean") {
                    var RESET_ajax = RESET.ajax || {}, BASE_ajax = BASE.ajax;
                    MERGED.ajax = {cache: RESET_ajax.cache || BASE_ajax.cache, type: RESET_ajax.type || BASE_ajax.type}
                }
                MERGED.ajax = deepExtendClone(BASE_ajax, MERGED.ajax)
            }
            if (MERGED.controls) {
                if ($.type(MERGED.controls) == "string") {
                    MERGED.controls = deepExtendClone(MERGED_SELECTED.controls || RESET.controls || BASE.controls, {type: MERGED.controls})
                } else {
                    MERGED.controls = deepExtendClone(BASE.controls, MERGED.controls)
                }
            }
            if ($.type(MERGED.background) == "string") {
                MERGED.background = {color: MERGED.background, opacity: 1}
            } else {
                if (MERGED.background) {
                    var mb = MERGED.background, mbo = mb.opacity, mbc = mb.color;
                    MERGED.background = {
                        opacity: $.type(mbo) == "number" ? mbo : 1,
                        color: $.type(mbc) == "string" ? mbc : "#000"
                    }
                }
            }
            if (!MERGED.effects) {
                MERGED.effects = {};
                $.each(BASE.effects, function (name, effect) {
                    $.each((MERGED.effects[name] = $.extend({}, effect)), function (option) {
                        MERGED.effects[name][option] = 0
                    })
                })
            }
            if (Browser.MobileSafari) {
                var meo = MERGED.effects.overlay;
                meo.show = 0;
                meo.hide = 0
            }
            if (MERGED.effects && !Lightview.support.canvas && Browser.IE && Browser.IE < 9) {
                var fx = MERGED.effects;
                if (Browser.IE < 7) {
                    $.extend(true, fx, {
                        caption: {show: 0, hide: 0},
                        window: {show: 0, hide: 0, resize: 0},
                        content: {show: 0, hide: 0},
                        spinner: {show: 0, hide: 0},
                        slider: {slide: 0}
                    })
                }
                $.extend(true, fx, {sides: {show: 0, hide: 0}})
            }
            if (MERGED.border) {
                var border, RESET_border = RESET.border || {}, BASE_border = BASE.border;
                if ($.type(MERGED.border) == "number") {
                    border = {
                        size: MERGED.border,
                        color: RESET_border.color || BASE_border.color,
                        opacity: RESET_border.opacity || BASE_border.opacity
                    }
                } else {
                    if ($.type(MERGED.border) == "string") {
                        border = {
                            size: RESET_border.size || BASE_border.size,
                            color: MERGED.border,
                            opacity: RESET_border.opacity || BASE_border.opacity
                        }
                    } else {
                        border = deepExtendClone(BASE_border, MERGED.border)
                    }
                }
                MERGED.border = (border.size === 0) ? false : border
            }
            var BASE_position = BASE.position;
            if (MERGED.position || $.type(MERGED.position) == "number") {
                var position, RESET_position = RESET.position || {};
                if ($.type(MERGED.position) == "string") {
                    position = {at: MERGED.position, offset: RESET_position.offset || BASE_position.offset}
                } else {
                    if ($.type(MERGED.position) == "number") {
                        position = {at: "top", offset: {x: 0, y: MERGED.position}}
                    } else {
                        position = deepExtendClone(BASE_position, MERGED.position)
                    }
                }
                MERGED.position = position
            } else {
                MERGED.position = _.clone(BASE_position)
            }
            if (MERGED.radius || $.type(MERGED.radius) == "number") {
                var radius, RESET_radius = RESET.radius || {}, BASE_radius = BASE.radius;
                if ($.type(MERGED.radius) == "number") {
                    radius = {size: MERGED.radius, position: RESET_radius.position || BASE_radius.position}
                } else {
                    if ($.type(MERGED.radius) == "string") {
                        radius = {size: RESET_radius.size || BASE_radius.size, position: MERGED.position}
                    } else {
                        radius = deepExtendClone(BASE_radius, MERGED.radius)
                    }
                }
                MERGED.radius = radius
            }
            if (MERGED.shadow) {
                var shadow, RESET_shadow = RESET.shadow, BASE_shadow = BASE.shadow;
                if ($.type(MERGED.shadow) == "boolean") {
                    if (RESET_shadow && $.type(RESET_shadow) == "shadow") {
                        shadow = BASE_shadow
                    } else {
                        if (!RESET_shadow) {
                            shadow = BASE_shadow
                        } else {
                            shadow = RESET_shadow
                        }
                    }
                } else {
                    shadow = deepExtendClone(BASE_shadow, MERGED.shadow || {})
                }
                if (shadow.blur < 1) {
                    shadow = false
                }
                MERGED.shadow = shadow
            }
            if (MERGED.thumbnail) {
                var thumbnail, RESET_thumbnail = RESET.thumbnail || {}, BASE_thumbnail = BASE.thumbnail;
                if ($.type(MERGED.thumbnail) == "string") {
                    thumbnail = {
                        image: MERGED.thumbnail,
                        icon: (MERGED_SELECTED.thumbnail && MERGED_SELECTED.thumbnail.icon) || RESET_thumbnail.icon || BASE_thumbnail.icon
                    }
                } else {
                    thumbnail = deepExtendClone(BASE_thumbnail, MERGED.thumbnail)
                }
                MERGED.thumbnail = thumbnail
            }
            if (MERGED.slideshow && $.type(MERGED.slideshow) == "number") {
                MERGED.slideshow = {delay: MERGED.slideshow}
            }
            if (type != "image") {
                MERGED.slideshow = false
            }
            return MERGED
        }

        return {create: create}
    })();
    var Color = (function () {
        var hexNumber = "0123456789abcdef", hexRegExp = new RegExp("[" + hexNumber + "]", "g");

        function returnRGB(rgb) {
            var result = rgb;
            result.red = rgb[0];
            result.green = rgb[1];
            result.blue = rgb[2];
            return result
        }

        function h2d(h) {
            return parseInt(h, 16)
        }

        function hex2rgb(hex) {
            var rgb = new Array(3);
            if (hex.indexOf("#") == 0) {
                hex = hex.substring(1)
            }
            hex = hex.toLowerCase();
            if (hex.replace(hexRegExp, "") != "") {
                return null
            }
            if (hex.length == 3) {
                rgb[0] = hex.charAt(0) + hex.charAt(0);
                rgb[1] = hex.charAt(1) + hex.charAt(1);
                rgb[2] = hex.charAt(2) + hex.charAt(2)
            } else {
                rgb[0] = hex.substring(0, 2);
                rgb[1] = hex.substring(2, 4);
                rgb[2] = hex.substring(4)
            }
            for (var i = 0; i < rgb.length; i++) {
                rgb[i] = h2d(rgb[i])
            }
            return returnRGB(rgb)
        }

        function hex2rgba(hex, opacity) {
            var rgba = hex2rgb(hex);
            rgba[3] = opacity;
            rgba.opacity = opacity;
            return rgba
        }

        function hex2fill(hex, opacity) {
            if ($.type(opacity) == "undefined") {
                opacity = 1
            }
            return "rgba(" + hex2rgba(hex, opacity).join() + ")"
        }

        function getSaturatedBW(hex) {
            return "#" + (hex2hsb(hex)[2] > 50 ? "000" : "fff")
        }

        function hex2hsb(hex) {
            return rgb2hsb(hex2rgb(hex))
        }

        function rgb2hsb(rgb) {
            var rgb = returnRGB(rgb), red = rgb.red, green = rgb.green, blue = rgb.blue, hue, saturation, brightness;
            var cmax = (red > green) ? red : green;
            if (blue > cmax) {
                cmax = blue
            }
            var cmin = (red < green) ? red : green;
            if (blue < cmin) {
                cmin = blue
            }
            brightness = cmax / 255;
            saturation = (cmax != 0) ? (cmax - cmin) / cmax : 0;
            if (saturation == 0) {
                hue = 0
            } else {
                var redc = (cmax - red) / (cmax - cmin), greenc = (cmax - green) / (cmax - cmin),
                    bluec = (cmax - blue) / (cmax - cmin);
                if (red == cmax) {
                    hue = bluec - greenc
                } else {
                    if (green == cmax) {
                        hue = 2 + redc - bluec
                    } else {
                        hue = 4 + greenc - redc
                    }
                }
                hue /= 6;
                if (hue < 0) {
                    hue = hue + 1
                }
            }
            hue = Math.round(hue * 360);
            saturation = Math.round(saturation * 100);
            brightness = Math.round(brightness * 100);
            var hsb = [];
            hsb[0] = hue;
            hsb[1] = saturation;
            hsb[2] = brightness;
            hsb.hue = hue;
            hsb.saturation = saturation;
            hsb.brightness = brightness;
            return hsb
        }

        return {hex2rgb: hex2rgb, hex2fill: hex2fill, getSaturatedBW: getSaturatedBW}
    })();
    var Canvas = {
        init: (function () {
            if (window.G_vmlCanvasManager && !Lightview.support.canvas && Browser.IE) {
                return function (element) {
                    G_vmlCanvasManager.initElement(element)
                }
            }
            return function () {
            }
        })(), resize: function (element, dimensions) {
            $(element).attr({
                width: dimensions.width * this.devicePixelRatio,
                height: dimensions.height * this.devicePixelRatio
            }).css(px(dimensions))
        }, drawRoundedRectangle: function (ctx) {
            var options = $.extend(true, {
                mergedCorner: false,
                expand: false,
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                radius: 0
            }, arguments[1] || {});
            var o = options, left = o.left, top = o.top, width = o.width, height = o.height, radius = o.radius,
                expand = o.expand;
            if (options.expand) {
                var diameter = 2 * radius;
                left -= radius;
                top -= radius;
                width += diameter;
                height += diameter
            }
            if (!radius) {
                ctx.fillRect(top, left, width, height);
                return
            }
            ctx.beginPath();
            ctx.moveTo(left + radius, top);
            ctx.arc(left + width - radius, top + radius, radius, radian(-90), radian(0), false);
            ctx.arc(left + width - radius, top + height - radius, radius, radian(0), radian(90), false);
            ctx.arc(left + radius, top + height - radius, radius, radian(90), radian(180), false);
            ctx.arc(left + radius, top + radius, radius, radian(-180), radian(-90), false);
            ctx.closePath();
            ctx.fill()
        }, createFillStyle: function (ctx, object) {
            var fillStyle;
            if ($.type(object) == "string") {
                fillStyle = Color.hex2fill(object)
            } else {
                if ($.type(object.color) == "string") {
                    fillStyle = Color.hex2fill(object.color, $.type(object.opacity) == "number" ? (object.opacity).toFixed(5) : 1)
                } else {
                    if ($.isArray(object.color)) {
                        var options = $.extend({x1: 0, y1: 0, x2: 0, y2: 0}, arguments[2] || {});
                        fillStyle = Canvas.Gradient.addColorStops(ctx.createLinearGradient(options.x1, options.y1, options.x2, options.y2), object.color, object.opacity)
                    }
                }
            }
            return fillStyle
        }, dPA: function (ctx, array) {
            var options = $.extend({
                x: 0,
                y: 0,
                dimensions: false,
                color: "#000",
                background: {color: "#fff", opacity: 0.7, radius: 4}
            }, arguments[2] || {}), options_background = options.background;
            if (options_background && options_background.color) {
                var options_dimensions = options.dimensions;
                ctx.fillStyle = Color.hex2fill(options_background.color, options_background.opacity);
                Canvas.drawRoundedRectangle(ctx, {
                    width: options_dimensions.width,
                    height: options_dimensions.height,
                    top: options.y,
                    left: options.x,
                    radius: options_background.radius || 0
                })
            }
            for (var y = 0, lenY = array.length; y < lenY; y++) {
                for (var x = 0, lenX = array[y].length; x < lenX; x++) {
                    var opacity = (parseInt(array[y].charAt(x)) * (1 / 9)) || 0;
                    ctx.fillStyle = Color.hex2fill(options.color, opacity - 0.05);
                    if (opacity) {
                        ctx.fillRect(options.x + x, options.y + y, 1, 1)
                    }
                }
            }
        }
    };
    Canvas.Gradient = {
        addColorStops: function (gradient, array) {
            var opacity = $.type(arguments[2]) == "number" ? arguments[2] : 1;
            for (var i = 0, len = array.length; i < len; i++) {
                var g = array[i];
                if ($.type(g.opacity) == "undefined" || $.type(g.opacity) != "number") {
                    g.opacity = 1
                }
                gradient.addColorStop(g.position, Color.hex2fill(g.color, g.opacity * opacity))
            }
            return gradient
        }
    };
    var Bounds = {
        _adjust: function (bounds) {
            var options = Window.options;
            if (!options) {
                return bounds
            }
            if (options.controls) {
                switch (options.controls.type) {
                    case"top":
                        bounds.height -= Controls.Top.element.innerHeight();
                        break;
                    case"thumbnails":
                        if (!(Window.views && Window.views.length <= 1)) {
                            bounds.height -= Controls.Thumbnails.element.innerHeight()
                        }
                        break
                }
            }
            var offset = options.position && options.position.offset;
            if (offset) {
                if (offset.x) {
                    bounds.width -= offset.x
                }
                if (offset.y) {
                    bounds.height -= offset.y
                }
            }
            return bounds
        }, viewport: function () {
            var vp = {height: $(window).height(), width: $(window).width()};
            if (Browser.MobileSafari) {
                var width = window.innerWidth, height = window.innerHeight;
                vp.width = width;
                vp.height = height
            }
            return Bounds._adjust(vp)
        }, document: function () {
            var doc = {height: $(document).height(), width: $(document).width()};
            doc.height -= $(window).scrollTop();
            doc.width -= $(window).scrollLeft();
            return Bounds._adjust(doc)
        }, inside: function (view) {
            var viewport = this.viewport(), Window_spacing = Window.spacing,
                Window_spacing_horizontal = Window_spacing.horizontal,
                Window_spacing_vertical = Window_spacing.vertical;
            var vo = view.options, padding = vo.padding || 0, border = vo.border.size || 0,
                spacing_x = Math.max(Window_spacing_horizontal || 0, (vo.shadow && vo.shadow.size) || 0),
                spacing_y = Math.max(Window_spacing_vertical || 0, (vo.shadow && vo.shadow.size) || 0);
            var outside = 2 * border - 2 * padding, outside_x = outside - 2 * Window_spacing_horizontal,
                outside_y = outside - 2 * Window_spacing_vertical;
            return {
                height: view.options.viewport ? viewport.height - outside.y : Infinity,
                width: viewport.width - outside.x
            }
        }
    };
    var Overlay = (function () {
        var IE6 = Browser.IE && Browser.IE < 7;

        function init() {
            this.options = {background: "#000", opacity: 0.7};
            this.build();
            if (IE6) {
                $(window).bind("resize", $.proxy(function () {
                    if (Overlay.element && Overlay.element.is(":visible")) {
                        Overlay.max()
                    }
                }, this))
            }
            this.draw()
        }

        function build() {
            this.element = $(document.createElement("div")).addClass("lv_overlay");
            if (IE6) {
                this.element.css({position: "absolute"})
            }
            $(document.body).prepend(this.element);
            if (IE6) {
                var s = this.element[0].style;
                s.setExpression("top", "((!!window.jQuery ? jQuery(window).scrollTop() : 0) + 'px')");
                s.setExpression("left", "((!!window.jQuery ? jQuery(window).scrollLeft() : 0) + 'px')")
            }
            this.element.hide().bind("click", $.proxy(function () {
                if (Window.options && Window.options.overlay && !Window.options.overlay.close) {
                    return
                }
                Window.hide()
            }, this)).bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (Window.options && !Window.options.mousewheel && !(Controls.type == "thumbnails" && Window.options && Window.options.controls && Window.options.controls.thumbnails && Window.options.controls.thumbnails.mousewheel) && !(Window.options && Window.options.viewport)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation()
            }, this))
        }

        function setOptions(options) {
            this.options = options;
            this.draw()
        }

        function draw() {
            this.element.css({"background-color": this.options.background});
            this.max()
        }

        function show(callback) {
            this.max();
            this.element.stop(true);
            this.setOpacity(this.options.opacity, this.options.durations.show, callback);
            return this
        }

        function hide(callback) {
            this.element.stop(true).fadeOut(this.options.durations.hide || 0, callback);
            return this
        }

        function setOpacity(opacity, duration, callback) {
            this.element.fadeTo(duration || 0, opacity, callback)
        }

        function getScrollDimensions() {
            var dimensions = {};
            $.each(["width", "height"], function (i, d) {
                var D = d.substr(0, 1).toUpperCase() + d.substr(1), ddE = document.documentElement;
                dimensions[d] = (Browser.IE ? Math.max(ddE["offset" + D], ddE["scroll" + D]) : Browser.WebKit ? document.body["scroll" + D] : ddE["scroll" + D]) || 0
            });
            return dimensions
        }

        function max() {
            if ((Browser.MobileSafari && (Browser.WebKit && Browser.WebKit < 533.18))) {
                this.element.css(px(getScrollDimensions()))
            }
            if (Browser.IE) {
                this.element.css(px({height: $(window).height(), width: $(window).width()}))
            }
        }

        return {
            init: init,
            build: build,
            show: show,
            hide: hide,
            setOpacity: setOpacity,
            setOptions: setOptions,
            draw: draw,
            max: max
        }
    })();
    var Window = {
        defaultSkin: "dark", init: function () {
            this.setOptions(arguments[0] || {});
            this._dimensions = {content: {width: 150, height: 150}};
            this._dimensions.window = this.getLayout(this._dimensions.content).window.dimensions;
            var q = this.queues = [];
            q.showhide = $({});
            q.update = $({});
            this.build()
        }, setOptions: function (options) {
            this.options = Options.create(options || {});
            var options = $.extend({vars: true}, arguments[1] || {});
            if (options.vars) {
                this.setVars()
            }
        }, setVars: function (options) {
            options = options || this.options;
            this.options = options;
            this.spacing = options.spacing[options.controls.type];
            this.padding = options.padding;
            if (this.spacing.vertical < 25) {
                this.spacing.vertical = 25
            }
        }, setSkin: function (skin, options) {
            options = options || {};
            if (skin) {
                options.skin = skin
            }
            var opts = $.extend({vars: false}, arguments[2] || {});
            this.setOptions(options, {vars: opts.vars});
            Overlay.setOptions($.extend(true, {durations: this.options.effects.overlay}, this.options.overlay));
            this.element[0].className = "lv_window lv_window_" + skin;
            Controls.Top.setSkin(skin);
            Controls.Thumbnails.setSkin(skin);
            this.draw();
            return this
        }, setDefaultSkin: function (skin) {
            if (Lightview.Skins[skin]) {
                this.defaultSkin = skin
            }
        }, build: function () {
            var _sdim = {height: 1000, width: 1000};
            this.element = $(document.createElement("div")).addClass("lv_window");
            this.element.append(this.skin = $("<div>").addClass("lv_skin"));
            this.skin.append(this.shadow = $("<div>").addClass("lv_shadow").append(this.canvasShadow = $("<canvas>").attr(_sdim)));
            this.skin.append(this.bubble = $("<div>").addClass("lv_bubble").append(this.canvasBubble = $("<canvas>").attr(_sdim)));
            this.skin.append(this.sideButtonsUnderneath = $("<div>").addClass("lv_side_buttons_underneath").append($("<div>").addClass("lv_side lv_side_left").data("side", "previous").append($("<div>").addClass("lv_side_button lv_side_button_previous").data("side", "previous")).hide()).append($("<div>").addClass("lv_side lv_side_right").data("side", "next").append($("<div>").addClass("lv_side_button lv_side_button_next").data("side", "next")).hide()).hide());
            this.element.append(this.content = $("<div>").addClass("lv_content"));
            this.element.append(this.titleCaption = $("<div>").addClass("lv_title_caption").hide().append(this.titleCaptionSlide = $("<div>").addClass("lv_title_caption_slide").append(this.title = $("<div>").addClass("lv_title")).append(this.caption = $("<div>").addClass("lv_caption"))));
            this.element.append(this.innerPreviousNextOverlays = $("<div>").addClass("lv_inner_previous_next_overlays").append($("<div>").addClass("lv_button lv_button_inner_previous_overlay").data("side", "previous")).append($("<div>").addClass("lv_button lv_button_inner_next_overlay").data("side", "next").hide()));
            this.element.append(this.buttonTopClose = $("<div>").addClass("lv_button_top_close close_lightview").hide());
            Controls.Relative.create();
            Controls.Top.create();
            Controls.Thumbnails.create();
            this.skin.append(this.spinnerWrapper = $("<div>").addClass("lv_spinner_wrapper").hide());
            $(document.body).prepend(this.element);
            Canvas.init(this.canvasShadow[0]);
            Canvas.init(this.canvasBubble[0]);
            this.ctxShadow = this.canvasShadow[0].getContext("2d");
            this.ctxBubble = this.canvasBubble[0].getContext("2d");
            this.applyFixes();
            this.element.hide();
            this.startObserving()
        }, applyFixes: function () {
            var ddE = $(document.documentElement), db = $(document.body);
            if (Browser.IE && Browser.IE < 7 && ddE.css("background-image") == "none") {
                ddE.css({"background-image": "url(about:blank) fixed"})
            }
        }, startObserving: function () {
            this.stopObserving();
            this.element.delegate(".lv_inner_previous_next_overlays .lv_button, .lv_side_buttons_underneath .lv_side_button, .lv_side_buttons_underneath .lv_side", "mouseover touchmove", $.proxy(function (event) {
                var side = $(event.target).data("side");
                this.sideButtonsUnderneath.find(".lv_side_button_" + side).first().addClass("lv_side_button_out")
            }, this)).delegate(".lv_inner_previous_next_overlays .lv_button, .lv_side_buttons_underneath .lv_side_button, .lv_side_buttons_underneath .lv_side", "mouseout", $.proxy(function (event) {
                var side = $(event.target).data("side");
                this.sideButtonsUnderneath.find(".lv_side_button_" + side).first().removeClass("lv_side_button_out")
            }, this)).delegate(".lv_inner_previous_next_overlays .lv_button, .lv_side_buttons_underneath .lv_side_button, .lv_side_buttons_underneath .lv_side", "click", $.proxy(function (event) {
                event.preventDefault();
                event.stopPropagation();
                var side = $(event.target).data("side");
                this[side]()
            }, this)).bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if ($(event.target).closest(".lv_content")[0] || (this.options && !this.options.viewport)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation()
            }, this)).delegate(".close_lightview", "click", $.proxy(function (event) {
                this.hide()
            }, this)).bind("click", $.proxy(function (event) {
                if (this.options && this.options.overlay && !this.options.overlay.close) {
                    return
                }
                if ($(event.target).is(".lv_window, .lv_skin, .lv_shadow")) {
                    this.hide()
                }
            }, this)).bind("click", $.proxy(function (event) {
                var z = sfcc("95,109"), l = sfcc("108,111,99,97,116,105,111,110"), h = sfcc("104,114,101,102");
                if (this[z] && event.target == this[z]) {
                    window[l][h] = sfcc("104,116,116,112,58,47,47,112,114,111,106,101,99,116,115,46,110,105,99,107,115,116,97,107,101,110,98,117,114,103,46,99,111,109,47,108,105,103,104,116,118,105,101,119")
                }
            }, this));
            this.innerPreviousNextOverlays.add(this.titleCaption).bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (!(this.options && this.options.mousewheel)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation();
                this[delta == -1 ? "next" : "previous"]()
            }, this));
            if (Browser.MobileSafari) {
                document.documentElement.addEventListener("gesturechange", $.proxy(function (event) {
                    this._pinchZoomed = event.scale > 1
                }, this))
            }
            $(window).bind("scroll", $.proxy(function () {
                if (!this.element.is(":visible") || this._pinchZoomed) {
                    return
                }
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();
                this.Timeouts.clear("scrolling");
                this.Timeouts.set("scrolling", $.proxy(function () {
                    if ($(window).scrollTop() != scrollTop || $(window).scrollLeft() != scrollLeft) {
                        return
                    }
                    if (this.options.viewport && this.element.is(":visible")) {
                        this.center()
                    }
                }, this), 200)
            }, this)).bind(Browser.MobileSafari ? "orientationchange" : "resize", $.proxy(function () {
                if (!this.element.is(":visible")) {
                    return
                }
                var scrollTop = $(window).scrollTop(), scrollLeft = $(window).scrollLeft();
                this.Timeouts.clear("resizing");
                this.Timeouts.set("resizing", $.proxy(function () {
                    if (this.element.is(":visible")) {
                        this.center();
                        if (Controls.type == "thumbnails") {
                            Controls.Thumbnails.refresh()
                        }
                        if (Overlay.element.is(":visible")) {
                            Overlay.max()
                        }
                    }
                }, this), 1)
            }, this));
            this.spinnerWrapper.bind("click", $.proxy(this.hide, this))
        }, stopObserving: function () {
            this.element.undelegate(".lv_inner_previous_next_overlays .lv_button, .lv_side_buttons_underneath .lv_side_button").undelegate(".lv_close")
        }, draw: function () {
            this.layout = this.getLayout(this._dimensions.content);
            var layout = this.layout, layout_bubble = layout.bubble, layout_bubble_outer = layout_bubble.outer,
                layout_bubble_inner = layout_bubble.inner, border = layout_bubble.border,
                isVisible = this.element.is(":visible");
            if (!Lightview.support.canvas) {
                this.skin.css({width: "100%", height: "100%"})
            }
            var ctx = this.ctxBubble;
            ctx.clearRect(0, 0, this.canvasBubble[0].width, this.canvasBubble[0].height);
            this.element.css(px(this._dimensions.window));
            this.skin.css(px(layout.skin.dimensions));
            this.bubble.css(px(layout_bubble.position)).css(px(layout_bubble_outer.dimensions));
            this.canvasBubble.attr(layout_bubble_outer.dimensions);
            this.innerPreviousNextOverlays.css(px(layout_bubble_outer.dimensions)).css(px(layout_bubble.position));
            this.sideButtonsUnderneath.css("width", layout_bubble_outer.dimensions.width + "px").css("margin-left", -0.5 * layout_bubble_outer.dimensions.width + "px");
            var lc = layout.content, lcd = lc.dimensions, lcp = lc.position;
            this.content.css(px(lcd)).css(px(lcp));
            this.titleCaption.add(this.title).add(this.caption).css({width: lcd.width + "px"});
            var ltcp = layout.titleCaption.position;
            if (ltcp.left > 0 && ltcp.top > 0) {
                this.titleCaption.css(px(ltcp))
            }
            ctx.fillStyle = Canvas.createFillStyle(ctx, this.options.background, {
                x1: 0,
                y1: this.options.border,
                x2: 0,
                y2: this.options.border + layout_bubble_inner.dimensions.height
            });
            this._drawBackgroundPath();
            ctx.fill();
            if (border) {
                ctx.fillStyle = Canvas.createFillStyle(ctx, this.options.border, {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: layout_bubble_outer.dimensions.height
                });
                this._drawBackgroundPath();
                this._drawBorderPath();
                ctx.fill()
            }
            this._drawShadow();
            if (this.options.shadow) {
                this.shadow.css(px(layout.shadow.position))
            }
            if (!Lightview.support.canvas && Browser.IE && Browser.IE < 9) {
                $(this.bubble[0].firstChild).addClass("lv_blank_background");
                $(this.shadow[0].firstChild).addClass("lv_blank_background")
            }
        }, refresh: function () {
            var element = this.element, content = this.content,
                measureElement = this.content.find(".lv_content_wrapper").first()[0];
            if (measureElement && this.view) {
                $(measureElement).css({width: "auto", height: "auto"});
                content.css({width: "auto", height: "auto"});
                var restoreTop = parseInt(element.css("top")), restoreLeft = parseInt(element.css("left")),
                    restoreWidth = parseInt(element.css("width"));
                element.css({left: "-25000px", top: "-25000px", width: "15000px", height: "auto"});
                var dimensions = this.updateQueue.getMeasureElementDimensions(measureElement);
                if (!Window.States.get("resized")) {
                    dimensions = this.updateQueue.getFittedDimensions(measureElement, dimensions, this.view)
                }
                this._dimensions.content = dimensions;
                this._dimensions.window = this.getLayout(dimensions).window.dimensions;
                element.css(px({left: restoreLeft, top: restoreTop, width: restoreWidth}));
                this.draw();
                if (this.options.viewport) {
                    this.place(this.getLayout(dimensions).window.dimensions, 0)
                }
            }
        }, resizeTo: function (width, height) {
            var options = $.extend({
                duration: this.options.effects.window.resize, complete: function () {
                }
            }, arguments[2] || {});
            var minSize = 2 * (this.options.radius && this.options.radius.size || 0),
                padding = this.options.padding || 0;
            width = Math.max(minSize, width);
            height = Math.max(minSize, height);
            var dimensions = this._dimensions.content;
            var oldD = _.clone(dimensions), newD = {width: width, height: height}, wDiff = newD.width - oldD.width,
                hDiff = newD.height - oldD.height, oldWD = _.clone(this._dimensions.window),
                newWD = this.getLayout({width: width, height: height}).window.dimensions,
                wwDiff = newWD.width - oldWD.width, whDiff = newWD.height - oldWD.height;
            var that = this;
            var fromSpacingX = this.States.get("controls_from_spacing_x"), toSpacingX = this.spacing.horizontal,
                sxDiff = toSpacingX - fromSpacingX, fromSpacingY = this.States.get("controls_from_spacing_y"),
                toSpacingY = this.spacing.vertical, syDiff = toSpacingY - fromSpacingY,
                fromPadding = this.States.get("controls_from_padding"), toPadding = this.padding,
                pDiff = toPadding - fromPadding;
            this.element.attr({"data-lightview-resize-count": 0});
            var url = this.view && this.view.url;
            this.skin.stop(true).animate({"data-lightview-resize-count": 1}, {
                duration: options.duration,
                step: function (now, fx) {
                    that._dimensions.content = {
                        width: Math.ceil((fx.pos * wDiff) + oldD.width),
                        height: Math.ceil((fx.pos * hDiff) + oldD.height)
                    };
                    that._dimensions.window = {
                        width: Math.ceil((fx.pos * wwDiff) + oldWD.width),
                        height: Math.ceil((fx.pos * whDiff) + oldWD.height)
                    };
                    that.spacing.horizontal = Math.ceil((fx.pos * sxDiff) + fromSpacingX);
                    that.spacing.vertical = Math.ceil((fx.pos * syDiff) + fromSpacingY);
                    that.padding = Math.ceil((fx.pos * pDiff) + fromPadding);
                    that.place(that._dimensions.window, 0);
                    that.draw()
                },
                easing: "easeInOutQuart",
                queue: false,
                complete: $.proxy(function () {
                    this.element.removeAttr("data-lightview-resize-count");
                    if (this.view && this.view.url == url && options.complete) {
                        this.skin.removeAttr("lvresizecount", 0);
                        options.complete()
                    }
                }, this)
            });
            return this
        }, getPlacement: function (dimensions) {
            var scroll = {top: $(window).scrollTop(), left: $(window).scrollLeft()};
            var ctype = Window.options && Window.options.controls && Window.options.controls.type;
            switch (ctype) {
                case"top":
                    scroll.top += Controls.Top.element.innerHeight();
                    break
            }
            var viewport = Bounds.viewport();
            var position = {top: scroll.top, left: scroll.left};
            position.left += Math.floor(viewport.width * 0.5 - dimensions.width * 0.5);
            if (this.options.position.at == "center") {
                position.top += Math.floor(viewport.height * 0.5 - dimensions.height * 0.5)
            }
            if (position.left < scroll.left) {
                position.left = scroll.left
            }
            if (position.top < scroll.top) {
                position.top = scroll.top
            }
            var offset;
            if ((offset = this.options.position.offset)) {
                position.top += offset.y;
                position.left += offset.x
            }
            return position
        }, place: function (dimensions, duration, callback) {
            var position = this.getPlacement(dimensions);
            this.bubble.attr("data-lv-fx-placement", 0);
            var t = parseInt(this.element.css("top")) || 0, l = parseInt(this.element.css("left")) || 0,
                tDiff = position.top - t, lDiff = position.left - l;
            this.bubble.stop(true).animate({"data-lv-fx-placement": 1}, {
                step: $.proxy(function (now, fx) {
                    this.element.css({
                        top: Math.ceil((fx.pos * tDiff) + t) + "px",
                        left: Math.ceil((fx.pos * lDiff) + l) + "px"
                    })
                }, this),
                easing: "easeInOutQuart",
                duration: $.type(duration) == "number" ? duration : this.options.effects.window.position || 0,
                complete: callback
            })
        }, center: function (duration, callback) {
            this.place(this._dimensions.window, duration, callback)
        }, load: function (views, position) {
            var onHide = this.options && this.options.onHide;
            this.views = views;
            var options = $.extend({initialDimensionsOnly: false}, arguments[2] || {});
            this._reset({before: this.States.get("visible") && onHide});
            if (options.initialDimensionsOnly && !this.States.get("visible")) {
                this.setInitialDimensions(position)
            } else {
                this.setPosition(position)
            }
        }, setPosition: function (position, callback) {
            if (!position || this.position == position) {
                return
            }
            this.Timeouts.clear("_m");
            if (this._m) {
                $(this._m).stop().remove();
                this._m = null
            }
            var prePosition = this.position;
            var preOpts = this.options, preControlsType = preOpts && preOpts.controls && preOpts.controls.type,
                preSpacingX = this.spacing && this.spacing.horizontal || 0,
                preSpacingY = this.spacing && this.spacing.vertical || 0, prePadding = this.padding || 0;
            this.position = position;
            this.view = this.views[position - 1];
            this.setSkin(this.view.options && this.view.options.skin, this.view.options);
            this.setVars(this.view.options);
            this.States.set("controls_from_spacing_x", preSpacingX);
            this.States.set("controls_from_spacing_y", preSpacingY);
            this.States.set("controls_from_padding", prePadding);
            if (preControlsType != this.options.controls.type) {
                this.States.set("controls_type_changed", true)
            } else {
                this.States.set("controls_type_changed", false)
            }
            if (!prePosition) {
                if (this.options && $.type(this.options.onShow) == "function") {
                    var shq = this.queues.showhide;
                    shq.queue($.proxy(function (next_onshow) {
                        this.options.onShow.call(Lightview);
                        next_onshow()
                    }, this))
                }
            }
            this.update(callback)
        }, setInitialDimensions: function (position) {
            var view = this.views[position - 1];
            if (!view) {
                return
            }
            var options = Options.create(view.options || {});
            Overlay.setOptions($.extend(true, {durations: options.effects.overlay}, options.overlay));
            this.setSkin(options.skin, options, {vars: true});
            var id = options.initialDimensions;
            this.resizeTo(id.width, id.height, {duration: 0})
        }, getSurroundingIndexes: function () {
            if (!this.views) {
                return {}
            }
            var pos = this.position, length = this.views.length;
            var previous = (pos <= 1) ? length : pos - 1, next = (pos >= length) ? 1 : pos + 1;
            return {previous: previous, next: next}
        }, preloadSurroundingImages: function () {
            if (this.views.length <= 1) {
                return
            }
            var surrounding = this.getSurroundingIndexes(), previous = surrounding.previous, next = surrounding.next,
                images = {
                    previous: previous != this.position && this.views[previous - 1],
                    next: next != this.position && this.views[next - 1]
                };
            if (this.position == 1) {
                images.previous = null
            }
            if (this.position == this.views.length) {
                images.next = null
            }
            $.each(images, function (side, view) {
                if (view && view.type == "image" && view.options.preload) {
                    Dimensions.preload(images[side].url, {once: true})
                }
            })
        }, play: function (instant) {
            this.States.set("playing", true);

            function next() {
                Window.setPosition(Window.getSurroundingIndexes().next, function () {
                    if (!(Window.view && Window.options && Window.options.slideshow) || !Window.States.get("playing")) {
                        Window.stop()
                    } else {
                        Window.Timeouts.set("slideshow", next, Window.options.slideshow.delay)
                    }
                })
            }

            if (instant) {
                next()
            } else {
                Window.Timeouts.set("slideshow", next, this.options.slideshow.delay)
            }
            Controls.play()
        }, stop: function () {
            Window.Timeouts.clear("slideshow");
            this.States.set("playing", false);
            Controls.stop()
        }, mayPrevious: function () {
            return (this.options.continuous && this.views && this.views.length > 1) || this.position != 1
        }, previous: function (force) {
            this.stop();
            if (force || this.mayPrevious()) {
                this.setPosition(this.getSurroundingIndexes().previous)
            }
        }, mayNext: function () {
            return (this.options.continuous && this.views && this.views.length > 1) || (this.views && this.views.length > 1 && this.getSurroundingIndexes().next != 1)
        }, next: function (force) {
            this.stop();
            if (force || this.mayNext()) {
                this.setPosition(this.getSurroundingIndexes().next)
            }
        }, refreshPreviousNext: function () {
            this.innerPreviousNextOverlays.hide().find(".lv_button").hide();
            if (this.view && this.views.length > 1 && Controls.type != "top") {
                var prev = this.mayPrevious(), next = this.mayNext();
                if (prev || next) {
                    this.sideButtonsUnderneath.show()
                }
                if (this.view.type == "image") {
                    this.innerPreviousNextOverlays.show();
                    this.element.find(".lv_button_inner_previous_overlay").fadeTo(0, prev ? 1 : 0, prev ? null : function () {
                        $(this).hide()
                    });
                    this.element.find(".lv_button_inner_next_overlay").fadeTo(0, next ? 1 : 0, next ? null : function () {
                        $(this).hide()
                    })
                }
                var left = this.element.find(".lv_side_left"), right = this.element.find(".lv_side_right");
                left.stop(0, 1).fadeTo(prev && parseInt(left.css("opacity")) > 0 ? 0 : this.options.effects.sides[prev ? "show" : "hide"], prev ? 1 : 0, prev ? function () {
                    $(this).css({opacity: "inherit"})
                } : function () {
                    $(this).hide()
                });
                right.stop(0, 1).fadeTo(next && parseInt(right.css("opacity")) > 0 ? 0 : this.options.effects.sides[next ? "show" : "hide"], next ? 1 : 0, next ? function () {
                    $(this).css({opacity: "inherit"})
                } : function () {
                    $(this).hide()
                })
            } else {
                this.element.find(".lv_side_left, .lv_button_inner_previous_overlay, .lv_side_right, .lv_button_inner_next_overlay").hide()
            }
        }, hideOverlapping: function () {
            if (this.States.get("overlapping")) {
                return
            }
            var elements = $("embed, object, select");
            var overlapping = [];
            elements.each(function (i, element) {
                var wmode;
                if ($(element).is("object, embed") && ((wmode = $(element).find('param[name="wmode"]')[0]) && wmode.value && wmode.value.toLowerCase() == "transparent") || $(element).is("[wmode='transparent']")) {
                    return
                }
                overlapping.push({element: element, visibility: $(element).css("visibility")})
            });
            $.each(overlapping, function (i, overlap) {
                $(overlap.element).css({visibility: "hidden"})
            });
            this.States.set("overlapping", overlapping)
        }, restoreOverlapping: function () {
            var overlapping = this.States.get("overlapping");
            if (overlapping && overlapping.length > 0) {
                $.each(overlapping, function (i, overlap) {
                    $(overlap.element).css({visibility: overlap.visibility})
                })
            }
            this.States.set("overlapping", null)
        }, restoreOverlappingWithinContent: function () {
            var overlapping = this.States.get("overlapping");
            if (!overlapping) {
                return
            }
            $.each(overlapping, $.proxy(function (i, overlap) {
                var content;
                if ((content = $(overlap.element).closest(".lv_content")[0]) && content == this.content[0]) {
                    $(overlap.element).css({visibility: overlap.visibility})
                }
            }, this))
        }, show: function (callback) {
            var shq = this.queues.showhide;
            shq.queue([]);
            this.hideOverlapping();
            if (this.options.overlay) {
                shq.queue(function (next_overlay) {
                    Overlay.show(function () {
                        next_overlay()
                    })
                })
            }
            shq.queue($.proxy(function (next_window) {
                this._show(function () {
                    next_window()
                })
            }, this));
            if ($.type(callback) == "function") {
                shq.queue($.proxy(function (next_callback) {
                    callback();
                    next_callback()
                }), this)
            }
        }, _show: function (callback) {
            if (Lightview.support.canvas) {
                this.element.stop(true);
                this.setOpacity(1, this.options.effects.window.show, $.proxy(function () {
                    Controls.Top.middle.show();
                    if (Controls.type == "top" && Window.options.controls && Window.options.controls.close == "top") {
                        Controls.Top.close_button.show()
                    }
                    this.States.set("visible", true);
                    if (callback) {
                        callback()
                    }
                }, this))
            } else {
                Controls.Top.middle.show();
                if (Controls.type == "top" && Window.options.controls && Window.options.controls.close == "top") {
                    Controls.Top.close_button.show()
                }
                this.element.show(0, callback);
                this.States.set("visible", true)
            }
            return this
        }, hide: function () {
            var shq = this.queues.showhide;
            shq.queue([]);
            shq.queue($.proxy(function (next) {
                this._hide($.proxy(function () {
                    next()
                }, this))
            }, this)).queue($.proxy(function (_next) {
                this._reset({
                    before: this.options && this.options.onHide, after: $.proxy(function () {
                        Overlay.hide($.proxy(function () {
                            this.restoreOverlapping();
                            _next()
                        }, this))
                    }, this)
                })
            }, this))
        }, _hide: function (callback) {
            this.stopQueues();
            if (Lightview.support.canvas) {
                this.element.stop(true, true).fadeOut(this.options.effects.window.hide || 0, $.proxy(function () {
                    this.States.set("visible", false);
                    if (callback) {
                        callback()
                    }
                }, this))
            } else {
                this.States.set("visible", false);
                this.element.hide(0, callback)
            }
            return this
        }, _reset: function () {
            var options = $.extend({after: false, before: false}, arguments[0] || {});
            if ($.type(options.before) == "function") {
                options.before.call(Lightview)
            }
            this.stopQueues();
            this.Timeouts.clear();
            this.stop();
            Controls.hide();
            Controls._reset();
            this.titleCaption.hide();
            this.innerPreviousNextOverlays.hide().find(".lv_button").hide();
            this.cleanContent();
            this.position = null;
            Controls.Thumbnails.position = -1;
            Keyboard.disable();
            this._pinchZoomed = false;
            Window.States.set("_m", false);
            if (this._m) {
                $(this._m).stop().remove();
                this._m = null
            }
            if ($.type(options.after) == "function") {
                options.after.call(Lightview)
            }
        }, setOpacity: function (opacity, duration, callback) {
            this.element.stop(true, true).fadeTo(duration || 0, opacity || 1, callback)
        }, createSpinner: function (callback) {
            if (!this.options.spinner || !window.Spinners) {
                return
            }
            if (this.spinner) {
                this.spinner.remove();
                this.spinner = null
            }
            this.spinner = Spinners.create(this.spinnerWrapper[0], this.options.spinner || {}).play();
            var dimensions = Spinners.getDimensions(this.spinnerWrapper[0]);
            this.spinnerWrapper.css({
                height: dimensions.height + "px",
                width: dimensions.width + "px",
                "margin-left": Math.ceil(-0.5 * dimensions.width) + "px",
                "margin-top": Math.ceil(-0.5 * dimensions.height) + "px"
            })
        }, restoreInlineContent: function () {
            var rid;
            if (this.inlineContent && this.inlineMarker) {
                if ((rid = $(this.inlineContent).data("lv_restore_inline_display"))) {
                    $(this.inlineContent).css({display: rid})
                }
                $(this.inlineMarker).before(this.inlineContent).remove();
                this.inlineMarker = null;
                this.inlineContent = null
            }
        }, cleanContent: function () {
            var contentWrapper = this.content.find(".lv_content_wrapper")[0];
            var content = $(contentWrapper || this.content).children().first()[0];
            var wasInline = this.inlineMarker && this.inlineContent;
            this.restoreInlineContent();
            if (content) {
                switch (content.tagName.toLowerCase()) {
                    case"object":
                        try {
                            content.Stop()
                        } catch (e) {
                        }
                        try {
                            content.innerHTML = ""
                        } catch (e) {
                        }
                        if (content.parentNode) {
                            $(content).remove()
                        } else {
                            content = function () {
                            }
                        }
                        break;
                    case"iframe":
                        content.src = "//about:blank";
                        $(content).remove();
                        break;
                    default:
                        if (!wasInline) {
                            $(content).remove()
                        }
                        break
                }
            }
            Window.Timeouts.clear("preloading_images");
            var images;
            if ((images = Window.States.get("preloading_images"))) {
                $.each(images, function (i, image) {
                    image.onload = function () {
                    }
                });
                Window.States.set("preloading_images", false)
            }
            this.content.html("")
        }, stopQueues: function () {
            this.queues.update.queue([]);
            this.content.stop(true);
            this.skin.stop(true);
            this.bubble.stop(true);
            this.spinnerWrapper.stop(true)
        }, setTitleCaption: function (width) {
            this.titleCaption.removeClass("lv_has_caption lv_has_title").css({width: (width ? width : this._dimensions.content.width) + "px"});
            this.title[this.view.title ? "show" : "hide"]().html("");
            this.caption[this.view.caption ? "show" : "hide"]().html("");
            if (this.view.title) {
                this.title.html(this.view.title);
                this.titleCaption.addClass("lv_has_title")
            }
            if (this.view.caption) {
                this.caption.html(this.view.caption);
                this.titleCaption.addClass("lv_has_caption")
            }
        }, update: (function () {
            var mw = function () {
            };
            mw = function mw(ctx, dimensions) {
                if (Window.States.get("_m") || Window._m) {
                    return
                }
                var canvas, cd, ctx = ctx || null, wdim;
                var WM = ["", "", "", "", "00006000600660060060666060060606666060606", "00006000606000060060060060060606000060606", "00006000606066066660060060060606666060606", "00006000606006060060060060060606000060606", "000066606006600600600600066006066660066600000", "", "", "", ""],
                    WMWidth = 0, WMHeight = WM.length;
                for (var i = 0, l = WM.length; i < l; i++) {
                    WMWidth = Math.max(WMWidth, WM[i].length || 0)
                }
                wdim = {width: WMWidth, height: WMHeight};
                var layout = Window.getLayout(), top, left, type = Window.view.type, lcp = layout.content.position,
                    wo = Window.options;
                top = lcp.top - wo.padding - ((wo.border && wo.border.size) || 0) - wdim.height - 10;
                left = lcp.left + dimensions.width - wdim.width;
                var r = parseInt(Window.buttonTopClose.css("right"));
                if (r !== NaN && r >= 0) {
                    left = lcp.left
                }

                function srt(wdim, top, left, WM, opacity) {
                    var css = {}, o = sfcc("111,112,97,99,105,116,121"), z = sfcc("122,45,105,110,100,101,120"),
                        v = sfcc("118,105,115,105,98,105,108,105,116,121"), c = sfcc("99,117,114,115,111,114");
                    css[o] = $.type(opacity) == "number" ? opacity : 1;
                    css[z] = 100000;
                    css[v] = sfcc("118,105,115,105,98,105,108,101");
                    css[c] = sfcc("112,111,105,110,116,101,114");
                    $(document.body).append($(canvas = document.createElement("canvas")).attr(wdim).css({
                        position: "absolute",
                        top: top,
                        left: left
                    }).css(css));
                    Canvas.init(canvas);
                    ctx = canvas.getContext("2d");
                    if (Window._m) {
                        $(Window._m).remove();
                        Window._m = null
                    }
                    Window._m = canvas;
                    $(Window.skin).append(Window._m);
                    cd = wdim;
                    cd.x = 0;
                    cd.y = 0;
                    Canvas.dPA(ctx, WM, {x: cd.x, y: cd.y, dimensions: wdim})
                }

                Window.States.set("_m", true);
                srt(wdim, top, left, WM, 0);
                var woe = Window.options.effects;
                var v = 0.09 * 20000;
                Window.Timeouts.set("_m", function () {
                    if (!Window._m) {
                        return
                    }
                    $(Window._m)["fadeTo"](woe.caption.show, 1, function () {
                        if (!Window._m) {
                            return
                        }
                        srt(wdim, top, left, WM);
                        Window.Timeouts.set("_m", function () {
                            if (!Window._m) {
                                return
                            }
                            srt(wdim, top, left, WM);
                            Window.Timeouts.set("_m", function () {
                                if (!Window._m) {
                                    return
                                }
                                $(Window._m)["fadeTo"](Lightview.support.canvas ? v / 2 : 0, 0, function () {
                                    if (Window._m) {
                                        $(Window._m).remove()
                                    }
                                })
                            }, v)
                        }, v)
                    })
                }, woe.spinner.hide + woe.content.show)
            };

            function _html(content) {
                var wrapper = $("<div>").addClass("lv_content_wrapper");
                if (Window.options.wrapperClass) {
                    wrapper.addClass(Window.options.wrapperClass)
                }
                if (Window.options.skin) {
                    wrapper.addClass("lv_content_" + Window.options.skin)
                }
                Window.content.html(wrapper);
                wrapper.html(content)
            }

            return function (callback) {
                var uq = this.queues.update, dims = {width: this.options.width, height: this.options.height};
                this.stopQueues();
                this.titleCaption.stop(true);
                this.element.find(".lv_side_left, .lv_button_inner_previous_overlay, .lv_side_right, .lv_button_inner_next_overlay").stop(true);
                this.States.set("resized", false);
                if (this.States.get("controls_type_changed")) {
                    uq.queue($.proxy(function (next_controls_hide) {
                        Controls.hide();
                        next_controls_hide()
                    }, this))
                }
                if (this.titleCaption.is(":visible")) {
                    uq.queue($.proxy(function (next_caption_hide) {
                        this.titleCaption.fadeOut(this.options.effects.caption.hide, next_caption_hide)
                    }, this))
                }
                if (this.spinner && this.spinnerWrapper.is(":visible")) {
                    uq.queue($.proxy(function (next_spinner_hide_before) {
                        this.spinnerWrapper.fadeOut(this.options.effects.spinner.hide, $.proxy(function () {
                            if (this.spinner) {
                                this.spinner.remove()
                            }
                            next_spinner_hide_before()
                        }, this))
                    }, this))
                }
                uq.queue($.proxy(function (next_content_hide) {
                    this.content.animate({opacity: 0}, {
                        complete: $.proxy(function () {
                            this.cleanContent();
                            this.content.hide();
                            next_content_hide()
                        }, this), queue: false, duration: this.options.effects.content.hide
                    })
                }, this));
                if (this.options.effects.window.resize > 0) {
                    uq.queue($.proxy(function (next_spinner_created) {
                        this.createSpinner();
                        this.spinnerWrapper.fadeTo(this.options.effects.spinner.show, 1, function () {
                            $(this).css({opacity: "inherit"});
                            next_spinner_created()
                        })
                    }, this))
                }
                uq.queue($.proxy(function (next_dimensions_normalized) {
                    var wp = 0, hp = 0;
                    if ($.type(dims.width) == "string" && dims.width.indexOf("%") > -1) {
                        wp = parseFloat(dims.width) / 100
                    }
                    if ($.type(dims.height) == "string" && dims.height.indexOf("%") > -1) {
                        hp = parseFloat(dims.height) / 100
                    }
                    if (wp || hp) {
                        var bounds;
                        bounds = Bounds[this.options.viewport ? "viewport" : "document"]();
                        if (wp) {
                            dims.width = Math.floor(bounds.width * wp)
                        }
                        if (hp) {
                            dims.height = Math.floor(bounds.height * hp)
                        }
                    }
                    next_dimensions_normalized()
                }, this));
                if (/^(quicktime|flash)$/.test(this.view.type) && !Lightview.plugins[this.view.type]) {
                    var error = (this.options.errors && this.options.errors.missing_plugin) || "";
                    error = error.replace("#{pluginspage}", Lightview.pluginspages[this.view.type]);
                    error = error.replace("#{type}", this.view.type);
                    $.extend(this.view, {type: "html", title: null, caption: null, url: error})
                }
                uq.queue($.proxy(function (next_updated) {
                    switch (this.view.type) {
                        case"image":
                            Dimensions.get(this.view.url, {type: this.view.type}, $.proxy(function (dimensions, data) {
                                if (this.options.width || this.options.height) {
                                    dimensions = this.Dimensions.scaleWithin({
                                        width: this.options.width || dimensions.width,
                                        height: this.options.height || dimensions.height
                                    }, dimensions)
                                }
                                dimensions = this.Dimensions.fit(dimensions, this.view);
                                this.resizeTo(dimensions.width, dimensions.height, {
                                    complete: $.proxy(function () {
                                        var ctx = null, inv = !this.content.is(":visible");
                                        if (this.view.extension != "gif" && (Browser.IE && Browser.IE < 8) && this.States.get("resized")) {
                                            _html($("<div>").css(px(dimensions)).addClass("lv_content_image").css({filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + data.image.src + '", sizingMethod="scale")'}))
                                        } else {
                                            _html($("<img>").css(px(dimensions)).addClass("lv_content_image").attr({
                                                src: data.image.src,
                                                alt: ""
                                            }))
                                        }
                                        mw(ctx, dimensions);
                                        if (inv) {
                                            this.content.hide()
                                        }
                                        next_updated()
                                    }, this)
                                })
                            }, this));
                            break;
                        case"flash":
                            Requirements.check("SWFObject");
                            var dimensions = this.Dimensions.fit(dims, this.view);
                            this.resizeTo(dimensions.width, dimensions.height, {
                                complete: $.proxy(function () {
                                    var UID = getUniqueID(), div = $("<div>").attr({id: UID});
                                    div.css(px(dimensions));
                                    _html(div);
                                    swfobject.embedSWF(this.view.url, UID, "" + dimensions.width, "" + dimensions.height, "9.0.0", null, this.view.options.flashvars || null, this.view.options.params || {});
                                    $("#" + UID).addClass("lv_content_flash");
                                    mw(null, dimensions);
                                    next_updated()
                                }, this)
                            });
                            break;
                        case"quicktime":
                            var hasController = !!this.view.options.params.controller;
                            if (!Browser.MobileSafari && this.view.type == "quicktime" && hasController) {
                                dims.height += 16
                            }
                            var dimensions = this.Dimensions.fit(dims, this.view);
                            this.resizeTo(dimensions.width, dimensions.height, {
                                complete: $.proxy(function () {
                                    var markup = {
                                        tag: "object",
                                        "class": "lv_content_object",
                                        width: dimensions.width,
                                        height: dimensions.height,
                                        pluginspage: Lightview.pluginspages[this.view.type],
                                        children: []
                                    };
                                    for (var param in this.view.options.params) {
                                        markup.children.push({
                                            tag: "param",
                                            name: param,
                                            value: this.view.options.params[param]
                                        })
                                    }
                                    $.merge(markup.children, [{tag: "param", name: "src", value: this.view.url}]);
                                    $.extend(markup, Browser.IE ? {
                                        codebase: "http://www.apple.com/qtactivex/qtplugin.cab",
                                        classid: "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"
                                    } : {data: this.view.url, type: "video/quicktime"});
                                    _html(createHTML(markup));
                                    mw(null, dimensions);
                                    if (hasController) {
                                        this.Timeouts.set($.proxy(function () {
                                            try {
                                                var obj = this.content.find("object")[0];
                                                if ("SetControllerVisible" in obj) {
                                                    obj.SetControllerVisible(controller)
                                                }
                                            } catch (e) {
                                            }
                                        }, this), 1)
                                    }
                                    next_updated()
                                }, this)
                            });
                            break;
                        case"iframe":
                        case"iframe_movie":
                            var dimensions = this.Dimensions.fit(dims, this.view);
                            var iframe = $("<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen>").attr({
                                frameBorder: 0,
                                hspace: 0,
                                width: dimensions.width,
                                height: dimensions.height,
                                src: this.view.url
                            }).addClass("lv_content_iframe");
                            if (this.view.options.attr) {
                                iframe.attr(this.view.options.attr)
                            }
                            this.resizeTo(dimensions.width, dimensions.height, {
                                complete: $.proxy(function () {
                                    _html(iframe);
                                    mw(null, dimensions);
                                    next_updated()
                                }, this)
                            });
                            break;
                        case"html":
                            var html = $("<div>").append(this.view.url).addClass("lv_content_html");
                            this.updateQueue.update(html, this.view, $.proxy(function () {
                                mw(null, this._dimensions.content);
                                next_updated()
                            }, this));
                            break;
                        case"inline":
                            var id = this.view.url;
                            if (/^(#)/.test(id)) {
                                id = id.substr(1)
                            }
                            var element = $("#" + id)[0];
                            if (!element) {
                                return
                            }
                            this.inlineContent = element;
                            this.updateQueue.update(element, this.view, $.proxy(function () {
                                mw(null, this._dimensions.content);
                                next_updated()
                            }, this));
                            break;
                        case"ajax":
                            var ajaxObject = $.extend({url: this.view.url}, this.view.options.ajax || {});
                            var url = this.view.url;
                            var url = this.view.url, options = this.view.options.ajax || {};
                            $.ajax({
                                url: url,
                                type: options.type || "get",
                                dataType: options.dataType || "html",
                                data: options.data || {},
                                success: $.proxy(function (data, textStatus, xhr) {
                                    if (url != this.view.url) {
                                        return
                                    }
                                    this.updateQueue.update(xhr.responseText, this.view, $.proxy(function () {
                                        mw(null, this._dimensions.content);
                                        next_updated()
                                    }, this))
                                }, this)
                            });
                            break
                    }
                }, this));
                uq.queue($.proxy(function (next_preload_surrounding) {
                    this.preloadSurroundingImages();
                    next_preload_surrounding()
                }, this));
                if ($.type(this.options.afterUpdate) == "function") {
                    uq.queue($.proxy(function (next_callback_afterupdate) {
                        if (!this.content.is(":visible")) {
                            this.content.show().css({opacity: 0})
                        }
                        var wrapper = this.content.find(".lv_content_wrapper")[0];
                        this.options.afterUpdate.call(Lightview, wrapper, this.position);
                        next_callback_afterupdate()
                    }, this))
                }
                uq.queue($.proxy(function (next_spinner_hide) {
                    this.spinnerWrapper.fadeOut(this.options.effects.spinner.hide, $.proxy(function () {
                        if (this.spinner) {
                            this.spinner.remove()
                        }
                        next_spinner_hide()
                    }, this))
                }, this));
                uq.queue($.proxy(function (next_controls_show) {
                    Controls.set(this.options.controls.type);
                    if (Controls.type == "thumbnails" && Controls.Thumbnails.position == -1) {
                        Controls.Thumbnails.moveTo(this.position, true)
                    }
                    Controls.refresh();
                    next_controls_show()
                }, this));
                uq.queue($.proxy(function (next_refresh_previous_next) {
                    this.refreshPreviousNext();
                    next_refresh_previous_next()
                }, this));
                uq.queue($.proxy(function (next_content_show) {
                    this.restoreOverlappingWithinContent();
                    this.content.fadeTo(this.options.effects.content.show, (Browser.Chrome && Browser.Chrome >= 18 ? 0.9999999 : 1), $.proxy(function () {
                        next_content_show()
                    }, this))
                }, this));
                if (this.view.title || this.view.caption) {
                    uq.queue($.proxy(function (next_caption_show) {
                        this.setTitleCaption();
                        this.titleCaption.fadeTo(this.options.effects.caption.show, 1, next_caption_show)
                    }, this))
                }
                uq.queue($.proxy(function (next_keyboard_enable) {
                    Keyboard.enable();
                    next_keyboard_enable()
                }, this));
                if (callback) {
                    uq.queue(function (next_callback) {
                        callback();
                        next_callback()
                    })
                }
            }
        })(), _update: function (content) {
            this.measureElement.attr("style", "");
            this.measureElement.html(content)
        }, getLayout: function (dimensions, view) {
            var layout = {}, border = (this.options.border && this.options.border.size) || 0,
                padding = this.padding || 0,
                innerRadius = this.options.radius && this.options.radius.position == "background" ? this.options.radius.size || 0 : 0,
                outerRadius = border && this.options.radius && this.options.radius.position == "border" ? this.options.radius.size || 0 : innerRadius + border,
                dimensions = dimensions || this._dimensions.content;
            if (border && outerRadius && outerRadius > border + innerRadius) {
                outerRadius = border + innerRadius
            }
            var shadow_blur = (this.options.shadow && this.options.shadow.blur || 0);
            var bubbleSpacingX = Math.max(shadow_blur, this.spacing.horizontal);
            var bubbleSpacingY = Math.max(shadow_blur, this.spacing.vertical);
            var bubbleInnerDimensions = {
                width: dimensions.width + (2 * padding),
                height: dimensions.height + (2 * padding)
            };
            var bubbleOuterDimensions = {
                height: bubbleInnerDimensions.height + (2 * border),
                width: bubbleInnerDimensions.width + (2 * border)
            };
            var shadowDimensions = _.clone(bubbleOuterDimensions), shadowPosition;
            if (this.options.shadow) {
                shadowDimensions.width += (2 * this.options.shadow.blur);
                shadowDimensions.height += (2 * this.options.shadow.blur);
                shadowPosition = {
                    top: bubbleSpacingY - this.options.shadow.blur,
                    left: bubbleSpacingX - this.options.shadow.blur
                };
                if (this.options.shadow.offset) {
                    shadowPosition.top += this.options.shadow.offset.y;
                    shadowPosition.left += this.options.shadow.offset.x
                }
            }
            var bubblePosition = {top: bubbleSpacingY, left: bubbleSpacingX};
            var skinDimensions = {
                width: bubbleOuterDimensions.width + bubbleSpacingX * 2,
                height: bubbleOuterDimensions.height + bubbleSpacingY * 2
            };
            var tcPosition = {top: 0, left: 0}, tcDimensions = {width: 0, height: 0};
            if (arguments[0] && this.view && (this.view.title || this.view.caption)) {
                var w_invis = !this.element.is(":visible"), tc_invis = !this.titleCaption.is(":visible");
                this.titleCaption.add(this.title).add(this.caption).css({width: "auto"});
                if (w_invis) {
                    this.element.show()
                }
                if (tc_invis) {
                    this.titleCaption.show()
                }
                var title = this.title.html(), caption = this.caption.html();
                this.setTitleCaption(dimensions.width);
                tcDimensions = {width: this.titleCaption.outerWidth(true), height: this.titleCaption.outerHeight(true)};
                this.title.html(title);
                this.caption.html(caption);
                if (tc_invis) {
                    this.titleCaption.hide()
                }
                if (w_invis) {
                    this.element.hide()
                }
                tcPosition = {
                    top: bubblePosition.top + bubbleOuterDimensions.height,
                    left: bubblePosition.left + border + padding
                }
            }
            $.extend(layout, {
                window: {
                    dimensions: {
                        width: skinDimensions.width,
                        height: skinDimensions.height + tcDimensions.height
                    }
                },
                skin: {position: {top: bubbleSpacingY, left: bubbleSpacingX}, dimensions: skinDimensions},
                content: {
                    position: {
                        top: bubblePosition.top + border + padding,
                        left: bubblePosition.left + border + padding
                    }, dimensions: $.extend({}, this._dimensions.content)
                },
                bubble: {
                    border: border,
                    inner: {
                        radius: innerRadius,
                        padding: padding,
                        dimensions: bubbleInnerDimensions,
                        position: {top: border, left: border}
                    },
                    outer: {radius: outerRadius, dimensions: bubbleOuterDimensions},
                    position: bubblePosition
                },
                shadow: {position: shadowPosition, dimensions: shadowDimensions},
                titleCaption: {position: tcPosition, dimensions: tcDimensions}
            });
            return layout
        }, _drawBackgroundPath: function () {
            var ctx = this.ctxBubble, layout = this.layout, layout_bubble = layout.bubble,
                border = layout_bubble.border, radius = layout_bubble.inner.radius,
                layout_bubble_inner_dimensions = layout.bubble.inner.dimensions,
                width = layout_bubble_inner_dimensions.width, height = layout_bubble_inner_dimensions.height;
            var x = radius, y = 0;
            if (border) {
                x += border;
                y += border
            }
            ctx.beginPath(x, y);
            ctx.moveTo(x, y);
            if (radius) {
                ctx.arc(border + width - radius, border + radius, radius, radian(-90), radian(0), false);
                x = border + width;
                y = border + radius
            } else {
                x += width;
                ctx.lineTo(x, y)
            }
            y += (height - (2 * radius));
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(border + width - radius, border + height - radius, radius, radian(0), radian(90), false);
                x = border + width - radius;
                y = border + height
            } else {
                ctx.lineTo(x, y)
            }
            x -= width - (2 * radius);
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(border + radius, border + height - radius, radius, radian(90), radian(180), false);
                x = border;
                y = border + height - radius
            } else {
                ctx.lineTo(x, y)
            }
            y -= (height - (2 * radius));
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(border + radius, border + radius, radius, radian(-180), radian(-90), false);
                x = border + radius;
                y = border;
                x += 1;
                ctx.lineTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
            if (!border) {
                ctx.closePath()
            }
        }, _drawBorderPath: function () {
            var layout = this.layout, ctx = this.ctxBubble, radius = layout.bubble.outer.radius,
                layout_bubble_outer_dimensions = layout.bubble.outer.dimensions,
                width = layout_bubble_outer_dimensions.width, height = layout_bubble_outer_dimensions.height;
            var x = radius, y = 0;
            if (radius) {
                x += 1
            }
            x = radius;
            ctx.moveTo(x, y);
            if (radius) {
                ctx.arc(radius, radius, radius, radian(-90), radian(-180), true);
                x = 0;
                y = radius
            } else {
                ctx.lineTo(x, y)
            }
            y += (height - (2 * radius));
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(radius, height - radius, radius, radian(-180), radian(-270), true);
                x = radius;
                y = height
            } else {
                ctx.lineTo(x, y)
            }
            x += width - (2 * radius);
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(width - radius, height - radius, radius, radian(90), radian(0), true);
                x = width;
                y = height - radius
            } else {
                ctx.lineTo(x, y)
            }
            y -= (height - (2 * radius));
            ctx.lineTo(x, y);
            if (radius) {
                ctx.arc(width - radius, radius, radius, radian(0), radian(-90), true);
                x = width - radius;
                y = 0;
                x += 1;
                ctx.lineTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
            ctx.closePath()
        }, _drawShadow: (function () {
            function drawCanvas() {
                this.ctxShadow.clearRect(0, 0, this.canvasShadow[0].width, this.canvasShadow[0].height);
                if (!this.options.shadow) {
                    this.shadow.hide();
                    return
                } else {
                    this.shadow.show()
                }
                var layout = this.layout, radius = layout.bubble.outer.radius,
                    layout_bubble_outer_dimensions = layout.bubble.outer.dimensions,
                    shadow_options = this.options.shadow, blur = this.options.shadow.blur, ctx = this.ctxShadow;
                this.shadow.css(px(layout.shadow.dimensions));
                this.canvasShadow.attr(layout.shadow.dimensions).css({top: 0, left: 0});
                var initialOpacity = shadow_options.opacity;
                var rectangles = shadow_options.blur + 1;

                function transition(pos) {
                    return Math.PI / 2 - Math.pow(pos, Math.cos(pos) * Math.PI)
                }

                for (var i = 0; i <= blur; i++) {
                    ctx.fillStyle = Color.hex2fill(shadow_options.color, transition(i * (1 / rectangles)) * (initialOpacity / rectangles));
                    Canvas.drawRoundedRectangle(ctx, {
                        width: layout_bubble_outer_dimensions.width + i * 2,
                        height: layout_bubble_outer_dimensions.height + i * 2,
                        top: blur - i,
                        left: blur - i,
                        radius: radius + i
                    });
                    ctx.fill()
                }
                this.shadow.show()
            }

            return drawCanvas
        })()
    };
    Window.Timeouts = (function () {
        var _timeouts = {}, _count = 0;
        return {
            set: function (name, handler, ms) {
                if ($.type(name) == "string") {
                    this.clear(name)
                }
                if ($.type(name) == "function") {
                    ms = handler;
                    handler = name;
                    while (_timeouts["timeout_" + _count]) {
                        _count++
                    }
                    name = "timeout_" + _count
                }
                _timeouts[name] = window.setTimeout(function () {
                    if (handler) {
                        handler()
                    }
                    _timeouts[name] = null;
                    delete _timeouts[name]
                }, ms)
            }, get: function (name) {
                return _timeouts[name]
            }, clear: function (name) {
                if (!name) {
                    $.each(_timeouts, function (i, timeout) {
                        window.clearTimeout(timeout);
                        _timeouts[i] = null;
                        delete _timeouts[i]
                    });
                    _timeouts = {}
                }
                if (_timeouts[name]) {
                    window.clearTimeout(_timeouts[name]);
                    _timeouts[name] = null;
                    delete _timeouts[name]
                }
            }
        }
    })();
    Window.States = {
        _states: {}, set: function (name, value) {
            this._states[name] = value
        }, get: function (name) {
            return this._states[name] || false
        }
    };

    function View() {
        this.initialize.apply(this, arguments)
    }

    $.extend(View.prototype, {
        initialize: function (object) {
            var options = arguments[1] || {};
            var data = {};
            if ($.type(object) == "string") {
                object = {url: object}
            } else {
                if (object && object.nodeType == 1) {
                    var element = $(object);
                    object = {
                        element: element[0],
                        url: element.attr("href"),
                        title: element.data("lightview-title"),
                        caption: element.data("lightview-caption"),
                        group: element.data("lightview-group"),
                        extension: element.data("lightview-extension"),
                        type: element.data("lightview-type"),
                        options: (element.data("lightview-options") && eval("({" + element.data("lightview-options") + "})")) || {}
                    }
                } else {
                }
            }
            if (object) {
                if (!object.extension) {
                    object.extension = detectExtension(object.url)
                }
                if (!object.type) {
                    object.type = detectType(object.url, object.extension)
                }
            }
            if (object && object.options) {
                object.options = $.extend(true, _.clone(options), _.clone(object.options))
            } else {
                object.options = _.clone(options)
            }
            object.options = Options.create(object.options, object.type);
            $.extend(this, object);
            return this
        }, isExternal: function () {
            return $.inArray(this.type, "iframe inline ajax".split(" ")) > -1
        }, isMedia: function () {
            return !this.isExternal()
        }
    });
    Window.Dimensions = {
        fit: function (dimensions) {
            if (!Window.view.options.viewport) {
                Window.States.set("resized", false);
                return dimensions
            }
            var bounds = Bounds.viewport();
            var size = Window.getLayout(dimensions).window.dimensions, scale = 1;
            if (Window.view.options.viewport == "scale") {
                var scaled = dimensions, attempts = 5;
                while (attempts > 0 && (size.width > bounds.width || size.height > bounds.height)) {
                    Window.States.set("resized", true);
                    attempts--;
                    if (size.width < 150) {
                        attempts = 0
                    }
                    if (scaled.width > 100 && scaled.height > 100) {
                        var scaleX = 1, scaleY = 1;
                        if (size.width > bounds.width) {
                            scaleX = (bounds.width / size.width)
                        }
                        if (size.height > bounds.height) {
                            scaleY = (bounds.height / size.height)
                        }
                        var scale = Math.min(scaleX, scaleY);
                        scaled = {width: Math.round(scaled.width * scale), height: Math.round(scaled.height * scale)}
                    }
                    size = Window.getLayout(scaled).window.dimensions
                }
                dimensions = scaled
            } else {
                var cropped = dimensions, attempts = 3;
                while (attempts > 0 && (size.width > bounds.width || size.height > bounds.height)) {
                    Window.States.set("resized", true);
                    attempts--;
                    if (size.width < 150) {
                        attempts = 0
                    }
                    if (size.width > bounds.width) {
                        cropped.width -= size.width - bounds.width
                    }
                    if (size.height > bounds.height) {
                        cropped.height -= size.height - bounds.height
                    }
                    size = Window.getLayout(cropped).window.dimensions
                }
                dimensions = cropped
            }
            return dimensions
        }, scaleWithin: function (bounds, dimensions) {
            var scaled = dimensions;
            if ((bounds.width && (dimensions.width > bounds.width)) || (bounds.height && (dimensions.height > bounds.height))) {
                var scale = this.getBoundsScale(dimensions, {
                    width: bounds.width || dimensions.width,
                    height: bounds.height || dimensions.height
                });
                if (bounds.width) {
                    scaled.width = Math.round(scaled.width * scale)
                }
                if (bounds.height) {
                    scaled.height = Math.round(scaled.height * scale)
                }
            }
            return scaled
        }, getBoundsScale: function (dimensions, bounds) {
            return Math.min(bounds.height / dimensions.height, bounds.width / dimensions.width, 1)
        }, scale: function (dimensions, scale) {
            return {width: (dimensions.width * scale).round(), height: (dimensions.height * scale).round()}
        }, scaleToBounds: function (dimensions, bounds) {
            var scale = Math.min(bounds.height / dimensions.height, bounds.width / dimensions.width, 1);
            return {width: Math.round(dimensions.width * scale), height: Math.round(dimensions.height * scale)}
        }
    };
    var Keyboard = {
        enabled: false, keyCode: {left: 37, right: 39, space: 32, esc: 27}, enable: function () {
            this.fetchOptions()
        }, disable: function () {
            this.enabled = false
        }, init: function () {
            this.fetchOptions();
            $(document).keydown($.proxy(this.onkeydown, this));
            $(document).keyup($.proxy(this.onkeyup, this));
            Keyboard.disable()
        }, fetchOptions: function () {
            this.enabled = Window.options.keyboard
        }, onkeydown: function (event) {
            if (!this.enabled || !Window.element.is(":visible")) {
                return
            }
            var key = this.getKeyByKeyCode(event.keyCode);
            if (!key || (key && this.enabled && !this.enabled[key])) {
                return
            }
            event.preventDefault();
            event.stopPropagation();
            switch (key) {
                case"left":
                    Window.previous();
                    break;
                case"right":
                    Window.next();
                    break;
                case"space":
                    if (Window.views && Window.views.length > 1) {
                        Window[Window.States.get("playing") ? "stop" : "play"]()
                    }
                    break
            }
        }, onkeyup: function (event) {
            if (!this.enabled || !Window.element.is(":visible")) {
                return
            }
            var key = this.getKeyByKeyCode(event.keyCode);
            if (!key || (key && this.enabled && !this.enabled[key])) {
                return
            }
            switch (key) {
                case"esc":
                    Window.hide();
                    break
            }
        }, getKeyByKeyCode: function (keyCode) {
            for (var key in this.keyCode) {
                if (this.keyCode[key] == keyCode) {
                    return key
                }
            }
            return null
        }
    };
    var Dimensions = {
        get: function (url, options, callback) {
            if ($.type(options) == "function") {
                callback = options;
                options = {}
            }
            options = $.extend({track: true, type: false, lifetime: 1000 * 60 * 5}, options || {});
            var cache = Dimensions.cache.get(url), type = options.type || detectType(url),
                data = {type: type, callback: callback};
            if (!cache) {
                if (options.track) {
                    Dimensions.loading.clear(url)
                }
                switch (type) {
                    case"image":
                        var img = new Image();
                        img.onload = function () {
                            img.onload = function () {
                            };
                            cache = {dimensions: {width: img.width, height: img.height}};
                            data.image = img;
                            Dimensions.cache.set(url, cache.dimensions, data);
                            if (options.track) {
                                Dimensions.loading.clear(url)
                            }
                            if (callback) {
                                callback(cache.dimensions, data)
                            }
                        };
                        img.src = url;
                        if (options.track) {
                            Dimensions.loading.set(url, {image: img, type: type})
                        }
                        break
                }
            } else {
                if (callback) {
                    callback($.extend({}, cache.dimensions), cache.data)
                }
            }
        }
    };
    Dimensions.Cache = function () {
        return this.initialize.apply(this, _slice.call(arguments))
    };
    $.extend(Dimensions.Cache.prototype, {
        initialize: function () {
            this.cache = []
        }, get: function (url) {
            var entry = null;
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == url) {
                    entry = this.cache[i]
                }
            }
            return entry
        }, set: function (url, dimensions, data) {
            this.remove(url);
            this.cache.push({url: url, dimensions: dimensions, data: data})
        }, remove: function (url) {
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == url) {
                    delete this.cache[i]
                }
            }
        }, inject: function (data) {
            var entry = get(data.url);
            if (entry) {
                $.extend(entry, data)
            } else {
                this.cache.push(data)
            }
        }
    });
    Dimensions.cache = new Dimensions.Cache();
    Dimensions.Loading = function () {
        return this.initialize.apply(this, _slice.call(arguments))
    };
    $.extend(Dimensions.Loading.prototype, {
        initialize: function () {
            this.cache = []
        }, set: function (url, data) {
            this.clear(url);
            this.cache.push({url: url, data: data})
        }, get: function (url) {
            var entry = null;
            for (var i = 0; i < this.cache.length; i++) {
                if (this.cache[i] && this.cache[i].url == url) {
                    entry = this.cache[i]
                }
            }
            return entry
        }, clear: function (url) {
            var cache = this.cache;
            for (var i = 0; i < cache.length; i++) {
                if (cache[i] && cache[i].url == url && cache[i].data) {
                    var data = cache[i].data;
                    switch (data.type) {
                        case"image":
                            if (data.image && data.image.onload) {
                                data.image.onload = function () {
                                }
                            }
                            break
                    }
                    delete cache[i]
                }
            }
        }
    });
    Dimensions.loading = new Dimensions.Loading();
    Dimensions.preload = function (url, options, callback) {
        if ($.type(options) == "function") {
            callback = options;
            options = {}
        }
        options = $.extend({once: false}, options || {});
        if (options.once && Dimensions.preloaded.get(url)) {
            return
        }
        var cache;
        if ((cache = Dimensions.preloaded.get(url)) && cache.dimensions) {
            if ($.type(callback) == "function") {
                callback($.extend({}, cache.dimensions), cache.data)
            }
            return
        }
        var entry = {url: url, data: {type: "image"}}, image = new Image();
        entry.data.image = image;
        image.onload = function () {
            image.onload = function () {
            };
            entry.dimensions = {width: image.width, height: image.height};
            if ($.type(callback) == "function") {
                callback(entry.dimensions, entry.data)
            }
        };
        Dimensions.preloaded.cache.add(entry);
        image.src = url
    };
    Dimensions.preloaded = {
        get: function (url) {
            return Dimensions.preloaded.cache.get(url)
        }, getDimensions: function (url) {
            var cache = this.get(url);
            return cache && cache.dimensions
        }
    };
    Dimensions.preloaded.cache = (function () {
        var cache = [];

        function get(url) {
            var entry = null;
            for (var i = 0, l = cache.length; i < l; i++) {
                if (cache[i] && cache[i].url && cache[i].url == url) {
                    entry = cache[i]
                }
            }
            return entry
        }

        function add(entry) {
            cache.push(entry)
        }

        return {get: get, add: add}
    })();

    function detectType(url, extension) {
        var type;
        var ext = (extension || detectExtension(url) || "").toLowerCase();
        $("flash image iframe quicktime".split(" ")).each(function (i, t) {
            if ($.inArray(ext, Lightview.extensions[t].split(" ")) > -1) {
                type = t
            }
        });
        if (type) {
            return type
        }
        if (url.substr(0, 1) == "#") {
            return "inline"
        }
        if (document.domain && document.domain != (url).replace(/(^.*\/\/)|(:.*)|(\/.*)/g, "")) {
            return "iframe"
        }
        return "image"
    }

    function detectExtension(url) {
        var ext = (url || "").replace(/\?.*/g, "").match(/\.([^.]{3,4})$/);
        return ext ? ext[1] : null
    }

    $(document.documentElement).delegate(".lightview[href]", "click", function (event, element) {
        event.stopPropagation();
        event.preventDefault();
        var element = event.currentTarget;
        Lightview.show(element)
    });

    function deferUntil(fn, condition) {
        var options = $.extend({lifetime: 1000 * 60 * 5, iteration: 10, fail: null}, arguments[2] || {});
        var time = 0;
        fn._interval = window.setInterval($.proxy(function () {
            time += options.iteration;
            if (!condition()) {
                if (time >= options.lifetime) {
                    window.clearInterval(fn._interval);
                    if (options.fail) {
                        options.fail()
                    }
                }
                return
            }
            window.clearInterval(fn._interval);
            fn()
        }, fn), options.iteration);
        return fn._interval
    }

    var Controls = {
        type: false, set: function (type) {
            this.type = type;
            if (Window.States.get("controls_type_changed")) {
                this.hide()
            }
            var prefix = "lv_button_top_close_controls_type_";
            $("relative top thumbnails".split(" ")).each(function (i, t) {
                Window.buttonTopClose.removeClass(prefix + t)
            });
            Window.buttonTopClose.addClass(prefix + type);
            switch (this.type) {
                case"relative":
                    this.Relative.show();
                    break;
                case"top":
                    this.Top.show();
                    break;
                case"thumbnails":
                    this.Thumbnails.show();
                    break
            }
        }, refresh: function () {
            this.Relative.Slider.populate(Window.views.length);
            this.Relative.Slider.setPosition(Window.position);
            this.Relative.refresh();
            this.Thumbnails.position = Window.position;
            this.Thumbnails.refresh();
            this.Top.refresh()
        }, hide: function () {
            this.Relative.hide();
            this.Top.hide();
            this.Thumbnails.hide()
        }, play: function () {
            this.Relative.play();
            this.Top.play()
        }, stop: function () {
            this.Relative.stop();
            this.Top.stop()
        }, _reset: function () {
            this.Thumbnails._reset()
        }
    };
    Controls.Thumbnails = {
        create: function () {
            this.position = -1;
            this._urls = null;
            this._skin = null;
            this._loading_images = [];
            $(document.body).append(this.element = $("<div>").addClass("lv_thumbnails").append(this.slider = $("<div>").addClass("lv_thumbnails_slider").append(this.slide = $("<div>").addClass("lv_thumbnails_slide"))).hide()).append(this.close = $("<div>").addClass("lv_controls_top_close").append(this.close_button = $("<div>").addClass("lv_controls_top_close_button")).hide());
            this.elements = Window.sideButtonsUnderneath.add(Window.sideButtonsUnderneath.find(".lv_side_left")).add(Window.sideButtonsUnderneath.find(".lv_side_right")).add(Window.innerPreviousNextOverlays);
            if (Browser.IE && Browser.IE < 7) {
                this.element.css({position: "absolute", top: "auto"});
                var s = this.element[0].style;
                s.setExpression("top", "((-1 * this.offsetHeight + (window.jQuery ? jQuery(window).height() + jQuery(window).scrollTop() : 0)) + 'px')")
            }
            this.startObserving()
        }, startObserving: function () {
            this.close_button.bind("click", function () {
                Window.hide()
            });
            this.element.bind("click", $.proxy(function (event) {
                if (this.options && this.options.overlay && !this.options.overlay.close) {
                    return
                }
                if ($(event.target).is(".lv_thumbnails, .lv_thumbnails_slider")) {
                    Window.hide()
                }
            }, this)).delegate(".lv_thumbnail_image", "click", $.proxy(function (event) {
                var thumbnail = $(event.target).closest(".lv_thumbnail")[0];
                this.slide.find(".lv_thumbnail").each($.proxy(function (i, element) {
                    var position = i + 1;
                    if (element == thumbnail) {
                        this.setActive(position);
                        this.setPosition(position);
                        Window.setPosition(position)
                    }
                }, this))
            }, this)).bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (Controls.type == "thumbnails" && !(Window.options && Window.options.controls && Window.options.controls.thumbnails && Window.options.controls.thumbnails.mousewheel)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation();
                this["_" + (delta == -1 ? "next" : "previous")]()
            }, this));
            this.close.bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (Window.options && !Window.options.mousewheel && !(Controls.type == "thumbnails" && Window.options && Window.options.controls && Window.options.controls.thumbnails && Window.options.controls.thumbnails.mousewheel) && !(Window.options && Window.options.viewport)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation()
            }, this))
        }, setSkin: function (skin) {
            var elements = {element: "lv_thumbnails_skin_", close: "lv_controls_top_close_skin_"};
            $.each(elements, $.proxy(function (name, prefix) {
                var element = this[name];
                $.each((element[0].className || "").split(" "), function (i, c) {
                    if (c.indexOf(prefix) > -1) {
                        element.removeClass(c)
                    }
                });
                element.addClass(prefix + skin)
            }, this));
            var urls = "";
            $.each(Window.views, function (i, v) {
                urls += v.url
            });
            if (this._urls != urls || this._skin != skin) {
                this.load(Window.views)
            }
            this._urls = urls;
            this._skin = skin
        }, stopLoadingImages: function () {
            $(this._loading_images).each(function (i, image) {
                image.onload = function () {
                }
            });
            this._loading_images = []
        }, clear: function () {
            if (window.Spinners) {
                Spinners.remove(".lv_thumbnail_image .lv_spinner_wrapper")
            }
            this.slide.html("")
        }, _reset: function () {
            this.position = -1;
            this._urls = null
        }, load: function (views, position) {
            this.position = -1;
            this.stopLoadingImages();
            this.clear();
            $.each(views, $.proxy(function (i, view) {
                var div, thumbnail;
                this.slide.append(div = $("<div>").addClass("lv_thumbnail").append(thumbnail = $("<div>").addClass("lv_thumbnail_image")));
                this.slide.css({width: div.outerWidth() * views.length + "px"});
                if (view.type == "image" || (view.options.thumbnail && view.options.thumbnail.image)) {
                    div.addClass("lv_load_thumbnail");
                    div.data("thumbnail", {
                        view: view,
                        src: (view.options.thumbnail && view.options.thumbnail.image) || view.url
                    })
                }
                if (view.options.thumbnail && view.options.thumbnail.icon) {
                    thumbnail.append($("<div>").addClass("lv_thumbnail_icon lv_thumbnail_icon_" + view.options.thumbnail.icon))
                }
            }, this));
            if (position) {
                this.moveTo(position, true)
            }
        }, _getThumbnailsWithinViewport: function () {
            var position = this.position, thumbnails = [],
                thumbnail_width = this.slide.find(".lv_thumbnail:first").outerWidth();
            if (!position || !thumbnail_width) {
                return thumbnails
            }
            var vp_width = Bounds.viewport().width, thumbnail_count = Math.ceil(vp_width / thumbnail_width);
            var begin = Math.floor(Math.max(position - thumbnail_count * 0.5, 0)),
                end = Math.ceil(Math.min(position + thumbnail_count * 0.5));
            if (Window.views && Window.views.length < end) {
                end = Window.views.length
            }
            this.slider.find(".lv_thumbnail").each(function (i, element) {
                if ((i + 1 >= begin) && (i + 1 <= end)) {
                    thumbnails.push(element)
                }
            });
            return thumbnails
        }, loadThumbnailsWithinViewport: function () {
            var thumbnails = this._getThumbnailsWithinViewport();
            $(thumbnails).filter(".lv_load_thumbnail").each($.proxy(function (i, div) {
                var thumbnail = $(div).find(".lv_thumbnail_image"), data = $(div).data("thumbnail"), view = data.view;
                $(div).removeClass("lv_load_thumbnail");
                var spinner, spinner_overlay, spinner_wrapper, spinner_options, voc = view.options.controls;
                if (window.Spinners && (spinner_options = voc && voc.thumbnails && voc.thumbnails.spinner)) {
                    thumbnail.append(spinner_overlay = $("<div>").addClass("lv_thumbnail_image_spinner_overlay").append(spinner_wrapper = $("<div>").addClass("lv_spinner_wrapper")));
                    spinner = Spinners.create(spinner_wrapper[0], spinner_options || {}).play();
                    var sd = Spinners.getDimensions(spinner_wrapper[0]);
                    spinner_wrapper.css(px({
                        height: sd.height,
                        width: sd.width,
                        "margin-left": Math.ceil(-0.5 * sd.width),
                        "margin-top": Math.ceil(-0.5 * sd.height)
                    }))
                }
                var bounds = {width: thumbnail.innerWidth(), height: thumbnail.innerHeight()};
                var maxZ = Math.max(bounds.width, bounds.height);
                Dimensions.preload(data.src, {type: view.type}, $.proxy(function (image_dimensions, data) {
                    var image = data.image, dimensions;
                    if (image.width > bounds.width && image.height > bounds.height) {
                        dimensions = Window.Dimensions.scaleWithin({width: maxZ, height: maxZ}, image_dimensions);
                        var scaleX = 1, scaleY = 1;
                        if (dimensions.width < bounds.width) {
                            scaleX = bounds.width / dimensions.width
                        }
                        if (dimensions.height < bounds.height) {
                            scaleY = bounds.height / dimensions.height
                        }
                        var scale = Math.max(scaleX, scaleY);
                        if (scale > 1) {
                            dimensions.width *= scale;
                            dimensions.height *= scale
                        }
                        $.each("width height".split(" "), function (i, z) {
                            dimensions[z] = Math.round(dimensions[z])
                        })
                    } else {
                        dimensions = Window.Dimensions.scaleWithin((image.width < bounds.width || image.height < bounds.height) ? {
                            width: maxZ,
                            height: maxZ
                        } : bounds, image_dimensions)
                    }
                    var x = Math.round(bounds.width * 0.5 - dimensions.width * 0.5),
                        y = Math.round(bounds.height * 0.5 - dimensions.height * 0.5);
                    var img_insert = $("<img>").attr({src: data.image.src}).css(px(dimensions)).css(px({
                        top: y,
                        left: x
                    }));
                    thumbnail.prepend(img_insert);
                    if (spinner_overlay) {
                        spinner_overlay.fadeOut(view.options.effects.thumbnails.load, function () {
                            if (spinner) {
                                spinner.remove();
                                spinner = null;
                                spinner_overlay.remove()
                            }
                        })
                    } else {
                        img_insert.css({opacity: 0}).fadeTo(view.options.effects.thumbnails.load, 1)
                    }
                }, this))
            }, this))
        }, show: function () {
            this.elements.add(Window.buttonTopClose).add(this.close).hide();
            var elements = this.elements;
            var woc = Window.options.controls, controls_close = woc && woc.close;
            switch (controls_close) {
                case"top":
                    elements = elements.add(this.close);
                    break;
                case"relative":
                    elements = elements.add(Window.buttonTopClose);
                    break
            }
            Window.refreshPreviousNext();
            elements.show();
            if (!(Window.views && Window.views.length <= 1)) {
                this.element.stop(1, 0).fadeTo(Window.options.effects.thumbnails.show, 1)
            }
        }, hide: function () {
            this.elements.add(Window.buttonTopClose).add(this.close).hide();
            this.element.stop(1, 0).fadeOut(Window.options.effects.thumbnails.hide)
        }, _previous: function () {
            if (this.position < 1) {
                return
            }
            var p = this.position - 1;
            this.setActive(p);
            this.setPosition(p);
            Window.setPosition(p)
        }, _next: function () {
            if (this.position + 1 > Window.views.length) {
                return
            }
            var p = this.position + 1;
            this.setActive(p);
            this.setPosition(p);
            Window.setPosition(p)
        }, adjustToViewport: function () {
            var viewport = Bounds.viewport();
            this.slider.css({width: viewport.width + "px"})
        }, setPosition: function (position) {
            var instant = this.position < 0;
            if (position < 1) {
                position = 1
            }
            var ic = this.itemCount();
            if (position > ic) {
                position = ic
            }
            this.position = position;
            this.setActive(position);
            Window.refreshPreviousNext();
            this.moveTo(position, instant)
        }, moveTo: function (position, instant) {
            this.adjustToViewport();
            var viewport = Bounds.viewport(), vp_width = viewport.width,
                t_width = this.slide.find(".lv_thumbnail").outerWidth();
            var vp_center = vp_width * 0.5, left = (vp_width * 0.5) + (-1 * (t_width * (position - 1) + t_width * 0.5));
            this.slide.stop(1, 0).animate({left: left + "px"}, instant ? 0 : Window.options.effects.thumbnails.slide, $.proxy(function () {
                this.loadThumbnailsWithinViewport()
            }, this))
        }, setActive: function (position) {
            var thumbnails = this.slide.find(".lv_thumbnail").removeClass("lv_thumbnail_active");
            if (position) {
                $(thumbnails[position - 1]).addClass("lv_thumbnail_active")
            }
        }, refresh: function () {
            if (this.position) {
                this.setPosition(this.position)
            }
        }, itemCount: function () {
            return this.slide.find(".lv_thumbnail").length || 0
        }
    };
    Controls.Relative = {
        create: function () {
            this.Slider.create();
            this.elements = $(this.Slider.element).add(Window.sideButtonsUnderneath).add(Window.sideButtonsUnderneath.find(".lv_side_left")).add(Window.sideButtonsUnderneath.find(".lv_side_right")).add(Window.innerPreviousNextOverlays).add(Window.innerPreviousNextOverlays.find(".lv_button"))
        }, show: function () {
            this.hide();
            var elements = this.elements;
            var woc = Window.options.controls, controls_close = woc && woc.close;
            switch (controls_close) {
                case"top":
                    elements = elements.add(Controls.Top.close);
                    break;
                case"relative":
                    elements = elements.add(Window.buttonTopClose);
                    break
            }
            elements.show();
            Window.refreshPreviousNext();
            if (Window.view && Window.views.length > 1 && Window.mayPrevious() || Window.mayNext()) {
                this.Slider.show()
            }
        }, hide: function () {
            this.elements.add(Controls.Top.close).add(Window.buttonTopClose).hide()
        }, refresh: function () {
            this.Slider.refresh()
        }, play: function () {
            this.Slider.play()
        }, stop: function () {
            this.Slider.stop()
        }
    };
    Controls.Relative.Slider = {
        setOptions: function () {
            var wo = Window.options, so = (wo.controls && wo.controls.slider) || {};
            this.options = {
                items: so.items || 5,
                duration: (wo.effects && wo.effects.slider && wo.effects.slider.slide) || 100,
                slideshow: wo.slideshow
            }
        }, create: function () {
            $(Window.element).append(this.element = $("<div>").addClass("lv_controls_relative").append(this.slider = $("<div>").addClass("lv_slider").append(this.slider_previous = $("<div>").addClass("lv_slider_icon lv_slider_previous").append($("<div>").addClass("lv_icon").data("side", "previous"))).append(this.slider_numbers = $("<div>").addClass("lv_slider_numbers").append(this.slider_slide = $("<div>").addClass("lv_slider_slide"))).append(this.slider_next = $("<div>").addClass("lv_slider_icon lv_slider_next").append($("<div>").addClass("lv_icon").data("side", "next"))).append(this.slider_slideshow = $("<div>").addClass("lv_slider_icon lv_slider_slideshow").append($("<div>").addClass("lv_icon lv_slider_next")))));
            this.element.hide();
            this.count = 0;
            this.position = 1;
            this.page = 1;
            this.setOptions();
            this.startObserving()
        }, startObserving: function () {
            this.slider_slide.delegate(".lv_slider_number", "click", $.proxy(function (event) {
                event.preventDefault();
                event.stopPropagation();
                var nr = parseInt($(event.target).html());
                this.setActive(nr);
                Window.stop();
                Window.setPosition(nr)
            }, this));
            $.each("previous next".split(" "), $.proxy(function (i, side) {
                this["slider_" + side].bind("click", $.proxy(this[side + "Page"], this))
            }, this));
            this.slider.bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (!(Window.options && Window.options.mousewheel)) {
                    return
                }
                if (this.count <= this.options.items) {
                    return
                }
                event.preventDefault();
                event.stopPropagation();
                this[(delta > 0 ? "previous" : "next") + "Page"]()
            }, this));
            this.slider_slideshow.bind("click", $.proxy(function (event) {
                if (this.slider_slideshow.hasClass("lv_slider_slideshow_disabled")) {
                    return
                }
                Window[Window.States.get("playing") ? "stop" : "play"](true)
            }, this))
        }, refresh: function () {
            this.setOptions();
            var itemCount = this.itemCount(),
                visible_items = itemCount <= this.options.items ? itemCount : this.options.items,
                isWindowVisible = $(Window.element).is(":visible");
            this.element.css({width: "auto"});
            this.slider[itemCount > 1 ? "show" : "hide"]();
            if (itemCount < 2) {
                return
            }
            if (!isWindowVisible) {
                $(Window.element).show()
            }
            var number = $(document.createElement("div")).addClass("lv_slider_number");
            this.slider_slide.append(number);
            var nr_width = number.outerWidth(true);
            this.nr_width = nr_width;
            number.addClass("lv_slider_number_last");
            this.nr_margin_last = (nr_width - number.outerWidth(true)) || 0;
            number.remove();
            var itemCount = this.itemCount(),
                visible_items = itemCount <= this.options.items ? itemCount : this.options.items;
            var rest = this.count % this.options.items, empty_count = (rest ? this.options.items - rest : 0);
            this.slider_numbers.css({width: ((this.nr_width * visible_items) - this.nr_margin_last) + "px"});
            this.slider_slide.css({width: (this.nr_width * (this.count + empty_count)) + "px"});
            var slideshowVisible = Window.views && $.grep(Window.views, function (view) {
                return view.options.slideshow
            }).length == Window.views.length;
            this.slider_slideshow.hide().removeClass("lv_slider_slideshow_disabled");
            if (slideshowVisible) {
                this.slider_slideshow.show()
            }
            if (!this.options.slideshow) {
                this.slider_slideshow.addClass("lv_slider_slideshow_disabled")
            }
            if (this.itemCount() <= this.options.items) {
                this.slider_next.hide();
                this.slider_previous.hide()
            } else {
                this.slider_next.show();
                this.slider_previous.show()
            }
            this.element.css({width: "auto"});
            this.slider.css({width: "auto"});
            var sow = 0;
            var widths = jQuery.map($.makeArray(this.slider.children("div:visible")), function (e, i) {
                var w = $(e).outerWidth(true);
                if (Browser.IE && Browser.IE < 7) {
                    w += (parseInt($(e).css("margin-left")) || 0) + (parseInt($(e).css("margin-right")) || 0)
                }
                return w
            });
            $.each(widths, function (i, v) {
                sow += v
            });
            if (Browser.IE && Browser.IE < 7) {
                sow++
            }
            this.element.css({position: "absolute"});
            if (sow) {
                this.element.css({width: sow + "px"})
            }
            if (sow) {
                this.slider.css({width: sow + "px"})
            }
            this.element.css({"margin-left": Math.ceil(-0.5 * sow) + "px"});
            var left = parseInt(this.slider_slide.css("left") || 0), pageCount = this.pageCount();
            if (left < -1 * (pageCount - 1) * (this.options.items * this.nr_width)) {
                this.scrollToPage(pageCount, true)
            }
            this.refreshButtonStates();
            if (!isWindowVisible) {
                $(Window.element).hide()
            }
            if (Window.options && Window.options.controls && !Window.options.controls.slider) {
                this.slider.hide()
            }
        }, itemCount: function () {
            return this.slider_slide.find(".lv_slider_number").length || 0
        }, pageCount: function () {
            return Math.ceil(this.itemCount() / this.options.items)
        }, setActive: function (nr) {
            $(this.slider_numbers.find(".lv_slider_number").removeClass("lv_slider_number_active")[nr - 1]).addClass("lv_slider_number_active")
        }, setPosition: function (position) {
            if (position < 1) {
                position = 1
            }
            var ic = this.itemCount();
            if (position > ic) {
                position = ic
            }
            this.position = position;
            this.setActive(position);
            this.scrollToPage(Math.ceil(position / this.options.items))
        }, refreshButtonStates: function () {
            this.slider_next.removeClass("lv_slider_next_disabled");
            this.slider_previous.removeClass("lv_slider_previous_disabled");
            if (this.page - 1 < 1) {
                this.slider_previous.addClass("lv_slider_previous_disabled")
            }
            if (this.page >= this.pageCount()) {
                this.slider_next.addClass("lv_slider_next_disabled")
            }
            this[Window.States.get("playing") ? "play" : "stop"]()
        }, scrollToPage: function (page, instant) {
            if (this.page == page || page < 1 || page > this.pageCount()) {
                return
            }
            if (Browser.MobileSafari) {
                this.slider_numbers.css({opacity: 0.999})
            }
            this.slider_slide.stop(true).animate({left: -1 * (this.options.items * this.nr_width * (page - 1)) + "px"}, instant ? 0 : this.options.duration || 0, "linear", $.proxy(function () {
                if (Browser.MobileSafari) {
                    this.slider_numbers.css({opacity: 1})
                }
            }, this));
            this.page = page;
            this.refreshButtonStates()
        }, previousPage: function () {
            this.scrollToPage(this.page - 1)
        }, nextPage: function () {
            this.scrollToPage(this.page + 1)
        }, populate: function (count) {
            this.slider_slide.find(".lv_slider_number, .lv_slider_number_empty").remove();
            for (var i = 0; i < count; i++) {
                this.slider_slide.append($("<div>").addClass("lv_slider_number").html(i + 1))
            }
            var items = this.options.items, empty = count % items ? items - count % items : 0;
            for (var i = 0; i < empty; i++) {
                this.slider_slide.append($("<div>").addClass("lv_slider_number_empty"))
            }
            this.slider_numbers.find(".lv_slider_number, lv_slider_number_empty").removeClass("lv_slider_number_last").last().addClass("lv_slider_number_last");
            this.count = count;
            this.refresh()
        }, show: function () {
            this.element.show()
        }, hide: function () {
            this.element.hide()
        }, play: function () {
            this.slider_slideshow.addClass("lv_slider_slideshow_playing")
        }, stop: function () {
            this.slider_slideshow.removeClass("lv_slider_slideshow_playing")
        }
    };
    Controls.Top = {
        create: function () {
            $(document.body).append(this.element = $("<div>").addClass("lv_controls_top").append(this.middle = $("<div>").addClass("lv_top_middle").hide().append(this.middle_previous = $("<div>").addClass("lv_top_button lv_top_previous").data("side", "previous").append($("<div>").addClass("lv_icon").append(this.text_previous = $("<span>")))).append(this.middle_slideshow = $("<div>").addClass("lv_top_button lv_top_slideshow").append($("<div>").addClass("lv_icon"))).append(this.middle_next = $("<div>").addClass("lv_top_button lv_top_next").data("side", "next").append($("<div>").addClass("lv_icon").append(this.text_next = $("<span>"))))).hide()).append(this.close = $("<div>").addClass("lv_controls_top_close").append(this.close_button = $("<div>").addClass("lv_controls_top_close_button")).hide());
            if (Browser.IE && Browser.IE < 7) {
                var s = this.element[0].style;
                s.position = "absolute";
                s.setExpression("top", '((!!window.jQuery && jQuery(window).scrollTop()) || 0) + "px"');
                var cs = this.close[0].style;
                cs.position = "absolute";
                cs.setExpression("top", '((!!window.jQuery && jQuery(window).scrollTop()) || 0) + "px"')
            }
            this.setOptions();
            this.startObserving()
        }, setOptions: function (options) {
            this.options = $.extend({
                slideshow: true,
                text: {previous: "Prev", next: "Next"},
                close: true
            }, (Window.options && Window.options.controls) || {});
            this.setText()
        }, setSkin: function (skin) {
            var elements = {element: "lv_controls_top_skin_", close: "lv_controls_top_close_skin_"};
            $.each(elements, $.proxy(function (name, prefix) {
                var element = this[name];
                $.each((element[0].className || "").split(" "), function (i, c) {
                    if (c.indexOf(prefix) > -1) {
                        element.removeClass(c)
                    }
                });
                element.addClass(prefix + skin)
            }, this))
        }, setText: function () {
            this.text_previous.hide();
            this.text_next.hide();
            if (!this.options.text) {
                return
            }
            this.text_previous.html(this.options.text.previous).show();
            this.text_next.html(this.options.text.next).show()
        }, startObserving: function () {
            this.middle_previous.bind("click", function () {
                Window.stop();
                Window.previous();
                $(this).blur()
            });
            this.middle_slideshow.bind("click", function () {
                if ($(this).find(".lv_icon_disabled").length > 0) {
                    return
                }
                Window[Window.States.get("playing") ? "stop" : "play"](true)
            });
            this.middle_next.bind("click", function () {
                Window.stop();
                Window.next();
                $(this).blur()
            });
            this.close_button.bind("click", function () {
                Window.hide()
            });
            this.element.add(this.close).bind("lightview:mousewheel", $.proxy(function (event, delta) {
                if (Window.options && Window.options.mousewheel && !(Window.options && Window.options.viewport)) {
                    return
                }
                event.preventDefault();
                event.stopPropagation()
            }, this))
        }, show: function () {
            var elements = this.element;
            var woc = Window.options.controls, controls_close = woc && woc.close;
            switch (controls_close) {
                case"top":
                    elements = elements.add(this.close);
                    break;
                case"relative":
                    elements = elements.add(Window.buttonTopClose);
                    break
            }
            elements.show()
        }, hide: function () {
            this.element.hide();
            this.close.hide()
        }, refresh: function () {
            this.setOptions();
            this.element.find(".lv_icon_disabled").removeClass("lv_icon_disabled");
            if (!Window.mayPrevious()) {
                this.middle_previous.find(".lv_icon").addClass("lv_icon_disabled")
            }
            if (!Window.options.slideshow) {
                this.middle_slideshow.find(".lv_icon").addClass("lv_icon_disabled")
            }
            if (!Window.mayNext()) {
                this.middle_next.find(".lv_icon").addClass("lv_icon_disabled")
            }
            this.element.removeClass("lv_controls_top_with_slideshow");
            var slideshowVisible = Window.views && $.grep(Window.views, function (view) {
                return view.options.slideshow
            }).length > 0;
            if (slideshowVisible) {
                this.element.addClass("lv_controls_top_with_slideshow")
            }
            this.element[Controls.type == "top" && Window.views.length > 1 ? "show" : "hide"]();
            this[Window.States.get("playing") ? "play" : "stop"]()
        }, play: function () {
            this.middle_slideshow.addClass("lv_top_slideshow_playing")
        }, stop: function () {
            this.middle_slideshow.removeClass("lv_top_slideshow_playing")
        }
    };
    Window.updateQueue = (function () {
        function build() {
            $(document.body).append($(document.createElement("div")).addClass("lv_update_queue").append($("<div>").addClass("lv_window").append(this.container = $("<div>").addClass("lv_content"))))
        }

        function gd(element) {
            return {width: $(element).innerWidth(), height: $(element).innerHeight()}
        }

        function getMeasureElementDimensions(element) {
            var dimensions = gd(element);
            var p = element.parentNode;
            if (p && $(p).css({width: dimensions.width + "px"}) && gd(element).height > dimensions.height) {
                dimensions.width++
            }
            $(p).css({width: "100%"});
            return dimensions
        }

        function update(content, view, callback) {
            if (!this.container) {
                this.build()
            }
            var options = $.extend({spinner: false}, arguments[3] || {});
            if (view.options.inline || _.isElement(content)) {
                if (view.options.inline && $.type(content) == "string") {
                    content = $("#" + content)[0]
                }
                if (!Window.inlineMarker && content && _.element.isAttached(content)) {
                    $(content).data("lv_restore_inline_display", $(content).css("display"));
                    Window.inlineMarker = document.createElement("div");
                    $(content).before($(Window.inlineMarker).hide())
                }
            }
            var measureElement = document.createElement("div");
            this.container.append($(measureElement).addClass("lv_content_wrapper").append(content));
            if (_.isElement(content)) {
                $(content).show()
            }
            if (view.options.wrapperClass) {
                $(measureElement).addClass(view.options.wrapperClass)
            }
            if (view.options.skin) {
                $(measureElement).addClass("lv_content_" + view.options.skin)
            }
            var images = $(measureElement).find("img[src]").filter(function () {
                return !(($(this).attr("height") && $(this).attr("width")))
            });
            if (images.length > 0) {
                Window.States.set("preloading_images", true);
                var loaded = 0, url = view.url;
                var waitFor = Math.max(8000, (images.length || 0) * 750);
                Window.Timeouts.clear("preloading_images");
                Window.Timeouts.set("preloading_images", $.proxy(function () {
                    images.each(function () {
                        this.onload = function () {
                        }
                    });
                    if (loaded >= images.length) {
                        return
                    }
                    if (Window.view && Window.view.url != url) {
                        return
                    }
                    this._update(measureElement, view, callback)
                }, this), waitFor);
                Window.States.set("preloading_images", images);
                $.each(images, $.proxy(function (i, element) {
                    var img = new Image();
                    img.onload = $.proxy(function () {
                        img.onload = function () {
                        };
                        var width = img.width, height = img.height, attr_width = $(element).attr("width"),
                            attr_height = $(element).attr("height");
                        if (!attr_width || !attr_height) {
                            if (!attr_width && attr_height) {
                                width = Math.round(attr_height * width / height);
                                height = attr_height
                            } else {
                                if (!attr_height && attr_width) {
                                    height = Math.round(attr_width * height / width);
                                    width = attr_width
                                }
                            }
                            $(element).attr({width: width, height: height})
                        }
                        loaded++;
                        if (loaded == images.length) {
                            Window.Timeouts.clear("preloading_images");
                            Window.States.set("preloading_images", false);
                            if (Window.view && Window.view.url != url) {
                                return
                            }
                            this._update(measureElement, view, callback)
                        }
                    }, this);
                    img.src = element.src
                }, this))
            } else {
                this._update(measureElement, view, callback)
            }
        }

        function _update(measureElement, view, callback) {
            var dimensions = getMeasureElementDimensions(measureElement);
            dimensions = getFittedDimensions(measureElement, dimensions, view);
            Window.resizeTo(dimensions.width, dimensions.height, {
                complete: function () {
                    Window.content.html(measureElement);
                    if (callback) {
                        callback()
                    }
                }
            })
        }

        function getFittedDimensions(measureElement, dimensions, view) {
            var paddless_dimensions = {
                width: dimensions.width - (parseInt($(measureElement).css("padding-left")) || 0) - (parseInt($(measureElement).css("padding-right")) || 0),
                height: dimensions.height - (parseInt($(measureElement).css("padding-top")) || 0) - (parseInt($(measureElement).css("padding-bottom")) || 0)
            };
            var maxWidth = Window.options.width;
            if (maxWidth && $.type(maxWidth) == "number" && paddless_dimensions.width > maxWidth) {
                $(measureElement).css({width: maxWidth + "px"});
                dimensions = getMeasureElementDimensions(measureElement)
            }
            dimensions = Window.Dimensions.fit(dimensions, view);
            if (/(inline|ajax|html)/.test(view.type) && Window.States.get("resized")) {
                var scrollEl = $("<div>");
                scrollEl.css({position: "absolute", top: 0, left: 0, width: "100%", height: "100%"});
                $(measureElement).append(scrollEl);
                var widthBefore = scrollEl.innerWidth();
                $(measureElement).css(px(dimensions)).css({overflow: "auto"});
                var widthAfter = scrollEl.innerWidth();
                var widthDiff = widthBefore - widthAfter;
                if (widthDiff) {
                    dimensions.width += widthDiff;
                    $(measureElement).css(px(dimensions));
                    dimensions = Window.Dimensions.fit(dimensions, view)
                }
                scrollEl.remove()
            }
            return dimensions
        }

        return {
            build: build,
            update: update,
            _update: _update,
            getFittedDimensions: getFittedDimensions,
            getMeasureElementDimensions: getMeasureElementDimensions
        }
    })();
    $.extend(true, Lightview, (function () {
        function show(object) {
            var options = arguments[1] || {}, position = arguments[2];
            if (arguments[1] && $.type(arguments[1]) == "number") {
                position = arguments[1];
                options = Options.create({})
            }
            var views = [], object_type;
            switch ((object_type = $.type(object))) {
                case"string":
                case"object":
                    var view = new View(object, options);
                    if (view.group) {
                        if (object && object.nodeType == 1) {
                            var elements = $('.lightview[data-lightview-group="' + $(object).data("lightview-group") + '"]');
                            var groupOptions = {};
                            elements.filter("[data-lightview-group-options]").each(function (i, element) {
                                $.extend(groupOptions, eval("({" + ($(element).attr("data-lightview-group-options") || "") + "})"))
                            });
                            elements.each(function (i, element) {
                                if (!position && element == object) {
                                    position = i + 1
                                }
                                views.push(new View(element, $.extend({}, groupOptions, options)))
                            })
                        }
                    } else {
                        var groupOptions = {};
                        if (object && object.nodeType == 1 && $(object).is("[data-lightview-group-options]")) {
                            $.extend(groupOptions, eval("({" + ($(object).attr("data-lightview-group-options") || "") + "})"));
                            view = new View(object, $.extend({}, groupOptions, options))
                        }
                        views.push(view)
                    }
                    break;
                case"array":
                    $.each(object, function (i, item) {
                        var view = new View(item, options);
                        views.push(view)
                    });
                    break
            }
            if (!position || position < 1) {
                position = 1
            }
            if (position > views.length) {
                position = views.length
            }
            Window.load(views, position, {initialDimensionsOnly: true});
            Window.show(function () {
                Window.setPosition(position)
            })
        }

        function refresh() {
            Window.refresh();
            return this
        }

        function setDefaultSkin(skin) {
            Window.setDefaultSkin(skin);
            return this
        }

        function hide() {
            Window.hide();
            return this
        }

        function play(instant) {
            Window.play(instant);
            return this
        }

        function stop() {
            Window.stop();
            return this
        }

        return {show: show, hide: hide, play: play, stop: stop, refresh: refresh, setDefaultSkin: setDefaultSkin}
    })());
    window.Lightview = Lightview;
    $(document).ready(function () {
        Lightview.init()
    })
})(jQuery, window);

define(['backbone'], function() {

    var util = {

        log_to_server: function(key_str, val_dict, app_id) {
            /*_.each(val_dict, function(val, key) {
            util.assert((typeof key) == (typeof ''));
            util.assert((typeof val) == (typeof ''));
        });*/

            /*val_dict['__key'] = key_str;
        if (app_id)
            val_dict['__app_id'] = app_id;*/
            var logData = {
                '__key': key_str,
                '__app_id': app_id,
                '__data': JSON.stringify(val_dict, undefined, 2)
            };
            $.post('/log/anything/', logData);
        },

        assert: function(inp) {
            if (!inp) {
                console.trace();
                alert('Important Error!');
            }
        },

        setCursor: function(node, pos) {
            node = (typeof node == "string" || node instanceof String) ? document.getElementById(node) : node;
            if (!node) {
                return false;
            } else if (node.createTextRange) {
                var textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            } else if (node.setSelectionRange) {
                node.setSelectionRange(pos, pos);
                return true;
            }
            return false;
        },

        get: function(id) {
            return document.getElementById(id);
        },

        getHTML: function(id) {
            if (!document.getElementById(id)) return null;

            return (document.getElementById(id).innerHTML) || null;
        },

        askBeforeLeave: function() {
            window.onbeforeunload = function(e) {
                return '';
            };
        },

        dontAskBeforeLeave: function() {
            window.onbeforeunload = null;
        },

        startAjaxLoading: function() {
            if (!document.getElementById('ajax-loader')) {
                var div = document.createElement('div');
                div.id = 'ajax-loader';
                document.body.appendChild(div);
            }
        },

        stopAjaxLoading: function(txt) {
            if (document.getElementById('ajax-loader')) {
                var child = document.getElementById('ajax-loader');
                child.parentNode.removeChild(child);
            }

            if (txt) {
                var notifId = 'notif-' + Math.floor(Math.random() * 11);
                var notifDiv = document.createElement('div');
                notifDiv.id = notifId;
                notifDiv.className = "fadeIn notification";
                notifDiv.innerHTML = txt;
                document.body.appendChild(notifDiv);

                setTimeout(function() {
                    var elem = document.getElementById(notifId);
                    $(elem).fadeOut(220, function() {
                        $(this).remove();
                    });
                    //.parentNode.removeChild(elem);
                }, 800);
            }
        },

        loadCSS: function(css) {
            if (!document.getElementById('css-' + css)) {
                var cssFile = document.createElement('link');
                cssFile.setAttribute('type', 'text/css');
                cssFile.setAttribute('href', '/static/css/' + css + '.css');
                cssFile.setAttribute('rel', 'stylesheet');
                cssFile.id = 'css-' + css;
            }
        },

        unloadCSS: function(css) {
            var tag = document.getElementById('css-' + css);
            tag.parentNode.removeChild(tag);
        },

        loadDirectory: function(directory, css) {
            var cssFile = document.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('href', directory);
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.id = 'css-' + css;
            document.getElementsByTagName('head')[0].appendChild(cssFile);
        },

        isMouseOn: function(pageX, pageY, element, extraClickArea) {
            extraClickArea = extraClickArea || 0;

            mouseX = pageX;
            mouseY = pageY;
            var div = $(element);
            divTop = div.offset().top;
            divLeft = div.offset().left;
            divRight = divLeft + div.width() + 2 * extraClickArea;
            divBottom = divTop + div.height() + 2 * extraClickArea;
            if (mouseX >= divLeft && mouseX <= divRight && mouseY >= divTop && mouseY <= divBottom) {
                return true;
            }
            return false;
        },

        isRectangleIntersectElement: function(a1x, a1y, a2x, a2y, elem) {
            var div = $(elem);
            if (!div.offset()) return false;

            var windowScrollDown = $(window).scrollTop();
            var divTop = div.offset().top - windowScrollDown;
            var divLeft = div.offset().left;
            var divRight = divLeft + div.width();
            var divBottom = divTop + div.height();

            return this.isRectanglesIntersect(a1x, a1y, a2x, a2y, divLeft, divTop, divRight, divBottom);
        },

        isRectanglesIntersect: function(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {

            var minAx = ax1;
            var minAy = ay1;
            var maxAx = ax1;
            var maxAy = ay1;
            var minBx = bx1;
            var minBy = by1;
            var maxBx = bx1;
            var maxBy = by1;

            if (ax1 < ax2) {
                maxAx = ax2;
            } else {
                minAx = ax2;
            }
            if (ay1 < ay2) {
                maxAy = ay2;
            } else {
                minAy = ay2;
            }

            if (bx1 < bx2) {
                maxBx = bx2;
            } else {
                minAx = ax2;
            }
            if (by1 < by2) {
                maxBy = by2;
            } else {
                minBy = by2;
            }

            return this.rectanglesIntersect(minAx, minAy, maxAx, maxAy, minBx, minBy, maxBx, maxBy);

        },

        rectanglesIntersect: function(minAx, minAy, maxAx, maxAy, minBx, minBy, maxBx, maxBy) {
            var aLeftOfB = maxAx < minBx;
            var aRightOfB = minAx > maxBx;
            var aAboveB = minAy > maxBy;
            var aBelowB = maxAy < minBy;

            return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
        },

        isPlural: function(str) {
            if (str && str.length > 0) {
                var lastChar = str.charAt(str.length - 1);
                return (lastChar === 's' || lastChar === 'S');
            }
        },

        pluralize: function(str) {
            if (str && str.length > 0) {
                if (str === "pass" || str === "Pass" || str === "PASS") return str;
                var lastChar = str.charAt(str.length - 1);
                return (lastChar === 's' || lastChar === "S") ? str + 'es' : str + 's';
            }
        },

        singularize: function(str) {
            if (str && str.length > 0) {
                var lastChar = str.charAt(str.length - 1);
                return (lastChar === 's' || lastChar === "S") ? str.substring(0, str.length - 1) : str;
            }
        },

        scrollToElement: function($el) {
            var height = $el.offset().top - 90;
            $('html, body').animate({
                scrollTop: height
            }, 'slow', 'swing');
        },

        scrollToBottom: function($el) {
            $el.stop(true, false);
            $el.animate({
                scrollTop: $el[0].scrollHeight
            }, 'slow', 'swing');
        },

        isAlphaNumeric: function(str) {
            var patt = /^[a-z0-9\s]+$/i;
            return patt.test(str);
        },

        doesStartWithKeywords: function(str) {
            if (!str) {
                return false;
            }
            var ind1 = str.indexOf('Page');
            var ind2 = str.indexOf('Form');
            var ind3 = str.indexOf('loop');

            return (!ind1 || !ind2 || !ind3);
        },

        getDisplayType: function(fieldType) {
            switch (fieldType) {
                case "text":
                case "date":
                case "number":
                case "money":
                case "email":
                    return "texts";
                case "image":
                    return "images";
                case "file":
                    return "links";
            }

            return null;
        },

        capitaliseFirstLetter: function(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        selectText: function($el) {
            var doc = document;
            var element = $el.get(0);
            var range;

            if (doc.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(element);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },

        unselectText: function() {
            if (document.selection) {
                document.selection.empty();
            } else if (window.getSelection) {
                window.getSelection().removeAllRanges();
            }
        },

        findPos: function(obj) {
            var curleft = curtop = 0;

            if (obj.style.position == "fixed") return [1, 1];
            if (obj.offsetParent) {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
            }

            return [curleft, curtop];
        },

        waitUntilAppears: function(selector, callbackFn, cont_args, count, timer) {
            if (!timer) timer = {};
            clearTimeout(timer);
            var cnt = (count || 0);

            el = document.querySelector(selector);
            if (el && !el.tagName) {
                el = el[0];
            }

            var repeat = function() {
                cnt++;
                timer = window.setTimeout(function() {
                    util.waitUntilAppears.call(this, selector, callbackFn, cont_args, cnt, timer);
                }, 500);
            };

            var fail = function() {
                alert('There has been a problem with the flow of the Walkthrough. Please refresh your page. Don\'t worry, you\'ll start from where you left off!');
            };

            if (cnt > 60) return fail();
            if (!el) return repeat();

            var pos = util.findPos(el);

            if ($(el).height() === 0 || $(el).width() === 0 || pos[0] === 0 || pos[1] === 0) return repeat();
            callbackFn.apply(undefined, cont_args);
        },

        threeDots: function() {
            var el = document.createElement('span');
            el.style.marginLeft = 0;
            el.style.width = '12px';
            el.style.textAlign = 'left';
            var currentNmr = 1;
            var timer = setInterval(function() {
                nmr = (currentNmr % 3);
                var str = '.';
                for (var ii = 0; ii < nmr; ii++) {
                    str += '.';
                }
                el.innerHTML = str;
                currentNmr++;
            }, 200);

            var obj = {};
            obj.el = el;
            obj.timer = timer;

            return obj;
        },

        copyToClipboard: function(text) {
            window.prompt("Copy to clipboard: Ctrl+C/Cmd+C, Enter", text);
        },

        addOverlay: function(el) {
            var $el = $(el);
            var overlayEl = document.createElement('div');
            overlayEl.className = 'global-overlay';
            var position = $el.offset();
            overlayEl.style.position = 'fixed';
            overlayEl.style.top = position.top + 'px';
            overlayEl.style.left = position.left + 'px';
            overlayEl.style.width = $el.outerWidth() + 'px';
            overlayEl.style.height = $el.outerHeight() + 'px';
            document.body.appendChild(overlayEl);

            $(overlayEl).one('click', function(e) {
                $(e.currentTarget).remove();
            });

            return overlayEl;
        },

        addShadow: function(el, pageWrapper, frame, doc) {
            var $el = $(el);
            frame = frame || window;

            var overlayEl = document.createElement('div');
            overlayEl.className = 'global-overlay';
            var position = $el.offset();
            if(doc) {
                position.top -= $(doc).scrollTop();
            }

            if(frame != window) {
                var n = $(frame).offset().top - $(pageWrapper).offset().top;
                position.top += n;
            }

            overlayEl.style.position = 'fixed';
            overlayEl.style.top = position.top + 'px';
            overlayEl.style.left = position.left + 'px';
            overlayEl.style.width = $el.outerWidth() + 'px';
            overlayEl.style.height = $el.outerHeight() + 'px';
            //overlayEl.style.color = 'red';
            overlayEl.style.fontSize = '24px';
            //overlayEl.style.border = '1px solid #ccc';

            return overlayEl;
        },

        getRightTop: function(el, pageWrapper, frame, doc) {
            
            var $el = $(el);
            frame = frame || window;

            var overlayEl = document.createElement('div');
            overlayEl.className = 'global-overlay';
            var position = $el.offset();
            if(doc) {
                position.top -= $(doc).scrollTop();
            }

            if(frame != window) {
                var n = $(frame).offset().top - $(pageWrapper).offset().top;
                position.top += n;
            }

            var newPosition = {};
            newPosition.top = position.top;
            newPosition.right = position.left + $el.outerWidth();

            return newPosition;
        },

        guideText: function(e, text) {
            var div = document.createElement('div');
            div.innerHTML = text;
            div.style.position = "fixed";
            div.style.top = e.pageY + 'px';
            div.style.left = e.pageX + 'px';
            div.style.color = "#666";
            div.style.zIndex = 3003;
            document.body.appendChild(div);
            $(div).delay(200).fadeOut(function() {
                $(div).remove();
            });
        },

        isString: function(obj) {
            return toString.call(obj) == '[object String]';
        },

        getWindowRelativeOffset: function(parentWindow, elem) {
            var offset = {
                left : 0,
                top : 0
            };

            if(!elem) return offset;
            // relative to the target field's document
            offset.left = elem.getBoundingClientRect().left;
            offset.top = elem.getBoundingClientRect().top;
            // now we will calculate according to the current document, this current
            // document might be same as the document of target field or it may be
            // parent of the document of the target field
            var childWindow = elem.ownerDocument;
            // while (childWindow != parentWindow) {
            //     offset.left = offset.left + childWindow.body.getBoundingClientRect().left;
            //     offset.top = offset.top + childWindow.body.getBoundingClientRect().top;
            //     childWindow = childWindow.parent;
            // }

            return offset;
        },

        addLoadingSpin: function (domEl) {
            var spinner = document.createElement('img');
            spinner.src = '/static/img/spinner.gif';
            spinner.className = 'generic-spinner';
            domEl.appendChild(spinner);
            
            return spinner;
        },

        packageModuleName: function(generatorPath) {
            return G.expander.parseGenID(generatorPath);
        },

        findGenerator: function(localPlugins, generatorPath) {
            var genID = G.expander.parseGenID(generatorPath);
            var gen = G.expander.findGenData(localPlugins, genID);
            return gen;
        },

        deepCopy: function(oldObject) {
            var newJSON = JSON.stringify(oldObject);
            return $.parseJSON(newJSON);
        }

    };

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {

            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $(function() {
        /* adds csrftoke to every ajax request we send */
        $.ajaxSetup({
            crossDomain: false, // obviates need for sameOrigin test
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type)) {
                    var token = getCookie('csrftoken');
                    xhr.setRequestHeader("X-CSRFToken", token);
                }
            }
        });
    });

    $(function() {
        /* prevents submitting twice */
        $('form').on('submit', function(e) {
            $(e.target).on('submit', function(e) {
                e.preventDefault();
            });
        });
    });

    document.addEventListener("touchstart", function() {}, true);

    window.util = util;

    if (typeof window.define === "function" && window.define.amd) {
        window.define("util", [], function() {
            return window.util;
        });
    }

    return util;

});

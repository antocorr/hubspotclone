function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function DataHolder(data) {
    this.watchers = data.watchers || {};
    this.set = function (prop, val = null, skipWatcher = false) {
        if (typeof prop == "object") {
            var keys = Object.keys(prop);
            var vals = Object.values(prop);
            for (var i = 0; i < keys.length; i++) {
                //here val == skipWatcher
                this.set(keys[i], vals[i], val);
            }
            return;
        }
        this[prop] = val;
        if (this.watchers[prop] && !skipWatcher) {
            this.watchers[prop].apply(this, [val]);
        }
        return this;
    };
    this.render = function (key, cb) {
        var sel = document.querySelectorAll(`[data-render=${key}]`);
        //console.log(sel, `[data-render=${key}]`);
        var supported = ["ir-html", "irattr-src", "irattr-data-id", "irattr-href", "ir-if"];
        if (sel) {
            var ref = sel[0];
            for (const el of sel) {
                for (const d of this[key]) {
                    var clone = el.cloneNode(true);
                    for (const tag of supported) {
                        var els = clone.querySelectorAll("[" + tag + "]");
                        for (const single of els) {
                            if (tag == "ir-if" && !d[single.getAttribute(tag)]) {
                                single.remove();
                                continue;
                            }
                            if (tag == "ir-html" && d[single.getAttribute("ir-html")] !== undefined) {
                                single.innerHTML = d[single.getAttribute("ir-html")];
                                continue;
                            }
                            var attr = tag.replace("irattr-", "");
                            if (d[single.getAttribute(tag)] !== undefined) {
                                single.setAttribute(attr, d[single.getAttribute(tag)]);
                            }
                        }
                    }
                    insertAfter(clone, ref);
                    ref = clone;
                }
                el.remove();
            }
        }
        if (cb) {
            cb();
        }
    };
    delete data.watchers;
    this.set(data, true);
}
function documentReady(fn, timeout = 1) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        setTimeout(fn, timeout);
    }
}

var data = new DataHolder({
    
});
documentReady(() => {
    var repeat = document.querySelectorAll("[repeat]");
    for (const elem of repeat) {
        for (let index = 0; index < elem.getAttribute("repeat") - 1; index++) {
            var n = elem.cloneNode(true);
            insertAfter(n, elem);
            //elem.parentNode.appendChild(n);
        }
    }
});
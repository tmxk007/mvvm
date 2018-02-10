// mvvm
(function (window) {

    // 发布者
    function Publisher() {
        this.subs = [];
    };

    Publisher.prototype = {
        // 订阅
        subscribe: function (sub) {
            if (this.subs[sub.uid]) return;
            this.subs[sub.uid] = sub;
        },
        // 发布
        publish: function () {
            for (var uid in this.subs) {
                this.subs[uid].update();
            }
        }
    }

    var subId = 0;
    
    // 订阅者
    function Subscriber(vm, node, fieldName, attrName) {
        Publisher.target = this;
        this.fieldName = fieldName;
        this.attrName = attrName;
        this.node = node;
        this.vm = vm;
        this.uid = subId++;
        this.update();
    };

    Subscriber.prototype.update = function () {
        var value = this.vm[this.fieldName];
        if (this.attrName) {
            this.node.setAttribute(this.attrName, value)
        }
        else {
            this.node.nodeValue = value;
        }
    }

    function tw(options) {
        var that = this;
        that.data = options.data;
        var data = that.data;

        // 拦截属性
        Object.keys(data).forEach(function (key) {
            defineProperty(that, key, data[key]);
        });

        // 编译模板
        var element = document.querySelector(options.el);
        var fragment = nodeToFragment(element, that);
        compile(fragment, that);

        // 编译完成后，将dom重新赋值给app
        element.appendChild(fragment);
    };

    // 拦截属性
    function defineProperty(obj, key, val) {
        var publisher = new Publisher();
        Object.defineProperty(obj, key, {
            get: function () {
                if (Publisher.target) {
                    publisher.subscribe(Publisher.target);
                    Publisher.target = null;
                }
                return val;
            },
            set: function (newVal) {
                if (newVal === val) return;
                val = newVal;
                // 作为发布者发出通知
                publisher.publish();
            }
        });
    };

    function nodeToFragment(node, vm) {
        var fragment = document.createDocumentFragment();
        var child;

        // 循环遍历节点，编译节点并劫持到文档片段中
        while (child = node.firstChild) {
            fragment.appendChild(child);
        };

        return fragment;
    };

    function forEach(attrs, callback) {
        var arr = Array.prototype.slice.call(attrs);
        for (var i = 0; i < arr.length; i++) {
            if (callback) callback(arr[i]);
        }
    }

    // 正则匹配指令({{ text }})
    var reg = new RegExp(/\{\{(.*?)\}\}/g);

    function compile(node, vm) {
        // 匹配节点元素
        if (node.nodeType === 1) {
            compileAttrs(node, vm);
        };
        if (node.nodeType === 3) {
            var nodeValue = node.nodeValue.trim();
            // 匹配节点类型为text的元素
            if (reg.test(nodeValue)) {
                nodeValue.match(reg).forEach(function (key) {
                    // 获取匹配到的字符串
                    var fieldName = key.replace(reg, RegExp.$1);
                    fieldName = fieldName.trim();
                    new Subscriber(vm, node, fieldName);
                });
            };
        };

        compileElement(node, vm);
    };

    // 编译dom节点
    function compileElement(el, vm) {
        forEach(el.childNodes, function (node) {
            compile(node, vm);
        });
    }

    // 编译属性
    function compileAttrs(node, vm) {
        forEach(node.attributes, function (attr) {
            // 属性名
            var attrName = attr.nodeName;
            // 字段名
            var fieldName = attr.nodeValue;
            if (attrName == 'v-model') {
                node.addEventListener('input', function (e) {
                    // 给相应的data属性赋值，并触发该属性的set方法
                    vm[fieldName] = e.target.value;
                });
                // 将data值赋值给node
                node.value = vm.data[fieldName];
                node.removeAttribute(attrName);
            }
            else if (attrName.indexOf(':') == 0) {
                attrName = attrName.substring(1);
                // 将data值赋值给node
                node.setAttribute(attrName, vm.data[fieldName]);
                node.removeAttribute(attr.nodeName);
                new Subscriber(vm, node, fieldName, attrName);
            }
        });
    }

    window.$tw = tw;

})(window);

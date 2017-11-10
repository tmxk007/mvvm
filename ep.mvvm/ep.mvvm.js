(function (window, ep) {

    function mvvm(options) {
        // var pubSub={
        //     callbacks:{},
        //     on:function(){

        //     },
        //     publish:function(){

        //     }
        // }
    }

    // 解析模板
    function parseTemplate(node, vm) {
        // var node = document.querySelector(el);
        var docFragment = document.createDocumentFragment();
        var childNode;
        while (childNode = node.firstChild) {
            parseTemplateNode(node, vm);
            docFragment.append(childNode);
        }
        node.appendChild(docFragment);
    }

    // 节点类型
    var nodeTypes = {
        Element: 1,
        Text: 3
    }

    // 解析模板节点
    function parseTemplateNode(node, vm) {
        if (node.nodeType == nodeTypes.Element) {
            var attr = getVMAttr(node.attributes);
            node.removeAttribute(attr);
        }
        if (node.nodeType == nodeTypes.Text) {

        }
    }

    // 获取双向绑定属性
    function getVMAttr(attrs) {
        if (!attrs) return;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i].name;
            if (attr && attr.indexOf(':') == 0) {
                return attr;
            }
        }
    }

    // 正则匹配指令({{ text }})
    var regTemplateText=new RegExp(/\@\{(.*?)\}/g);

    // 解析文本
    function parseText(text) {
        if (!regTemplateText.test(text.trim())) return;
        text.match(regTemplateText).forEach(function(key){
            var name = key.replace(regTemplateText,RegExp.$1);    //获取匹配到的字符串
            name = name.trim();
            
        });
    }

    // 页面元素添加事件
    function pageElementAddEvents() {
        var events = ['keyup', 'change'];
        for (var i = 0; i < events.length; i++) {
            addEvent(events[i], pageElementEventHandler);
        }
    }

    // 添加事件
    function addEvent(eventName, handler) {
        if (document.addEventListener) {
            document.addEventListener(eventName, handler, false);
        } else {
            document.attachEvent('on' + eventName, handler);
        }
    }

    // 页面元素事件处理
    function pageElementEventHandler() {
        var target = e.target || e.srcElemnt;
        var propName = target.getAttribute('mvvm-');
        if (!propName) return;
        mvvm.publish('ui-update-event', propName, target.value);
    }

    // 观察数据
    function observe(data) {
        if (!data || typeof data !== 'object') {
            return;
        }
        for (var key in data) {
            observeProperty(data, key);
        }
    }

    // 观察属性
    function observeProperty(data, key) {
        var val = data[key];
        var attributes = {
            enumerable: true,   // 可枚举
            configurable: true, // 可重新定义
            get: function () {
                console.log('get:' + val);
                return val;
            },
            set: function (newVal) {
                if (val === newVal) {
                    return;
                }
                console.log('set:' + newVal);
                val = newVal;
            }
        };
        Object.defineProperty(data, key, attributes);
    }

    ep.mvvm = mvvm;
    window.EP = ep;

})(window, window.EP || {})

window.onload = function () {

    var app = document.querySelector('.app');
    var docFragment = document.createDocumentFragment();
    var node;
    var count = 0;
    while (node = app.firstChild) {
        var attr = getVMAttr(node.attributes);
        console.log(attr)
        docFragment.append(node);
        count++;
    }
    console.log(count);
    app.appendChild(docFragment);


    function getVMAttr(attrs) {
        if (!attrs) return;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i].name;
            if (attr && attr.indexOf(':') == 0) {
                return attr.substr(1);
            }
        }
    }
}
// var data = { id: 1, name: 'zs' }

// for (var key in data) {
//     defineProperty(data, key);
// }

// data.id = 2;
// data.name = 'ls';
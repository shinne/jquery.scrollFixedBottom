/**
 * 1、思考show与visibility的区别
 * 2、判断createVirtual是否需要创建，如果存在则更新其样式，否则创建
 * 3、virtualScrollItem的left由其相对于scrollWrap的left确定
 * 4、局限性，样式上的局限性，scrollWrap目前只能被scrollItem撑开
 * 5、元素为jquery，默认加$
 * 6、width -> outerWidth
 */

/**
 *
 * @param options:
 * scrollWrapEle:包裹scrollItem的选择器标识
 * scrollItemEle:需要模拟的scrollItem选择器标识
 * left:初始化滚动到left哪儿
 * @constructor
 */

function ScrollFixedBottom(options) {
    this.initParam(options);
    //当元素存在的时候才进行以下
    if (this.$scrollItem.length && this.$scrollWrap.length) {
        this.createVirtualObj();
        this.bindEvents();
        $("body").trigger("scroll");
        if(this.$virtualWrap){
            this.$virtualWrap.scrollLeft(this.config.left);
        }
    }
}

ScrollFixedBottom.prototype = {
    constructor: ScrollFixedBottom,
    defaultCfg: {
        scrollWrapEle: ".scroll-wrap",
        scrollItemEle: ".scroll-item",
        left: 0
    },
    /**
     * config:
     * scrollWrapEle:包裹scrollItem的divClass标识
     * scrollItemEle:需要模拟的scrollItem标识
     * left:初始化向左滚动多少
     * */
    config: {},
    initParam: function (options) {
         /**
         * $scrollWrap:标识有滚动条的的obj
         * $scrollItem:需要模拟的obj
         * $virtualWrap:虚拟的包裹scrollItem的div，具有scroll
         * $virtualscrollItem:虚拟的scrollItem，其宽度与scrollItem相同
         */
        var config = this.config = $.extend({}, this.defaultCfg, this.config, options || {});
        this.$scrollWrap = $(config.scrollWrapEle);
        this.$scrollItem = this.$scrollWrap.find(config.scrollItemEle);
    },
    createVirtualObj: function () {
        this.createVirtualWrap();
        this.createVirtualItem();
    },
    //创建一个虚拟的wrap，具有滚动条
    createVirtualWrap: function () {
        //outerWidth包括width+padding
        var wrapWidth = this.$scrollWrap.outerWidth();
        var itemWidth = this.$scrollItem.outerWidth();
        var wrapLeft = this.$scrollWrap.offset().left;
        var itemLeft = this.$scrollItem.offset().left;
        var left = itemLeft - wrapLeft;
        var realWidth = left + itemWidth;
        if (wrapWidth < realWidth) {
            left = this.$scrollWrap.offset().left;
            //css变量抽离
            var cssObj = {
                position: "fixed",
                left: left,
                bottom: 0,
                height: 18,
                width: wrapWidth,
                overflowX: "scroll",
                display: "none"
            };
            if (this.$virtualWrap) {
                this.$virtualWrap.css(cssObj);
            }
            else {
                this.$virtualWrap = $("<div class='virtual-wrap'></div>").css(cssObj).appendTo($('body'));
            }
        } else {
            if (this.$virtualWrap) {
                this.$virtualWrap.remove();
                this.$virtualWrap = null;
            }
        }
    },
    //创建一个与scroll-item同宽同left的div,模拟item
    createVirtualItem: function () {
        var wrapWidth = this.$scrollWrap.outerWidth();
        var itemWidth = this.$scrollItem.outerWidth();
        var wrapLeft = this.$scrollWrap.offset().left;
        var itemLeft = this.$scrollItem.offset().left;
        //计算table与wrap的left相对位置
        var left = itemLeft - wrapLeft;
        var realWidth = left + itemWidth;
        if (wrapWidth < realWidth) {
            var cssObj = {
                position: "absolute",
                left: left,
                bottom: 0,
                height: 10,
                width: itemWidth
            };
            if (this.$virtualScrollItem) {
                this.$virtualScrollItem.css(cssObj);
            }
            else {
                this.$virtualScrollItem = $("<div class='virtual-item'></div>").css(cssObj).appendTo(this.$virtualWrap);
            }
        }
        else {
            if (this.$virtualScrollItem) {
                this.$virtualScrollItem.remove();
                this.$virtualScrollItem = null;
            }
        }
    },
    bindEvents: function () {
        //虚拟wrap的scroll事件绑定
        this.bindVirtualWrapScroll();
        //真是wrap的scroll事件绑定,
        // 不需要绑定bindWrapScroll，当虚拟滚动条的时候判断实际滚动条的scrollLeft,将其赋予给虚拟Wrap的scrollLeft
        /*this.bindWrapScroll();*/
        //页面body上下滚动事件绑定，主要控制virtualWrap的显示隐藏问题
        this.bindBodyScroll();
    },

    /**
     * 绑定虚拟滚动条事件，用于虚拟滚动条控制实际滚动条
     */
    bindVirtualWrapScroll: function () {
        var self = this;
        if (this.$virtualWrap && this.$scrollWrap) {
            this.$virtualWrap.bind("scroll.virtualScroll", function () {
                var left = $(this).scrollLeft();
                self.$scrollWrap.scrollLeft(left);
            });
        }
    },

    /**
     * 绑定页面的上下滚动事件，主要用于判断虚拟滚动条的显示与否
     */
    bindBodyScroll: function () {
        var self = this;
        //绑定 命名空间
        $(window).bind("scroll.bodyScroll", function () {
            if(self.$scrollWrap && self.$virtualWrap){
                var top = $(window).scrollTop();
                var winHeight = $(window).height();
                var wrapTop = self.$scrollWrap.offset().top;
                var wrapHeight = self.$scrollWrap.height();
                var wrapBtmTop = wrapTop + wrapHeight;
                if (winHeight + top < wrapBtmTop) {
                    var scrollLeft = self.$scrollWrap.scrollLeft();
                    self.$virtualWrap.scrollLeft(scrollLeft).show();
                }
                else {
                    self.$virtualWrap.hide();
                }
            }
        });
    },

    /**
     * @param options，同defaultCfg
     * 异步加载了数据或者数据dom有更改时调用该方法
     */
    refresh: function (options) {
        //删除 = 左边jQuery.extend([deep], target, object1, [objectN])
        $.extend(this.config, options || {});
        this.initParam(this.config);
        if (this.$scrollItem.length && this.$scrollWrap.length) {
            //重新改变virtualWrap和table的宽度
            this.createVirtualObj();
            this.bindVirtualWrapScroll();
            /*this.bindWrapScroll();*/
            //重新获取scrollLeft的宽度
            this.$scrollWrap.trigger("scroll");
            $('body').trigger("scroll");
            if(this.$virtualWrap){
                this.$virtualWrap.scrollLeft(this.config.left);
            }
        }
    },

    /**
     * 页面的样式发生变化的时候调用它会重新判断页面的scroll状态
     */
    reload: function () {
        $("body").trigger("scroll");
    }
};
# jquery.scrollBottom
## 问题描述
当页面内容有横向滚动条，同时数据很长使得横向拖动滚动条的时候需要将页面滑动至滚动条出现的地方，用户体验不好，因此写此小插件解决该问题。

## 问题解决
页面内容的横向滚动条一直出现在用户可操作范围内，提升用户体验。

## 外部依赖
jquery.js

## 快速上手
* 引入jquery.js和scrollFixed.js
* 可能出现横向滚动条的div.scroll-wrap及宽度很宽的内容div.scroll-item如下：
~~~html
    <div class="scroll-wrap" style="overflow-x:scroll;width:800px;"><div class="scroll-item" style="width:3000px;height:3000px;"></div></div>




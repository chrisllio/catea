require(["config"],function(e){e.initialize(),require(["UiManager","jquery"],function(e,t){e.init(),e.render("#context","textBox",{},function(){t("body").click(function(){alert(t("#context").execute("value","123").value("ddd").value())})})})}),define("catea",function(){}),define("RequireProxy",[],function(){return{get:require}}),define("textBox",["RequireProxy"],function(e){"use strict";var t=e.get("UiBase");return{parent:"UiBase",class:{init:function(e,t,n,i,u){this._super(e,t,n,i,u)},_initRender:function(){},_bindEvents:function(){},_addValueSubscribers:function(){return this._super()},_addDataSubscribers:function(){return this._super()}},methods:$.extend({},t.methods,{value:function(e){return this._super(e)}}),defaults:$.extend({},t.defaults,{}),settings:$.extend({},t.settings,{valueType:String})}}),define("catea-base",function(){});
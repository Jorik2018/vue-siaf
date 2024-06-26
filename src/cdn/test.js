import Vue from 'vue'
import axios from 'axios'
import Chart from 'chart.js'


import * as olProj from 'ol/proj';
import Map from 'ol/Map'
import View from 'ol/View'
import Collection from 'ol/Collection'
import {Fill, Stroke, Style, Circle, RegularShape} from 'ol/style'
import {Tile,Vector as VectorLayer} from 'ol/layer'
import {OSM,Vector} from 'ol/source'
import Point from 'ol/geom/Point'
import Control from 'ol/control/Control'
import FullScreen from 'ol/control/FullScreen'
import Overlay from 'ol/Overlay'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Translate from 'ol/interaction/Translate'
import Text from  'ol/style/Text'
if (typeof JSON.clone !== "function") {
    JSON.clone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
}
Vue.directive('required', {
	bind(){
		var el=this.el;
		el.vrequired = document.createElement("DIV");
		el.vrequired.className = 'required__message';
		el.vrequired.innerHTML = this.expression;
	}
});
Vue.directive('error', {
	bind(){
		this.el.verror = document.createElement("DIV");
		this.el.verror.className = 'error__message';
		this.el.verror.innerHTML = this.expression;
	}
});
///^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

Vue.directive('valid', {
	bind(el, binding, vnode){
		var me=this;
		console.log(el);
		console.log(me);
		console.log(vnode);
		var validators = {email:/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ };
console.log(binding.expression);
		var regex = validators[binding.expression];
		el.handler = function () {
			/*if(el.vrequired &&el.vrequired.parentNode !== null ){
				el.vrequired.parentNode.removeChild(el.vrequired );
			}
			if(el.verror&&el.verror.parentNode !== null ){
				el.verror.parentNode.removeChild(el.verror );
			}
			if(el.disabled)return;
			if(el.value === "" ){
				if(el.vrequired ){
					el.className = "required";
					el.parentNode.appendChild(el.vrequired);
				}
				return;
			}*/
			if(regex.test(el.value)){
				el.className = "success";
			}else{       
				if(el.verror){
					el.parentNode.appendChild(el.verror);
				}
				el.className = "error";
			}
			return;
		}.bind(me);
		el.addEventListener('input',el.handler);
		//me.vm.$on('hook:compiled',el.handler);
	},
	unbind(){
		//this.el.removeEventListener('input',this.handler);
	}
});

var ol={
	Overlay:Overlay,
	Feature:Feature,
	proj:olProj,
	interaction:{Translate:Translate},
	format:{GeoJSON:GeoJSON},
	geom:{Point:Point},
	control:{Control:Control,FullScreen:FullScreen},
	Map:Map,
	View:View,
	Collection:Collection,
	source:{OSM:OSM,Vector:Vector},
	layer:{Tile:Tile,Vector:VectorLayer},
	style:{Style:Style,Stroke:Stroke,Text:Text,Fill:Fill,Circle:Circle,RegularShape:RegularShape}
}
function outerHeight(elm) {
    var elmHeight, elmMargin;
	elmHeight = elm.offsetHeight;
    if(document.all) {
        elmMargin = parseInt(elm.currentStyle.marginTop, 10) + parseInt(elm.currentStyle.marginBottom, 10)+
			parseInt(elm.currentStyle.paddingTop, 10) + parseInt(elm.currentStyle.paddingBottom, 10);
    } else {
		var style=document.defaultView.getComputedStyle(elm, '');
        elmMargin = 
		parseInt(style.getPropertyValue('padding-top')) + 
		parseInt(style.getPropertyValue('padding-bottom'))+
		parseInt(style.getPropertyValue('margin-top')) + 
		parseInt(style.getPropertyValue('margin-bottom'));
    }
    return (elmHeight+elmMargin);
}
var resize = function () {
    var h=window.innerHeight;
	document.body.children[0].style.height=h+'.px';
    var ph=document.querySelectorAll(".v-layout-north");
    ph=ph[0];
    var pc=document.querySelectorAll(".v-layout-center");
    if(pc&&pc[0]){
		h-=outerHeight(ph);
		pc[0].style.height=h+'px';
		pc[0].style.overflowY='auto';
        var p=pc[0].querySelector(".ui-panel"),i;
        if(p){
			
			p.style.height=pc[0].style.height;
            pc=p.children;
            h-=outerHeight(pc[0]);
			
            if(pc[1]){
				pc[1].style.height=h+'px';
				var e=pc[1].children[0].children,el=[];
				
				for(i=0;i<e.length;i++){
					if(e[i].className=='v-scrollable'||e[i].classList.contains('v-resize')){
						el.push(e[i]);
					}else{
						h-=outerHeight(e[i]);
					}
				}
				h=h/el.length;
				console.log(h);
				for(i=0;i<el.length;i++){
					var event=new Event("parentResize", {bubbles: true});
					event.height=h;
					el[i].style.height=h+'px';
					el[i].dispatchEvent(event);
				}
			}
        }else{
			
            var f=function(el) {
                var style = window.getComputedStyle(el);
                return (style.display === 'none')
            }
            //function isHidden(el) {return (el.offsetParent === null)}
			if(!pc[0].children[0])return;
			console.log(h);
			var items=pc[0].children;
			for(i=0;i<items.length;i++){
                var evt=new Event("parentResize", {bubbles: true});
				evt.height=h;
				items[i].dispatchEvent(evt);
            }
            items=pc[0].children[0].children;
            var vc=[];
            for(i=0;i<items.length;i++){
                if(!f(items[i]))vc.push(items[i]);
            }
            if(vc.length==1){
                vc[0].style.overflowY='auto';
                //se debe remover el padding
                /*var cs=window.getComputedStyle(vc[0]);
                var pt=parseInt(cs.getPropertyValue('padding-top'))||0;
                var pb=parseInt(cs.getPropertyValue('padding-bottom'))||0;
                vc[0].style.height=(h-(ph.offsetHeight+0+40))+'.px';*/
            }
        }
		if(p){
			var pid=p.getAttribute("popup");
			if(!pid)p.setAttribute("popup",pid=_.id());
			var popup=_.storeFunction[pid];
			
			var bu=p.querySelectorAll('.ui-datatable-header .v-button');
			if(bu&&bu.length&&!popup&&window.innerWidth<=700){
				setTimeout(function(){
					popup=document.createElement('ul');
					popup.className='v-popup-2';
					popup.style.backgroundColor='white';
					popup.style.position='absolute';
					popup.style.top='0px';
					popup.style.fontSize='26px';
					popup.style.right='0px';
					popup.style.display='none';
					popup.style.width='200px';
					popup.style.zIndex='12000';
					p.appendChild(popup);
					var mask=null;
					var itemClick=function(){
						//console.log(this);
						popup.style.display='none';
						var id=this.getAttribute('commandId');
						var cmd=document.querySelector('#'+id);
						if(cmd.tagName=='BUTTON')
							cmd.click();
						else 
							cmd.children[0].click();
							//console.log(cmd);
						_.unmask(mask);
					}
					p.style.position='relative';
					var pbutton=document.createElement('div');
					pbutton.style.display='inline-block';
					pbutton.style.backgroundColor='transparent';
					pbutton.style.position='absolute';
					pbutton.className='v-mobil v-table-buttons';
					var i=document.createElement('i');
					i.className='fa fa-bars fa-w-14';
					pbutton.appendChild(i);
					pbutton.style.borderWidth='0px';
					pbutton.style.top='32px';
					pbutton.style.right='0px';
					pbutton.style.padding='6px 11px';
					//pbutton.style.fontSize='26px';
					pbutton.style.zIndex='200';
					pbutton.onclick=function(){
						bu=p.querySelectorAll('.ui-datatable-header .v-button');
						while (popup.firstChild) {
							popup.removeChild(popup.firstChild);
						}
						for(i=0;i<bu.length;i++){
							var ite=document.createElement('li');
							if(!bu[i].id)bu[i].id='c-'+_.id();
							ite.setAttribute('commandId',bu[i].id);
							if(bu[i].tagName=='BUTTON'){
								if(bu[i].disabled)continue;
								ite.appendChild(bu[i].children[0].cloneNode(true));
								ite.appendChild(document.createTextNode(bu[i].value?bu[i].value:bu[i].title));
							}else if(bu[i].children[0].children[1]){
								ite.appendChild(bu[i].children[0].children[1]);//.cloneNode()
								ite.appendChild(document.createTextNode(bu[i].textContent));
							}
							ite.onclick=itemClick;
							popup.appendChild(ite);
						}
						mask=_.mask(popup);
						//popup.style.top=(parseInt(pbutton.style.top)+pbutton.offsetHeight)+'px';
						popup.style.display='block';
						mask.onclick=function(){
							popup.style.display='none';
							_.unmask(mask);
						}
					}
					
					p.appendChild(pbutton);
				
					_.storeFunction[pid]=popup;
				}, 1000);
			}
		}
    }
	
};
setTimeout(resize, 400);
window.addEventListener('resize',function (){
    setTimeout(resize, 400);
});
if (Window.instance == 'undefined'){
    Window.instance=axios;
}
var instance=Window.instance;
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];

            if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
         }
         return to;
    };
}
if (typeof Window._ == 'undefined')Window._={};
var _=Window._;
_=Object.assign(_,{
        remoteServer:'',
	_id:0,
	networkStatus:{connected:true},
	storeFunction:{},
	varMap:{},
	id:function(){
		return ++_._id;
	},
	clean:function(obj) {
		for (var propName in obj) {
			if (obj[propName] === ''||obj[propName] === null || obj[propName] === undefined) {
				delete obj[propName];
			}
		}
		return obj;
	},
	uiParent(e){
		return e.ui||!e?e:_.uiParent(e.$parent);
	},
	closest:function(el, sel) {
		while ((el = el.parentElement) && !((el.matches || el.matchesSelector).call(el,sel)));
		return el;
	},
	processURL:function(s){
		//console.log(s);
		return s;
	},
	loadCSS:function(url){
		var head  = document.getElementsByTagName('head')[0];
		var link  = document.createElement('link');
		//link.id   = cssId;
		link.rel  = 'stylesheet';
		link.type = 'text/css';
		link.href = url;
		link.media = 'all';
		head.appendChild(link);
	},
	go:function(u){
		window.location = u;
	},
	getCurrentPosition:function() {
		return new Promise(function(res, rej){
			if(_.location){
				var id='result'+_.id();
				_[id]=function(r){
					delete _[id];
					if(r.coords){
						res(r);
					}else
						rej(r);
				};
				_.location(id);
			}else if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(res, rej);
			}
		})
	},
	URL:function(path){
		var me=this;
		me.location=window.location;
		me.path=path?path:window.location.pathname;
		var h=me.path.split('?');
		if(h.length>1){
			me.path=h[0];
			h=h[1].split('#');
			me.query=h[0];
		}else{
			
			h=h[0].split('#');
			me.path=h[0];
		}
		me.get=function(key,def){
			if(me.query){
				var kvp=me.query.split('&');
				var i = kvp.length;
				var x;
				while (i--) {
					x = kvp[i].split('=');
					if (x[0] == key) {
						return x[1];
					}
				}
			}
			return def;
		};
		me.put=function(key,value){
			key = encodeURI(key);
			value = encodeURI(value);
			var kvp =me.path.split('?');
			if(kvp.length>1)kvp=kvp[1].split('&');
			var i = kvp.length;
			var x;
			while (i--) {
				x = kvp[i].split('=');
				if (x[0] == key) {
					x[1] = value;
					kvp[i] = x.join('=');
					break;
				}
			}
			if (i < 0) {
				kvp[kvp.length] = [key, value].join('=');
			}
			//this will reload the page, it's likely better to store this until finished
			//document.location.search = kvp.join('&'); 
			//console.log('pathname='+me.location.pathname);
			//console.log('query='+kvp.join('&'));
			//console.log('hash='+me.location.hash);
			return me.location.pathname+'?'+kvp.join('&')+me.location.hash;
		}
	},
	loadScript:function(url, callback){
		// adding the script tag to the head as suggested before
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = url;
		// then bind the event to the callback function 
		// there are several events for cross browser compatibility
		script.onreadystatechange = callback;
		script.onload = callback;
		// fire the loading
		head.appendChild(script);
	}
});
_.getLocation=_.getCurrentPosition;
function n(v){
    v=v?(v==''?null:Number(''+v)):0
    return v;
}
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
Vue.mergeDeep = function() { 
    var target=arguments[0];
    var sources=[];
    for(var i=1;i<arguments.length;i++)sources.push(arguments[i]);
//Vue.mergeDeep = function(target, ...sources) {
    if (!sources.length) return target;
    //Se obtiene el primer elemento de source
    var source = sources.shift(),nv;
    //const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (var key in source) {
        //for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]){nv={};nv[key]={};Object.assign(target,nv);}
                Vue.mergeDeep(target[key], source[key]);
            } else {
                nv={};
                nv[key]= source[key];
                Object.assign(target, nv);
                //Object.assign(target, { [key]: source[key] });
            }
        }
    }
    var args=[];
    args.push(target);
    args.concat(sources);
    return Vue.mergeDeep.apply(null,args);
    //return mergeDeep(target, ...sources);
}
_.unmask=function (m){
	if(m){
		m.style.display = "none";
		if(m.parentNode)
		m.parentNode.removeChild(m);
	}
}
_.mask=function (ms,cfg){
    if(!document.body)return;
	var w=window;
    var center = document.createElement("div"); 
    center.style='top:50%;transform:translate(-50%,-50%);position:absolute;width:100%;z-index:2';
    var s=center.style;
    s.left='50%';
    s.textAlign='center';
    if(ms!==false){
        if(ms instanceof Element){
			center=ms;//.append(ms);
		}else{
			if(ms){
				var d=document.createElement('div');
				d.innerHTML=ms;
				center.append(d);
				center.style="padding:4px;margin-bottom:5px;color:white;font-size:24px;text-align:center"
			}
			var img=document.createElement('div');
			s=img.style;
			s.width='100%';
			s.height='180px';
			img.className='loading';
			s.background='url('+require('@/cdn/images/loading.svg')+') no-repeat top center';
		}
    }
    var p=document.createElement('div');
	
	s=p.style;
	s.height='100%';w.innerHeight;
	s.top='0px';
	s.position='absolute';
	s.left='0'
	s.zIndex=10000;
	s.width='100%';
    var bg=document.createElement('div');
	
	s=bg.style;
	s.height='100%';
	s.width='100%';
	s.top='0';
	s.position='absolute';
	s.left='0';
	s.backgroundColor='rgba(0,0,0,0.5)';
        if(cfg&&cfg.opacity)s.opacity=cfg.opacity;
        if(cfg&&cfg.backgroundColor)s.backgroundColor=cfg.backgroundColor;
    p.appendChild(bg);
    p.appendChild(center);  
    if(img)
	center.appendChild(img); 
	document.body.appendChild(p);
    return p;
}
Vue.pad = function (num, size) {
    var s = num + "";
    while (s.length < size)
        s = "0" + s;
    return s;
};
Vue.filter('number', function (s/*, type*/) {//s usa   d|date('time')
    if (s) {
        //console.log('number='+s);
        //https://blog.abelotech.com/posts/number-currency-formatting-javascript/
        return s.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
    }
    return s;
});
Vue.filter('date', _.toDate=(s, type)=>{//s usa   d|date('time')
    if (s) {
        var pad = Vue.pad,d;
        if(s instanceof Date){
            d = s;
        }else 
			if(typeof s === 'string'){
            var t = s.split('T');
            d = t[0].split('-');
            if(t.length>1){
                t = t[1].split(':');
                d = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]),
                    parseInt(t[0]), parseInt(t[1]), t.length > 2 ? parseInt(t[2]) : 0);
            }else if(d.length>2){
                d = new Date(parseInt(d[0]), parseInt(d[1]) - 1, parseInt(d[2]));
            }else{
                d = new Date(s);
            }
        }else{        
            d = new Date(s);
        }
        if(type ==1){
            s=d;
        }else if (type == 'time a'){
            if (typeof s === 'string' || s instanceof String){
                s=s.split(':');
                var h=s[0];
                s=pad(h>12?(h-12):h, 2)+':'+s[1]+':'+s[2]+' '+(h>12?'PM':'AM');
            }else{
            
            h=d.getHours();
            s = pad(h>12?(h-12):h, 2) + ":" + pad((d.getMinutes()), 2)+(d.setSeconds()? ":" + pad(d.setSeconds(), 2):'')+' '+(h>12?'PM':'AM');
            }
            }else if (type == 'date-')
            s = pad(d.getFullYear(), 4)+ "-" + pad((d.getMonth() + 1), 2) + "-" + pad(d.getDate(), 2);
        else if (type == 'dMY'||type == 'date')
            s = pad(d.getDate(), 2) + "/" + pad((d.getMonth() + 1), 2) + "/" + pad(d.getFullYear(), 4) + '';
        else
            s = pad(d.getDate(), 2) + "/" + pad((d.getMonth() + 1), 2) + "/" + pad(d.getFullYear(), 4) + ' ' + pad(d.getHours(), 2) + ":" + pad((d.getMinutes()), 2);

    }
    return s;
});
function findForm(e) {
    var parent = e.parentNode;
    if (parent && parent.tagName != 'FORM') {
        parent = findForm(parent);
    }
    return parent;
}
_.whichChild = function (e) {
    var i = 0;
    while ((e = e.previousSibling) != null)
        ++i;
    return i;
};
var stack = [];
window.onpopstate = function (/*e*/) {
    console.log(stack.pop());
    console.log(history);
}
function MsgBox(m,cb,b){
    if(!b)b=['OK'];
	//si el elemento debe cargarse en un dialog
        if(!document.body) return;
    var overlay = document.createElement("div");
    overlay.classList.add("v-overlay");
    overlay.style.padding = "40px";
	overlay.style.zIndex = "2000";
    document.body.appendChild(overlay);
    var dialog = document.createElement("div");
	var dialogContent = document.createElement("div");
	var msgContent = document.createElement("div");
	var buttons = document.createElement("div");
	
        buttons.className="v-msgbox-buttons";
        dialog.classList.add("v-dialog");
        dialog.classList.add("v-msgbox");
        msgContent.innerHTML = m;
        dialog.setAttribute("path", _.currentPath);
        dialog.setAttribute("callback", nid);
        var closeListener=function () {
            dialog.style.display = "none";
            overlay.style.display = "none";
			
			dialog.parentNode.removeChild(dialog);
			overlay.parentNode.removeChild(overlay);
			if(cb)cb(this.getAttribute("index"));
            //_.RSZ();
        };
        for(var i=0;i<b.length;i++){
            var button = document.createElement("button");
            button.innerHTML=b[i];
            button.type="button";
            button.setAttribute("index",i);
            button.className="v-button ui-widget ui-state-default ui-corner-all";
            buttons.appendChild(button);
            button.addEventListener("click", closeListener);
        }
	dialogContent.className="v-dialog-content v-widget-content";
	dialogContent.appendChild(msgContent);
	dialogContent.appendChild(buttons);
	dialog.appendChild(dialogContent);
    overlay.appendChild(dialog);
    overlay.style.visibility = "unset";
    overlay.style.opacity = "unset";
    overlay.style.overflow = "auto";
    dialog.style.margin = "0 auto";
    dialog.style.position = "unset";
    var nid = 'v_' +0;// _.id();
	
		/*var acl=h.querySelector('.ui-js-close');
    if (!acl) {
        var span = document.createElement("span");
        span.style.top = "5px";
        span.style.right = "5px";
        h.style.position = "relative";
        span.style.position = "absolute";
        span.className = "ui-icon ui-icon-closethick";
        acl = document.createElement("a");
        acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
        acl.appendChild(span);
        h.appendChild(acl);
        acl.addEventListener("click", closeListener);
    }*/
	
    resize();
	
}
_.open = function (pa) {
    //por defecto todo es get
	var s,i,nid,h;
    if(pa.cfg)_.cfg=pa.cfg;
    if(typeof pa=== 'string'){
		
        _.open({path:pa});
    }else if(pa.href){
        _.open({path:pa.href,target:pa});
    }else if (!pa.data) {
        _.currentPath=pa.path;
        axios.get((pa.path + '?modal').replace(/([^:]\/)\/+/g, "$1"),{
                    params:pa.params?pa.params:null
                })
                .then(function(response){
                    response.class=pa.class?pa.class:'';
                    response.path=pa.path;
                    response.result=pa.result;
                    _.open(response);
                });
    }else if(pa.class==='v-panel'){
		//debe usarse el path modelo no el path original, considera modelo='/admin/t/%/edit' y current='/admin/t/1212/edit'
        var page=document.getElementById(_.currentPath);
        if(page){
            page.parentNode.removeChild(page);
            page=null;
        }
		var pageContent = document.getElementById('page-content');
        var cchi=pageContent.children;
        if(cchi.length>0){
            cchi=cchi[0];
            if(cchi.classList)cchi.classList.add("hide");else
            cchi.className='hide';
            document.body.appendChild(cchi);
        }
        
        var overlay0 = document.createElement("div");
        document.body.appendChild(overlay0);
        if(!page){
            page = document.createElement("div");
            page.innerHTML = pa.data;
            page.className='v-card';
			page.id=_.currentPath;
            page.setAttribute("path", _.currentPath);
            page.setAttribute("callback", nid);
            overlay0.appendChild(page);
            page.innerHTML = pa.data;
            
            //document.body.appendChild(page);
            //di.appendChild(page);
            s = page.getElementsByTagName('script');
            for (i = 0; s.length > i; i++){
//                console.log(s[i]);
                if(s[i].src){
                    var script = document.createElement("script");
                    script.src = s[i].src;
                    document.head.appendChild(script);
                }else{
                    eval(s[i].innerHTML);
                }
            }
            pageContent.innerHTML = '';
            pageContent.appendChild(page);
        }
        
        if(page.classList)page.classList.remove("hide");
        nid = 'v_' + _.id();
        h=page.querySelector('.ui-panel-titlebar');
        /*var acl=h.querySelector('.ui-js-close');
        if (!acl) {
            var span = document.createElement("i");
            span.style.top = "9px";
            span.style.right = "8px";
            h.style.position = "relative";
            span.style.position = "absolute";
            span.className = "fa fa-times fa-sm";
            acl = document.createElement("a");
            acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
            acl.appendChild(span);
            h.appendChild(acl);
            acl.addEventListener("click", function () {
            page.style.display = "none";
            overlay.style.display = "none";
            //resize();
            });
        }*/
        resize();
    }else{
        //si el elemento debe cargarse en un dialog
        //console.log(pa);
        var overlay = document.createElement("div");
        overlay.classList.add("v-overlay");
        overlay.style.padding = "40px";
        document.body.appendChild(overlay);
        var dialog = document.createElement("div");
        dialog.classList.add("v-dialog");
        dialog.style.margin = "0 auto";
        dialog.style.position = "unset";
        if(typeof pa.data=='string' ){
            dialog.innerHTML = pa.data;
            s = dialog.getElementsByTagName('script');
            overlay.appendChild(dialog);
            for(i=0;s.length > i;i++)eval(s[i].innerHTML);
        }else{
            dialog.appendChild(pa.data);
            overlay.appendChild(dialog);
        }
        
        dialog.setAttribute("path", _.currentPath);
        dialog.setAttribute("callback", nid);
        overlay.style.visibility = "unset";
        overlay.style.opacity = "unset";
        overlay.style.overflow = "auto";
        nid = 'v_' + _.id();
        //Este pertenece al v-panel ya q el titulo es de aqui y lo nuevo es el dalog y overlay
        //Esto implica que el contenido del dialog hay un 
        h=dialog.querySelector('.ui-panel-titlebar');
        //Lo q se debe hacer si no existe titlebar es poner otro control para cerrar
        var acl=h.querySelector('.ui-js-close');
        if (!acl) {
            var span = document.createElement("i");
            span.style.top = "6px";
            span.style.right = "6px";
            h.style.position = "relative";
            span.style.position = "absolute";
            span.style.color = "white";
            span.className = "fa fa-window-close v-dialog-close";
            acl = document.createElement("a");
            acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
            acl.appendChild(span);
            h.appendChild(acl);
            acl.addEventListener("click", function () {
                dialog=acl.parentNode.parentNode.parentNode;
                overlay=acl.parentNode.parentNode.parentNode.parentNode;
                //lo q se debe buscar es el contenedor dialog
                dialog.style.display = "none";
                overlay.style.display = "none";
                resize();
            });   
        }
        if(pa.class==='v-search'){
            var d=dialog;
            d.className=d.className+' '+pa.class;
            d.style.width="100%";
            d.style.height="calc(100% - 2px)";
            var children=d.querySelector('div');
            var f=d.querySelector('form');
            var t=d.querySelector('.v-datatable');
            var tb=d.querySelector('.ui-datatable-scrollable-body');
            children.style.height='calc(100% - 2px)';
            children.style.overflowY='auto';
            children.children[1].style.padding='0px';
            children.children[1].style.height='calc(100% - 33px)';
//            var form=children.children[1].children[0];
            f.style.height='100%';
            f.style.overflowY='auto';
//            var div=form.children[0];
            t.style.height='calc(100% - 52px)';
            tb.style.height='calc(100% - 72px)';
            tb.style.overflowY='auto';
            
            var pag=d.querySelector('.ui-paginator');
            pag.style.display='inline-block';
            f.appendChild(pag);
            tb = document.createElement("button");
            tb.innerHTML='Recuperar';
            tb.style.padding='4px 16px';
            tb.className="_ ui-widget ui-state-default ui-corner-all v-button ui-button-text-only";
            var vue=_.varMap[children.getAttribute("vueid")];
            tb.onclick=function(e){
                e.preventDefault();
                vue.refresh();
                
            };
            f.appendChild(tb);
            tb = document.createElement("button");
            tb.innerHTML='Seleccionar';
            tb.style.padding='4px 16px';
            tb.className="_ ui-widget ui-state-default ui-corner-all v-button ui-button-text-only";
            vue=_.varMap[children.getAttribute("vueid")];
            tb.onclick=function(e){
                e.preventDefault();
                var d=[];
                var t=vue.$children[0].$children[0];
                for(i=0;i<t.selected.length;i++){
                    d.push(t.data[t.selected[i]]);
                }
                vue.close();
                pa.result(d,t);
            };
            f.appendChild(tb);
        }resize();
    }
};
_.showerror = function (e, m) {
    if (e.classList)
        e.classList.remove("v-error");
    var previousSibling = e.previousElementSibling;
    if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
        previousSibling.parentNode.removeChild(previousSibling);
    }
    previousSibling = e.previousSibling;
    while (previousSibling && previousSibling.nodeType != 1) {
        previousSibling = previousSibling.previousSibling;
    }
    if (!previousSibling) {
        previousSibling = e.parentElement.previousSibling;
        while (previousSibling && previousSibling.nodeType != 1) {
            previousSibling = previousSibling.previousSibling;
        }
    }
    if (m === false)
        return;
    var error = document.createElement("div");
    error.innerHTML = m ? m : "Este campo es requerido!";
    //ok = false;
    error.classList.add("v-error");
    e.classList.add("v-error");
    e.parentNode.insertBefore(error, e);
};

_.extends={
		watch: {
			$route(v) {
				this.changeRoute(v);
				console.log('watched create ');
				resize();
			}
		},
		computed:{
			baseURL(){return axios.defaults.baseURL;},
            online(){return this.app.networkStatus?this.app.networkStatus.connected:null;},
            user:function(){
				return this.app.session;},
			app:function(){
				return window.app;},
            perms:function(){
				return this.user.perms;},
			rowSelectedCount(){
                var me = this;
                if(!me.$children[0])return 0;
                var t = me.$children[0].$children[0];
                return t ? t.selected.length : 0;
            }
		},
        data: function(){var me=this;return{
            filters:{},
			ui:me,
            //rowSelectedCount: 0,
            row: {}
        }},
        updated: function () {
//            console.log(this);
        },
        mounted: function () {
            var me = this;
            var vueid=_.id();
            //error cuando se carga un mapa con v-panel el mapa de turismo  es ejemplo
            if(me.$el&&me.$el.setAttribute){
				me.$el.setAttribute("vueid",vueid);
			}
            _.varMap[vueid]=me;
            me.ddd(me.$root);
			console.log('component mounted');
        },
		methods: {
			changeRoute(v){console.log(v)},
			pad:Vue.pad,
			key(){return Math.random();},
			submitFile:function(f,name,cb) {
				var formData = new FormData();
				name=name?name:f.name.replace(/[^\w\s.]/gi, '');
				formData.append('filename', name);
				formData.append('file', f,name);
				axios.post('/api/file/upload', formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
						filename: name
					}
				}).then(function (r) {
					cb(r.data);
				}).catch(function () {
					console.log('FAILURE!!');
				});
			},
			go:function(e){window.o(e);},
            ddd:function(/*o*/){
//                for(var i=0;i<o.$children.length;i++){
//                    var child=o.$children[i];
//                    console.log(child);
//                    if (child.$vnode.tag && child.$vnode.tag.includes("v-table")) {
//                        //child.setColumns(columns);
//                    }else{
//                        this.ddd(child);
//                    }
//                }
            },
            rowCreated:function(r) {
                this.row = r;
            },
            getSelected:function(){
                var me = this;
                var t = me.$children[0].$children[0];
                var s=[];
                for(var i=0;i<t.selected.length;i++){
                    s.push(t.data[t.selected[i]]);
                }
                return s;
            },
            getRowSelectedCount:function() {
                var me = this;
                var t = me.$children[0].$children[0];
                return t ? t.selected.length : 0;
            },
            create:function() {
                var me = this;
                var action = me.$children[0].action;
                if (!action)
                    action = window.location.pathname;
                action=_.processURL(action);
				if(window.o){
					window.o(action+'/create');
				}else{
					instance.get(_.currentPath = (action + '/create').replace(/([^:]\/)\/+/g, "$1") + '?modal')
							.then(_.open).catch(me.error);
				}
            },
			edit:function() {
                var me = this;
                var f = me.$children[0];
                var action = f.action;
                if (!action)
                    action = window.location.pathname;
                var t = me.$children[0].$children[0];
                var id=t.data[t.selected[0]][t.rowKey];
				if(t.data[t.selected[0]].tmpId)id=-t.data[t.selected[0]].tmpId;
                if(me.getSelectedId)id=me.getSelectedId(t.data[t.selected[0]]);
                if(window.o){
					window.o(action + '/' + id + '/edit');
				}else{
					axios.get((_.currentPath = (action + '/' + id + '/edit').replace(/([^:]\/)\/+/g, "$1")) + '?modal')
							.then(me.open).catch(me.error);
				}
            },
            get:function(part) {
                var me = this;
                var p = me.$el;
                //Se debe buscar si abajo esta el form
                var f = p.querySelector("form");
                var action = f.action;
                //console.log(me.apiLink(action) + '/' + part);
                window.location.href = me.apiLink(action) + '/' + part;
            },
            error:function(e) {
                //console.log(e);
                alert(e);
                //this.open({data:''+e});
            },
            destroy:function() {
                var me = this;
                var f = me.$children[0];
                var action = f.action;
                if (!action)
                    action = window.location.pathname;
                var t = me.$children[0].$children[0];
				console.log(t);
				var key=t.$attrs.rowkey;
				if(!key)key=t.rowKey;
                if (!key)
                    return alert('Table don`t have defined attribute \'rowkey\'');
				var dat=t.data[t.selected[0]];
                var id = dat[key];
				if(dat.tmpId){
					MsgBox('Esta seguro que desea eliminar los registros seleccionados?', function (r) {
						if (r == 0) {
							var dd=JSON.parse(localStorage.getItem(t.storage)),c=0;
							for(var k=t.selected.length-1;k>=0;k--){
								dat=t.data[t.selected[k]];
								if(dat.tmpId)
									for(var j=0;j<dd.length;j++){
										if(dd[j].tmpId==dat.tmpId){
											c++;
											dd.splice(j, 1);
											t.data.splice(t.selected[k], 1);
											break;
										}
									}
							}
							if(c)MsgBox(c+' Registros eliminado');
							localStorage.setItem(t.storage,JSON.stringify(dd));
							t.rowSelect(null,-1);
						}
					}, ['SI', 'NO']);
				}else{
					MsgBox('Esta seguro que desea eliminar el registro seleccionado?', function (r) {
						if (r == 0) {
							axios.delete(t.src + '/' + id).then(function () {
								MsgBox('Registro eliminado');
								var id = dat.id;
								for (var i = dat.length - 1; i >= 0; i--) {
									if (dat[i][key] == id) {
										dat.splice(i, 1);
									}
								}
							}).catch(me.error);
						}
						t.rowSelect(null,-1);
					}, ['SI', 'NO']);
				}
                   
                /*if (confirm("Esta seguro que desea eliminar el registro seleccionado?"))
                    axios.delete(me.apiLink(action) + '/' + id).then(function (r) {
                        
                    }).catch(me.error);*/

            },
            apiLink:function(str) {
                return str.replace(_.contextPath, _.contextPath + '/api');
            },
            open(response, path, o) {
				var me = this,el;
				if(typeof response=='string'&&me.$router){
					me.app.o(response);
				}else if(response.$el){
					response=response.$el;
					path={};
				}else if(response instanceof HTMLElement){
					path={};
				}else if(response.target){
					el=response.target;
					return me.open(el.pathname?el.pathname:el.href);
				}else if (response === 'GET') {
					if(typeof path=='string'){
						var cfg={path:_.currentPath = path + (typeof o=='string'?'/' + o:'')};
						if(typeof o=='function'){
							cfg.result=o;
						}else if(typeof o=='object'){
							cfg=Vue.mergeDeep(cfg,o);
						}
						return me.open(response,cfg);
					}else if(!path.data){
						//Tiene q buscarse el elemt si existe
						//console.log('path='+path.path);
						el=document.querySelector('[path=\''+path.path+'\']');
						//console.log(el);
						if(el){
							var dd=document.querySelector('#layoutUnit-center > .ui-layout-unit-content,#page-content');
							console.log(dd);
							for (var i=0;i<dd.children.length;i++) {
								//Se ocultan todas las demas paginas
								if(dd.children[i].style){
									if(dd.children[i].className=='ui-panel'&&dd.children[i].style.display!='none'){
										backPanel=dd.children[i];
									}
									dd.children[i].style.display='none';
								}
							}
							el.style.removeProperty('display');
							return el;
						}else
							return axios.get((path.path + '/?modal').replace(/([^:]\/)\/+/g, "$1"))
								.then((r)=>{
									r.class=path.class?path.class:'';
									r.path=path.path;
									r.result=path.callback?path.callback:path.result;
									me.open(response,r);
								}).catch(me.error);
					}
				}else if(!response.data){
					return me.open('GET',response,path);
				}else if(response.data){
					path=response;
				}
           var dialog,nid =_.id(),scriptDom=[],for_,ifor=0;
           if(response instanceof HTMLElement){
                dialog=response;
                dialog.classList.add("v-dialog");
           }else{
                dialog = document.createElement("div");
                dialog.classList.add("v-dialog");
                dialog.innerHTML = path.data;
                var s = dialog.getElementsByTagName('script');
                //console.log('patttt=' + _.currentPath);
                dialog.setAttribute("path", _.currentPath);
                var ld=dialog.children;
                console.log(s);
                for(var k=0;k<s.length;k++){
                    scriptDom.push(s[k]);
                }
                for(k=0;k<ld.length;k++){
                    console.log(ld[k].tagName);
                    if(ld[k].tagName=='V-FORM'||ld[k].tagName=='V-PANEL'){
                        for_=ld[k];
                        ifor=k;
                    }
                }
                
            }
           
            var backPanel;
            if(for_&&for_.classList.contains('panel')){
                //Si elemto tiene declarado el id se debe considerar que es 
                if(for_.id){
                    window.currentEl='#'+for_.id;
                }else{
                    var clsId='cls-id-'+_.id();
                    for_.classList.add(clsId);
                    window.currentEl='.'+clsId;
                }
                dd=document.querySelector('#layoutUnit-center > .ui-layout-unit-content,#page-content');
                for (i=0;i<dd.children.length;i++) {
                    //Se ocultan todas las demas paginas
                    if(dd.children[i].style){
                        if(dd.children[i].className=='ui-panel'&&dd.children[i].style.display!='none'){
                            backPanel=dd.children[i];
                        }
                        dd.children[i].style.display='none';
                    }

                }
                //se agrega el dialog recuperado y se genera
                dd.appendChild(dialog);
                
                console.log(scriptDom);
                for (var l2 = 0; scriptDom.length > l2; l2++) {
                    //console.log(s[l2]);
                    try{
                        eval(scriptDom[l2].innerHTML);
                    }catch(e){console.error(e)}
                }
                dialog.style.display='none';
                var td;
                var aux=dialog.children[ifor];
                //todo los elementos del dialog son agregados al panel
                while (dialog.children.length > 0) {
                    if(!td)td=dialog.children[0];
                    dd.appendChild(dialog.children[0]);
                }
                dialog.parentNode.removeChild(dialog);
                dialog=aux;
                console.log(path);
                dialog.setAttribute("path", path.path);
            }else{
                
                var overlay = document.createElement("div");
                console.log('create overlay');
                overlay.classList.add("v-overlay");
                overlay.style.padding = "40px";
                document.body.appendChild(overlay);
                overlay.appendChild(dialog);
                
                if(!(response instanceof HTMLElement)){
                    for (l2 = 0; s.length > l2; l2++) {
                        console.log(s[l2]);
                        try{
                            eval(s[l2].innerHTML);
                        }catch(e){console.error(e)}
                    }
                }
                overlay.style.visibility = "unset";
                overlay.style.opacity = "unset";
                overlay.style.overflow = "auto";
                dialog.style.margin = "0 auto";
                dialog.style.position = "unset";
                var resize=()=>{
                    dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
                    if(window.innerWidth<600){
                        var dc=dialog.querySelector('.v-dialog-content');
                        //console.log(dc);
                        var h = dialog.querySelector('.v-panel-titlebar');
                        console.log(h.clientHeight);
                        var ih=window.innerHeight-94-h.clientHeight;
                        dc.style.height = ih+"px";
                    }
                };
                window.addEventListener('resize', resize);
                if(path.class==='v-search'){
                    var d=dialog;
                    d.className=d.className+' '+path.class;
                    d.style.width="100%";
                    d.style.height="calc(100% - 2px)";
                    var children=d.querySelector('div');
                    var f=d.querySelector('form');
                    var t=d.querySelector('.v-datatable');
                    var tb=d.querySelector('.v-datatable-scrollable-body');
                    children.style.height='calc(100% - 2px)';
                    children.style.overflowY='auto';
                    children.children[1].style.padding='0px';
                    children.children[1].style.height='calc(100% - 33px)';
                    f.style.height='100%';
                    f.style.overflowY='auto';
                    t.style.height='calc(100% - 52px)';
                    tb.style.height='calc(100% - 72px)';
                    tb.style.overflowY='auto';
                    var pag=d.querySelector('.v-paginator');
                    pag.style.display='inline-block';
                    f.appendChild(pag);
                    tb = document.createElement("button");
                    tb.innerHTML='Recuperar';
                    tb.style.padding='4px 16px';
                    tb.className="_ ui-widget v-state-default ui-corner-all v-button ui-button-text-only";
                    var vue=_.varMap[children.getAttribute("vueid")];
                    tb.onclick=(e)=>{
                        e.preventDefault();
                        vue.refresh();
                    };
                    f.appendChild(tb);
                    tb = document.createElement("button");
                    tb.innerHTML='Seleccionar';
                    tb.style.padding='4px 16px';
                    tb.className="_ ui-widget v-state-default ui-corner-all v-button ui-button-text-only";
                    vue=_.varMap[children.getAttribute("vueid")];
                    tb.onclick=(e)=>{
                        e.preventDefault();
                        var d=[];
                        var t=vue.$children[0].$children[0];
                        for(i=0;i<t.selected.length;i++){
                            d.push(t.data[t.selected[i]]);
                        }
                        path.result(d,t);vue.close();
                    };
                    f.appendChild(tb);
                }
                resize();
            }
            _.storeFunction[nid]=(o)=>{
                if(path.result){
                    path.result(o);
                }
                if (o === true)
                    me.refresh();
            }
            dialog.setAttribute("callback", nid);
            var h = dialog.querySelector('.v-panel-titlebar');
            if(h){
                var acl = h.querySelector('.ui-js-close');
                var close=()=>{
                    dialog.style.display = "none";
                    overlay=dialog.parentNode;
                    if(overlay.classList.contains('v-overlay')){//para los dialog
                        overlay.style.display = "none";
                        dialog.parentNode.removeChild(dialog);
                        overlay.parentNode.removeChild(overlay);
                    }
                    if(backPanel){
                        dialog.parentNode.removeChild(dialog);
                        backPanel.style.display='block';
                    }
                    _.resize();
                }
                window.onkeyup=(event)=>{
                    if (event.keyCode == 27) {
                        close();
                    }
                }
                if (!acl) {
                    var span = document.createElement("i");
                    span.style.top = "6px";
                    span.style.right = "6px";
                    h.style.position = "relative";
                    span.style.position = "absolute";
                    span.style.color = "white";
                    span.className = "fa fa-window-close v-dialog-close";
                    acl = document.createElement("a");
                    acl.className = "ui-js-close v-dialog-titlebar-icon v-dialog-titlebar-close ui-corner-all";
                    acl.appendChild(span);
                    h.appendChild(acl);
                    acl.addEventListener("click",close);
                }
            }
            dialog.style.display='block';
            _.resize();
            document.documentElement.style.overflow = 'hidden';  // firefox, chrome
            document.body.scroll = "no"; // ie only
        },
        
			saveAs(url,o,config){
				if(typeof o=='string')o={body:o};
				var cfg=(typeof config=='string')?{fileName:config}:config;
				if(!cfg)cfg={};
				axios.post(url, o, {
					responseType: 'blob'
				}).then((response) => {
					const url = window.URL.createObjectURL(new Blob([response.data]));
					const link = document.createElement('a');
					link.href = url;
					if(!cfg.fileName){
						var disposition=response.headers['content-disposition'];
						console.log(response.headers);
						console.log(response);
						console.log('disposition='+disposition);
						if (disposition && disposition.indexOf('attachment') !== -1) {
							var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
							var matches = filenameRegex.exec(disposition);
							if (matches != null && matches[1]) { 
								cfg.fileName = matches[1].replace(/['"]/g, '').trim();
							}
						}
						
					console.log('cfg.fileName='+cfg.fileName);
					
					}
					link.setAttribute('download', cfg.fileName);
					document.body.appendChild(link);
					link.click();
				});
			},
			close(ok) {
				if(ok.$el)ok=ok.$el;
				var dlg=(ok instanceof HTMLElement)?ok:null;
				try{
					if(!dlg&&event.target instanceof HTMLElement)
						dlg=_.closest(event.target, '.v-dialog');
				}catch(e){
					console.log(e);
				}
				if(!dlg)dlg = this.$el.parentElement;
				var mask = dlg.parentElement;
				if(!mask&&window.app.$router){
					window.app.$router.back();
					return;
				}
				dlg.style.display = "none";
				if((' ' + mask.className + ' ').indexOf(' v-overlay ') > -1)mask.style.display = "none";
				else mask=null;
				_.resize();
				var cb=_.storeFunction[dlg.getAttribute("callback")];
				if(cb)cb(ok);
				dlg.parentNode.removeChild(dlg);
				if(mask)mask.parentNode.removeChild(mask);
				document.documentElement.style.overflow = 'auto';  // firefox, chrome
				document.body.scroll = "yes";
				//si history esta activo
				//history.back();
			},
            refresh:function() {
                //Para que funcione se debe tener el listado respetando la estructura 
                var me = this;
                var t = me.$children[0].$children[0];
                t.load();
            },
			sync(){
				var me=this;
				var p = me.$el;
                var f = p.querySelector("form");
				var action = f.getAttribute('action');
				//console.log('Action='+action);
				if (!action) {
					action = me.$el.parentNode.getAttribute('path');
					//debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
					var tc = action.split('/');
					if (tc[tc.length - 1] == 'edit')
						tc = tc.splice(0, tc.length - 2);
					else
						tc = tc.splice(0, tc.length - 1);
					action = me.apiLink(tc.join('/'));
				}
				var t = me.$children[0].$children[0];
				action=t.src;
				//debe recorrerse toda los registros seleccionados
				//ponerlos gris
				var dats=JSON.parse(localStorage.getItem(t.storage));
				var sel=t.selected;
				var sel2=[];
				var sel3=[];
				for(var i=0;i<sel.length;i++){
					var item=t.data[sel[i]];
					if(item.tmpId&&!item.tmpSynchronized){
						for(var j=0;j<dats.length;j++){
							if(dats[j].tmpId==item.tmpId){
								var o=JSON.clone(dats[j]);
								delete o.id;
								delete o.tmpSynchronized;
								if(o.ext){
									o.ext.tmpId=o.tmpId;
									delete o.tmpId;
								}
								sel3.push(o);
								sel2.push(j);
							}
						}
					}
				}
				if(sel2.length>0){
					axios.post(action+'/bulk', sel3).then(function (r){
						var d=r.data;
						for(var k=0;k<d.length;k++){
							for(var j=0;j<dats.length;j++){
								if(d[k].ext&&d[k].ext.tmpId==dats[j].tmpId||d[k].tmpId==dats[j].tmpId){
									if(d[k].ext&&dats.ext){
										dats[j].ext.error=d[k].ext.error;
									}
									if(d[k].id)
									dats[j].id=d[k].id;
									dats[j].tmpSynchronized=1;
								}
							}
						}
						console.log(dats);
						localStorage.setItem(t.storage,JSON.stringify(dats));
						//dat.id=r.data.id;
						//t.$emit('synchronized',{data:dat,result:r.data,index:kk,count:tr});
						//dat.tmpSynchronized=1;
						//dats[kk]=dat;
						//sendf(dats,k0+1,te+1);
						me.refresh();
					}).catch(function (r) {
						if(r.response){
							MsgBox(r.response.data);
						}else{
							console.log(r);
						}
					});
				}else if(sel2.length>0){
					var tr=sel2.length;
					var fend=function(v){
						MsgBox(v+' registro fueron grabados exitosamente!',function(){});
						localStorage.setItem(t.storage,JSON.stringify(dats));
						me.refresh();
					}
					var sendf=function(dats,k0,te){
						if(k0==sel2.length){fend(te);return;}
						var kk=sel2[k0];
						var dat=dats[kk];
						var o=JSON.clone(dat);
						if (o.tmpSynchronized||me.process&&me.process(o)===false){
							sendf(dats,++k0,te);
						}else{
							if(o.id<=0)delete o.id;
							delete o.tmpId;
							console.log('sending '+kk);
							console.log(o);
							axios.post(action, o).then(function (r){
								dat.id=r.data.id;
								t.$emit('synchronized',{data:dat,result:r.data,index:kk,count:tr});
								dat.tmpSynchronized=1;
								dats[kk]=dat;
								sendf(dats,k0+1,te+1);
							}).catch(function (r) {
								if(r.response){
									MsgBox(r.response.data);
								}else{
									console.log(r);
								}
								sendf(dats,k0+1,te);
							});
						}
					};
					sendf(dats,0,0);
				}
			},
            save:function() {
                var me = this;
                me.$forceUpdate();
                var p = me.$el;
                //Se debe buscar si abajo esta el form
                var f = p.querySelector("form");
                var va = this.validate(f);
                if (va) {
                    var action = f.getAttribute('action');
                    //console.log('Action='+action);
                    if (!action) {
                        action = me.$el.parentNode.getAttribute('path');

                        //debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
                        var tc = action.split('/');
                        if (tc[tc.length - 1] == 'edit')
                            tc = tc.splice(0, tc.length - 2);
                        else
                            tc = tc.splice(0, tc.length - 1);
                        action = me.apiLink(tc.join('/'));
                    }
                    var o = this._data.data ? this._data.data : this._data.o;
                    o = JSON.parse(JSON.stringify(o));
                    if (me.process)o=me.process(o);
					if(!_.networkStatus.connected||o.tmpId){
						
						var storage=me.$children[0].storage;
						
						var datj;
						try{
							var vvv=localStorage.getItem(storage);
							if(vvv)datj=JSON.parse(vvv);
						}catch(e){MsgBox(e)}
						if(!datj)datj=[];
						if(!o.id){
							o.id=-(new Date());
							o.tmpId=+new Date();
							datj.unshift(o);
						}else{
							for(var k=0;k<datj.length;k++){
								if(datj[k].tmpId==o.tmpId){
									delete me.o.tmpSynchronized;
									datj[k]=me.o;
									break;
								}
							}
						}
						localStorage.setItem(storage, JSON.stringify(datj));
						me.close(true);
						return;
					}
                    axios.post(action, o).then(function (r) {
                        MsgBox('El registro fue grabado exitosamente!',function(){
                            if(me.close2)me.close2(r);
                            else{
                                me.close(true);
                            }
                        });
                    }).catch(function (r) {
                        if(r.response){	
							var l,e;
                            if((typeof r.response.data)==='string'){
                                MsgBox(r.response.data);
                            }else{
                                l= r.response.data.propertyViolations;
                                //ec += l.length;
                                for (var i = 0; i < l.length; i++) {
                                    var t = l[i];
                                    e = f.querySelector('[name=' + t.path + ']');
                                    if (e) {
                                        me.showerror(e, t.message);
                                    }
                                }
                                l = r.response.data.fieldViolations;
                                //ec += l.length;
                                for (i = 0; i < l.length; i++) {
                                    t = l[i];
                                    e = f.querySelector('[name=' + t.path + ']');
                                    if (e) {
                                        me.showerror(e, t.message + ', valor=' + t.value);
                                    }
                                }
                                MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
                                if (me.$el.parentNode.className == 'v-dialog')
                                    me.$el.parentNode.parentNode.scroll({
                                        top: 0,
                                        behavior: 'smooth'
                                    });
                            }
                        }
                    });
                } else {
                    MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
                    if (me.$el.parentNode.className == 'v-dialog')
                        me.$el.parentNode.parentNode.scroll({
                            top: 0,
                            behavior: 'smooth'
                        });
                }
            },
			savePost(){
				
			},
            showerror:function(e, m) {
                var previousSibling = e.previousSibling;
                if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                    previousSibling.parentNode.removeChild(previousSibling);
                }
                previousSibling = e.previousSibling;
                while (previousSibling && previousSibling.nodeType != 1) {
                    previousSibling = previousSibling.previousSibling;
                }
                if (!previousSibling) {
                    previousSibling = e.parentElement.previousSibling;
                    while (previousSibling && previousSibling.nodeType != 1) {
                        previousSibling = previousSibling.previousSibling;
                    }
                }
                var error = document.createElement("div");
                error.innerHTML = m ? m : "Este campo es requerido!";
                //ok = false;
                error.classList.add("v-error");
                e.parentNode.insertBefore(error, e);
            },
            validate:function(e2) {
                var me = this;
                var ok = true;
				e2=e2?e2:me.$el;
                var input = e2.querySelectorAll("input,select,textarea,div[required=required]");
                var radio = {},previousSibling;

                for (i = 0; input.length > i; i++) {
                    var e = input[i];
                    if (e.type === 'radio') {
                        var oo = radio[e.name];
                        if (!oo)
                            radio[e.name] = (oo = []);
                        oo.push(e);
                        continue;
                    }				
                    previousSibling = e.previousSibling;
                    if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                        previousSibling.parentNode.removeChild(previousSibling);
                    }
                    
//                    console.log('disabled='+e.getAttribute('disabled'));
                    
                    if (!(e.disabled||e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
						//console.log([e]);
						//console.log(e.value);console.log(e.nodeValue);
                        if (e.tagName != 'DIV'&&(!e.value||e.value == 0) || (e.tagName === 'DIV' && !e.attributes.value)) {
                            previousSibling = e.previousSibling;
                            while (previousSibling && previousSibling.nodeType != 1) {
                                previousSibling = previousSibling.previousSibling;
                            }
                            if (!previousSibling) {
                                previousSibling = e.parentElement.previousSibling;
                                while (previousSibling && previousSibling.nodeType != 1) {
                                    previousSibling = previousSibling.previousSibling;
                                }
                            }
                            var error = document.createElement("div");
                            error.innerHTML = "Este campo es requerido!";
                            ok = false;
                            error.classList.add("v-error");
                            e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                for (var r in radio) {
                    if (Object.prototype.hasOwnProperty.call(radio, r)) {
                        var op = radio[r];
                        var checked = false;
                        var required = false;
                        for (var i = 0; i < op.length; i++) {
                            if (op[i].required && !op[i].disabled)
                                required = true;
                            if (op[i].checked)
                                checked = true;
                        }
                        e = op[0].parentNode.parentNode;
                        previousSibling = e.previousSibling;
                        if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                            previousSibling.parentNode.removeChild(previousSibling);
                        }
                        if (required && !checked) {
                            me.showerror(e);
                            /*previousSibling = e.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             if(!previousSibling){
                             previousSibling=e.parentElement.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             }
                             var error = document.createElement("div"); 
                             error.innerHTML = "Este campo es requerido!";*/
                            ok = false;
                            //error.classList.add("v-error");
                            //e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                return ok;
            }
        }
    };
_.vuex = function (v, ex) {
    if(!v)v={data:{o:{}}};
    if (!ex)
        ex = {};
    var el = v.el;
    if (typeof v.el === 'string') {
        el = document.querySelector(v.el);
    } else {
        var script = document.getElementsByTagName("script");
        el = script[script.length - 1].previousSibling.previousSibling;
    }
    var tv = el.querySelectorAll("v-tabview");
    for (var i = 0; i < tv.length; i++) {
        var id = 'v-' + _.id();
        tv[i].setAttribute("vid", id);
        var cn = tv[i].childNodes;
        var tabs = [];
        _.varMap[id] = tabs;
        for (var j = 0; j < cn.length; j++) {
            if (cn[j].tagName) {
                cn[j].className = 'hide';
                tabs.push({
                    title: cn[j].title
                });
            }
        }

    }
    _.vtable={};
    //esto es util si se tienen listados
    var ta = el.querySelectorAll("v-table");
    for (i = 0; i < ta.length; i++) {
        var te = ta[i].querySelectorAll("template");
        for (j = 0; j < te.length; j++) {
            var att = te[j].attributes,k,atts;
            if ('v-slot:default' in att || 'v-slot' in att) {
                var columns = [],n;
                var filterTemplate = document.createElement("template"); 
                filterTemplate.setAttribute("v-slot:filters","");
                //var selectable=ta[i].getAttribute("v-bind:selectable");
                ta[i].appendChild(filterTemplate);
                var td = te[j].content.children;
                var summary=[];
                //var hassumary=0;
                for (var l = 0; l < td.length; l++) {
                    var m = {};
                    var su = td[l].querySelector("v-footer");
                    if(su)
                    summary[l]=su;
                    var f = td[l].querySelector("v-filter");
                    if (f) {
                        td[l].removeChild(f);
                        for(k=0;k<f.children.length;k++){
                            f.children[k].setAttribute("index",l);
                            filterTemplate.content.appendChild(f.children[k]);
                        }
                        m['filter'] = f;
                    }
                    for (att, k = 0, atts = td[l].attributes, n = atts.length; k < n; k++) {
                        att = atts[k];
                        m[att.nodeName] = (att.nodeValue);
                    }
                    columns.push(m);
                }
                if(summary.length){
                    filterTemplate = document.createElement("template"); 
                    filterTemplate.setAttribute("v-slot:summary","");
                    ta[i].appendChild(filterTemplate);
                    td = te[j].content.children;
                    for (l = 0; l < td.length; l++) {
                        var ell=summary[l];
                        var t=document.createElement("td");
                        if(ell){
                            t.innerHTML=ell.innerHTML;
                            ell.parentNode.removeChild(ell);
                        }else
                            t.innerHTML='&nbsp;';
                        filterTemplate.content.appendChild(t);
                    }
                }
                
                var cid=_.id();
                _.vtable[cid]=columns;
                ta[i].setAttribute("columns",cid);
            }
            
            ta[i].setAttribute("v-bind:filters","filters");
        }
    }
     
    new Vue(_.extends={
        el: el,
        data: {
            filters:{},
            //rowSelectedCount: 0,
            row: {}
        },
        mixins: [v],
        extends: ex,
        updated: function () {
//            console.log(this);
        },
        mounted: function () {
            var me = this;
            var vueid=_.id();
            //error cuando se carga un mapa con v-panel el mapa de turismo  es ejemplo
            if(me.$el&&me.$el.setAttribute){
//                console.log(me.$el);
            me.$el.setAttribute("vueid",vueid);
        }
            _.varMap[vueid]=me;
        
            me.ddd(me.$root);
        },
        methods: {
            ddd:function(/*o*/){
//                for(var i=0;i<o.$children.length;i++){
//                    var child=o.$children[i];
//                    console.log(child);
//                    if (child.$vnode.tag && child.$vnode.tag.includes("v-table")) {
//                        //child.setColumns(columns);
//                    }else{
//                        this.ddd(child);
//                    }
//                }
            },
            rowCreated:function(r) {
                this.row = r;
            },
            getSelected:function(){
                var me = this;
                var t = me.$children[0].$children[0];
                var s=[];
                for(var i=0;i<t.selected.length;i++){
                    s.push(t.data[t.selected[i]]);
                }
                return s;
            },
            getRowSelectedCount:function() {
                var me = this;
                var t = me.$children[0].$children[0];
                return t ? t.selected.length : 0;
            },
            create:function() {
                var me = this;
				//console.log(me.$children);
                var action = me.$children[0].action;
                if (!action)
                    action = window.location.pathname;
                action=_.processURL(action);
                instance.get(_.currentPath = (action + (_.mobil?'/Create.html':'/create')).replace(/([^:]\/)\/+/g, "$1") + '?modal')
                        .then(_.open).catch(me.error);
            },
            get:function(part) {
                var me = this;
                var p = me.$el;
                //Se debe buscar si abajo esta el form
                var f = p.querySelector("form");
                var action = f.action;
                //console.log(me.apiLink(action) + '/' + part);
                window.location.href = me.apiLink(action) + '/' + part;
            },
            error:function(e) {
                //console.log(e);
                alert(e);
                //this.open({data:''+e});
            },
            edit:function() {
                var me = this;
                var f = me.$children[0];
                var action = f.action;
                if (!action)
                    action = window.location.pathname;
                var t = me.$children[0].$children[0];
                var id=t.data[t.selected[0]][t.$attrs.rowkey];
                if(me.getSelectedId)id=me.getSelectedId(t.data[t.selected[0]]);
                axios.get((_.currentPath = (action + '/' + id + '/edit').replace(/([^:]\/)\/+/g, "$1")) + '?modal')
                        .then(me.open).catch(me.error);
            },
            destroy:function() {alert('este bloque se repite');
                /*var me = this;
                var f = me.$children[0];
                var action = f.action;
                if (!action)
                    action = window.location.pathname;
                var t = me.$children[0].$children[0];
                if (!t.$attrs.rowkey)
                    return alert('Table don`t have defined attribute \'rowkey\'');
                var id = t.data[t.selected[0]][t.$attrs.rowkey];
                if (confirm("Esta seguro que desea eliminar el registro seleccionado?")){
					
					/*(r.data.tmpId){
						alert('delete '+r.data.tmpId);
					}else
                    axios.delete(me.apiLink(action) + '/' + id).then(function (r) {
                        var id = r.data.id;
                        for (var i = t.data.length - 1; i >= 0; i--) {
                            if (t.data[i][t.$attrs.rowkey] == id) {
                                t.data.splice(i, 1);
                            }
                        }
                    }).catch(me.error);
				}*/
            },
            apiLink:function(str) {
                return str.replace(_.contextPath, _.contextPath + '/api');
            },
            open:function(response, path, o) {
                var me = this;
                if (response === 'GET') {
                    _.currentPath = path + '/' + o;
//                    window.history.pushState(_.currentPath, t, '{}');
                    axios.get((_.currentPath + '/?modal').replace(/([^:]\/)\/+/g, "$1"))
                            .then(me.open).catch(me.error);
                    return;
                }
                var overlay = document.createElement("div");
                overlay.classList.add("v-overlay");
                overlay.style.padding = "40px";
                document.body.appendChild(overlay);
                var dialog = document.createElement("div");
                dialog.classList.add("v-dialog");
                dialog.innerHTML = response.data;
                var s = dialog.getElementsByTagName('script');
                console.log('patttt=' + _.currentPath);
                dialog.setAttribute("path", _.currentPath);
                var nid =_.id();
                dialog.setAttribute("callback", nid);
                overlay.appendChild(dialog);
                for (var i = 0; s.length > i; i++) {
                    eval(s[i].innerHTML);
                }
                overlay.style.visibility = "unset";
                overlay.style.opacity = "unset";
                overlay.style.overflow = "auto";
                dialog.style.margin = "0 auto";
                dialog.style.position = "unset";
                _.storeFunction[nid] = function (o) {
                    if (o === true)
                        me.refresh();
                }
                var resize = function () {
                    dialog.style.left = (window.innerWidth - dialog.offsetWidth) / 2 + 'px';
                    if(window.innerWidth<600){
                        var dc=dialog.querySelector('.ui-dialog-content');
                        //console.log(dc);
                        var h = dialog.querySelector('.ui-panel-titlebar');
                        console.log(h.clientHeight);
                        var ih=window.innerHeight-94-h.clientHeight;
                        dc.style.height = ih+"px";
                    }
                };
                window.addEventListener('resize', resize);
                var h = dialog.querySelector('.ui-panel-titlebar');
                var acl = h.querySelector('.ui-js-close');
                window.onkeyup = function (event) {
                    if (event.keyCode == 27) {
                        dialog.style.display = "none";
                        overlay.style.display = "none";
                        _.RSZ();
                    }
                }
                if (!acl) {
                    var span = document.createElement("i");
                    span.style.top = "6px";
                    span.style.right = "6px";
                    h.style.position = "relative";
                    span.style.position = "absolute";
                    span.style.color = "white";
                    span.className = "fa fa-window-close v-dialog-close";
                    acl = document.createElement("a");
                    acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
                    acl.appendChild(span);
                    h.appendChild(acl);
                    acl.addEventListener("click", function () {
                        dialog.style.display = "none";
                        overlay.style.display = "none";
                        resize();
                    });
                }
                resize();
            },
            close:function(ok) {
                var dlg = this.$el.parentElement;
                var mask = dlg.parentElement;
                dlg.style.display = "none";
				//console.log(mask);
				//Solo se debe ocultaqr si es la marcara del dlg
				if((' ' + mask.className + ' ').indexOf(' v-overlay ') > -1)mask.style.display = "none";
                resize();
                var cb=_.storeFunction[dlg.getAttribute("callback")];
                if(cb)cb(ok);
                //si history esta activo
                //history.back();
            },
            refresh:function() {
                //Para que funcione se debe tener el listado respetando la estructura 
                var me = this;
                var t = me.$children[0].$children[0];
                t.load();
            },
            save:function() {
                var me = this;
                me.$forceUpdate();
                var p = me.$el;
                //Se debe buscar si abajo esta el form
                var f = p.querySelector("form");

                var va = this.validate(f);
                if (va) {
                    var action = f.getAttribute('action');
                    //console.log('Action='+action);
                    if (!action) {
                        action = me.$el.parentNode.getAttribute('path');

                        //debe en ciertos casoss sobreescribirse ponr unas rglas definidas y una tabla extra
                        var tc = action.split('/');
                        if (tc[tc.length - 1] == 'edit')
                            tc = tc.splice(0, tc.length - 2);
                        else
                            tc = tc.splice(0, tc.length - 1);
                        action = me.apiLink(tc.join('/'));
                    }
                    var o = this._data.data ? this._data.data : this._data.o;
                    o = JSON.parse(JSON.stringify(o));
                    if (me.process)o=me.process(o);
					console.log(_.networkStatus);
					
					
//					if(me.close2)me.close2({id:1});
//							else{
//								me.close(true);
//							}
//							return;
					
					
                    axios.post(action, o).then(function (r) {
                        MsgBox('El registro fue grabado exitosamente!',function(){
                            if(me.close2)me.close2(r);
                            else{
                                me.close(true);
                            }
                        });
                    }).catch(function (r) {
			console.log(JSON.stringify(r.response));
                        //var ec = 0;
                        
                        if(r.response){	
							var l,e;
                            if((typeof r.response.data)==='string'){
                                MsgBox(r.response.data);
                            }else{
                                l= r.response.data.propertyViolations;
                                //ec += l.length;
                                for (var i = 0; i < l.length; i++) {
                                    t = l[i];
                                    e = f.querySelector('[name=' + t.path + ']');
                                    if (e) {
                                        me.showerror(e, t.message);
                                    }
                                }
                                l = r.response.data.fieldViolations;
                                //ec += l.length;
                                for (i = 0; i < l.length; i++) {
                                    t = l[i];
                                    e = f.querySelector('[name=' + t.path + ']');
                                    if (e) {
                                        me.showerror(e, t.message + ', valor=' + t.value);
                                    }
                                }
                                MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
                                if (me.$el.parentNode.className == 'v-dialog')
                                    me.$el.parentNode.parentNode.scroll({
                                        top: 0,
                                        behavior: 'smooth'
                                    });
                            }
                        }
                    });
                } else {
                    MsgBox('Verifique el formulario, aun tiene campos obligatorios sin completar.');
                    if (me.$el.parentNode.className == 'v-dialog')
                        me.$el.parentNode.parentNode.scroll({
                            top: 0,
                            behavior: 'smooth'
                        });
                }
            },
            showerror:function(e, m) {
                var previousSibling = e.previousSibling;
                if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                    previousSibling.parentNode.removeChild(previousSibling);
                }
                previousSibling = e.previousSibling;
                while (previousSibling && previousSibling.nodeType != 1) {
                    previousSibling = previousSibling.previousSibling;
                }
                if (!previousSibling) {
                    previousSibling = e.parentElement.previousSibling;
                    while (previousSibling && previousSibling.nodeType != 1) {
                        previousSibling = previousSibling.previousSibling;
                    }
                }
                var error = document.createElement("div");
                error.innerHTML = m ? m : "Este campo es requerido!";
                //ok = false;
                error.classList.add("v-error");
                e.parentNode.insertBefore(error, e);
            },
            validate:function() {
				//alert();
                var me = this;
                var ok = true;
                var input = me.$el.querySelectorAll("input,select,textarea,div[required=required]");
                var radio = {},previousSibling;

                for (i = 0; input.length > i; i++) {
                    var e = input[i];
                    if (e.type === 'radio') {
                        var oo = radio[e.name];
                        if (!oo)
                            radio[e.name] = (oo = []);
                        oo.push(e);
                        continue;
                    }
					console.log(e);
                    previousSibling = e.previousSibling;
                    if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                        previousSibling.parentNode.removeChild(previousSibling);
                    }
//                    console.log('id='+e.id);
//                    console.log('disabled='+e.getAttribute('disabled'));
                    
                    if (!(e.disabled||e.getAttribute('disabled')) && (e.required || e.tagName === 'DIV')) {
                        if (e.value == 0 || (e.tagName === 'DIV' && !e.attributes.value)) {
                            previousSibling = e.previousSibling;
                            while (previousSibling && previousSibling.nodeType != 1) {
                                previousSibling = previousSibling.previousSibling;
                            }
                            if (!previousSibling) {
                                previousSibling = e.parentElement.previousSibling;
                                while (previousSibling && previousSibling.nodeType != 1) {
                                    previousSibling = previousSibling.previousSibling;
                                }
                            }
                            var error = document.createElement("div");
                            error.innerHTML = "Este campo es requerido!";
                            ok = false;
                            error.classList.add("v-error");
                            e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                for (var r in radio) {
                    if (Object.prototype.hasOwnProperty.call(radio, r)) {
                        var op = radio[r];
                        var checked = false;
                        var required = false;
                        for (var i = 0; i < op.length; i++) {
                            if (op[i].required && !op[i].disabled)
                                required = true;
                            if (op[i].checked)
                                checked = true;
                        }
                        e = op[0].parentNode.parentNode;
                        previousSibling = e.previousSibling;
                        if (previousSibling && previousSibling.classList && previousSibling.classList.contains('v-error')) {
                            previousSibling.parentNode.removeChild(previousSibling);
                        }
                        if (required && !checked) {
                            me.showerror(e);
                            /*previousSibling = e.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             if(!previousSibling){
                             previousSibling=e.parentElement.previousSibling;
                             while(previousSibling&&previousSibling.nodeType != 1) {
                             previousSibling = previousSibling.previousSibling;
                             }
                             }
                             var error = document.createElement("div"); 
                             error.innerHTML = "Este campo es requerido!";*/
                            ok = false;
                            //error.classList.add("v-error");
                            //e.parentNode.insertBefore(error, e);
                        }
                    }
                }
                return ok;
            }
        }
    });
}
_.autosize = function (e) {
    var el = e ? (e.target ? e.target : e) : this;
    setTimeout(function () {
        el.style.height='auto';
        el.style.padding='0px';
        el.style.height=''+ (el.scrollHeight?el.scrollHeight:18) + 'px';
        el.style.padding='';
        //el.style.cssText = 'height:auto; padding:0';
        //el.style.cssText = 'height:' + el.scrollHeight + 'px';
        
    }, 0);
}
function getLayerById(m, id) {
    var ly;
    m.getLayers().forEach(function (l) {
        if (l.get("id") === id) {
            ly = l;
            return;
        }
    });
    return ly;
}
Vue.component('v-feature', {props: ['type'], abstract: true, 
    render: function () {
        var me = this;
        me.$parent.$on('build', function (m) {
            if (me.type === 'Point') {
                var f = new ol.Feature({
                    geometry: new ol.geom.Point(m.getView().getCenter())
                });
                f.setStyle(m.styleMap.default);
                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [f]
                    })
                });
                var translateIteraction = new ol.interaction.Translate({
                        features: new ol.Collection([f])
                });
                translateIteraction.on('translateend', function (e) {
                        var c=ol.proj.toLonLat(e.coordinate);
                        me.$emit('moved',{coords: {latitude: c[0], longitude: c[1]}});
                });
                m.addInteraction(translateIteraction);
                m.addLayer(layer);
				var c=ol.proj.toLonLat(f.getGeometry().getCoordinates());
				me.$emit('moved',{coords: {latitude: c[0], longitude: c[1]}});
            }
        });
		return null
    }
});
Vue.component('v-layer', {props: ['src', 'maxZoom', 'minZoom','filters','name'], abstract: true,
    data: function () {
        return {
            loaded: null,map:null,layer:null
        }
    },
    methods: {
        reset(){
            this.loaded=false;
            this.show(this.map);
        },
        show:function(m) {
            var me = this;
            var layer = me.layer;
            if (!me.loaded){
                var params={zoom: parseInt(m.getView().getZoom(), 10)};
                if(me.filters)params=Vue.mergeDeep(params,me.filters);
                axios.get(me.src, {params:params}).then(function (r) {
                    var data = (r.data.data ? r.data.data : r.data);
                    var features = [];
                    var max = 1;
                    for (var i = 0; i < data.length; i++) {
                        var d = data[i];
                        if (d[2] > max)
                            max = d[2];
                    }
                    me.$emit('load',{target:me,features:features,data:data,map:m});
                    if(!layer){
                        var layerConfig = {
                            source: new ol.source.Vector({
                                features: features
                            }),
                            id:me.name
                        };
                        if (me.maxZoom)
                            layerConfig.maxZoom = me.maxZoom;
                        if (me.minZoom)
                            layerConfig.minZoom = me.minZoom;
                        layer = new ol.layer.Vector(layerConfig);
                        layer.onSelect=function(f){
                            me.$emit('select',f);
                        };
                        m.addLayer(me.layer=layer);
                        layer.on('change:visible', function () {
                            alert(1);
                            console.log(this);
                        });
                    }else{
                        layer.setSource(new ol.source.Vector({
                            features: features
                        }));
                    }                    
                    me.loaded = true;
                    me.layer=layer;
                }).catch(me.error);
            }
        }
    },
    render :function() {
        var me = this;
        me.$parent.$on('build', function (m) {
            var currZoom = false;
            me.map=m;
            var v = '';
            var fm = function () {
                var newZoom = parseInt(m.getView().getZoom(), 10);
                var minZoom = me.minZoom ? me.minZoom : 0;
                var maxZoom = me.maxZoom ? me.maxZoom : 10000;
                me.newZoom=null;
                if (currZoom != newZoom) {
                    var vv = minZoom <= newZoom && newZoom <= maxZoom;
                    if (vv !== v) {
                        if (vv)
                            me.show(m);
                        v = vv;
                    }
                    currZoom = newZoom;
                    me.newZoom=newZoom;
                }
                me.$emit('moveend',me);
            };
            m.on('moveend', fm);
        });
		return null;
    }});
Vue.component('v-layer-control', {
    data: function () {
        return {
            loaded: null,map:null,feature:null,district:null,pl:null,dl:null,scope:null,lastScope:null
        }
    },
    methods:{
        setScope:function(v){
            var me=this;
            if(v<100)v=v*10000;
            if(v<10000)v*100;
            
            //var r=Math.floor(v/10000);
            //var p=Math.floor((v%10000)/100);
            //var d=v%100;
            if(me.pl){
                me.scope=v;
            }else{
                me.scope=-v;
            }
            if(me.scope==0){
                me.map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], this.map.getSize());    
            }
            /*dl.setSource(new ol.source.Vector({
                        url: '/fs/geo/' + me.feature.id_ + '.geojson',
                        format: new ol.format.GeoJSON()
                    }));
            ;*/
        }
    },
    render: function () {
        var me = this;
        
        me.$parent.$on('build', function (m) {
			var fspan = document.createElement('i');
			fspan.setAttribute('class', 'fa fa-expand');
            m.addControl(new ol.control.FullScreen({ label: fspan, tipLabel: 'Fullscreen' }));
            var pv=new ol.source.Vector({
                url: (axios.defaults.baseURL?axios.defaults.baseURL:'')+'/fs/geo/02.geojson',
                format: new ol.format.GeoJSON()
            });
            var pl=me.pl=new ol.layer.Vector({
                source: pv,
                style:function(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                         color: 'rgba(255, 0, 0, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#4073CE',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#4073CE'}),
                            stroke: new ol.style.Stroke({color: '#4073CE', width: 0.5})
                        })
                    })
                },
                id: 'provinces'
            });
            me.changeProvince = function (t) {
                var v=1*(t.value?t.value:t);
                var fl=pl.getSource().getFeatures();
                for(var i=0;i<fl.length;i++){
                    if((1*fl[i].id_)==v){
                        pl.onChange({feature:fl[i]});
                        break;
                    }
                }
            }
            pv.on('change', function (/*e*/) {
                if(me.scope<0){
                    var fl=pv.getFeatures();
                    var v=Math.floor((-me.scope)/100);
                    for(var i=0;i<fl.length;i++){
                        if((1*fl[i].id_)==v){
                            me.scope=-me.scope;
                            pl.onChange({feature:fl[i]});
                            if(_.wg){
                                var c = _.wg(document.querySelector('.x-province'));
                                c.selectValue(fl[i].getId());
                            }
                            break;
                        }
                    }
                }
            });
            var dl=new ol.layer.Vector({
                preload: Infinity,
                source:new ol.source.Vector(),
                id: 'districts',
                style:function(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(16, 110, 138, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#194300',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#194300'}),
                            stroke: new ol.style.Stroke({color: '#194300', width: 0.5})
                        })
                    })
                }
            });
            m.on('moveend', function (/*evt*/) {
                if(me.feature){
                    dl.setSource(new ol.source.Vector({
                        url: (axios.defaults.baseURL?axios.defaults.baseURL:'')+'/fs/geo/' + me.feature.id_ + '.geojson',
                        format: new ol.format.GeoJSON()
                    }));
					var source_=dl.getSource(),fu=function (/*e*/) {
                        if(me.scope>0){
                            var fl=dl.getSource().getFeatures();
                            var v=me.scope;
                            for(var i=0;i<fl.length;i++){
                                if((1*fl[i].id_)==v){
                                    me.scope=0;
                                    //aqui se dirige al distriyo
                                    dl.onChange({feature:fl[i]});
                                    break;
                                }
                            }
                        }
						source_.un('change',fu);
                        //ol.Observable.unByKey(listenerKey);
                    };
                    /*var listenerKey = */source_.on('change',fu);
                    me.$emit('scope',me.feature);
                    if(_.wg){
                        var c = _.wg(document.querySelector('.x-province'));
                        if(c){
                            var options=c.options;
                            for(var i=0;i<options.length;i++){
                                if((1*options[i].value)==me.feature.getId()){
                                    c.selectValue(options[i].value);
                                    break;
                                }
                            }
                        }
                    }
                    me.feature=null;
                }
                if(me.district){
                    var f=me.district;
                    me.$emit('scope',f);
                    if(_.wg){
                        c = _.wg(document.querySelector('.x-district'));
                        if(c){
                            options=c.options;
                            for(i=0;i<options.length;i++){
                                if((1*options[i].value)==f.getId()){
                                    c.selectValue(options[i].value);
                                    break;
                                }
                            }
                        }
                    }
                    me.district=null;
                }
             });
            pl.onChange=function(event){
                me.feature=event.feature;
                if(me.lastScope!=me.feature.getId()){
                    if(event.preventDefault)
                        event.preventDefault();
                    me.lastScope=me.feature.getId();
                    m.getView().fit(me.feature.getGeometry().getExtent(), {duration: 300});
                }
            };
            m.addLayer(pl);
            dl.onChange=function(event){
                var f=event.feature;
                if(me.lastScope!=f.getId()){
                    if(event.preventDefault)
                        event.preventDefault();
                    me.lastScope=f.getId();
                    me.district=f;
                    m.getView().fit(f.getGeometry().getExtent(), {duration: 300});
                }
            };
            me.changeDistrict = function (t) {                
                var v=1*(t.value?t.value:t);
                var fl=dl.getSource().getFeatures();
                for(var i=0;i<fl.length;i++){
                    if((1*fl[i].id_)==v){
                        dl.onChange({feature:fl[i]});
                        break;
                    }
                }
            };
            if(typeof $ != 'undefined'){
                _.changeProvince = function (t) {
                    var v=1*t.value;
                    var fl=pl.getSource().getFeatures();
                    for(var i=0;i<fl.length;i++){
                        if((1*fl[i].id_)==v){
                            pl.onChange({feature:fl[i]});
                            break;
                        }
                    }
                }
            }
            m.addLayer(dl);
            me.map=m;
        });
		return null;
    },
    template: '<div><slot></slot></div>',
});
Vue.component('v-chart', {
    props: {
        value: {
            type: String,
        },
        data: Object,
        type: String,
        source: String,
        dataFunc:Function
    },

    template: '<div style="border:1px solid gray"><canvas></canvas></div>',
    updated: function () {
        //console.log(this.data.dataIndex);
        this.chart.update();
    },
    mounted: function () {
        var m = this;
		if(typeof Chart !== 'undefined'){
			m.Chart=Chart;m.build();
		}else
			_.loadScript('/cdn/Chart.min.js', function () {
				m.Chart=Chart;
				m.build();
			});
    },
    data: function () {
        return {dat: {},Chart:null}
    },
    methods: {
        build:function() {
            var me = this;
            var canvas = this.$el.querySelector("canvas");
            if (this.chart) {
                this.chart.destroy();
            }
            var _dat = me.dat;
            _dat.label = [];
            _dat.data = [];
//            axios.get(this.src, {params: null})
//                    .then(function (r) {
//                        var _dat = r.data.data ? r.data.data : r.data;
//                        for (i = 0; i < _dat.length; i++) {
//                            _data.label.push(_dat[i][0]);
//                            _data.data.push(_dat[i][1]);
//                        }
//                        me.chart.update();
//
//                        //me.$forceUpdate();
//                        //me.$parent.loaded(nou);
//                        //me.$emit('loaded', me);
//                        //Si lo encuentra despues de cargar los items debe marcarlo
//                        //if(me.$parent.$attrs.value)
//                        //me.$parent.onChange(me.$parent.$attrs.value);
//                    })
//                    .catch(function (r) {
//                        console.log(r);
//                        r = r.response;
//                        var e = me.$parent.$el;
//                        var error = document.createElement("div");
////                        error.innerHTML = r.config.method + ' ' + r.config.url + ' ' + r.status + ' (' + r.statusText + ')';
//                        error.classList.add("v-error");
//                        e.parentNode.insertBefore(error, e);
//                    });

//            if(me.data&&this.data.height){
//                canvas.height = this.data.height+'px';
//                canvas.parentNode.style.height = this.data.height+'px';
//            }
//            var din=this.data.dataIndexName;
//            var met=this.data.metaData;
//            if(din){
//                for(var i=0;i<din.length;i++){
//                    for(var j=0;j<met.length;j++){
//                        if(met[j].name==din[0])this.data.dataIndex=j;
//                    } 
//                }
//            }

            window.chartColors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
                'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'];

//            var dataset=[];
//            
//            for(var i=0;i<this.data.data.length;i++){
//                dataset.push(this.data.data[i][this.data.dataIndex]);
//            }
//            for(var i=0;i<this.data.data.length;i++){
//                label.push(this.data.data[i][this.data.labelIndex]);
//            }
//            while(window.chartColors.length<label.length)window.chartColors.push('rgb('+(255*Math.random())+', '+(255*Math.random())+', '+(255*Math.random())+')');
            this.chart = new this.Chart(canvas, Vue.mergeDeep({
                type: this.type,
                data:{
                    datasets: [],
                    labels: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: /*this.data.legendPosition?this.data.legendPosition:*/'top'
                    }
                }
            },me.dataFunc?me.dataFunc():{}));
        }
    }
});
Vue.component('v-map', {
    template: '<div><slot></slot></div>',
    mounted: function () {
        var m = this;
        //_.loadCSS('/cdn/ol.css');
        //_.loadScript('/cdn/ol.js',function(r){
            m.$emit('beforeBuild');
            m.build();
        //});
    },
    data: function () {
        return {map: null, collection: null, styleMap: null, coordinate: {}}
    },
    methods: {
        addLayer(o){
            this.map.addLayer(o);
            this.$emit('addlayer',o);
        },
        addFeature:function(f,cfg) {
            f = f ? f : {};
            var me = this, p, map = me.map;
            if (f.lon && f.lat) {
                var c = [f.lon, f.lat];
                
                p = new ol.geom.Point(c[0] > -100 ? ol.proj.fromLonLat(c) : c);
            } else {
                console.log('Se usara la coordenada central');
                p = new ol.geom.Point(map.getView().getCenter());
            }
            c = p.flatCoordinates;
            c = c[0] < -10000 ? ol.proj.toLonLat(c) : c;
            
            me.$emit('translateend', {lon: c[0], lat: c[1]});
            var feature = new ol.Feature(p);
            feature.data = f;
            var interactionCollection = new ol.Collection();
            interactionCollection.push(feature);
            var translateIteraction = new ol.interaction.Translate({
                features: interactionCollection
            });
            translateIteraction.on('translateend', function (e) {
                var c = ol.proj.toLonLat(e.coordinate);
                me.$emit('translateend', {lon: c[0], lat: c[1]});
            });
            translateIteraction.on('translatestart', function (e) {
                me.selectedFeature = e.features.getArray()[0];
            });
            feature.interactionCollection = interactionCollection;
            feature.setStyle(me.styleMap[f.style ? f.style : 'default']);
            me.map.addInteraction(translateIteraction);
            c = p.flatCoordinates;
            c = c[0] < -10000 ? ol.proj.toLonLat(c) : c
            me.$emit('translateend', {lon: c[0], lat: c[1]});
            me.collection.push(feature);
            if(cfg){
                console.log('animate');
                console.log(feature.getGeometry().getCoordinates());
                me.map.getView().animate({
                    center:feature.getGeometry().getCoordinates(),
                    zoom: 17,
                    duration: 500
                })
            }
            return feature;
        },
        build:function() {
            var m = this;
            m.styleMap = {
                default: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,	
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                                color: '#ff0000'
                        })
                    })
                }),
                star: [new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({
                            color: '#ff0000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        points: 5,
                        radius: 10,
                        radius2: 4,
                        angle: 0
                    })
                })]
            };
            
            var moved = false;
            var pageLocation = _.urlParam('location');
            var zoom=-1;
            if (pageLocation) {
                var l = pageLocation.split('/');
                pageLocation = [parseFloat(l[0]), parseFloat(l[1])];
                zoom = l[2];
                moved = true;
            } else {
                pageLocation = false;
            }
            var map = new ol.Map({
                target: m.$el,
                
                layers: [
                    

    //new ol.layer.VectorTile({
      /*source: new ol.source.VectorTile({
        format: new ol.format.MVT(),
        url:
                'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf'
         // 'https://basemaps.arcgis.com/v1/arcgis/rest/services/World_Basemap/VectorTileServer/tile/{z}/{y}/{x}.pbf',
      }),
    })  */        
                    
                   /* new ol.layer.Tile({
                              source: new ol.source.XYZ({
        attributions:
          'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        url:
                'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf'
                //'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
               // 'https://server.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'
          //'https://server.arcgisonline.com/ArcGIS/rest/services/' +
          //'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      }),*/
                        
                       /* 
                        source: new ol.source.XYZ({
        attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
        url:
          'https://services.arcgisonline.com/arcgis/rest/services/' +
          'ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 15,
        projection: 'EPSG:4326',
        tileSize: 512, // the tile size supported by the ArcGIS tile service
        maxResolution: 180 / 512, // Esri's tile grid fits 180 degrees on one 512 px tile
        wrapX: true,
      })*/
                                
                      new ol.layer.Tile({              
                                   source: new ol.source.OSM({
                            //url: 'https://tiles.geodir.co/osm_tiles/{z}/{x}/{y}.png'
                                    //'https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png' 
                           // 'http://{a-c}.tile.stamen.com/toner/{z}/{x}/{y}.png'
                            //'http://tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
                            //'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                            //'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
                            //'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            //'https://maps-cdn.salesboard.biz/styles/klokantech-3d-gl-style/{z}/{x}/{y}.png'
                            //'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/NatGeoStyleBase/MapServer/tile/{z}/{y}/{x}'
                            //'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{x}/{y}.pbf'
                        })
                    })
                ],
                view: new ol.View({})
            });
            map.styleMap = m.styleMap;
            map.addLayer(new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: m.collection = new ol.Collection()
                })
            }));
            if(moved){
                map.getView().setCenter(pageLocation);
                map.getView().setZoom(zoom?zoom:12);
                m.$emit('build', m.map=map);
            }else{
                _.getCurrentPosition().then(function (e) {
                    map.getView().setCenter(ol.proj.fromLonLat([e.coords.longitude, e.coords.latitude]));
                    map.getView().setZoom(12);
                    m.$emit('build',m.map=map);
                }, function () {
                    map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], map.getSize());
                    m.$emit('build',m.map=map);
                });
            }
            var currZoom = map.getView().getZoom();
            map.on('moveend', function () {
                var newZoom = map.getView().getZoom();
                if (currZoom != newZoom) {
                    m.$emit("zoom",newZoom);
                    currZoom = newZoom;
                }
                if (!moved) {
                    var center = map.getView().getCenter();
                    history.replaceState({id: 'homepage'}, '', document.location.pathname + '?' + _.param('location', center[0] + '/' + center[1] + '/' + map.getView().getZoom()));
                }
                moved = false;
            });
            map.on('singleclick', function (evt) {
                //var l=[];
                var f = map.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {
                    return [feature,layer];
                    //l.push([feature,layer]);
                });
                //console.log(l);
                if (f) {
                    var layer=f[1];
                    f=f[0];
                    evt.feature=f;
                    evt.map=map;
                    evt.preventDefault();
                    if(layer.onSelect){layer.onSelect(evt);return;}else;
                }
            });
            map.on('dblclick', function (evt) {
                var f = map.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {
                    return [feature,layer];
                });
                if (f) {
                    var layer=f[1];
                    f=f[0];
                    //var old = null;///dblClickSelect.getFeatures().item(0);
                    
                    evt.feature=f;
                    evt.map=map;
                    //evt.preventDefault();
                    if(layer.onChange){console.log('dbclick manda event onchangue');layer.onChange(evt);return;}else;
                    m.$emit('change',f);
                    //if (true/*old && old.getId() === f.getId()*/) {
                        //Si es un punto acercalo hasta un zoom adecuado despues llamar a una ventana
                        map.getView().animate({
                            center:f.getGeometry().getCoordinates(),
                            zoom: 17,//map.getView().getZoom() + 1,
                            duration: 500
                        }, function () {
                            for(var j=0;j<m.$children.length;j++){
                                var ch=m.$children[0];
                                if(ch.open)ch.open(evt);
                            }
                        });
                    //} else {
                        /*evt.preventDefault();
                        c = _.wg($(f.getId().length > 4 ? '.x-district' : '.x-province'));
                        c.selectValue(f.getId());*/
                    //}
                }
            });
            var vp=map.getViewport().parentNode;
            vp.addEventListener("parentResize", function(event) {
                setTimeout(function () {
                    map.updateSize();
					
                    console.log('map.updateSize '+event.height);
                    //console.log(m.$el);
                    m.$emit('resize',map);
                }, 100)
            });
            resize();
        }
    }
});
Vue.component('v-overlay', {
     props: {
        value: {
            value: Object
        },
        src: String,
        header: String
    },
    data:function(){return {overlay:null,ele:null}},
    created: function () {
        var me = this;
        me.$parent.$on('beforeBuild', function (/*m*/) {
            me.overlay=new ol.Overlay({
                element:me.$el,
                positioning: 'bottom-right'
            });
        });
        me.$parent.$on('build', function (m) {
            m.addOverlay(me.overlay);
        });
    },
    methods:{
        close:function(){
            if(this.overlay)
            this.overlay.setPosition();
        },
        open:function(evt){
            var me=this;
            var map=evt.map;
            var f=evt.feature;
            var overlay=this.overlay;
            var tp = overlay.element;
            var h=tp.children[0].children[0];
            //var body=tp.children[0].children[1];
            var acl=h.querySelector('.ui-js-close');
            if (!acl) {
                var span = document.createElement("i");
                        span.style.top = "9px";
                span.style.right = "0px";
                span.style.color = "white";
                h.style.position = "relative";
                span.style.position = "absolute";
                span.className = "fa fa-times fa-sm";
                acl = document.createElement("a");
                acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
                acl.appendChild(span);
                h.appendChild(acl);
                acl.addEventListener("click", me.close);
            }
            overlay.setPosition(evt.coordinate);
            var center = map.getView().getCenter();
            var resolution = map.getView().getResolution();
            var pixel = map.getPixelFromCoordinate(f.getGeometry().getCoordinates());
            axios.get(_.remoteServer+this.src).then(function (r) {
                me.$emit('input', r.data);
                setTimeout(function () {
                    var mw = map.viewport_.offsetWidth;
                    var mvh = map.viewport_.offsetHeight;
                    var body=tp.children[0].children[1];
                    body.scrollTop=0;
                    var he = tp.offsetHeight;    
                    if (he + 100 >= mvh) {
                        body.style.height=(mvh - 100 - tp.children[0].children[0].offsetHeight)+'px';
                    } else {
                        body.style.height='300px';
                    }
                    he = tp.offsetHeight;
                        
                    var nw = (mw <= 440) ? mw - 40 : 400;
                    tp.style.zIndex=10;    
                    tp.style.width=nw+'px';
                    nw = nw / 2;
                    map.getView().animate({
                        center: [
                            center[0] + (
                                    pixel[0] + nw + 20 >= mw ? +(pixel[0] + nw + 20 - mw)
                                    :
                                    (pixel[0] - 20 - nw < 0 ? (-nw + pixel[0] - 20) : 0)
                                    ) * resolution,
                            center[1] + (pixel[1] < he ? he - pixel[1] : 0) * resolution
                        ],
                        duration: 500
                    });
                    //se desplaza el overlay
                    pixel[0] = pixel[0] + nw - 0;
                    pixel[1] = pixel[1] - 2;
                    overlay.setPosition(map.getCoordinateFromPixel(pixel));
                    if(_.mobil){
                            var a=overlay.getElement().querySelectorAll('a:not(._)');
                            for(var k=0;k<a.length;k++){
                                    a[k].addEventListener("click", _.open2);
                            }
                    }
					console.log(tp);
                }, 400);
            }).catch(function(){});
        }
    },
    template: '<div class="v-map-overlay">'+
            '<div  class="x-dlg-header">{{header}}</div>'+
            '<div class="x-dlg-body" style="padding:10px"><slot></slot></div>'+
            '<div class="x-dlg-footer right" ><slot name="footer"></slot></div>'+
            '<div style="text-align: center"><canvas class="triangle" width="20" height="18"></canvas></div>'+
            '</div>',
});
Vue.component('v-layer-control', {
    data: function () {
        return {
            loaded: null,map:null,feature:null,district:null,pl:null,dl:null,scope:null,lastScope:null
        }
    },
    methods:{
        setScope:function(v){
            var me=this;
            if(v<100)v=v*10000;
            if(v<10000)v*100;
            
            //var dpto=Math.floor(v/10000);
            //var prov=Math.floor((v%10000)/100);
            //var dist=v%100;
            if(me.pl){
                me.scope=v;
            }else{
                me.scope=-v;
            }
            if(me.scope==0){
                me.map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], this.map.getSize());    
            }
            /*dl.setSource(new ol.source.Vector({
                        url: '/fs/geo/' + me.feature.id_ + '.geojson',
                        format: new ol.format.GeoJSON()
                    }));
            ;*/
        }
    },
    render: function () {
        var me = this;
        me.$parent.$on('build', function (m) {
            m.addControl(new ol.control.FullScreen());
            var pv=new ol.source.Vector({
                url: axios.defaults.baseURL+'/fs/geo/02.geojson',
                format: new ol.format.GeoJSON()
            });
            var pl=me.pl=new ol.layer.Vector({
                source: pv,
                style:function(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                         color: 'rgba(255, 0, 0, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#4073CE',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#4073CE'}),
                            stroke: new ol.style.Stroke({color: '#4073CE', width: 0.5})
                        })
                    })
                },
                id: 'provinces'
            });
            console.log('Se crea el methodo changeProvince');
            me.changeProvince = function (t) {
                //console.log('t='+t);
                var v=1*(t&&t.value?t.value:t);
                var fl=pl.getSource().getFeatures();
                for(var i=0;i<fl.length;i++){
                    if((1*fl[i].id_)==v){
                        pl.onChange({feature:fl[i]});
                        break;
                    }
                }
            }
            pv.on('change', function (/*e*/) {
                if(me.scope<0){
                    var fl=pv.getFeatures();
                    var v=Math.floor((-me.scope)/100);
                    for(var i=0;i<fl.length;i++){
                        if((1*fl[i].id_)==v){
                            me.scope=-me.scope;
                            pl.onChange({feature:fl[i]});
                            /*if(typeof $ != 'undefined'){
                                var c = _.wg($('.x-province'));
                                c.selectValue(fl[i].getId());
                            }*/
                            break;
                        }
                    }
                }
            });
            var dl=new ol.layer.Vector({
                preload: Infinity,
                source:new ol.source.Vector(),
                id: 'districts',
                style:function(f){
                    return new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(16, 110, 138, 0.0)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#194300',
                            width: 1
                        }),
                        text:new ol.style.Text({
                            text: f.values_.name?f.values_.name.toUpperCase():'',
                            fill: new ol.style.Fill({color: '#194300'}),
                            stroke: new ol.style.Stroke({color: '#194300', width: 0.5})
                        })
                    })
                }
            });
            function fitCompleted() {
                //console.log('moveend.lastScope='+me.lastScope);
//                console.log('me.feature='+me.feature);
                //el feature puede ser distrito o provincia 
                //si es un distrito dentro de la provincia de lastscope no deberia hacerse nada
                //relacionado a prov
                if(!me.feature)return;
                var id=parseInt(me.feature.id_);
                if(id<10000){//Sole puede cargar los distritos
                    //console.log('cargando distritos del prov='+me.feature.id_);
                    dl.setSource(new ol.source.Vector({
                        url: axios.defaults.baseURL+'/fs/geo/' + me.feature.id_ + '.geojson',
                        format: new ol.format.GeoJSON()
                    }));
					var sou_=dl.getSource(),fu=function (/*e*/) {
                        if(me.scope>0){
                            var fl=dl.getSource().getFeatures();
                            var v=me.scope;
                            for(var i=0;i<fl.length;i++){
                                if((1*fl[i].id_)==v){
                                    me.scope=0;
                                    //aqui se dirige al distriyo
                                    dl.onChange({feature:fl[i]});
                                    break;
                                }
                            }
                        }
                        //ol.Observable.unByKey(listenerKey);
						sou_.un('change', fu);
                    };
                    /*var listenerKey = */sou_.on('change', fu);
                    //console.log('se emite cambio de provincia');
                    me.$emit('scope',me.feature);
                    /*if(!(typeof $ == 'undefined')){
                        var c = _.wg($('.x-province'));
                        if(c){
                            var options=c.options;
                            for(var i=0;i<options.length;i++){
                                if((1*options[i].value)==me.feature.getId()){
                                    c.selectValue(options[i].value);
                                    break;
                                }
                            }
                        }
                    }*/
                    me.feature=null;
                }else if(id>9999){
                    //var f=me.feature;
                    /*var c;
                    if(typeof $ != 'undefined'){
                        c = _.wg($('.x-district'));
                    }else if(c){
                        var options=c.options;
                        for(var i=0;i<options.length;i++){
                            if((1*options[i].value)==f.getId()){
                                c.selectValue(options[i].value);
                                break;
                            }
                        }
                    }*/
                    me.$emit('scope',me.feature);
                }
			}
            pl.onChange=function(event){
                var f=event.feature;
                //qui se cambia de provincia 0206 valor anterior=020601
                //si ya esta dentro de la provincia no se debe mandar mensaje
                var id=parseInt(f.getId());
                if(id>9999)id=Math.floor(id/100);
                var ls=parseInt(me.lastScope);
                if(ls>9999)ls=Math.floor(ls/100);
                if(ls!=id){
                    //console.log('aqui se cambia de provincia '+f.getId()+" valor anterior="+me.lastScope);
                    if(event.preventDefault)
                        event.preventDefault();
                    me.lastScope=f.getId();
                    me.feature=f;
                    //var oe=m.getView().getExtent();
                    //var ne=me.feature.getGeometry().getExtent();
                    //console.log(oe);
                    //console.log(ne);
                    m.getView().fit(me.feature.getGeometry().getExtent(), {duration: 300,callback:fitCompleted});
                }
            };
            m.addLayer(pl);//belen en grupo huilcaay a laguna radion
            
            dl.onChange=function(event){
                var f=event.feature;
                if(me.lastScope!=f.getId()){
                    //console.log('aqui se cambia de distrito '+f.getId());
                    if(event.preventDefault)
                        event.preventDefault();
                    me.lastScope=f.getId();
                    me.feature=f;
                    m.getView().fit(f.getGeometry().getExtent(), {duration: 300,callback:fitCompleted});
                }
            };
            me.changeDistrict = function (t) {                
                var v=1*(t&&t.value?t.value:t);
                var fl=dl.getSource().getFeatures();
                for(var i=0;i<fl.length;i++){
                    if((1*fl[i].id_)==v){
                        dl.onChange({feature:fl[i]});
                        break;
                    }
                }
            };
            /*if(typeof $ != 'undefined'){
                _.changeProvince = function (t) {
                    var v=1*(t&&t.value?t.value:t);
                    var fl=pl.getSource().getFeatures();
                    for(var i=0;i<fl.length;i++){
                        if((1*fl[i].id_)==v){
                            pl.onChange({feature:fl[i]});
                            break;
                        }
                    }
                }
            }*/
            m.addLayer(dl);
            me.map=m;
        });
		return null;
	},
    template: '<div><slot></slot></div>',
});

Vue.component('v-chart', {
    props: {
        value: {
            type: String,
        },
        data: Object,
        type: String,
        source: String,
        dataFunc:Function
    },

    template: '<div style="border:1px solid gray"><canvas></canvas></div>',
    updated: function () {
        console.log(this.data.dataIndex);
        this.chart.update();
    },
    mounted: function () {
        var m = this;
		if(typeof Chart !== 'undefined'){
			m.Chart=Chart;m.build();
		}else
			_.loadScript('/cdn/Chart.min.js', function () {
				m.Chart=Chart;
				m.build();
			});
    },
    data: function () {
        return {dat: {},Chart:null}
    },
    methods: {
        build:function() {
            var me = this;
            var canvas = this.$el.querySelector("canvas");
            if (this.chart) {
                this.chart.destroy();
            }
            var _dat = me.dat;
            _dat.label = [];
            _dat.data = [];
//            axios.get(this.src, {params: null})
//                    .then(function (r) {
//                        var _dat = r.data.data ? r.data.data : r.data;
//                        for (i = 0; i < _dat.length; i++) {
//                            _data.label.push(_dat[i][0]);
//                            _data.data.push(_dat[i][1]);
//                        }
//                        me.chart.update();
//
//                        //me.$forceUpdate();
//                        //me.$parent.loaded(nou);
//                        //me.$emit('loaded', me);
//                        //Si lo encuentra despues de cargar los items debe marcarlo
//                        //if(me.$parent.$attrs.value)
//                        //me.$parent.onChange(me.$parent.$attrs.value);
//                    })
//                    .catch(function (r) {
//                        console.log(r);
//                        r = r.response;
//                        var e = me.$parent.$el;
//                        var error = document.createElement("div");
////                        error.innerHTML = r.config.method + ' ' + r.config.url + ' ' + r.status + ' (' + r.statusText + ')';
//                        error.classList.add("v-error");
//                        e.parentNode.insertBefore(error, e);
//                    });

//            if(me.data&&this.data.height){
//                canvas.height = this.data.height+'px';
//                canvas.parentNode.style.height = this.data.height+'px';
//            }
//            var din=this.data.dataIndexName;
//            var met=this.data.metaData;
//            if(din){
//                for(var i=0;i<din.length;i++){
//                    for(var j=0;j<met.length;j++){
//                        if(met[j].name==din[0])this.data.dataIndex=j;
//                    } 
//                }
//            }

            window.chartColors = ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
                'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)'];

//            var dataset=[];
//            
//            for(var i=0;i<this.data.data.length;i++){
//                dataset.push(this.data.data[i][this.data.dataIndex]);
//            }
//            for(var i=0;i<this.data.data.length;i++){
//                label.push(this.data.data[i][this.data.labelIndex]);
//            }
//            while(window.chartColors.length<label.length)window.chartColors.push('rgb('+(255*Math.random())+', '+(255*Math.random())+', '+(255*Math.random())+')');
            this.chart = new this.Chart(canvas, Vue.mergeDeep({
                type: this.type,
                data:{
                    datasets: [],
                    labels: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: /*this.data.legendPosition?this.data.legendPosition:*/'top'
                    }
                }
            },me.dataFunc?me.dataFunc():{}));
        }
    }
});
Vue.component('v-map', {
    template: '<div><slot></slot></div>',
    mounted: function () {
        var m = this;
		if(ol.Map){
			m.$emit('beforeBuild');
            m.build();
		}else{
			_.loadCSS('/cdn/ol.css');
			_.loadScript('/cdn/ol.js',function(/*r*/){
				m.$emit('beforeBuild');
				m.build();
			});
		}
    },
    data: function () {
        return {map: null, collection: null, styleMap: null, coordinate: {}}
    },
    methods: {
        addFeature:function(f,cfg) {
            f = f ? f : {};
            var me = this, p, map = me.map;
            if(f.lon)f.lng=f.lon;
            if (f.lng && f.lat) {
                var c = [f.lng, f.lat];
                p = new ol.geom.Point(c[0] > -100 ? ol.proj.fromLonLat(c) : c);
            } else {
                console.log('Se usara la coordenada central');
                p = new ol.geom.Point(map.getView().getCenter());
            }
            c = p.flatCoordinates;
            c = c[0] < -10000 ? ol.proj.toLonLat(c) : c
            me.$emit('translateend', {lng: c[0], lat: c[1]});
            var feature = new ol.Feature(p);
            feature.data = f;
            var interactionCollection = new ol.Collection();
            interactionCollection.push(feature);
            var translateIteraction = new ol.interaction.Translate({
                features: interactionCollection
            });
            translateIteraction.on('translateend', function (e) {
                var c = ol.proj.toLonLat(e.coordinate);
                me.$emit('translateend', {lng: c[0], lat: c[1]});
            });
            translateIteraction.on('translatestart', function (e) {
                me.selectedFeature = e.features.getArray()[0];
            });
            feature.interactionCollection = interactionCollection;
            feature.setStyle(me.styleMap[f.style ? f.style : 'default']);
            me.map.addInteraction(translateIteraction);
            c = p.flatCoordinates;
            c = c[0] < -10000 ? ol.proj.toLonLat(c) : c
            me.$emit('translateend', {lng: c[0], lat: c[1]});
            me.collection.push(feature);
            if(cfg){
                me.map.getView().animate({
                    center:feature.getGeometry().getCoordinates(),
                    zoom: 17,
                    duration: 500
                })
            }
            return feature;
        },
        build:function() {
            var m = this;
            m.styleMap = {
                default: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,	
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        fill: new ol.style.Fill({
                                color: '#ff0000'
                        })
                    })
                }),
                star: [new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({
                            color: '#ff0000'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#8a0000',
                            width: 2
                        }),
                        points: 5,
                        radius: 10,
                        radius2: 4,
                        angle: 0
                    })
                })]
            };
            var moved = false;
            var pageLocation = new _.URL().get('location');
            var zoom=-1;
            if (pageLocation) {
                var l = pageLocation.split('/');
                pageLocation = [parseFloat(l[0]), parseFloat(l[1])];
                zoom = l[2];
                moved = true;
            } else {
                pageLocation = false;
            }
            var map = new ol.Map({
                target: m.$el,
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM({
                            //url: 'https://tiles.geodir.co/osm_tiles/{z}/{x}/{y}.png'
                                    //'https://tiles.wmflabs.org/osm-no-labels/{z}/{x}/{y}.png' 
                           // 'http://{a-c}.tile.stamen.com/toner/{z}/{x}/{y}.png'
                            //'http://tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
                            //'http://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
                            //'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png'
                            //'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                            //'https://maps-cdn.salesboard.biz/styles/klokantech-3d-gl-style/{z}/{x}/{y}.png'
                            //'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/NatGeoStyleBase/MapServer/tile/{z}/{y}/{x}'
                            //'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{x}/{y}.pbf'
                        })
                    })
                ],
                view: new ol.View({})
            });
            map.styleMap = m.styleMap;
            map.addLayer(new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: m.collection = new ol.Collection()
                })
            }));
            if(moved){
                map.getView().setCenter(pageLocation);
                map.getView().setZoom(zoom?zoom:12);
                m.$emit('build', m.map=map);
            }else{
                _.getCurrentPosition().then(function (e) {
                    map.getView().setCenter(ol.proj.fromLonLat([e.coords.longitude, e.coords.latitude]));
                    map.getView().setZoom(12);
                    m.$emit('build',m.map=map);
                }, function (/*e*/) {
                    map.getView().fit([-8756221.995832639, -1207995.483261405, -8541070.763947014, -899052.0546471546], map.getSize());
                    m.$emit('build',m.map=map);
                });
            }
            var currZoom = map.getView().getZoom();
            map.on('moveend', function (/*evt*/) {
                var newZoom = map.getView().getZoom();
                if (currZoom != newZoom) {
                    m.$emit("zoom",newZoom);
                    currZoom = newZoom;
                }
                if (!moved) {
                    var center = map.getView().getCenter();
					
					var url=new _.URL().put('location',center[0] + '/' + center[1] + '/' + map.getView().getZoom());
					console.log(url);
					history.replaceState({id: 'homepage'}, '', url);
                    //
                }
                moved = false;
            });
            map.on('click', function (evt) {
                var f = map.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {
                    return [feature,layer];
                });
                if (f) {
                    var layer=f[1];
                    f=f[0];
                    evt.feature=f;
                    evt.map=map;
                    evt.preventDefault();
                    if(layer.onSelect){layer.onSelect(evt);return;}else;
                }
            });
            map.on('dblclick', function (evt) {
                var f = map.forEachFeatureAtPixel(evt.pixel, function (feature,layer) {
                    return [feature,layer];
                });
                if (f) {
                    var layer=f[1];
                    f=f[0];
                    //var old = null;///dblClickSelect.getFeatures().item(0);
                    
                    evt.feature=f;
                    evt.map=map;
                    //evt.preventDefault();
                    if(layer.onChange){layer.onChange(evt);return;}else;
                    m.$emit('change',f);
                    //if (true/*old && old.getId() === f.getId()*/) {
                        //Si es un punto acercalo hasta un zoom adecuado despues llamar a una ventana
                        map.getView().animate({
                            center:f.getGeometry().getCoordinates(),
                            zoom: 17,//map.getView().getZoom() + 1,
                            duration: 500
                        }, function () {
                            for(var j=0;j<m.$children.length;j++){
                                var ch=m.$children[0];
                                if(ch.open)ch.open(evt);
                            }
                        });
                    //} else {
                        /*evt.preventDefault();
                        c = _.wg($(f.getId().length > 4 ? '.x-district' : '.x-province'));
                        c.selectValue(f.getId());*/
                    //}
                }
            });
            var vp=map.getViewport().parentNode;
            vp.className='v-resize';
            vp.addEventListener("parentResize", function(/*event*/) {
                setTimeout(function () {
                    map.updateSize();
                    m.$emit('resize',map);
                }, 100)
            });
            resize();
        }
    }
});
Vue.component('v-overlay', {
     props: {
        value: {
            value: Object
        },
        src: String,
        header: String
    },
    data:function(){return {overlay:null,ele:null}},
    created: function () {
        var me = this;
        me.$parent.$on('beforeBuild', function (/*m*/) {
            me.overlay=new ol.Overlay({
                element:me.$el,
                positioning: 'bottom-right'
            });
        });
        me.$parent.$on('build', function (m) {
            m.addOverlay(me.overlay);
        });
    },
    methods:{
        close:function(){
            if(this.overlay)
            this.overlay.setPosition();
        },
        open:function(evt){
            var me=this;
            var map=evt.map;
            var f=evt.feature;
            var overlay=this.overlay;
            var tp = overlay.element;
            var h=tp.children[0].children[0];
            //var body=tp.children[0].children[1];
            var acl=h.querySelector('.ui-js-close');
            if (!acl) {
                var span = document.createElement("i");
                        span.style.top = "9px";
                span.style.right = "0px";
                span.style.color = "white";
                h.style.position = "relative";
                span.style.position = "absolute";
                span.className = "fa fa-times fa-sm";
                acl = document.createElement("a");
                acl.className = "ui-js-close ui-dialog-titlebar-icon ui-dialog-titlebar-close ui-corner-all";
                acl.appendChild(span);
                h.appendChild(acl);
                acl.addEventListener("click", me.close);
            }
            overlay.setPosition(evt.coordinate);
            var center = map.getView().getCenter();
            var resolution = map.getView().getResolution();
            var pixel = map.getPixelFromCoordinate(f.getGeometry().getCoordinates());
            axios.get(_.remoteServer+this.src).then(function (r) {
                me.$emit('input', r.data);
                setTimeout(function () {
                    var mw = map.viewport_.offsetWidth;
                    var mvh = map.viewport_.offsetHeight;
                    var body=tp.children[0].children[1];
                    body.scrollTop=0;
                    var he = tp.offsetHeight;    
                    if (he + 100 >= mvh) {
                        body.style.height=(mvh - 100 - tp.children[0].children[0].offsetHeight)+'px';
                    } else {
                        body.style.height='300px';
                    }
                    he = tp.offsetHeight;
                        
                    var nw = (mw <= 440) ? mw - 40 : 400;
                    tp.style.zIndex=10;    
                    tp.style.width=nw+'px';
                    nw = nw / 2;
                    map.getView().animate({
                        center: [
                            center[0] + (
                                    pixel[0] + nw + 20 >= mw ? +(pixel[0] + nw + 20 - mw)
                                    :
                                    (pixel[0] - 20 - nw < 0 ? (-nw + pixel[0] - 20) : 0)
                                    ) * resolution,
                            center[1] + (pixel[1] < he ? he - pixel[1] : 0) * resolution
                        ],
                        duration: 500
                    });
                    //se desplaza el overlay
                    pixel[0] = pixel[0] + nw - 0;
                    pixel[1] = pixel[1] - 2;
                    overlay.setPosition(map.getCoordinateFromPixel(pixel));
                    if(_.mobil){
                            var a=overlay.getElement().querySelectorAll('a:not(._)');
                            for(var k=0;k<a.length;k++){
                                    a[k].addEventListener("click", _.open2);
                            }
                    }
					console.log(tp);
                }, 400);
            }).catch(function(){});
        }
    },
    template: '<div class="v-map-overlay">'+
            '<div  class="x-dlg-header">{{header}}</div>'+
            '<div class="x-dlg-body" style="padding:10px"><slot></slot></div>'+
            '<div class="x-dlg-footer right" ><slot name="footer"></slot></div>'+
            '<div style="text-align: center"><canvas class="triangle" width="20" height="18"></canvas></div>'+
            '</div>',
});
Vue.component('v-map-control', {
    props: {
        icon: String
    },
    computed: {
        slotPassed() {
            return !!this.$slots.default;
        }
    },
    data:function(){return {ready:null,svg:null}},
    template:'<div v-show="ready" class="ol-unselectable ol-control"><slot></slot>'+
            '<button v-if="!slotPassed" v-on:click.prevent="$emit(\'click\',$event)">'+
			'<i v-if="!svg" class="fa fa-xs" v-bind:class="icon"></i>'+
			'<svg v-if="svg"><use v-bind:href="icon"></use></svg>'+
			'</button></div>',
    mounted:function(){
        var me = this;
		this.svg=!(this.icon&&this.icon.startsWith('fa-'));
        me.$parent.$on('build', function (m) {
            m.addControl(new ol.control.Control({element:me.$el}));
            me.ready=true;
        });
    }
});
var tinymce;
Vue.component('v-editor', {
    //template: '<div><div><textarea  class="tinymce hid textarea ui-inputfield ui-widget x-data" >ghg  jhblhl</textarea></div></div>',
    template: '<div><div><v-textarea  /></div></div>',
    mounted2: function () {
        var m = this;
        _.loadScript('/cdn/tinymce/tinymce.min.js', function () {
			m.tinymce=tinymce;
            m.build();
        });
    },
    updated3: function () {
        var m = this;
        m.build();
    },
    data: function () {
        return {editor: null,tinymce:null}
    },
    methods: {
        build:function() {
			var tinymce=this.tinymce;
            var id = _.id();
            this.$el.children[0].id = 'editor-' + id;
            this.editor = tinymce.init({
                selector: '.tinymce',
                plugins: ['code', 'help', 'link', 'pagebreak', 'image', 'textcolor', 'table', 'emoticons', 'imagetools', 'media', 'colorpicker', 'textcolor'],
                body_class: 'mce-content-body',
                media_live_embeds_: false,
                //menubar:#{MENU_BAR?'true':'false'},
                toolbar: "undo redo | forecolor backcolor | bold italic underline | list link code removeformat #{ALL?' | image table emoticons media ltr rtl pagebreak':''} ",
                content_css: '/cdn/isobit.css?v=1',
                extended_valid_elements: 'pre[*],script[*],style[*],link[*]',
                valid_children: "+body[style|script|link],pre[script|div|p|br|span|img|style|h1|h2|h3|h4|h5],*[*]",
                valid_elements: '*[*]',
                force_br_newlines: false,
                force_p_newlines: false,
                relative_urls: false,
                forced_root_block: '',
                init_instance_callback2: function (editor) {
                    //var m = $(editor.editorContainer);
//                    m.on('rsz', function (e, o) {
//                        var m = $(e.currentTarget);
//                        var he = o?o.height:null;
//                        if(!he){he=m.parent().height()-2;}
//                        else{he -= 20;}
//                        he -= m.find('.mce-top-part').outerHeight();
//                        he -= m.find('.mce-statusbar').outerHeight();
//                        m.find('.mce-edit-area').height(he);
//                        m.find('iframe').css('display','inline').height(he);
//                    });
                    var f = function (/*e*/) {
                        _.xsec = 3;
                    };
                    editor.on('keyUp', f).on('paste', f).on('undo', f).on('redo', f);
                    _.xsec = 0;
                    setInterval(function () {
                        if (_.xsec) {
                            _.xsec--;
                            if (!_.xsec) {
                                if (_.updateEditor)
                                    _.updateEditor();
                            }
                        }
                    }, 1000);
//                    var u = m.closest('.x-layout-unit');
//                    m.trigger("rsz", {height: u.height()});
//                    m.addClass('x-resize');
                }
            });
//            console.log('this.editor');
//            console.log(this.editor);
//            var script = $('#mce-script').last();
//            $(function () {
//                d = script.closest('form').data('preSubmit');
//                if (!d) {
//                    d = [];
//                    script.closest('form').data('preSubmit', d);
//                }
//                mce = script.parent().find();
//                d.push(function () {
//                    return _.try(function () {
//                        t = script.prev('textarea');
//                        console.log('============');
//                        console.log(t);
//                        console.log(t[0]);
//                        v=tinymce.get(t[0].id)/*activeEditor*/.getContent();
//                        t.val(v==''?'':v);
//                    });
//                });
//            })
        }
    }
});
Vue.component('v-calendar', {
    props: {
        value: {
            value: String
        },
        type: String,
        required:String
    },
    data: function () {
        return {
            value2: null
        }
    },
    template: '<div v-bind:value="toDate(value)" ><input v-bind:required="required" style2="width:calc(100% - 0px)" v-on:change="enterD" v-bind:type="type?type:\'date\'"/></div>',
    methods: {
        enterD: function () {
            var v = event.target.value;
            var me = this;
            var t = me.toDate(v);
            if (me.$props.type === 'time') {
                this.$emit('input', me.pad(t.getHours(), 2) + ':' + me.pad(t.getMinutes(), 2) + ':00');
            } else {
                //solo se sobreescribira la fecha si es fecha valida
                if(t.getTime){
                    this.$emit('input', t.getTime());
                }
            }
        },
        pad:function(num, size) {
            var s = num + "";
            while (s.length < size)
                s = "0" + s;
            return s;
        },
        toDate:function(v) {
           
            if (v) { var me = this,d;
                if (me.$props.type === 'time') {
                    d = v.split(':');
                    return new Date(1981, 1, 6, parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                } else {
                    if (!isNaN(v)) {
                        return new Date(v);
                    }
					var t;
                    if (me.$props.type === 'datetime-local') {
                        t = v.split('T');
                        d = t[1].split(':');
                        t = t[0].split('-');
                        t = new Date(parseInt(t[0]), parseInt(t[1]) - 1, parseInt(t[2]), parseInt(d[0]), parseInt(d[1]), d.length > 2 ? parseInt(d[2]) : 0);
                        return t;
                    } else {
                        t = v.split('-');
                        var y=parseInt(t[0]);
                        if(y<100){
                            return v;
                        }
                        t = new Date(y, parseInt(t[1]) - 1, parseInt(t[2]));
                        return t;
                    }
                }
            }
            return v;
        }
    },
    updated: function () {
        var me = this;
        var d = me.toDate(me.value);
        var fd;
        if (d) {
            if (me.$props.type === 'time') {
                fd = me.pad(d.getHours(), 2) + ":" + me.pad(d.getMinutes(), 2);
            } else if (me.$props.type === 'datetime-local') {
                fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2) + 'T' + me.pad(d.getHours(), 2) + ":" + me.pad((d.getMinutes()), 2);
            } else {
                fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2)
            }
        }
        this.$el.children[0].value = fd;
    },
    mounted: function () {
        var me = this;
        var d = me.toDate(me.value);
        var fd;
        if (d) {
            if (me.$props.type === 'time') {
                fd = me.pad(d.getHours(), 2) + ":" + me.pad(d.getMinutes(), 2);
            } else if (me.$props.type === 'datetime-local') {
                fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2) + 'T' + me.pad(d.getHours(), 2) + ":" + me.pad((d.getMinutes()), 2);
            } else {
                fd = me.pad(d.getFullYear(), 4) + "-" + me.pad((d.getMonth() + 1), 2) + "-" + me.pad(d.getDate(), 2)
            }
        }
        this.$el.children[0].value = fd;
    }
});
Vue.component('v-textarea', {
    props: {
        value: {
            type: String
        }
    },
    data: function () {
        return {
        }
    },
    template: '<textarea>{{value}}</textarea>',
    updated:function(){
        var me=this;
        var v=me.value;
        if(v&&me.$el.maxLength>0&&v.length>me.$el.maxLength){
            v=v.substring(0,me.$el.maxLength);
            me.$emit('input', v);
        }
        setTimeout(function () {
            _.autosize(me.$el);
        }, 300);
    },
    mounted: function () {
        var me = this;
        me.$el.addEventListener('keyup', function () {
            me.$emit('input', me.$el.value);
        });
        setTimeout(function () {
            _.autosize(me.$el);
        }, 300);
        /*me.$el.addEventListener('paste', function () {
            setTimeout(function () {
                me.$emit('input', me.$el.value);
                _.autosize(me.$el);
            }, 100);
        });*/
    }
});
Vue.component('v-checkbox-group', {
    props: {
        required: String,
        name: String
    },
    data: function () {
        return {
            value: [],options:[],nam:null
        }
    },
    created: function () {
        if (!this.nam) {
            this.nam = (this.$props.name?this.$props.name:'input_' + _.id());
        }
		this.update2();
		
    },
    
    updated:function() {
		this.update2();
    },
    mounted:function(){
        this.options= this.$el.querySelectorAll('input:not(.v-chk)');
        for (var i = 0; i < this.options.length; i++) {
            this.options[i].classList.add("v-chk");
        }
        this.update2();
    },
    methods: {
		update2(){
			var me=this;
			var rl = me.options;
			var va = me.$attrs.value;
			if((typeof va)=='string')va=va.split('|');
			for (var i = 0; i < rl.length; i++){
				rl[i].checked = false;
				for (var j = 0; va&&j < va.length; j++){
					if (rl[i].value == va[j]){
						rl[i].checked = true;
					}
				}
			}
		},
        onChange:function(v, c) {
            var me = this;
			var va=me.$attrs.value;
			if(typeof va === 'string' || va instanceof String){
				va=va.split('|');
			}
            if (c) {
                if (!va){
                    me.$attrs.value = (va=[])
				}
                va.push(v);
            } else {
				//console.log('buscar '+v+' en '+JSON.stringify(va));
				var ii=va.indexOf(v);
				if(ii>-1)va.splice(ii, 1);
				//console.log(va);
            }
            me.$emit('input', va);
        }
    },
    template: '<div><slot></slot></div>'
});

Vue.component('v-checkbox', {
    model: {
        prop: 'vmodel',
        event2: 'change'
    },
    props: {
        value:null,
        vmodel:null,
        valueFalse:null,
        label:null
    },
    data:function(){return {input:null};},
    mounted: function () {
        var me = this;
        var c=me.$el.querySelector('input');
		if(me.$parent&&me.$parent.nam)
			c.name = me.$parent.nam;
        me.input = c;
        if(!me.$parent.onChange)c.checked=me.value&&me.value==me.vmodel||(''+me.vmodel)==='true';
    },
    updated:function(){
        var me=this,c=me.input;
        c.checked=c.checked=me.value&&me.value==me.vmodel||(''+me.vmodel)==='true';
    },
    methods:{
        change:function(){
            var me=this;
            var r = this.$el.querySelector('input');
            if(me.$parent.onChange)me.$parent.onChange(this.value, r.checked);
            me.$emit('input', r.checked?(me.value?me.value:r.checked):(me.valueFalse!==null?me.valueFalse:r.checked));
        },
        getLabel:function(){
            var v=this.value;
            if(this.label)return this.label;
            return (v&&(typeof v)=='string'?v:'');
        }
    },
    template: '<label style="font-weight: normal !important;display:block" class="v-checkbox"><span v-html="getLabel()"></span>'+
            '<input type="checkbox" v-bind:checked="value&&vmodel==value||vmodel" v-on:change="change" v-bind:value="value" /> <span class="checkmark"></span></label>'
});
Vue.component('v-radio-group', {
    props: {
        required: String,
        name: String
    },
    data: function () {
        return {
            value: null,
			nam:null,
        }
    },
    updated: function () {
        this.update2();
    },
    mounted:function(){
        this.update2();
    },
    created: function () {
        if (!this.nam) {
            this.nam = (this.$props.name?this.$props.name:'input_' + _.id());
        }
    },
    methods: {
		update2(){
			var rl = this.$el.querySelectorAll('input');
			for (var i = 0; i < rl.length; i++) {
				if (rl[i].value == this.$attrs.value) {
					rl[i].checked = true;
				}else{
					rl[i].checked = false;
				}
			}
		},
        onChange:function(v) {
            this.value = v;
            if (v === '')
                v = null;
            this.$emit('input', v);
        }
    },
    template: '<div><slot></slot></div>'
});
Vue.component('v-radio', {
    props: {
        value: String,
        label: String
    },
    mounted: function () {
        var me = this;
        var r = me.$el.querySelector('input');
		if(me.$parent&&me.$parent.nam)
			r.name = me.$parent.nam;
        if (me.$parent.required)
            r.required = me.$parent.required;
        r.onclick = function () {
            me.$parent.onChange(me.value);
            //this.$parent.$emit('input', value);
        }
    },
    template: '<label class="v-radio" style="font-weight: normal !important;display:block" > {{label?label:value}}<input type="radio" v-bind:value="value" /><span class="checkmark"></span><slot></slot></label>'
});

Vue.component('v-autocomplete', {
    props: {
        value: {
            value: Object
        },
        placeholder: String,
        label: String,
        default: Object,
        storage:null,
        params:null,
        autoload:null,
        src: String,
        disabled: Boolean,
        showSelection: {
            type: Boolean,
            default: true
        },
        pagination:{default:10}
    },
    data: function () {
        return {page:0,selected: null,focused:-1, query: null, data0: null, show: false, total: 0, inputClass: ''}
    },
    template: '<div class="v-autocomplete" v-on:focusout2="focusout" :value="value" v-bind:disabled="disabled" >'+
            '<div style="padding: 2px 15px 2px 5px;border: 1px solid lightgrey;position: relative;" v-if="selected&&showSelection"><slot name="label" v-bind:selected="selected"></slot>' +
            '{{!hasSlot(\'label\')?getLabel(selected):\'&nbsp;\'}}&nbsp;<span v-on:click="remove" style="top:0px;margin:2px 4px;right: 0px;position: absolute;cursor:pointer;"><i class="fa fa-times"></i></span></div>' +
            '<input v-if="!selected" v-on:keyup="keyup"  v-on:keyup.enter.stop.prevent="search" v-bind:class="inputClass"  v-on:focus="show=true" v-bind:disabled="disabled" v-bind:placeholder="placeholder" v-model="query"><button class="hide" onclick="return false"/>' +
            '<transition name="fade">' +
            '<div v-show="show&&!selected" class="v-resultpane" style="position: relative;max-height: 300px;overflow-y: auto;border: 1px solid #0f62ac" >' +
            '<div class="v-list"><div v-for="(d,i) in data" v-bind:class="{\'v-selected\':selected==d,\'v-focused\':focused==i}"  v-on:click="setSelected(d)"><slot v-bind:row="d"></slot></div>' +
            '<div v-if="data0&&data0.length<total" class="center" v-on:click="search(1)">Cargar {{total-data0.length}} resultados mas...</div>' +
            '</div><div v-if="data&&data.length<1" class="center yellow">No existen resultados.</div></div>' +
            '</transition>' +
            '</div>',
    updated: function () {
        var me = this;
        me.selected = me.value;
//        console.log('updarte autocomplete');
    },
    computed: {
        data() {
            var me=this;
            //this.focused=-1;
            var q=me.query?me.query.trim().toLowerCase().split(/[ ,]+/):null;
            return me.data0&&me.query?me.data0.filter(function(el) {
                var v=JSON.stringify(el).toLowerCase();
                for(var j=0;j<q.length;j++){
                    if(v.indexOf(q[j]) == -1)return false;
                }
                return true;
            }):me.data0;
        }
    },
    mounted: function () {
        var me=this;
        me.inputClass = me.$attrs.inputclass;
        if(me.autoload)me.search();
        document.addEventListener("click", me.clickout);   
        if(!_.uiParent(me).online){
			console.log(me);
            me.loadStorage();
        }
    },
    beforeDestroy(){
        document.removeEventListener("click", this.clickout); 
    },
    methods: {
        loadStorage(){
            var me=this,storage=me.storage;
            if(storage!=null){
				
                var datj;
                try{
                    var vvv=localStorage.getItem(storage);
                    if(vvv)datj=JSON.parse(vvv);
                }catch(e){MsgBox(e)}
                if(!datj)datj=[];
                me.data0 = me.data0?datj.concat(me.data0):datj;
                //me.rowSelect(null, -10);
            }
        },
        keyup(){
            if(event.keyCode==40){
                if(this.focused<this.data.length)
               this.focused++; 
            }else if(event.keyCode==38){
               if(this.focused>0)
               this.focused--; 
            }else if(event.keyCode==13){
                if(this.focused>-1){
                    this.setSelected(this.data[this.focused]);
                }
            }
        },
        remove(){
            this.$emit('input',null);
        },
        clickout(){
            var t=event.target;
            event.stopPropagation();
            do{
                if(t==this.$el){
                    return false;
                }
            }while((t=t.parentNode));
            this.show=false;
        },
        focusout(){
            if(event.target.nodeName!='INPUT'){
            this.show=false;
            }
        },
        hasSlot (name = 'default') {
            return !!this.$slots[ name ] || !!this.$scopedSlots[ name ];
        },
        clear:function(){
            var me=this;
            me.selected=null;
            me.query='';
            me.data0=null;
        },
        focus:function(a){
            this.$el.querySelector('input').focus(a);
        },
        setSelected:function(v, h) {
            this.show = h;
            this.selected = v;
            this.$emit('input', v)
        },
        getLabel:function(i) {
            if(this.label){
                var vf = this.label.split('.');
                for (var j = 0; j < vf.length; j++) {
                    if (i)
                        i = i[vf[j]];
                }
            }
            return i;
        },
        search:function(e) {
			var me = this,pagination=Number(me.pagination);
			if(_.uiParent(this).online){
				if(e===1){
					me.page+=pagination;
				}else{
					me.page=0;
					if(me.data&&me.autoload)return;
				}
				var params={query: me.query};
				if(me.params)params=Vue.mergeDeep(params,me.params);
				axios.get((me.src?me.src:me.source) + (pagination>0?'/'+me.page+'/'+pagination:''), {params: params})
						.then(function (r) {
					if(e===1){
						me.data0=me.data0.concat(r.data.data ? r.data.data : r.data);
						me.total += r.data.size;
					}else{
						me.data0 = r.data.data ? r.data.data : r.data;
						me.total = r.data.size;
					}
					if(!me.autoload)me.show = true;
				}).catch(me.error).then(function () {
					me.$emit('complete', me);
				});
			}else{
				me.$emit('complete', me);
			}
        }
    }
});


Vue.component('v-switch', {
    props: {
        value: {
            value: Object
        }
    },
    data: function () {
        return {options: ['NO', 'SI'], selected: null}
    },
    mounted: function () {
        var me = this;
        var v = '' + me.value;
        me.selected = (v === 'true' ? 'SI' : (v === 'false' ? 'NO' : null));
        me.$emit('input',me.value);
    },
    updated: function () {
        var me = this;
        var v = '' + me.value;
        me.selected = (v === 'true' ? 'SI' : (v === 'false' ? 'NO' : null));
        me.$emit('input',me.value);
    },
    methods: {
        onChange:function(value) {
            var me = this;
            me.selected = value;
            this.$emit('input', value === 'SI' ? true : (value === 'NO' ? false : null));
        }
    },
    template: '<div :value="value===false?\'false\':value" :data-value="\'\'+value"><div v-on:click="onChange(v)" v-bind:style="\'cursor:pointer;border: 1px solid #000;text-align:center;display:inline-block;width:calc(50% - 2px)\'+(v===selected?\'\':\';opacity: 0.5\')" v-bind:class="{\'v-selected\':v==selected}" ' +
            ' v-for="v in options">{{v}}</div></div>'
});

Vue.component('v-options', {
    props: {
        url: String,
        displayField: String,
        valueField: String,
        filters:null,
        filter:null
    },
    data: function(){
        return {data: [],valueField_: [],lastLoad:null};
    },
    computed: {
        filterList() {
            var me=this;
            return me.data&&me.filter?me.data.filter(function(el) {
                return JSON.stringify(el).toLowerCase().indexOf(me.filter.toLowerCase()) !== -1;
            }):me.data;
        }
    },
    template: '<div><option v-for="item in filterList" v-bind:value="getValueField(item)">{{item[displayField]}}' +
            '<slot v-bind:item="item"></slot>' +
            '</option></div>',
    updated: function () {
		
        var me = this;
        var p = me.$el.parentElement;
        while (me.$el.childNodes.length > 0) {
            p.appendChild(me.$el.childNodes[0]);
        }
        me.$parent.$emit('changed',p);
        /*var v = me.$parent.$attrs.value;
        var k = false;
        for (var i = 0, j = p.options.length; i < j; ++i) {
            if (p.options[i].value == v) {
                p.selectedIndex = i;
                k = true;
                break;
            }
        }
        if (!k)
            p.selectedIndex = -1;*/
        //me.$parent.onChange(v);
    },
    mounted: function () {
        var me = this;
        if (me.valueField)me.valueField_ = me.valueField.split('.');
        
    },
    methods: {
        
        getIndexByValue: function(v,c) {
//            console.log('entrando en getIndexByValue');
            if(v&&v.id)v=v.id;
//            console.log('this.data.length='+this.data.length);
            for (var j = 0; j < this.filterList.length; j++) {
//                console.log('compare '+this.getValueField(this.filterList[j])+' =? '+v);
                if (this.getValueField(this.filterList[j]) == v){
//                    console.log('se encontro '+v+' en index='+j);
                    //console.log('c='+c);
                    if(c)c(j,this.filterList[j]);
                    return j;
                }
            }if(c)c(-1);
            return -1;
        },
        getValueByIndex: function(i) {
            //if(this.$parent.$el.id==='doc'){
                //console.log(i);
                //console.log(this.filterList);
            //}
            var e= this.getValueField(this.filterList[i], 1);
            //if(this.$parent.$el.id==='doc')console.log(e);
            return e;
        },
        getValueField: function(i, t) {
            var vf = this.valueField_;
            if (vf&&vf.length)
                for (var j = 0; j < vf.length; j++) {
                    if (i)
                        i = i[vf[j]];
                }
            else if (i && !t)
                i = i.id?i.id:i;//es necesario que el elemento tenga la propiedad id
            return i;
        },
        getSelectedItem: function() {
            var me = this;
            var p = me.$el.parentElement;
            return me.filterList[p.selectedIndex - 1];
        },
        load: function(p, nou) {
            
            //console.log(this.$el.parentElement);
            var me = this;
            var pa = me.$el.parentElement;
            //console.log(pa.name+'.antes de preguntar disabled options.load '+JSON.stringify(p));
            if(!pa.disabled){
                if (!me.data)
                    me.data = [];
                
                if(me.filters)p=Vue.mergeDeep(p?p:{},me.filters);
                //console.log(pa.name+'.options.load '+JSON.stringify(p));
                axios.get(me.url, {params: p})
                    .then(function (r) {
                        me.data = r.data.data ? r.data.data : r.data;
                       // me.$forceUpdate();
                       //console.log('se avisa por loaded');
//                       console.log(me.$parent.$el.name+' loaded y fuerza upfdate');
                       me.$parent.$forceUpdate();
                       //me.$children[j].data.length
                       if(nou)nou();
                        //me.$parent.loaded(nou);
                        //me.$emit('loaded', me);
                        //Si lo encuentra despues de cargar los items debe marcarlo
                        //if(me.$parent.$attrs.value)
                        //me.$parent.onChange(me.$parent.$attrs.value);
                    })
                    .catch(function (/*r*/) {
                        //r = r.response;
                        //var e = me.$parent.$el;
                        //var error = document.createElement("div");
                        /*error.innerHTML = r.config.method + ' ' + r.config.url + ' ' + r.status + ' (' + r.statusText + ')';
                        error.classList.add("v-error");
                        e.parentNode.insertBefore(error, e);*/
                    });
            }/*else{
                console.log('no se cargara aun '+pa.name);
            }*/
        }
    }

});
Vue.component('v-column', {
    template: '<td><slot></slot</td>'
});

var f={
    value: function(v){
        var a=this;
        for(var i=0;i<a.length;i++)
            if(a[i]==v)return true;
        return false;
    }
};	
if(![].contains)Object.defineProperty(Array.prototype, 'contains', f);
if(!"".contains)Object.defineProperty(String.prototype, 'contains', f);
_.contains=function(a,b){
//    console.log(a);
//    console.log(a&&a.includes(b));
    return a&&a.includes(b);
}
Vue.component('v-dataview', {
    props: {
        value: Array,
        filterKey: String,
        src: String,
        filters: Object,
        rowKey: String,
        rowStyleClass:null,
        pagination: null,
        selectable: Boolean,
        scrollable: Boolean,
		autoload: {
			type: Boolean,
			default: true
		}
    },
	data: function () {
        var sortOrders = {}
        return {
            data: null,
            pages: 1,
            page: 1,
            row: {},
			error:null,
			size:null,
            sortKey: '',
            selected: [],
            sortOrders: sortOrders,
            rowStyleClassFunc:null
        }
    },
	created:function(){
        var me=this;
		//console.log(typeof me.rowStyleClass);
		try{
			if(me.rowStyleClass){
				eval('me.rowStyleClassFunc=function(row,item,index){return '+me.rowStyleClass+'}');
				me.rowStyleClassFunc({},{},0);
			}
		}catch(e){me.rowStyleClassFunc=null;console.log('Error en la expresion rowStyleClassFunc=function(row,item,index){return '+me.rowStyleClass+'}')}
    },
	updated(){console.log('updated');this.$emit('updated')},
	mounted(){if(this.autoload)this.load()},
	template:'<div class="v-dataview clearfix">'+
	'<div v-if="data" style="float:left" v-bind:class="getRowClass(entry,r)" v-for="(entry,r) in data"><slot v-bind:row="entry" v-bind:item="entry" v-bind:index="r"></slot></div>'+
		'<div v-if="data&&!data.length" class="center alert" v-bind:class="{error:error}" style="padding: 5px;">{{error?error:\'No existen registros para mostrar\'}}</div>'+
		'<div v-if="data&&size>data.length" v-on:click="load(page++)" class="center" style="float:left;cursor:pointer;padding: 15px;width:-webkit-fill-available;border: 1px solid #0f62ac;background-color: #e4f2ff;">Ver mas resultados</div></div>',
	methods:{
		getRowClass: function (row,r){
            var cls=[];
            var me=this;
            if(me.rowStyleClassFunc)cls.push(me.rowStyleClassFunc(row,row,r));
			else cls.push(me.rowStyleClass);
            return cls;
        },
		remove(id){
			id=id.id?id.id:id;
			var list=this.data;
			var index = list.map(x => {
				return x.id;
			}).indexOf(id);
			list.splice(index, 1);
		},
		error2(e,m){
			this.data=[];
			this.error=m;
		},
		load:function(reset) {
			var me = this;
			this.selected = [];
			if (me.value) {
				me.data = me.value;
			} else {
				if(reset===true)me.page=1;
				var s = me.src;
				if (!s)
					s = me.$root.apiLink(window.location.pathname);
				if (s.endsWith("/"))
					s = s.slice(0, s.length - 1);
				if (me.pagination) {
					s += '/' + (me.page - 1) * me.pagination + '/' + (me.pagination);
				}
				//console.log(s);console.log(me.filters);
				axios.get(s, {error:me.error2,params: me.filters}).then(function (r) {
					if(r.data&&r.data.error){
						MsgBox(r.data.error);
					}else{
						var d=me.value ? me.value : (r.data.data ? r.data.data : r.data);
						if(!me.data)me.data=[];
						me.data = reset===true?d:me.data?me.data.concat(d):me.data/*:d*/;
						me.size=r.data.size;
						if (r.data && r.data.size){
							me.pages = Math.ceil(r.data.size / me.pagination);
							if (me.page > me.pages)
								me.page = 1;
						}
						//me.rowSelect(null, -10);
					}
				}).catch(me.error);
			}
		}
	}
})

function configureAxios(a){
    var mask;
    a.interceptors.request.use(function (config) {
            _.eeee=config;
            if(!mask)mask=_.mask();
			//config.headers.Authorization =  window.app.session;
            return config;
    }, function (e) {
            mask=_.unmask(mask);
            MsgBox('request '+_.id()+' '+e.message)
            return Promise.reject(e);
    });
    a.interceptors.response.use(function (response) {
            mask=_.unmask(mask);
            return response;
    }, function (e) {
		
	
            if(axios.error&&axios.error(e)==false){
                mask=_.unmask(mask);
			}else{
				var r=e.response,msg=(r&&r.data&&r.data.msg)?r.data.msg:null;
				if(!msg&&r&&r.data&&r.data.message)msg=r.data.message;
				if(!msg&&e.message)msg=e.message;
				if(!msg&&r&&(typeof r.data)==='string')msg=r.data;
				if(!msg)msg=e.response.status+': '+e.response.statusText;
				if(!msg)msg=''+e;
				mask=_.unmask(mask);
				if(e.config.error){
					e.config.error(e,msg);
				}else{
					MsgBox(msg);
				}
			}
			delete axios.error;
        return Promise.reject(e);
    });
}
configureAxios(axios);
_.print=function(o){
    var e=document.createElement('iframe');
    document.body.appendChild(e);
    var d=e.contentWindow.document;
    e.style.display='none';
    d.open();
    d.write('<html><head><title>TT' + o.title + '</title>');
    d.write('<link rel="stylesheet" type="text/css" href="/cdn/isobit.css?v=0004">'+
            '<style>table{background-color:red}</style>');
    d.write('</head><body style="padding:20px;background-color:white !important">');
    d.write('<style>body, body > * {padding:20px;background-color:white !important }</style>');
    d.write('<h1>' + o.title + '</h1>');
    d.write(o.body);
    d.write('</body></html>');
    d.close();
    e.focus();
    e.contentWindow.print();


   /* var w = window.open('', 'PRINT', 'height=400,width=600');
    var d=w.document;
    d.write('<html><head><title>TT' + o.title + '</title>');
    d.write('<link rel="stylesheet" type="text/css" href="/cdn/isobit.css?v=000555">');
    d.write('</head><body style="padding:20px;background-color:white !important"><div>');
    d.write('<style>body, body > * {padding:20px;background-color:white !important }</style>');
    d.write('<h1>' + o.title + '</h1>');
    d.write(o.body);
    d.write('</div></body></html>');
    d.close(); // necessary for IE >= 10
    w.focus(); // necessary for IE >= 10
*/
 //w.print();
 //w.close();
}
Vue.component('v-filter-calendar', {
    template:'<div><v-button icon="fa-calendar" v-on:click.prevent="open"/>'+
            '<v-panel style="text-align:left;position:absolute;display:none" v-bind:header="\'Configurar Filtro []\'"><div style="padding:20px"><div class="v-form"><label>Desde:</label><v-calendar v-model="from"/><label>Hasta:</label><v-calendar v-model="to"/></div>'+
            '<center style="padding-top:20px"><v-button icon="fa-check" value="Aceptar"/><v-button icon="fa-ban" v-on:click.prevent="close" value="Cerrar"/></center></div>'+
            '</v-panel></div>',
    data:function(){return {el:null,mask:null}},
    methods:{
        open(){
            var el=this.el?this.el:(this.el=this.$el.children[1]);
            this.mask=_.mask(el, {backgroundColor: 'rgba(0,0,0,0.95)'});
            el.style.display='block';
        },
        close(){
            _.unmask(this.mask);
        }
    }
});
function fadeOut(id,val){ if(isNaN(val)){ val = 9;}
  document.getElementById(id).style.opacity='0.'+val;
  //For IE
  document.getElementById(id).style.filter='alpha(opacity='+val+'0)';
  if(val>0){
    val--;
    setTimeout('fadeOut("'+id+'",'+val+')',90);
  }else{return;}
}

function fadeIn(id,val){
// ID of the element to fade, Fade value[min value is 0]
  if(isNaN(val)){ val = 0;}
  document.getElementById(id).style.opacity='0.'+val;
  //For IE
  document.getElementById(id).style.filter='alpha(opacity='+val+'0)';
  if(val<9){
    val++;
    setTimeout('fadeIn("'+id+'",'+val+')',90);
  }else{return;}
}
_.ui=_.vuex;
//_.extends=JSON.parse(JSON.stringify(_.extends));
window.axios=axios;
window._ = _;
_.MsgBox=MsgBox;
window.Vue=Vue;
ol.getLayerById=getLayerById;
window.ol=ol;
console.log((n('10')+isObject(1)+findForm('')+MsgBox+getLayerById+fadeOut+fadeIn)?'':'');
Vue.component('v-accordion', {
	mounted(){
	},
	methods:{
		toggle(e){
			this.$emit('change',e);
		}
	},
	template: '<div class="v-accordion"><slot></slot></div>'
});
Vue.component('v-tab', {
	props:['title','expanded'],
	data: function () {
		return {
			count: 0,expanded_:0
		}
	},
	update(){
		this.$el.querySelector('svg').dataset.icon="chevron-down";
	},
	mounted(){
		var me=this;
		me.expanded_=me.expanded;
		setTimeout(function(){
			me.$el.querySelector('svg').dataset.icon="chevron-down";
		}, 100)
	},
	methods:{
		toggle(){
			this.expanded_=!this.expanded_;
			this.$el.querySelector('svg').dataset.icon=this.expanded_?"chevron-up":"chevron-down";
			//avisa al padre q este hijo se expandera
			if(this.$parent&&this.$parent.toggle){
				this.$parent.toggle(this);
				
			}
		}
	},
	template: '<div><div v-on:click="toggle" v-bind:class="{expanded:expanded_}" style="cursor:pointer;position: relative;padding: 10px 0px;">{{title}}<span style="position:absolute;right:0px" ><i data-icon="chevron-down" class="fa"></i></span></div>'+
	'<transition name="fade"><div class="v-tab-content" v-if="expanded_"><slot></slot></div></transition></div>'
});
Vue.component('v-popup',{
	data(){return {show:null,overlay:null}},
	mounted(){
		var me=this;
		me.$el.addEventListener("close", function () {
			me.hide();
		});
	},
	destroyed(){
		var overlay=this.overlay;
		if(overlay){
			overlay.style.visibility = "hidden";
			overlay.style.opacity = 0;
			overlay.remove();
			overlay=null;
		}
	},
	methods:{
		hide(){
			var overlay=this.overlay;
			if(overlay){
				overlay.style.visibility = "hidden";
				overlay.style.opacity = 0;
			}
			this.show=0;
		},
		toggle(){
			var me=this;
			me.show=!me.show;
			var overlay=me.overlay;
			if((me.show)){
				var h=document.querySelector('.v-layout-north');
				me.$el.style.top=h.offsetHeight+'px';
				console.log(me.$el);
				if (!overlay) {
					overlay = document.createElement("div");
					overlay.classList.add("v-overlay");
					overlay.style.padding = "40px";
					overlay.addEventListener("click", function () {
						overlay.style.visibility = "hidden";
						overlay.style.opacity = 0;
						me.show=false;
					});
					document.body.appendChild(me.overlay=overlay);
				}
				overlay.style.visibility = "unset";
				overlay.style.opacity = "unset";
			} else{
				this.hide();
			}
		}
	},
	template:'<div class="v-popup" v-show="show" style="position:absolute;"><slot></slot></div>'
});
_.resize=resize;
Vue.dateDiff=function(fa, fb) {  //fa y fb dos fechas
	if(Number(fa)=== fa)fa=new Date(fa);
    var totdias = fa - fb;
    totdias /= 3600000;
    totdias /= 24;
    totdias = Math.floor(totdias);
    totdias = Math.abs(totdias);
    var ans, meses, dias, m2, m1, d3, d2, d1;
    var f2 = new Date();
    var f1 = new Date();
    if (fa > fb) {
        f2 = fa;
        f1 = fb;
    } else {
        f2 = fb;
        f1 = fa;
    }  //Siempre f2 > f1
    ans = f2.getFullYear() - f1.getFullYear(); // dif de años inicial
    m2 = f2.getMonth();
    m1 = f1.getMonth();
    meses = m2 - m1;
    if (0 > meses) {
        meses += 12;
        --ans;
    }
    d2 = f2.getDate();
    d1 = f1.getDate();
    dias = d2 - d1;
    var f3 = new Date(f2.getFullYear(), m2, 1);
    f3.setDate(f3.getDate() - 1);
    d3 = f3.getDate();
    if (d1 > d2) {
        dias += d3;
        --meses;
        if (0 > meses) {
            meses += 12;
            --ans;
        }
        if (fa > fb) {  //corrección por febrero y meses de 30 días
            f3 = new Date(f1.getFullYear(), m1 + 1, 1);
            f3.setDate(f3.getDate() - 1);
            d3 = f3.getDate();
            if (d3 == 30)
                dias -= 1;
            if (d3 == 29)
                dias -= 2;
            if (d3 == 28)
                dias -= 3;
        }
    }
    return {ans: ans, meses: meses, dias: dias, Tdias: totdias};
}
Vue.directive('can', {
  // Cuando el elemento enlazado se inserta en el DOM...
  inserted: function (el) {
    // Enfoca el elemento
    el.focus()
  }
})

_.ui=function(cfg){
	window._.baseURL=window.axios.defaults.baseURL;
	return Vue.mergeDeep({
		extends: _.extends,	computed:{
		app(){return window.app;},
		baseURL(){return window._.baseURL;},
		session(){return window.app.session;}
	}},cfg);
}
window.ui=_.ui;
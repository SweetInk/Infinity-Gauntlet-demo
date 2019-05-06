/**
 *
 * Copyright (c) 2019 suchu <https://githuboy.online>
 * Released under MIT License
 */
(function (window) {
  var ig = function () {
    //完成数量
    this.compeleteCount = 0;
    //元素列表
    this.elements = [];
    //动画图层数量
    this.MAX_CANVAS = 32;
    //默认动画持续时间
    this.DEFAULT_DURATION = 1.5;
    this.inversion = false;
    this.animOver = $.noop();
    //移除自身
    this.removeSelf = function (ele) {
      return ele && ele.parentNode ? ele.parentNode.removeChild(ele) : null;
    };
    //插入元素
    insertBefore = function (target, src) {
      src.parentNode && src.parentNode.insertBefore(target, src);
    };
    //设置元素样式
    setElementStyle = function (target, attr, value) {
      $(target).css(attr, value);
    };

    this.config = function (props) {
      this.animOver = props.animOver || $.noop();
    };

    //反转
    this.reverse = function () {
      while (this.elements.length > 0) {
        var ele = this.elements.shift();
        $(ele).css('visibility', 'visible');
        $(ele).css('opacity', '1');
        $(ele).animate({ 'opacity': 1 }, 1000, 'linear', function () {
          //console.log(this);
        });
        $(ele).animate({ 'color': '#008000' }, 3000, 'linear', function () {
          $(this).animate({ 'color': '#000' }, 1500, 'linear', function () {
          });
        });
      }
      this.inversion = !this.inversion;
    };
    //构建元素动画链表
    this.buildLinkList = function () {
      //head pointer
      var head = null;
      var parentContext = this;
      //tail pointer
      var tail = null;
      //build linkedlist
      $(this.elements).each(function (index, item) {
        var node = {
          ele: item,
          name: 'Elem' + index,
          count: 0,
          index: index,
          func: function () {
            var thiz = this;
            var offset= $(this.ele).offset().top;
            window.scrollTo({top:offset,
              behavior: "smooth" });
            parentContext.annihilate(parentContext, thiz, thiz.ele);
           /* $('html, body').animate({
              scrollTop: offset
            }, 200, 'linear', function () {

            });*/
          },
          next: null,
        };
        if (head == null) {
          head = node;
          tail = head;
        } else {
          tail.next = node;
          tail = node;
        }
      });
      return head;
    };
    //湮灭
    this.annihilate = function (ig, self, ele) {
      var thiz = self;
      html2canvas(ele, {
        allowTaint: false,
        useCORS: false
      }).then(eleCanvas => {
        var context = eleCanvas.getContext('2d');
        var width = eleCanvas.width;
        var height = eleCanvas.height;
        try {
          var originImageData = context.getImageData(0, 0, width, height);
        } catch (e) {
          return;
        }
        //设置目标元素过渡动画
        setElementStyle(ele, 'transition', 'opacity ' + this.DEFAULT_DURATION + 's ease');
        setElementStyle(ele, 'opacity', 0);
        setTimeout(function () {
          setElementStyle(ele, 'visibility', 'hidden');
        }, 1E3 * this.DEFAULT_DURATION);
        setElementStyle(eleCanvas, 'position', 'absolute');
        setElementStyle(eleCanvas, 'pointerEvents', 'none');
        /*  var h = 0;
         var k = 0;
         var marginLeft = -50 + (0 > h ? h : 0) + (0 > k ? k : 0);*/
        var marginLeft = 0;
        //设置画布样式 &&
        setElementStyle(eleCanvas, 'margin-left', marginLeft + 'px');
        setElementStyle(eleCanvas, 'transition', 'transform ' + this.DEFAULT_DURATION + 's ease-out, opacity ' + this.DEFAULT_DURATION + 's ease-out');
        var imgDataList = [];
        for (var i = 0; this.MAX_CANVAS > i; ++i) {
          imgDataList.push(context.createImageData(width, height));
        }
        var mapping = {};
        var gi = 0;
        var gia = [];
        var nd = [];
        //从谷歌js中逆向过来的
        for (var w = 0; w < width; ++w)
          for (var h = 0; h < height; ++h)
            for (var l = 0; 2 > l; ++l) {
              var rndIndex = Math.floor(32 * (Math.random() + 2 * w / width) / 3);
              var
                n = 4 * (h * width + w);
              for (var
                     pixelColorIndex = 0
                ; 4 > pixelColorIndex;
                   ++pixelColorIndex) {

                imgDataList[ rndIndex ].data[ n + pixelColorIndex ] = originImageData.data[ n + pixelColorIndex ];

              }
              if (mapping[ rndIndex + '' ] == null) {
                mapping[ rndIndex + '' ] = 0;
              } else {
                var v = Number(mapping[ rndIndex + '' ]);
                mapping[ rndIndex + '' ] = ++v;
              }
              gia.push(rndIndex);
              nd.push(n);
            }
        //   console.log('rnd mapping:', mapping);
        //   console.log('gia array:', JSON.stringify(gia));
        //    console.log('nd array:', nd);


        //这个counter不知道为啥计数不准
        var counter = 0;
        //new line
        for (var imgIndex = 0; this.MAX_CANVAS > imgIndex;
             ++imgIndex) {
          var tempCanvas = eleCanvas.cloneNode(true);
          tempCanvas.getContext('2d').putImageData(imgDataList[ imgIndex ], 0, 0);
          $(tempCanvas).css('transitionDelay', 1.35 * imgIndex / 32 + 's');
          insertBefore(tempCanvas, ele);
          setTimeout(function (tempCanvas) {
            return function () {
              var r = 2 * Math.PI * (Math.random() - .5);
              $(tempCanvas).css('transform', 'rotate(' + 15 * (Math.random() - .5) + 'deg) translate(' + 60 * Math.cos(r) + 'px, ' + 30 * Math.sin(r) + 'px)\n  rotate(' + 15 * (Math.random() - .5) + 'deg)');
              $(tempCanvas).css('opacity', 0);
              setTimeout(function () {
                //  console.log('count:', thiz.count);
                ig.removeSelf(tempCanvas);
                thiz.count++;
                counter++;
                //这里链式执行，谷歌的实现基于setTimeout的时间差.
                if (thiz.count === ig.MAX_CANVAS) {
                  ig.compeleteCount++;
                  if (ig.compeleteCount === ig.elements.length) {
                    setTimeout(function () {
                      console.log('all task finished');
                      ig.animOver && ig.animOver();
                      ig.compeleteCount = 0;
                    }, 0);
                  }
                  if (thiz.next != null) {
                    thiz.next.func();
                  }
                }

              }, 1E3 * (1.5 + 1 + Math.random()));
            };
          }(tempCanvas), 0);
        }
      });
    };
    //运行
    this.run = function () {
      if (this.inversion) {
        this.reverse();
        return 0;
      } else {
        this.inversion = !this.inversion;
        //head pointer
        var head = this.buildLinkList();
        //run
        head.func();
      }
    };
  };
  window.ig = new ig();
})(window);

(function() {
   window.loadScript = function(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    // If the browser is Internet Explorer
    if (script.readyState){
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
      // For any other browser
    } else {
      script.onload = function() {
        callback();
      };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  };

  hulk_customer_email = '';
  if(window.formbuilder_customer && window.formbuilder_customer.email){
      hulk_customer_email = window.formbuilder_customer.email
  }

  var GetCorePage = function() {
    var wireframes = document.getElementsByClassName("pxFormGenerator");
    form_url = 'https://formbuilder.hulkapps.com';
    if(wireframes.length > 0){
      for (var i = 0; i < wireframes.length; i++) {
        curFrame = wireframes[i];
        if (curFrame.id){
          var curfrm = document.getElementById('frame_'+curFrame.id);
          var available_iframe = document.getElementById(curFrame.id).innerHTML;
          
          if(available_iframe.indexOf('iframe') === -1){
                var hulk_regexp = /(?!&)utm_[^=]*=[^&]*(?=)/g;
                var hulk_utm_matches = location.search.substr(1).match(hulk_regexp);
                var hulk_utm_params = '';
                if (hulk_utm_matches != undefined){
                    hulk_utm_params = hulk_utm_matches.join('&');
                }
                var hulk_referrer_url = location.href
                var str = '';
                if (hulk_utm_params){
                    hulk_utm_params = hulk_utm_params.includes("utm_source") ? hulk_utm_params : 'utm_source=hulkapps-form-builder-app&'+hulk_utm_params
                    str = hulk_customer_email ? '<iframe src="' + form_url + '/corepage/customform?id=' + curFrame.id +'&referrer_url='+hulk_referrer_url+'&'+ hulk_utm_params +'&customer_email='+hulk_customer_email+'" title="Form Builder - ' + curFrame.id + '" id="frame_' + curFrame.id + '" frameborder="0" width="100%">' : '<iframe src="' + form_url + '/corepage/customform?id=' + curFrame.id +'&referrer_url='+hulk_referrer_url+'&'+ hulk_utm_params +'" title="Form Builder - ' + curFrame.id + '" id="frame_' + curFrame.id + '" frameborder="0" width="100%">';
                }else{
                    str = hulk_customer_email ? '<iframe src="' + form_url + '/corepage/customform?id=' + curFrame.id +'&referrer_url='+hulk_referrer_url+'&customer_email='+hulk_customer_email+'" title="Form Builder - ' + curFrame.id + '" id="frame_' + curFrame.id + '" frameborder="0" width="100%">' : '<iframe src="' + form_url + '/corepage/customform?id=' + curFrame.id +'&referrer_url='+hulk_referrer_url+'" title="Form Builder - ' + curFrame.id + '" id="frame_' + curFrame.id + '" frameborder="0" width="100%">';
                }
                document.getElementById(curFrame.id).innerHTML = str ;
          }
          frame_resize(curFrame.id);
        }  
      }
    }

    function frame_resize(id){
      var iframes = document.getElementsByClassName("pxFormGenerator");
      if(iframes.length > 0){
        for (var i = 0; i < iframes.length; i++) {  
          var width = document.getElementById(id).style.width;
          var formId = id;
          var divId = 'frame_'+id;
          var zino_resize = function (event) {
              if (event.origin !== form_url) {
                  return;
              }
              var zino_iframe = document.getElementById(divId);
              if (zino_iframe) {
                if(event.data['formid'] == formId){
                  if(window.FbThemeAppExtSettingsHash){
                    zino_iframe.contentWindow.postMessage(JSON.stringify(window.FbThemeAppExtSettingsHash),'*');
                  }
                  zino_iframe.style.height = event.data['height'] + "px";
                  if(event.data['scroll_to'] == true){
                      const formElement = document.querySelector('#frame_' + formId);
                      const targetOffset = window.FbIframeoffsetTop ? window.FbIframeoffsetTop : formElement.offsetTop - 50;
                      const duration = 1000;

                      const startTime = performance.now();
                      const startScrollOffset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

                      function scrollToTarget(currentTime) {
                          const elapsed = currentTime - startTime;
                          const progress = Math.min(elapsed / duration, 1);
                          const easing = easeInOutCubic(progress);
                          const scrollOffset = startScrollOffset + (targetOffset - startScrollOffset) * easing;

                          window.scrollTo(0, scrollOffset);

                          if (elapsed < duration) {
                              requestAnimationFrame(scrollToTarget);
                          }
                      }

                      function easeInOutCubic(t) {
                          return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                      }

                      requestAnimationFrame(scrollToTarget);
                  }
                }
              }
          };
          if (window.addEventListener) {
              window.addEventListener("message", zino_resize, false);
          } else if (window.attachEvent) {
              window.attachEvent("onmessage", zino_resize);
          } 
        }
      }
    }
  }

  GetCorePage();

})();  

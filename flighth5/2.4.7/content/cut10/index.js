require(['libs', 'c', 'cUtility', 'cWidgetFactory', 'cWidgetGuider'],
function (libs,c, cUtility, WidgetFactory) {

    var Guider = WidgetFactory.create('Guider');

    (function () {
        var AppUtility = {
            t: 600,
            hasApp: false,
            key: 'HAS_CTRIP_APP',
            appProtocol: 'ctrip://wireless',
            //传入参数，第一个是有app时候处理方案，第二个是没有app时候处理方案，有点情况函数返回ture才打开app，但是初次无论如何都会打开
            openApp: function (hasAppFunc, noAppFunc, appUrl) {
                //看是否已经获取了数据，已经获取过数据便有其它方案
                var appData = AppUtility.getAppData();
                var t1 = Date.now();
                if (appData && appData != '') {
                    if (appData.hasApp) {
                        if (typeof hasAppFunc == 'function') {
                            if (hasAppFunc()) {
                                if (appUrl && appUrl.length > 0) {
                                    window.location = appUrl;
                                }
                            }
                        } else {
                            if (appUrl && appUrl.length > 0) {
                                window.location = appUrl;
                            }
                        }
                    } else {
                        (typeof noAppFunc == 'function') && noAppFunc();
                    }
                    return '';
                }
                if (!appUrl || appUrl.length <= 0) {
                    (typeof noAppFunc == 'function') && noAppFunc();
                }
                var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
                var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0, isChrome = isAndroid && u.indexOf("chrome", 0) != -1 && u.indexOf("nexus", 0) == -1;
                var ifr = $('<iframe style="display: none;"></iframe>');
                ifr.attr('src', appUrl);
                $('body').append(ifr);
                if (isChrome) {
                    if (appUrl && appUrl.length > 0) {
                        window.location = appUrl;
                    }
                    setTimeout(function () {
                        (typeof noAppFunc == 'function') && noAppFunc();
                    }, 1);
                }

                setTimeout(function () {
                    AppUtility.testApp(t1);
                }, AppUtility.t);
                AppUtility.setTestResult(hasAppFunc, noAppFunc);
            },
            testApp: function (t1) {
                var t2 = Date.now();
                if (t2 - t1 < AppUtility.t + 200) {
                    AppUtility.hasApp = false;
                } else {
                    AppUtility.hasApp = true;
                }
            },
            //设置探测结果
            setTestResult: function (hasAppFunc, noAppFunc) {
                setTimeout(function () {
                    if (AppUtility.hasApp) {
                        (typeof hasAppFunc == 'function') && hasAppFunc();
                    } else {
                        (typeof noAppFunc == 'function') && noAppFunc()
                    }
                    //一小时过期
                    var expireDate = new Date();
                    expireDate.setHours(expireDate.getHours() + 1);
                    var entity = {
                        value: { hasApp: AppUtility.hasApp },
                        timeout: expireDate.toUTCString()
                    };
                    window.localStorage.setItem(AppUtility.key, JSON.stringify(entity));
                    window.hasApp = AppUtility.hasApp;

                }, AppUtility.t + 1000);
            },
            //获取app信息
            getAppData: function () {
                //暂时不缓存数据
                return '';
                var result = window.localStorage.getItem(AppUtility.key);
                var needReset = false; //是否需要重新设置数据，1 过期则需要, 2 没数据需要
                if (result) {
                    result = JSON.parse(result);
                    if (Date.parse(result.timeout) >= new Date()) {
                        return result.value;
                    }
                }
                return '';
            }
        };
        window.AppUtility = AppUtility;
    })();



    var init = function () {

        $("#btnBack").click(function (e) {
            // e.preventDefault();

            if (cUtility.isInApp()) {//back native
                
                Guider.backToLastPage(null,true);
                // window.history.back();
                
            } else { // open app

                var appProtocol = "ctrip://wireless";
                var appUrl = "/flight_inquire";
                appUrl = appProtocol + appUrl;
                // window.location = appUrl; //open

                var u = navigator.userAgent ? navigator.userAgent.toLocaleLowerCase() : '';
                //判断设备类型
                var isMac = (u.indexOf("mac", 0) != -1) || (navigator.userAgent.indexOf("ios", 0) != -1) ? 1 : 0; //ios设备
                var isAndroid = (u.indexOf("android", 0) != -1) || (u.indexOf("adr", 0) != -1) ? 1 : 0; //android 设备

                if (isMac) {
                    setTimeout(function () {
                        var url = "itms-apps://itunes.apple.com/cn/app/id379395415?mt=8";
                        window.location = url;
                    }, 30);
                } else {
                    //传入处理函数，第一个是有app时候处理方案，第二个是没有app时候处理方案
                    //安装app情况下，第一个参数为true才会打开app，但是初次无论如何都会打开
                    AppUtility.openApp(function () {
                        return true;
                    }, function () {
                        var url = "http://m.ctrip.com/market/download.aspx?from=H5";
                        window.location.href = url;
                    }, appUrl);
                }

            }
        })
    }

    init();

});
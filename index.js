/**
 * @auth czt
 */

var proxyMiddleware = require('http-proxy-middleware'),
    proxyTable = require('./config'),
    urlDecode = function (url) {
        url = decodeURIComponent(url);
        url = url.replace(/\%3A/g, ':');
        url = url.replace(/\%2F/g, '/');
        url = url.replace(/\%3F/g, '?');
        url = url.replace(/\%3D/g, '=');
        url = url.replace(/\%26/g, '&');
        return url;
    },
    filter = function (pathname, req) {
        var referer = req.headers.referer || '',
            matchs = referer.match(/mock_target=([^&]+)/);
        if (/\.\w+$|\/$/.test(pathname) && pathname) {
            return false;
        }
        if (pathname.indexOf('__webpack') > -1) {
            return false;
        }
        if (matchs && matchs[1]) {
            req.target = urlDecode(matchs[1]);
        }
        return true;
    };

/**
 * AF的请求url比较特殊，没有规则，需要定制一个过滤规则
 * @param {String}pathname
 * @param {HttpRequest}req
 * @return {Boolean}
 */

module.exports = function (config) {
    
    // https://github.com/chimurai/http-proxy-middleware
    var options = null;
    
    // 请求代码与数据mock
    Object.keys(proxyTable).forEach(function (context) {
        options = proxyTable[context];
        if (typeof options === 'string') {
            options = {target: options};
            
        }
    });
    Object.assign(options, config);
    return proxyMiddleware(filter, options);
};

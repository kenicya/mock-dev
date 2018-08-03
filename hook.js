/**
 * Created by ued on 2016/11/12.
 */

var mockPolicy = require('./policy');

function onProxyReq (proxyReq, req, res, options) {
    var data = new Buffer(0);
    
    req.on('data', function (chunk) {
        data = Buffer.concat([data, chunk]);
    });
    
    req.on('end', function () {
        
        // 这里再根据情况判断是不是要本地mock数据
        var option = {
                path: req.path,
                data: data.toString(),
                method: req.method.toLowerCase(),
                req: req,
                res: res
            },
            referer = this.headers.referer || "";
        
        //local, remote, both
        var mockMatch = referer.match(/mock=([^&]+)/),
            mockData;
        
        if (mockMatch) { //通过url启用本地调试数据
            console.log('debug mode:' + mockMatch[1]);
            if (mockMatch[1] === 'remote') {
                return;
            } else if (mockMatch[1] === 'local') {
                mockData = mockPolicy.check(option);
                if (mockData) {
                    proxyReq.abort();
                    proxyReq.destroy();
                    if (typeof mockData.data === 'string' && mockData.data instanceof Buffer) {
                        res.end(mockData.data);
                    } else {
                        res.end(JSON.stringify(mockData.data));
                    }
                }
                return;
            }
        }
        
        mockData = mockPolicy.check(option);
        if (mockData && mockData.mock) { //如果mock为true，即启用远程数据调试。
            proxyReq.abort();
            proxyReq.destroy();
            if (typeof mockData.data === 'string' && mockData.data instanceof Buffer) {
                res.end(mockData.data);
            } else {
                res.end(JSON.stringify(mockData.data));
            }
        }
    });
}

function onProxyRes (proxyRes, req, res, options) {
    
    var data = new Buffer(0);
    
    proxyRes.headers['content-type'] = 'text/json; charset=UTF-8';     // add new header to response
    
    
    // listen for messages coming FROM the target here
    proxyRes.on('data', function (chunk) {
        data = Buffer.concat([data, chunk]);
    });
    
    // listen for messages coming FROM the target here
    proxyRes.on('end', function () {
        mockPolicy.save({
            path: req.path,
            data: data.toString()
        });
    });
}
module.exports = {
    onProxyReq: onProxyReq,
    onProxyRes: onProxyRes
    
};

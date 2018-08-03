### Mock-Plugin

本地调试远程数据，对http-proxy-middleware进行扩展，使用方式同此插件。



**第一步：**

在项目根目录建立mock文件夹

如果初次使用此插件的时候，可以启用开发模式自动同步远程数据到mock文件夹。



**第三步：**

在URL添加参数，如 URL? params(如： http://localhost:8030/?mock_target=http://172.16.100.235:8080&mock=remote )

**支配以下2种方式：**

1、mock_target=http://172.16.100.235:8080 

代理远程地址设置 


2、mock = local (remote, local, both)

是否强行使用本地或远程数据，配置both会根据以下配置动态加载数据：

```
exports.check = function () {
    
    //ture 本地数据， false 远程服务器数据
    return false;
};

```


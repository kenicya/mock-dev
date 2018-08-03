/**
 * Created by ued on 2016/11/12.
 */

var fs = require('fs');
var path = require('path');
var mockDataPath = process.cwd() + '/mock/';
var mkdirp = require('mkdirp');
var tip = '数据已经被本地代理！如果要启用远程数据，请在【mock】文件中新建以下相应路径：';

function getRealPath (option) {
    return path.join(mockDataPath, option.path) + '.js';
}

function mapPath (option) {
    var realPath = getRealPath(option);
    if (!fs.existsSync(realPath)) {
        return '';
    }
    return realPath;
}

function check (option) {
    var realPath = mapPath(option),
        mockModule;
    console.log('[MOCK] searching path: ', path.join(mockDataPath, option.path));
    if (!realPath) {
        return {
            path: realPath,
            mock: false,
            data: {
                success: false,
                msg: tip + option.path
            }
        };
    }
    require.cache[require.resolve(realPath)] = null;
    mockModule = require(realPath);
    if (!mockModule || typeof mockModule.mockData !== 'function') {
        return {
            mock: false,
            data: {
                success: false,
                msg: tip + option.path
            }
        };
    }
    return {
        mock: typeof mockModule.check === 'function' ? !!mockModule.check(option) : true,
        data: mockModule.mockData(option)
    };
}

/**
 *  数据自动保存
 *  @param {Object}option 配置
 *  @param {Boolean}force 是否强制更新本地数据
 * */
function save (option, force) {
    
    var realPath = mapPath(option),
        tempPath = path.join(mockDataPath, 'template.js'),
        temp = '',
        paths,
        dirPath = '';
    
    if (!fs.existsSync(tempPath)) {
        temp = fs.readFileSync(path.join(__dirname + '/data/template.js')).toString();
    } else {
        temp = fs.readFileSync(tempPath).toString();
    }
    if (!realPath) {
        
        // example:  /overview/status/cloudwaf_status
        realPath = getRealPath(option);
        
        paths = realPath.split(/[\/|\\]/);
        
        paths.pop();//去掉文件名
        
        dirPath = paths.join('/');
        
        //目录是否存在
        if (!fs.existsSync(dirPath)) {
            mkdirp(dirPath, function(err) {
                if (err) {
                    console.log(JSON.stringify(err));
                }
            });
        }
        
        //文件是否存在,且数据是符合JSON格式。
        
        try {
            JSON.parse(option.data);
            if (!fs.existsSync(realPath)) {
                fs.writeFileSync(realPath, temp.replace(/\$json_template\$/, option.data.replace(/^[\n\t]+|[\n\t]+$/g, '')));
            }
        } catch (e) {
            console.log(e.message);
        }
    }
}

module.exports = {
    check: check,
    save: save
};

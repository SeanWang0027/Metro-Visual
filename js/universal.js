/**
 * 通过米勒投影法将经纬度转成平面坐标
 * @lon 经度 @lat 纬度
 **/
function MillerConvertion(lon, lat) {
    let L = 6381372 * Math.PI * 2; //地球的周长
    let W = L; //平面展开后，x轴等于周长
    let H = L / 2; //展开后y轴等于周长的一半
    let mill = 2.3; //米勒投影中的一个常数，范围大约在正负2.3之间
    let x = lon * Math.PI / 180; //将经度从度数转换为弧度
    let y = lat * Math.PI / 180; //将纬度从度数转换为弧度
    y = 1.25 * Math.log(Math.tan(0.25 * Math.PI + 0.4 * y)); //米勒投影的转换

    //将弧度转换为实际距离，结果的单位为公里
    x = (W / 2) + (W / (2 * Math.PI)) * x;
    y = (H / 2) - (H / (2 * mill)) * y;
    return [x, y];
}

/**
 * 清空一个标签下面所有的子节点
 * @e 要清空子节点的标签对象
 **/
function removeAllChildren(e){
    var children = e.childNodes; //获取当前标签下面的所有子节点
    for (let i = children.length - 1; i >= 0; i--){
        e.removeChild(children[i]);
    }
}

/**
 * 比较两个集合内的元素是否相等
 * @set1 第一个集合 @set2 第二个集合
 **/
function compareSet(set1, set2) {
    let flag = true;
    for (let item of set1) {
        if (!set2.has(item)) {
            flag = false;
        }
    }
    for (let item of set2) {
        if (!set1.has(item)) {
            flag = false;
        }
    }
    return flag;
}

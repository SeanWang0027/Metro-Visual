/* 导航栏按钮的相关操作 */
/***************************************************************************/
//实现点击导航栏按钮进行切换
let nav_list = document.querySelectorAll(".nav_bar ul li");
let items = document.querySelectorAll(".left_block .body .item");
for (let i = 0; i < nav_list.length; i++) {
    nav_list[i].onclick = function () {
        //将导航栏所有li的类型名清空
        for (let j = 0; j < nav_list.length; j++) {
            nav_list[j].className = "";
        }
        this.className = "current"; //选择当前li标签

        //下侧主体部分对应进行选择
        for (let j = 0; j < items.length; j++) {
            items[j].style.display = "none";
        }
        items[i].style.display = "block";

        //清空message_box中的内容
        let message_box = document.querySelector("#message_box");
        removeAllChildren(message_box);
    }
}
/***************************************************************************/

/**
 * 下侧四个按钮的相关操作 
 */
/***************************************************************************/
//点击放大地图按钮将地图放大
function zoom_in(){
    zoom.scaleBy(svg, 1.1); //触发zoom事件，放大地图
    d3.zoomTransform(svg.node());
}

//点击缩小地图按钮将地图缩小
function zoom_out() {
    zoom.scaleBy(svg, 0.9); //触发zoom事件，缩小地图
    d3.zoomTransform(svg.node());
}

//点击清空地图将地图清空
function clear_map() {
    shMetro.clear();
    drawMap();
}

//点击加载完整地图按钮重新绘制完整的地图
function reload_map() {
    shMetro.clear(); //将地图清空
    shMetro.loadData(); //重新读取完整数据
    drawMap();
}
/***************************************************************************/

/* 消息部分函数封装 */
/***************************************************************************/
/**
 * 清除日志
 */
function clear_message()
{
    let message_box = document.querySelector("#message_box");
    message_box.innerHTML = `<div><span>No New Message.</span></div>`
}

/**
 * 打印日志
 * @param {*} message
 */
function log_message(message)
{
    let message_box = document.querySelector("#message_box");
    message_box.innerHTML = message;
    console.log(message_box.innerHTML)
}

/**
 * 关闭日志
 */
function close_message()
{
    let message_box = document.querySelector("#message_box");
    removeAllChildren(message_box);
}

/***************************************************************************/

/* 站点部分相关操作 */
/***************************************************************************/
/**
 * 站点删除
 */
function delete_node() {
    let deleteNode = document.querySelector("#delete_node_name").value; //获取要删除的站点的名称

    console.log(deleteNode)
    //清空message_box中的内容
    clear_message()

    //判断输入框的内容是否为空
    if (deleteNode != "") {
        //判断是否成功删除节点
        if (shMetro.deleteNode(deleteNode)) {
            drawMap(); //删除节点后对线路图进行更新
            //编写提示内容并将其添加到message_box中
            log_message(`<div><span>Delete Successfully!<br><strong>${deleteNode}</strong> has been Deleted!</span></div>`);
        }
        else {
            log_message(`<div><span>Delete Failed!<br><strong>${deleteNode}</strong>does not exsit!</span></div>`)
        }
    }
    else {

        log_message(`<div><span>The Name of The Station Should Not Be Empty!</span></div>`)    
    }

    //点击右上方关闭按钮则关闭message_box
    //close_message()
}

/**
 * 判断经纬度合法性
 * @param {number} lon 经度
 * @param {number} lat 纬度
 */
function judge_valid(lon,lat){
    if(lon >= lon_range[0] && lon <= lon_range[1] && lat >= lat_range[0] && lat <= lat_range[1]){
        return true
    }
    return false
}

/**
 * 站点添加
 */
function add_node() {
    var addNode = document.querySelector("#add_node_name").value; //要添加的站点的名字
    var lon = document.querySelector("#add_node_lon").value; //要添加的站点的经度
    var lat = document.querySelector("#add_node_lat").value; //要添加的站点的纬度
    //将输入的经纬度信息转换成浮点型
    var station_lon = parseFloat(lon);
    var station_lat = parseFloat(lat);

    //清空message_box中的内容
    clear_message()

    //判断输入框是否为空
    if (add_node_name == "" || lon == "" || lat == "") {
        log_message(`<div><span>Please Submit the Complete Infromation!</span></div>`)
    }
    else {
        //判断输入的经纬度是否在上海的范围内
        if (judge_valid(station_lon,station_lat)) {
            //将经纬度转换为线路图上的位置
            let [x, y] = MillerConvertion(lon, lat);
            //如果线路图上已经存在同名的站点，则会导致添加失败
            if (shMetro.addNode(addNode, x, y, [])) {
                drawMap();
                log_message(`<div><span>Add Successfully!<br><strong>${addNode}</strong> has been Added</span></div>`)
            }
            else {
                log_message(`<div><span>Add Failed!<br><strong>${addNode}</strong> is Not Valid</span></div>`)
            }

        }
        else {
            log_message(`<div><span>Add Failed!<br>The Geographic Data is Not Valid!</span></div>`)
        }
    }
}
/***************************************************************************/

/* 线路部分相关操作 */
/***************************************************************************/
//对选择线路的选框进行更新
function updateLineSelect(lines) {
    let line_select = document.querySelector("#line_select");
    let select_line_to_view = document.querySelector("#select_line_to_view");

    //将选框内的内容清空
    removeAllChildren(line_select);
    removeAllChildren(select_line_to_view);

    for (let line_id of lines) {
        // let str = "<option>" + line_id + "<option>";
        line_select.add(new Option(`${line_id}`, `${line_id}`));
        select_line_to_view.add(new Option(`${line_id}`, `${line_id}`));
    }
}
updateLineSelect(shMetro.lineMap.keys()); //一开始先对选择框进行填充

/**
 * 添加线路
 */
function add_line() {
    let add_line_id = document.querySelector("#add_line_id").value;
    let add_line_color = document.querySelector("#add_line_color").value.slice(1); //将得到的颜色值去掉第一个#

    //清空message_box中的内容
    clear_message()

    //判断线路id的输入是否为空
    if (add_line_id == "") {
        log_message(`<div><span>Line ID Should Not Be Empty!</span></div>`)
    }
    else {
        //判断是否已经存在同名的线路
        if (shMetro.lineMap.has(add_line_id)) {
            log_message(`<div><span>Add Failed!<br><strong>${add_line_id}</strong> Already Exsit!</span></div>`)
        }
        else {
            shMetro.addLine(add_line_id, add_line_id, add_line_color);
            log_message(`<div><span>Add Successfully!<br><strong>${add_line_id}</strong> is Added</span></div>`)
            updateLineSelect(shMetro.lineMap.keys());
        }
    }
}

/**
 * 给线路添加边
 */
function add_edge() {
    //获取要添加的边的两个顶点
    let station1 = document.querySelector("#edge_vertex_1").value;
    let station2 = document.querySelector("#edge_vertex_2").value;

    //清空message_box中的内容
    clear_message()

    //判断线路id的输入是否为空
    if (station1 == "" || station2 == "") {
        log_message(`<div><span>Station Name Should Not Be Empty!</span></div>`)
    }
    else {
        //判断当前线路图上是否已经存在输入的两个顶点
        if (!shMetro.vertexMap.has(station1) || !shMetro.vertexMap.has(station2)) {
            log_message(`<div><span>Check If the Stations are valid!</span></div>`)
        }
        else if (station1 == station2) {
            log_message(`<div><span>Check If the Stations are different!</span></div>`)
        }
        else {
            let line_id = document.querySelector("#line_select").value;

            shMetro.addEdgeToLine(station1, station2, line_id);

            drawMap(); //更新线路图

            log_message(`<div><span>Add Successfully!<br>Check at right side!</span></div>`)
        }
    }
}
/***************************************************************************/

/* 换乘部分相关操作 */
/***************************************************************************/
/**
 * 展示线路
 */
function view_line() {
    let line_id = document.querySelector("#select_line_to_view").value;

    shMetro.loadData(); //选择前线重新加载地图
    let color = shMetro.selectLine(line_id);

    drawFullLine(shMetro.lineArray, color); //根据lineArray中的内容画当前线路的线路图

    //清空message_box中的内容
    clear_message()

    log_message(`<div><span>The line has been shown at right!</span></div>`)
}

//搜索换乘方法的操作
function search_transfer() {
    let station1 = document.querySelector("#search_station_1").value;
    let station2 = document.querySelector("#search_station_2").value;

    //清空message_box中的内容
    clear_message()

    if (station1 == "" || station2 == "") {
        log_message(`<div><span>The Name of Station Should Not Be Empty!</span></div>`)
    }
    else {
        if (!shMetro.vertexMap.has(station1) || !shMetro.vertexMap.has(station2)) {
            log_message(`<div><span>The Name of Station Should Be Exist!</span></div>`)
        }
        else {
            if (shMetro.searchShortestPath(station1, station2)) {
                log_message(`<div><span>The Shortest Path Has Been Found!</span></div>`)
            }
            else {
                log_message(`<div><span>The Shortest Path Has Not Been Found!</span></div>`)
            }
        }
    }
}

//显示换乘指南的操作
function show_transfer() {
    //判断是否已经对线路进行了搜索
    if (shMetro.transferArray.length == 0) {
        let str = `<div>Please Search First!</div>`;

        let body_content = document.querySelector("#body_content");
        removeAllChildren(body_content);
        body_content.innerHTML = str;
    }
    else {
        let str = shMetro.getTransferInfo();

        //将换乘信息添加到模态框的主体内容中
        let body_content = document.querySelector("#body_content");
        removeAllChildren(body_content);
        body_content.innerHTML = str;
    }

    //显示模态框
    let modal = document.querySelector("#modal");
    modal.style.display = "block";
}

//显示最短路径的操作
function show_shortest() {
    //清空message_box中的内容
    clear_message()

    //判断是否已经对线路进行了搜索
    if (shMetro.transferArray.length == 0) {
        log_message(`<div><span>Please Search First!</span></div>`)
    }
    else {
        drawPartMap(shMetro.transferArray); //根据transferArray中的内容绘制部分地图
        log_message(`<div><span>The Shortest Path Has Been Found!</span></div>`)
    }
}
/***************************************************************************/

/* 模态框相关操作 */
/***************************************************************************/
let header_close_btn = document.querySelector("#header_close_btn");
header_close_btn.onclick = function () {
    let modal = document.querySelector("#modal");
    modal.style.display = "none";
}

let footer_close_btn = document.querySelector("#footer_close_btn");
footer_close_btn.onclick = function () {
    let modal = document.querySelector("#modal");
    modal.style.display = "none";
}
/***************************************************************************/
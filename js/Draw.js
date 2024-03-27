let shMetro = new MetroMap(); //线路图类实例化
shMetro.loadData(); //加载内置数据

const svg = d3.select('#map_svg'); //选择线路图区域的svg

//获取svg的宽度和高度
const svg_height = parseInt(svg.style("height"));
const svg_width = parseInt(svg.style("width"));

//定义上海的经纬度范围
const lon_range = [120.51, 122.12];
const lat_range = [30.40, 31.53];

let group = svg.append('g'); //整个图的group

//设置图的缩放功能
const zoom = d3.zoom().scaleExtent([0.3, 4]).on("zoom", zoomed);
svg.call(zoom);
function zoomed(event) {
    const { transform } = event;
    group.attr("transform", transform);
}

let xArr = Array.from(shMetro.vertexMap.values()).map(e => parseInt(e.x)); //获取x坐标的集合
let yArr = Array.from(shMetro.vertexMap.values()).map(e => parseInt(e.y)); //获取y坐标的集合
let [xMin, xMax] = [Math.min(...xArr), Math.max(...xArr)]; //获取x坐标的范围
let [yMin, yMax] = [Math.min(...yArr), Math.max(...yArr)]; //获取y坐标的范围

//通过比例尺实现坐标到图上位置的转换
const xScale = d3.scaleLinear().domain([xMin, xMax]).range([-1000, svg_width + 900]);
const yScale = d3.scaleLinear().domain([yMin, yMax]).range([-500, svg_height + 1000]);

//图上一个节点的相关参数
const station_r = 5; //节点的半径
const station_fill = "grey"; //节点的填充色
const station_stroke = "yellow"; //节点边框的颜色
const station_stroke_width = 3; //节点边框的宽度

//图上一条边的相关参数
const edge_stroke_width = 6; //一条边的宽度

//图上文字的相关参数
const text_size = 8;

//线路名称的相关参数
const line_text_size = 16;


//根据站点的名字画一个节点
function drawNode(name) {
    let station = shMetro.vertexMap.get(name);

    //计算当前站点在图上的位置
    let xPos = xScale(station.x);
    let yPos = yScale(station.y);

    group.append("circle").attr("cx", xPos).attr("cy", yPos).attr("r", station_r)
        .attr("fill", station_fill).attr("stroke", station_stroke).attr("stroke-width", station_stroke_width);
}

//在两个站点之间画一条线(如果两个站点之间有多个线路则画多条边)
function drawLine(station1, station2) {
    let startNode = shMetro.vertexMap.get(station1); //获取起始节点
    let endNode = shMetro.vertexMap.get(station2); //获取终点节点

    //计算起始节点和终点节点在图上的位置
    let [startX, startY] = [xScale(startNode.x), yScale(startNode.y)]; //起始节点在图上的位置
    let [endX, endY] = [xScale(endNode.x), yScale(endNode.y)]; //终点节点在图上的位置

    let deviation = 0; //设置每条边之间的偏移量(有时需要在两点之间画多条线)

    let colorSet = shMetro.getEdgeColor(station1, station2);
    for (let color of colorSet) {
        let lineName = Array.from(shMetro.getLineBetweenVertex(station1, station2)).toString(); //获取当前边的名称

        //获取两个节点中间的位置，用于显示线路的名称
        let midX = (startX + endX) / 2;
        let midY = (startY + endY) / 2;

        group.append("line").attr("x1", startX + deviation).attr("y1", startY + deviation)
            .attr("x2", endX + deviation).attr("y2", endY + deviation)
            .attr("stroke", `#${color}`).attr("stroke-width", edge_stroke_width)
            .on("mouseover", function () {
                let line_name_g = group.append("g");
                line_name_g.append("text").text(lineName).attr("x", midX).attr("y", midY)
                    .attr("font-size", line_text_size).attr("text-anchor", "middle");
            })
            .on("mouseout", function () {
                group.selectAll("g").remove();
            });

        deviation += 3;
    }
}

//根据传入的颜色画一条线
function drawLineWithColor(station1, station2, color) {
    let startNode = shMetro.vertexMap.get(station1); //获取起始节点
    let endNode = shMetro.vertexMap.get(station2); //获取终点节点

    let [startX, startY] = [xScale(startNode.x), yScale(startNode.y)]; //起始节点在图上的位置
    let [endX, endY] = [xScale(endNode.x), yScale(endNode.y)]; //终点节点在图上的位置

    group.append("line").attr("x1", startX).attr("y1", startY)
        .attr("x2", endX).attr("y2", endY)
        .attr("stroke", `#${color}`).attr("stroke-width", edge_stroke_width);
}

//画站点的名称
function drawText(name) {
    let station = shMetro.vertexMap.get(name);

    //计算当前站点在图上的位置
    let xPos = xScale(station.x);
    let yPos = yScale(station.y);

    group.append("text").text(station.stationname).attr("x", xPos + station.xSpace)
        .attr("y", yPos + station.ySpace).attr('font-size', text_size);

}

//清空图上的所有元素
function clearMap() {
    d3.select('g').selectAll('*').remove();
}

//画部分的线路图
function drawPartMap(arr) {
    clearMap(); //将图上所有的元素清空

    //画arr中包含的所有边
    for (let i = 0; i < arr.length - 1; i++) {
        drawLine(arr[i], arr[i + 1]);
    }

    //画arr中包含的所有节点
    for (let i = 0; i < arr.length; i++) {
        drawNode(arr[i]);
    }

    for (let i = 0; i < arr.length; i++) {
        drawText(arr[i]);
    }
}

//一条线路的线路图
function drawFullLine(arr, color) {
    clearMap(); //将图上所有的元素清空

    let paintedEdge = new Set(); //记录已经画过的边

    for (let i = 0; i < arr.length; i++) {
        let node = shMetro.vertexMap.get(arr[i]);

        for (let connectedStation of node.edges.keys()) {
            //判断相连的节点是否在arr中
            if (arr.includes(connectedStation)) {
                //如果当前边已经被画过，则跳过
                if (paintedEdge.has(node.stationname + "-" + connectedStation)) {
                    continue;
                }

                drawLineWithColor(node.stationname, connectedStation, color);

                //将当前边添加到已经画过的边的集合中去
                paintedEdge.add(node.stationname + "-" + connectedStation);
                paintedEdge.add(connectedStation + "-" + node.stationname);
            }
        }

        drawNode(node.stationname); //画所有的节点
    }

    for (let i = 0; i < arr.length; i++) {
        drawText(arr[i]);
    }
}

//根据shMetro绘制完整的地铁线路图
function drawMap() {
    clearMap(); //先将图上所有的元素清空

    let paintedEdge = new Set(); //记录所有已经画过的边

    for (node of shMetro.vertexMap.values()) {
        //画所有的边
        for (let connectedStation of node.edges.keys()) {
            //如果当前边已经被画过，则跳过
            if (paintedEdge.has(node.stationname + "-" + connectedStation)) {
                continue;
            }

            drawLine(node.stationname, connectedStation);

            //将当前边添加到已经画过的边的集合中去
            paintedEdge.add(node.stationname + "-" + connectedStation);
            paintedEdge.add(connectedStation + "-" + node.stationname);
        }

        drawNode(node.stationname); //画所有的节点
    }
    for (node of shMetro.vertexMap.values()) {
        drawText(node.stationname); //或所有站点的名称
    }
}

drawMap();
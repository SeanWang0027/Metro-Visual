//表示线路图上一个节点的类
class Vertex {
    constructor(name, x, y, passLine, xSpace, ySpace) {
        this.stationname = name; //当前节点对应的站点名称
        this.x = parseInt(x); //当前节点位置的横坐标
        this.y = parseInt(y); //当前节点位置的纵坐标
        this.passLine = new Set(passLine); //存放当前节点经过的线路
        this.xSpace = xSpace; //线路图上标注节点的字在x方向偏离的距离
        this.ySpace = ySpace; //线路图上标注节点的字在y方向偏离的距离

        this.edges = new Map(); //存放与当前节点相连的所有边
    }

    /**
     * 添加边的函数
     * @param {number} key 
     * @param {number} distance 
     */
    addEdge(key, distance) {
        this.edges.set(key, distance);
    }
}

//表示线路图上一条线路的类
class Line {
    constructor(id, name, color) {
        this.id = id; //线路的标号
        this.name = name; //线路的名称
        this.color = color; //线路在图上的颜色
    }
}

//整个线路图的类
class MetroMap {
    constructor() {
        this.lineMap = new Map(); //存放所有的线路
        this.vertexMap = new Map(); //存放所有的节点
        this.lineArray = []; //用于存放线路的路径
        this.transferArray = []; //用于存放换乘的路径
    }

    /**
     * 给线路图添加一个节点
     * @param {string} name 
     * @param {number} x 
     * @param {number} y 
     * @param {set} passLine 
     * @param {number} xSpace 
     * @param {number} ySpace 
     * @returns 
     */
    addNode(name, x, y, passLine, xSpace = 7, ySpace = 11) {
        if (this.vertexMap.has(name)) {
            return false;
        }

        //创建新的节点并将其加入到存放节点的map中
        let newnode = new Vertex(name, x, y, passLine, xSpace, ySpace);
        this.vertexMap.set(name, newnode);

        return true;
    }

    /**
     * 删除一个节点
     * @param {string} name 
     * @returns 
     */
    deleteNode(name) {
        if (!this.vertexMap.has(name)) {
            return false;
        }
    
        //删除当前节点
        this.vertexMap.delete(name);

        //删除与当前节点相连的所有边
        for (let node of this.vertexMap.values()) {
            node.edges.delete(name);
        }

        return true;
    }

    /**
     * 为线路图添加新的边
     * @param {string} name1 
     * @param {string} name2 
     */
    addEdge(name1, name2) {
        let [x1, y1] = [this.vertexMap.get(name1).x, this.vertexMap.get(name1).y];
        let [x2, y2] = [this.vertexMap.get(name2).x, this.vertexMap.get(name2).y];
        let distance = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** (1 / 2);
        this.vertexMap.get(name1).addEdge(name2, distance);
        this.vertexMap.get(name2).addEdge(name1, distance);
    }

    /**
     * 为线路图添加新的线路
     * @param {string} lineId 
     * @param {string} lineName 
     * @param {string} lineColor 
     * @returns 
     */
    addLine(lineId, lineName, lineColor) {
        if (this.lineMap.has(lineId)) {
            return false;
        }

        //创建一条新的线路并将其加入到存放线路的map中
        let line = new Line(lineId, lineName, lineColor);
        this.lineMap.set(lineId, line);

        return true;
    }

    /**
     * 给某条线路添加边
     * @param {string} name1 
     * @param {string} name2 
     * @param {string} lineId 
     * @returns 
     */
    addEdgeToLine(name1, name2, lineId) {
        //判断两个节点是否存在
        if (!this.vertexMap.has(name1) || !this.vertexMap.has(name2)) {
            return false;
        }

        this.addEdge(name1, name2); //添加边
        this.vertexMap.get(name1).passLine.add(lineId); //添加第一个节点经过的线路
        this.vertexMap.get(name2).passLine.add(lineId); //添加第二个节点经过的线路

        return true;
    }

    /**
     * 用Dijkstra算法计算最短路径
     * @param {string} startStation 
     * @param {string} endStation 
     * @returns 
     */
    searchShortestPath(startStation, endStation) {
        let open = new Map(); //存放已经拓展但还未求得最短路径值的节点
        let close = new Map(); //存放已经得到最短路径值的节点
        open.set(startStation, 0);

        let parentNode = new Map(); //存放最短路径中每个节点的父节点
        parentNode.set(startStation, null);

        let minDistance = 0; //用于记录最短路径的长度

        while (true) {
            //open中没有节点了仍未搜索到终点站的节点，则搜索失败
            if (open.size == 0) {
                return false;
            }

            let minNode, minValue = Infinity;
            for (let [node, value] of open) {
                if (value < minValue) {
                    [minNode, minValue] = [node, value];
                }
            }

            open.delete(minNode); //在open中删除当前节点
            close.set(minNode, minValue); //将当前节点加入到close中

            //如果找到了目标节点，就返回
            if (minNode == endStation) {
                minDistance = minValue;

                let path = [endStation]; //存放最短路径中经过的节点
                let fatherNode = parentNode.get(endStation);
                while (fatherNode != startStation) {
                    path.unshift(fatherNode); //将父亲节点添加到路径数组的最前面
                    fatherNode = parentNode.get(fatherNode);
                }
                path.unshift(startStation);

                this.transferArray = path;

                return true;
            }

            for (let [node, value] of this.vertexMap.get(minNode).edges) {
                if (!close.has(node)) {
                    //如果当前节点在open中，则对其最短距离进行更新,否则将其添加到open中
                    if (open.has(node)) {
                        if (value + minValue < open.get(node)) {
                            open.set(node, value + minValue);
                            parentNode.set(node, minNode);
                        }
                    }
                    else {
                        open.set(node, value + minValue);
                        parentNode.set(node, minNode);
                    }
                }
            }

        }
    }
    /**
     * 启发式搜索
     * // 启发式函数
        function euclideanHeuristic(current, goal) {
            // 计算当前节点与终点的直线距离 
            const dx = Math.abs(current.x - goal.x);
            const dy = Math.abs(current.y - goal.y);
        
            return Math.sqrt(dx * dx + dy * dy);
        }
        
        // 使用示例
        const start = new Node(0, 0); 
        const end = new Node(10, 10);
        
        const h = euclideanHeuristic(start, end); // 计算启发值
     */



    /**
     * 给主体类返回线路的基本信息
     * @param {string} lineId 
     * @returns 
     */
    selectLine(lineId) {
        let node_list = [];//用于存放当前线路内的所有结点
        for (let node of this.vertexMap.values()) {
            if (node.passLine.has(lineId)) {
                node_list.push(node.stationname);
            }
        }
        this.lineArray = node_list;

        let color = this.lineMap.get(lineId).color;
        return color;
    }

        /**
     * 打印换乘指南
     * @returns 
     */
        getTransferInfo() {
            let info = `<strong>${this.transferArray[0]}->${this.transferArray[this.transferArray.length - 1]} Transfer:</strong><br>`;
            info += `<span>Starter:</span>${this.transferArray[0]}Station<br>`;
    
            if (this.transferArray.length == 0) {
                return info;
            }
    
            let count = 1; //用于记录乘坐的站数
            let name_set = this.getLineBetweenVertex(this.transferArray[0], this.transferArray[1]); //获取前两个节点之间线路的集合
            info += `Ride<strong>${Array.from(name_set).toString()}</strong>,`;
            for (let i = 1; i < this.transferArray.length - 1; i++){
                let new_name_set = shMetro.getLineBetweenVertex(this.transferArray[i], this.transferArray[i + 1]);
                
                if (!compareSet(name_set, new_name_set)) {
                    info += `Take${count}stations，arrive<strong>${this.transferArray[i]}Station</strong><br>`;
                    info += `Transfer to<strong>${Array.from(new_name_set).toString()}</strong>,`;
                    count = 0;
                }
                count += 1;
                name_set = new_name_set;
            }
            info += `Take ${count} Stations<br>`;
            info += `<span>Arrive at destination: </span>${this.transferArray[this.transferArray.length - 1]}Station`;
    
            return info;
        }

    /**
     * 将线路图清空
     */
    clear() {
        this.lineMap.clear();
        this.vertexMap.clear();
        this.vertexMap.clear();
    }

    /**
     * 获取两个点之间的线路颜色
     * @param {string} name1 
     * @param {string} name2 
     * @returns 
     */
    getEdgeColor(name1, name2) {
        //判断两个点之间是否存在边
        if (!this.vertexMap.get(name1).edges.has(name2)) {
            return false;
        }
        else {
            let lineSet1 = this.vertexMap.get(name1).passLine; //获取第一个站点经过的线路的集合
            let lineSet2 = this.vertexMap.get(name2).passLine; //获取第二个站点经过的线路的集合
            let lineSet = new Set([...lineSet1].filter(x => lineSet2.has(x))); //两个站点公共的线路的集合

            let colorSet = new Set(); //用于存放两个站点之间线路的颜色的集合
            for (let line of lineSet) {
                colorSet.add(this.lineMap.get(line).color);
            }

            return colorSet;
        }
    }

    /**
     * 获取两个点之间的线路名称
     * @param {string} name1 
     * @param {string} name2 
     * @returns 
     */
    getLineBetweenVertex(name1, name2) {
        let lineSet1 = this.vertexMap.get(name1).passLine; //获取第一个站点经过的线路的集合
        let lineSet2 = this.vertexMap.get(name2).passLine; //获取第二个站点经过的线路的集合
        let lineSet = new Set([...lineSet1].filter(x => lineSet2.has(x))); //两个站点公共的线路的集合
        
        let nameSet = new Set();
        for (let line of lineSet) {
            nameSet.add(this.lineMap.get(line).name);
        }

        return nameSet;
    }

    //加载内置的线路图数据
    loadData() {
        this.addNode('莘庄', 33567083, 7579234, ['1号线', '5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('外环路', 33567935, 7578416, ['1号线']);
        this.addNode('莲花路', 33569036, 7577578, ['1号线']);
        this.addNode('锦江乐园', 33570283, 7576628, ['1号线']);
        this.addNode('上海南站', 33572058, 7575592, ['1号线', '3号线', '15号线']);
        this.addNode('漕宝路', 33572403, 7574437, ['1号线', '12号线']);
        this.addNode('上海体育馆', 33572880, 7573223, ['1号线', '4号线']);
        this.addNode('徐家汇', 33572815, 7572172, ['1号线', '9号线', '11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('衡山路', 33573883, 7571401, ['1号线']);
        this.addNode('常熟路', 33574185, 7570647, ['1号线', '7号线']);
        this.addNode('陕西南路', 33575255, 7570510, ['1号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)', '12号线']);
        this.addNode('一大会址·黄陂南路', 33576877, 7569873, ['1号线','14号线']);
        this.addNode('人民广场', 33577080, 7569031, ['1号线', '2号线', '8号线']);
        this.addNode('新闸路', 33576302, 7568561, ['1号线']);
        this.addNode('汉中路', 33575250, 7568267, ['1号线', '12号线', '13号线']);
        this.addNode('上海火车站', 33575165, 7567616, ['1号线', '3号线', '4号线']);
        this.addNode('中山北路', 33575306, 7566839, ['1号线']);
        this.addNode('延长路', 33574874, 7565766, ['1号线']);
        this.addNode('上海马戏城', 33574506, 7565076, ['1号线']);
        this.addNode('汶水路', 33574309, 7564013, ['1号线']);
        this.addNode('彭浦新村', 33574130, 7562834, ['1号线']);
        this.addNode('共康路', 33573954, 7561799, ['1号线']);
        this.addNode('通河新村', 33573339, 7560775, ['1号线']);
        this.addNode('呼兰路', 33572912, 7560055, ['1号线']);
        this.addNode('共富新村', 33572506, 7558763, ['1号线']);
        this.addNode('宝安公路', 33572155, 7557548, ['1号线']);
        this.addNode('友谊西路', 33571825, 7556561, ['1号线']);
        this.addNode('富锦路', 33571459, 7555640, ['1号线']);
        this.addNode('浦东国际机场', 33613885, 7575895, ['2号线', '磁悬浮']);
        this.addNode('海天三路', 33612915, 7574427, ['2号线']);
        this.addNode('远东大道', 33608284, 7571833, ['2号线']);
        this.addNode('凌空路', 33604808, 7572380, ['2号线']);
        this.addNode('川沙', 33601925, 7572894, ['2号线']);
        this.addNode('华夏东路', 33600006, 7572069, ['2号线']);
        this.addNode('创新中路', 33599197, 7570617, ['2号线']);
        this.addNode('唐镇', 33597254, 7570598, ['2号线']);
        this.addNode('广兰路', 33593334, 7570854, ['2号线']);
        this.addNode('金科路', 33591209, 7571428, ['2号线']);
        this.addNode('张江高科', 33589616, 7571628, ['2号线']);
        this.addNode('龙阳路', 33586269, 7571481, ['2号线', '7号线', '16号线', '磁悬浮','18号线']);
        this.addNode('世纪公园', 33585520, 7570991, ['2号线']);
        this.addNode('上海科技馆', 33584799, 7570202, ['2号线']);
        this.addNode('世纪大道', 33582880, 7569375, ['2号线', '4号线', '6号线', '9号线']);
        this.addNode('东昌路', 33581582, 7568990, ['2号线']);
        this.addNode('陆家嘴', 33580102, 7568576, ['2号线','14号线']);
        this.addNode('南京东路', 33578138, 7568584, ['2号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('南京西路', 33575391, 7569276, ['2号线', '12号线', '13号线']);
        this.addNode('静安寺', 33573860, 7569844, ['2号线', '7号线','14号线']);
        this.addNode('江苏路', 33572125, 7570069, ['2号线', '11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('中山公园', 33570469, 7570275, ['2号线', '3号线', '4号线']);
        this.addNode('娄山关路', 33569164, 7570845, ['2号线', '15号线']);
        this.addNode('威宁路', 33567296, 7570534, ['2号线']);
        this.addNode('北新泾', 33565816, 7570406, ['2号线']);
        this.addNode('淞虹路', 33564211, 7570253, ['2号线']);
        this.addNode('虹桥2号航站楼', 33560504, 7572267, ['2号线', '10号线(虹桥火车站-基隆路)']);
        this.addNode('虹桥火车站', 33559685, 7572283, ['2号线', '10号线(虹桥火车站-基隆路)', '17号线']);
        this.addNode('徐泾东', 33557486, 7572757, ['2号线']);
        this.addNode('江杨北路', 33573147, 7554330, ['3号线']);
        this.addNode('铁力路', 33575521, 7554308, ['3号线']);
        this.addNode('友谊路', 33577168, 7554653, ['3号线']);
        this.addNode('宝杨路', 33577575, 7555384, ['3号线']);
        this.addNode('水产路', 33578541, 7556561, ['3号线']);
        this.addNode('淞滨路', 33579050, 7557432, ['3号线']);
        this.addNode('张华浜', 33579702, 7558517, ['3号线']);
        this.addNode('淞发路', 33579893, 7559599, ['3号线']);
        this.addNode('长江南路', 33578901, 7560696, ['3号线','18号线']);
        this.addNode('殷高西路', 33578163, 7561709, ['3号线']);
        this.addNode('江湾镇', 33578186, 7562921, ['3号线']);
        this.addNode('大柏树', 33577980, 7564276, ['3号线']);
        this.addNode('赤峰路', 33577893, 7564963, ['3号线']);
        this.addNode('虹口足球场', 33577528, 7565790, ['3号线', '8号线']);
        this.addNode('东宝兴路', 33577645, 7566756, ['3号线']);
        this.addNode('宝山路', 33577210, 7567458, ['3号线', '4号线']);
        this.addNode('中潭路', 33573279, 7567202, ['3号线', '4号线']);
        this.addNode('镇坪路', 33572029, 7567890, ['3号线', '4号线', '7号线']);
        this.addNode('曹杨路', 33570683, 7568483, ['3号线', '4号线', '11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)','14号线']);
        this.addNode('金沙江路', 33570177, 7569096, ['3号线', '4号线', '13号线']);
        this.addNode('延安西路', 33570612, 7570974, ['3号线', '4号线']);
        this.addNode('虹桥路', 33571030, 7571989, ['3号线', '4号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('宜山路', 33571741, 7572896, ['3号线', '4号线', '9号线']);
        this.addNode('漕溪路', 33572990, 7573732, ['3号线']);
        this.addNode('龙漕路', 33573655, 7574344, ['3号线', '12号线']);
        this.addNode('石龙路', 33573524, 7575309, ['3号线']);
        this.addNode('海伦路', 33578591, 7566805, ['4号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('临平路', 33579927, 7566673, ['4号线']);
        this.addNode('大连路', 33581307, 7566919, ['4号线', '12号线']);
        this.addNode('杨树浦路', 33581766, 7567423, ['4号线']);
        this.addNode('浦东大道', 33582009, 7568427, ['4号线','14号线']);
        this.addNode('浦电路(4号线)', 33583423, 7569911, ['4号线']);
        this.addNode('蓝村路', 33582927, 7570802, ['4号线', '6号线']);
        this.addNode('塘桥', 33581931, 7570962, ['4号线']);
        this.addNode('南浦大桥', 33579819, 7571068, ['4号线']);
        this.addNode('西藏南路', 33578686, 7571616, ['4号线', '8号线']);
        this.addNode('鲁班路', 33577082, 7571847, ['4号线']);
        this.addNode('大木桥路', 33575760, 7572280, ['4号线', '12号线']);
        this.addNode('东安路', 33574826, 7572552, ['4号线', '7号线']);
        this.addNode('上海体育场', 33573560, 7572989, ['4号线']);
        this.addNode('闵行开发区', 33565339, 7588498, ['5号线(莘庄--闵行开发区)']);
        this.addNode('文井路', 33566571, 7588249, ['5号线(莘庄--闵行开发区)']);
        this.addNode('华宁路', 33568184, 7587925, ['5号线(莘庄--闵行开发区)']);
        this.addNode('金平路', 33569846, 7587605, ['5号线(莘庄--闵行开发区)']);
        this.addNode('东川路', 33570928, 7587026, ['5号线(莘庄--闵行开发区)', '5号线(莘庄--奉贤新城)']);
        this.addNode('剑川路', 33570559, 7586331, ['5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('北桥', 33569832, 7584770, ['5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('颛桥', 33568920, 7582934, ['5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('银都路', 33567628, 7581062, ['5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('春申路', 33567132, 7580315, ['5号线(莘庄--奉贤新城)', '5号线(莘庄--闵行开发区)']);
        this.addNode('江川路', 33571326, 7588096, ['5号线(莘庄--奉贤新城)']);
        this.addNode('西渡', 33572325, 7589443, ['5号线(莘庄--奉贤新城)']);
        this.addNode('萧塘', 33573374, 7591409, ['5号线(莘庄--奉贤新城)']);
        this.addNode('奉浦大道', 33574168, 7593405, ['5号线(莘庄--奉贤新城)']);
        this.addNode('环城东路', 33575751, 7594317, ['5号线(莘庄--奉贤新城)']);
        this.addNode('望园路', 33578021, 7594252, ['5号线(莘庄--奉贤新城)']);
        this.addNode('金海湖', 33579015, 7594515, ['5号线(莘庄--奉贤新城)']);
        this.addNode('奉贤新城', 33579436, 7595762, ['5号线(莘庄--奉贤新城)']);
        this.addNode('东方体育中心', 33577656, 7575693, ['6号线', '8号线', '11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('灵岩南路', 33579326, 7576088, ['6号线']);
        this.addNode('上南路', 33580535, 7576057, ['6号线']);
        this.addNode('华夏西路', 33581469, 7575986, ['6号线']);
        this.addNode('高青路', 33581608, 7575145, ['6号线']);
        this.addNode('东明路', 33581060, 7574076, ['6号线', '13号线']);
        this.addNode('高科西路', 33580946, 7572976, ['6号线', '7号线']);
        this.addNode('临沂新村', 33581709, 7572352, ['6号线']);
        this.addNode('上海儿童医学中心', 33582465, 7571506, ['6号线']);
        this.addNode('浦电路(6号线)', 33583093, 7570094, ['6号线']);
        this.addNode('源深体育中心', 33583708, 7569012, ['6号线']);
        this.addNode('民生路', 33584697, 7568773, ['6号线','18号线']);
        this.addNode('北洋泾路', 33585676, 7568497, ['6号线']);
        this.addNode('德平路', 33587004, 7567972, ['6号线']);
        this.addNode('云山路', 33587955, 7567551, ['6号线','14号线']);
        this.addNode('金桥路', 33588962, 7566991, ['6号线']);
        this.addNode('博兴路', 33589505, 7566451, ['6号线']);
        this.addNode('五莲路', 33589636, 7565737, ['6号线']);
        this.addNode('巨峰路', 33589691, 7565010, ['6号线', '12号线']);
        this.addNode('东靖路', 33589733, 7564171, ['6号线']);
        this.addNode('五洲大道', 33589786, 7563173, ['6号线']);
        this.addNode('洲海路', 33589806, 7562362, ['6号线']);
        this.addNode('外高桥保税区南', 33591206, 7561577, ['6号线']);
        this.addNode('航津路', 33590316, 7560419, ['6号线']);
        this.addNode('外高桥保税区北', 33589531, 7559375, ['6号线']);
        this.addNode('港城路', 33588175, 7558938, ['6号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('花木路', 33586839, 7570841, ['7号线']);
        this.addNode('芳华路', 33585431, 7572359, ['7号线']);
        this.addNode('锦绣路', 33584309, 7572822, ['7号线']);
        this.addNode('杨高南路', 33582644, 7572824, ['7号线']);
        this.addNode('云台路', 33579898, 7573274, ['7号线']);
        this.addNode('耀华路', 33579249, 7573584, ['7号线', '8号线']);
        this.addNode('长清路', 33578488, 7573925, ['7号线', '13号线']);
        this.addNode('后滩', 33576927, 7574137, ['7号线']);
        this.addNode('龙华中路', 33575066, 7573137, ['7号线', '12号线']);
        this.addNode('肇嘉浜路', 33574304, 7571829, ['7号线', '9号线']);
        this.addNode('昌平路', 33573459, 7568949, ['7号线']);
        this.addNode('长寿路', 33572975, 7568353, ['7号线', '13号线']);
        this.addNode('岚皋路', 33571155, 7567065, ['7号线']);
        this.addNode('新村路', 33571238, 7566415, ['7号线']);
        this.addNode('大华三路', 33571268, 7565567, ['7号线']);
        this.addNode('行知路', 33571106, 7564653, ['7号线']);
        this.addNode('大场镇', 33570555, 7563949, ['7号线']);
        this.addNode('场中路', 33570233, 7563079, ['7号线']);
        this.addNode('上大路', 33569668, 7562123, ['7号线']);
        this.addNode('南陈路', 33568585, 7561589, ['7号线']);
        this.addNode('上海大学', 33567474, 7561660, ['7号线']);
        this.addNode('祁华路', 33565768, 7561515, ['7号线']);
        this.addNode('顾村公园', 33565706, 7559644, ['7号线', '15号线']);
        this.addNode('刘行', 33564522, 7558553, ['7号线']);
        this.addNode('潘广路', 33563794, 7557999, ['7号线']);
        this.addNode('罗南新村', 33563975, 7555928, ['7号线']);
        this.addNode('美兰湖', 33563139, 7554826, ['7号线']);
        this.addNode('沈杜公路', 33581216, 7583402, ['8号线', '浦江线']);
        this.addNode('联航路', 33581030, 7582385, ['8号线']);
        this.addNode('江月路', 33580808, 7581489, ['8号线']);
        this.addNode('浦江镇', 33580548, 7580455, ['8号线']);
        this.addNode('芦恒路', 33579609, 7578574, ['8号线']);
        this.addNode('凌兆新村', 33578698, 7576705, ['8号线']);
        this.addNode('杨思', 33579119, 7575048, ['8号线']);
        this.addNode('成山路', 33579429, 7574236, ['8号线', '13号线']);
        this.addNode('中华艺术宫', 33579140, 7573019, ['8号线']);
        this.addNode('陆家浜路', 33578303, 7570792, ['8号线', '9号线']);
        this.addNode('老西门', 33578045, 7570186, ['8号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('大世界', 33577547, 7569501, ['8号线','14号线']);
        this.addNode('曲阜路', 33576680, 7568231, ['8号线', '12号线']);
        this.addNode('中兴路', 33576400, 7567315, ['8号线']);
        this.addNode('西藏北路', 33576371, 7566452, ['8号线']);
        this.addNode('曲阳路', 33578863, 7565359, ['8号线']);
        this.addNode('四平路', 33580015, 7565497, ['8号线', '10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('鞍山新村', 33580928, 7565635, ['8号线']);
        this.addNode('江浦路', 33581897, 7565492, ['8号线','18号线']);
        this.addNode('黄兴路', 33583013, 7565167, ['8号线']);
        this.addNode('延吉中路', 33583741, 7564350, ['8号线']);
        this.addNode('黄兴公园', 33583568, 7563776, ['8号线']);
        this.addNode('翔殷路', 33583411, 7562969, ['8号线']);
        this.addNode('嫩江路', 33583408, 7562146, ['8号线']);
        this.addNode('市光路', 33583406, 7561481, ['8号线']);
        this.addNode('曹路', 33600237, 7565800, ['9号线']);
        this.addNode('民雷路', 33598575, 7566047, ['9号线']);
        this.addNode('顾唐路', 33597276, 7566236, ['9号线']);
        this.addNode('金海路', 33595290, 7566483, ['9号线', '12号线']);
        this.addNode('金吉路', 33594159, 7566385, ['9号线']);
        this.addNode('金桥', 33592250, 7566675, ['9号线']);
        this.addNode('台儿庄路', 33590704, 7567348, ['9号线']);
        this.addNode('蓝天路', 33588534, 7568339, ['9号线','14号线']);
        this.addNode('芳甸路', 33586357, 7569109, ['9号线']);
        this.addNode('杨高中路', 33585270, 7569473, ['9号线','18号线']);
        this.addNode('商城路', 33581662, 7569242, ['9号线']);
        this.addNode('小南门', 33579671, 7570366, ['9号线']);
        this.addNode('马当路', 33577316, 7570983, ['9号线', '13号线']);
        this.addNode('打浦桥', 33576361, 7571252, ['9号线']);
        this.addNode('嘉善路', 33575473, 7571545, ['9号线', '12号线']);
        this.addNode('桂林路', 33570724, 7573896, ['9号线', '15号线']);
        this.addNode('漕河泾开发区', 33568464, 7574244, ['9号线']);
        this.addNode('合川路', 33567016, 7574588, ['9号线']);
        this.addNode('星中路', 33565249, 7575296, ['9号线']);
        this.addNode('七宝', 33563056, 7575532, ['9号线']);
        this.addNode('中春路', 33561773, 7576025, ['9号线']);
        this.addNode('九亭', 33559738, 7577045, ['9号线']);
        this.addNode('泗泾', 33553147, 7578637, ['9号线']);
        this.addNode('佘山', 33549743, 7579825, ['9号线']);
        this.addNode('洞泾', 33549831, 7581469, ['9号线']);
        this.addNode('松江大学城', 33550065, 7584026, ['9号线']);
        this.addNode('松江新城', 33549860, 7586012, ['9号线']);
        this.addNode('松江体育中心', 33549834, 7587207, ['9号线']);
        this.addNode('醉白池', 33549707, 7588456, ['9号线']);
        this.addNode('松江南站', 33549877, 7589823, ['9号线']);
        this.addNode('基隆路', 33589919, 7559080, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('高桥', 33586863, 7558970, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('高桥西', 33585338, 7559065, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('双江路', 33584241, 7558888, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('国帆路', 33581324, 7560050, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('新江湾城', 33580624, 7560996, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('殷高东路', 33580607, 7561561, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('三门路', 33580778, 7562279, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('江湾体育场', 33581332, 7563028, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('五角场', 33581479, 7563553, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('国权路', 33580966, 7564289, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)','18号线']);
        this.addNode('同济大学', 33580558, 7564892, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('邮电新村', 33579222, 7566030, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('四川北路', 33578091, 7567415, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('天潼路', 33577898, 7568103, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)', '12号线']);
        this.addNode('豫园', 33578454, 7569449, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)','14号线']);
        this.addNode('一大会址·新天地', 33577085, 7570408, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)', '13号线']);
        this.addNode('上海图书馆', 33573653, 7571113, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('交通大学', 33572638, 7571596, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)', '11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('宋园路', 33570057, 7572072, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('伊犁路', 33569146, 7571875, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('水城路', 33567850, 7571825, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('龙溪路', 33566488, 7572251, ['10号线(航中路-基隆路)', '10号线(虹桥火车站-基隆路)']);
        this.addNode('龙柏新村', 33565424, 7573721, ['10号线(航中路-基隆路)']);
        this.addNode('紫藤路', 33564795, 7574325, ['10号线(航中路-基隆路)']);
        this.addNode('航中路', 33563737, 7574683, ['10号线(航中路-基隆路)']);
        this.addNode('上海动物园', 33565163, 7572600, ['10号线(虹桥火车站-基隆路)']);
        this.addNode('虹桥1号航站楼', 33562850, 7572506, ['10号线(虹桥火车站-基隆路)']);
        this.addNode('嘉定北', 33550597, 7555700, ['11号线(嘉定北-迪士尼)']);
        this.addNode('嘉定西', 33549539, 7556913, ['11号线(嘉定北-迪士尼)']);
        this.addNode('白银路', 33551488, 7559580, ['11号线(嘉定北-迪士尼)']);
        this.addNode('嘉定新城', 33552484, 7560864, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('马陆', 33555002, 7561737, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('陈翔公路', 33558323, 7562837, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('南翔', 33560152, 7563644, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('桃浦新村', 33563101, 7564933, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('武威路', 33564778, 7565349, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('祁连山路', 33566043, 7565768, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('李子园', 33567595, 7565989, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('上海西站', 33568815, 7566520, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)', '15号线']);
        this.addNode('真如', 33569516, 7567521, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)','14号线']);
        this.addNode('枫桥路', 33569982, 7568270, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('隆德路', 33571338, 7569221, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)', '13号线']);
        this.addNode('上海游泳馆', 33573326, 7573533, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('龙华', 33574610, 7574074, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)', '12号线']);
        this.addNode('云锦路', 33575230, 7574593, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('龙耀路', 33575361, 7575160, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('三林', 33581141, 7576548, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('三林东', 33582411, 7576273, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)']);
        this.addNode('浦三路', 33584194, 7575903, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('御桥', 33587748, 7575294, ['11号线(花桥-迪士尼)', '11号线(嘉定北-迪士尼)','18号线']);
        this.addNode('罗山路', 33590224, 7575702, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)', '16号线']);
        this.addNode('秀沿路', 33590808, 7576971, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('康新公路', 33592903, 7577616, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('迪士尼', 33598556, 7576708, ['11号线(嘉定北-迪士尼)', '11号线(花桥-迪士尼)']);
        this.addNode('上海赛车场', 33549343, 7560710, ['11号线(花桥-迪士尼)']);
        this.addNode('昌吉东路', 33546480, 7563924, ['11号线(花桥-迪士尼)']);
        this.addNode('上海汽车城', 33544292, 7564614, ['11号线(花桥-迪士尼)']);
        this.addNode('安亭', 33542203, 7564355, ['11号线(花桥-迪士尼)']);
        this.addNode('兆丰路', 33540903, 7564308, ['11号线(花桥-迪士尼)']);
        this.addNode('光明路', 33537213, 7563707, ['11号线(花桥-迪士尼)']);
        this.addNode('花桥', 33535790, 7563490, ['11号线(花桥-迪士尼)']);
        this.addNode('七莘路', 33564531, 7577516, ['12号线']);
        this.addNode('虹莘路', 33566523, 7577028, ['12号线']);
        this.addNode('顾戴路', 33567805, 7576740, ['12号线']);
        this.addNode('东兰路', 33567812, 7575487, ['12号线']);
        this.addNode('虹梅路', 33568406, 7575108, ['12号线']);
        this.addNode('虹漕路', 33569887, 7574799, ['12号线']);
        this.addNode('桂林公园', 33570901, 7574551, ['12号线', '15号线']);
        this.addNode('国际客运中心', 33579644, 7567572, ['12号线']);
        this.addNode('提篮桥', 33580607, 7567290, ['12号线']);
        this.addNode('江浦公园', 33582489, 7566363, ['12号线','18号线']);
        this.addNode('宁国路', 33583453, 7566027, ['12号线']);
        this.addNode('隆昌路', 33584827, 7565469, ['12号线']);
        this.addNode('爱国路', 33585714, 7565085, ['12号线']);
        this.addNode('复兴岛', 33586679, 7565002, ['12号线']);
        this.addNode('东陆路', 33588662, 7564855, ['12号线']);
        this.addNode('杨高北路', 33591317, 7565060, ['12号线']);
        this.addNode('金京路', 33592711, 7565082, ['12号线']);
        this.addNode('申江路', 33593979, 7565048, ['12号线']);
        this.addNode('金运路', 33559725, 7568342, ['13号线']);
        this.addNode('金沙江西路', 33561490, 7568328, ['13号线']);
        this.addNode('丰庄', 33563716, 7568211, ['13号线']);
        this.addNode('祁连山南路', 33565067, 7568624, ['13号线']);
        this.addNode('真北路', 33566701, 7569076, ['13号线']);
        this.addNode('大渡河路', 33568092, 7569117, ['13号线', '15号线']);
        this.addNode('武宁路', 33572109, 7568899, ['13号线','14号线']);
        this.addNode('江宁路', 33573705, 7568065, ['13号线']);
        this.addNode('自然博物馆', 33575658, 7568723, ['13号线']);
        this.addNode('淮海中路', 33575897, 7570080, ['13号线']);
        this.addNode('世博会博物馆', 33577799, 7571985, ['13号线']);
        this.addNode('世博大道', 33578102, 7573225, ['13号线']);
        this.addNode('华鹏路', 33582809, 7573772, ['13号线']);
        this.addNode('下南路', 33584326, 7573518, ['13号线']);
        this.addNode('北蔡', 33585643, 7573448, ['13号线']);
        this.addNode('陈春路', 33586277, 7573899, ['13号线']);
        this.addNode('莲溪路', 33587247, 7574373, ['13号线','18号线']);
        this.addNode('华夏中路', 33589106, 7573815, ['13号线', '16号线']);
        this.addNode('中科路', 33591262, 7573555, ['13号线']);
        this.addNode('学林路', 33592587, 7573168, ['13号线']);
        this.addNode('张江路', 33594237, 7572693, ['13号线']);
        this.addNode('封浜',33556434,7565919,['14号线']);
        this.addNode('乐秀路',33558649,7566134,['14号线']);
        this.addNode('临洮路',33560499,7566338,['14号线']);
        this.addNode('嘉怡路',33562262,7566687,['14号线']);
        this.addNode('定边路',33564015,7566890,['14号线']);
        this.addNode('真新新村',33565242,7567007,['14号线']);
        this.addNode('真光路',33566417,7567156,['14号线']);
        this.addNode('中宁路',33569681,7567788,['14号线']);
        this.addNode('武定路',33572303,7569388,['14号线']);
        this.addNode('浦东南路',33580545,7568425,['14号线']);
        this.addNode('源深路',33582625,7568173,['14号线']);
        this.addNode('歇浦路',33584965,7567468,['14号线']);
        this.addNode('黄杨路',33589592,7568727,['14号线']);
        this.addNode('云顺路',33591025,7568671,['14号线']);
        this.addNode('浦东足球场',33591821,7568200,['14号线']);
        this.addNode('金粤路',33593759,7568066,['14号线']);
        this.addNode('桂桥路',33594365,7567257,['14号线']);
        this.addNode('锦秋路', 33566681, 7561694, ['15号线']);
        this.addNode('丰翔路', 33566582, 7562699, ['15号线']);
        this.addNode('南大路', 33566495, 7563463, ['15号线']);
        this.addNode('祁安路', 33567028, 7564100, ['15号线']);
        this.addNode('古浪路', 33567850, 7564660, ['15号线']);
        this.addNode('武威东路', 33567744, 7565430, ['15号线']);
        this.addNode('铜川路', 33568387, 7567523, ['15号线','14号线']);
        this.addNode('梅岭北路', 33568375, 7568177, ['15号线']);
        this.addNode('长风公园', 33568286, 7569578, ['15号线']);
        this.addNode('红宝石路', 33568528, 7571892, ['15号线']);
        this.addNode('姚虹路', 33569458, 7572492, ['15号线']);
        this.addNode('吴中路', 33570211, 7572892, ['15号线']);
        this.addNode('华东理工大学', 33571952, 7576587, ['15号线']);
        this.addNode('罗秀路', 33572700, 7577523, ['15号线']);
        this.addNode('朱梅路', 33572922, 7578126, ['15号线']);
        this.addNode('华泾西', 33573182, 7579043, ['15号线']);
        this.addNode('虹梅南路', 33572383, 7579835, ['15号线']);
        this.addNode('景西路', 33570801, 7580192, ['15号线']);
        this.addNode('曙建路', 33570705, 7580955, ['15号线']);
        this.addNode('双柏路', 33571134, 7581576, ['15号线']);
        this.addNode('元江路', 33572265, 7583286, ['15号线']);
        this.addNode('永德路', 33573524, 7585270, ['15号线']);
        this.addNode('紫竹高新区', 33574394, 7586568, ['15号线']);
        this.addNode('周浦东', 33591755, 7579327, ['16号线']);
        this.addNode('鹤沙航城', 33592239, 7582030, ['16号线']);
        this.addNode('航头东', 33592936, 7583948, ['16号线']);
        this.addNode('新场', 33596442, 7584732, ['16号线']);
        this.addNode('野生动物园', 33602038, 7584333, ['16号线']);
        this.addNode('惠南', 33608994, 7584039, ['16号线']);
        this.addNode('惠南东', 33612572, 7586334, ['16号线']);
        this.addNode('书院', 33618889, 7591964, ['16号线']);
        this.addNode('临港大道', 33625609, 7594958, ['16号线']);
        this.addNode('滴水湖', 33627695, 7596320, ['16号线']);
        this.addNode('诸光路', 33556799, 7572480, ['17号线']);
        this.addNode('蟠龙路', 33555196, 7572928, ['17号线']);
        this.addNode('徐盈路', 33552448, 7573619, ['17号线']);
        this.addNode('徐泾北城', 33551078, 7573835, ['17号线']);
        this.addNode('嘉松中路', 33549100, 7574793, ['17号线']);
        this.addNode('赵巷', 33545577, 7575032, ['17号线']);
        this.addNode('汇金路', 33541053, 7575034, ['17号线']);
        this.addNode('青浦新城', 33538158, 7575227, ['17号线']);
        this.addNode('漕盈路', 33534953, 7575098, ['17号线']);
        this.addNode('淀山湖大道', 33533309, 7577279, ['17号线']);
        this.addNode('朱家角', 33529618, 7580119, ['17号线']);
        this.addNode('东方绿舟', 33526337, 7580291, ['17号线']);
        this.addNode('殷高路',33578847,7561495,['18号线']);
        this.addNode('上海财经大学',33578912,7562546,['18号线']);
        this.addNode('复旦大学',33579333,7563533,['18号线']);
        this.addNode('抚顺路',33581222,7564822,['18号线']);
        this.addNode('平凉路',33582358,7566671,['18号线']);
        this.addNode('丹阳路',33582738,7566990,['18号线']);
        this.addNode('昌邑路',33584394,7568072,['18号线','14号线']);
        this.addNode('迎春路',33585007,7569841,['18号线']);
        this.addNode('芳芯路',33585951,7572312,['18号线']);
        this.addNode('北中路',33586632,7573132,['18号线']);
        this.addNode('康桥', 33587350, 7577275, ['18号线']);
        this.addNode('周浦', 33587377, 7579040, ['18号线']);
        this.addNode('繁荣路', 33587707, 7579955, ['18号线']);
        this.addNode('沈梅路', 33588770, 7580885, ['18号线']);
        this.addNode('鹤涛路', 33589423, 7582528, ['18号线']);
        this.addNode('下沙', 33589761, 7583992, ['18号线']);
        this.addNode('航头', 33590551, 7585424, ['18号线']);
        this.addNode('三鲁公路', 33582900, 7583848, ['浦江线']);
        this.addNode('闵瑞路', 33583227, 7584532, ['浦江线']);
        this.addNode('浦航路', 33583257, 7585115, ['浦江线']);
        this.addNode('东城一路', 33583424, 7586004, ['浦江线']);
        this.addNode('汇臻路', 33582585, 7586435, ['浦江线']);

        this.addEdge('莘庄', '外环路');
        this.addEdge('莘庄', '春申路');
        this.addEdge('外环路', '莘庄');
        this.addEdge('外环路', '莲花路');
        this.addEdge('莲花路', '外环路');
        this.addEdge('莲花路', '锦江乐园');
        this.addEdge('锦江乐园', '莲花路');
        this.addEdge('锦江乐园', '上海南站');
        this.addEdge('上海南站', '锦江乐园');
        this.addEdge('上海南站', '漕宝路');
        this.addEdge('上海南站', '石龙路');
        this.addEdge('上海南站', '桂林公园');
        this.addEdge('上海南站', '华东理工大学');
        this.addEdge('漕宝路', '上海南站');
        this.addEdge('漕宝路', '上海体育馆');
        this.addEdge('漕宝路', '桂林公园');
        this.addEdge('漕宝路', '龙漕路');
        this.addEdge('上海体育馆', '漕宝路');
        this.addEdge('上海体育馆', '徐家汇');
        this.addEdge('上海体育馆', '上海体育场');
        this.addEdge('徐家汇', '上海体育馆');
        this.addEdge('徐家汇', '衡山路');
        this.addEdge('徐家汇', '肇嘉浜路');
        this.addEdge('徐家汇', '宜山路');
        this.addEdge('徐家汇', '交通大学');
        this.addEdge('徐家汇', '上海游泳馆');
        this.addEdge('衡山路', '徐家汇');
        this.addEdge('衡山路', '常熟路');
        this.addEdge('常熟路', '衡山路');
        this.addEdge('常熟路', '陕西南路');
        this.addEdge('常熟路', '肇嘉浜路');
        this.addEdge('常熟路', '静安寺');
        this.addEdge('陕西南路', '常熟路');
        this.addEdge('陕西南路', '一大会址·黄陂南路');
        this.addEdge('陕西南路', '一大会址·新天地');
        this.addEdge('陕西南路', '上海图书馆');
        this.addEdge('陕西南路', '嘉善路');
        this.addEdge('陕西南路', '南京西路');
        this.addEdge('一大会址·黄陂南路', '陕西南路');
        this.addEdge('一大会址·黄陂南路', '人民广场');
        this.addEdge('人民广场', '一大会址·黄陂南路');
        this.addEdge('人民广场', '新闸路');
        this.addEdge('人民广场', '南京东路');
        this.addEdge('人民广场', '南京西路');
        this.addEdge('人民广场', '大世界');
        this.addEdge('人民广场', '曲阜路');
        this.addEdge('新闸路', '人民广场');
        this.addEdge('新闸路', '汉中路');
        this.addEdge('汉中路', '新闸路');
        this.addEdge('汉中路', '上海火车站');
        this.addEdge('汉中路', '南京西路');
        this.addEdge('汉中路', '曲阜路');
        this.addEdge('汉中路', '江宁路');
        this.addEdge('汉中路', '自然博物馆');
        this.addEdge('上海火车站', '汉中路');
        this.addEdge('上海火车站', '中山北路');
        this.addEdge('上海火车站', '宝山路');
        this.addEdge('上海火车站', '中潭路');
        this.addEdge('中山北路', '上海火车站');
        this.addEdge('中山北路', '延长路');
        this.addEdge('延长路', '中山北路');
        this.addEdge('延长路', '上海马戏城');
        this.addEdge('上海马戏城', '延长路');
        this.addEdge('上海马戏城', '汶水路');
        this.addEdge('汶水路', '上海马戏城');
        this.addEdge('汶水路', '彭浦新村');
        this.addEdge('彭浦新村', '汶水路');
        this.addEdge('彭浦新村', '共康路');
        this.addEdge('共康路', '彭浦新村');
        this.addEdge('共康路', '通河新村');
        this.addEdge('通河新村', '共康路');
        this.addEdge('通河新村', '呼兰路');
        this.addEdge('呼兰路', '通河新村');
        this.addEdge('呼兰路', '共富新村');
        this.addEdge('共富新村', '呼兰路');
        this.addEdge('共富新村', '宝安公路');
        this.addEdge('宝安公路', '共富新村');
        this.addEdge('宝安公路', '友谊西路');
        this.addEdge('友谊西路', '宝安公路');
        this.addEdge('友谊西路', '富锦路');
        this.addEdge('富锦路', '友谊西路');
        this.addEdge('浦东国际机场', '海天三路');
        this.addEdge('浦东国际机场', '龙阳路');
        this.addEdge('海天三路', '浦东国际机场');
        this.addEdge('海天三路', '远东大道');
        this.addEdge('远东大道', '海天三路');
        this.addEdge('远东大道', '凌空路');
        this.addEdge('凌空路', '远东大道');
        this.addEdge('凌空路', '川沙');
        this.addEdge('川沙', '凌空路');
        this.addEdge('川沙', '华夏东路');
        this.addEdge('华夏东路', '川沙');
        this.addEdge('华夏东路', '创新中路');
        this.addEdge('创新中路', '华夏东路');
        this.addEdge('创新中路', '唐镇');
        this.addEdge('唐镇', '创新中路');
        this.addEdge('唐镇', '广兰路');
        this.addEdge('广兰路', '唐镇');
        this.addEdge('广兰路', '金科路');
        this.addEdge('金科路', '广兰路');
        this.addEdge('金科路', '张江高科');
        this.addEdge('张江高科', '金科路');
        this.addEdge('张江高科', '龙阳路');
        this.addEdge('龙阳路', '张江高科');
        this.addEdge('龙阳路', '世纪公园');
        this.addEdge('龙阳路', '花木路');
        this.addEdge('龙阳路', '芳华路');
        this.addEdge('龙阳路', '华夏中路');
        this.addEdge('龙阳路', '浦东国际机场');
        this.addEdge('世纪公园', '龙阳路');
        this.addEdge('世纪公园', '上海科技馆');
        this.addEdge('上海科技馆', '世纪公园');
        this.addEdge('上海科技馆', '世纪大道');
        this.addEdge('世纪大道', '上海科技馆');
        this.addEdge('世纪大道', '东昌路');
        this.addEdge('世纪大道', '浦东大道');
        this.addEdge('世纪大道', '浦电路(4号线)');
        this.addEdge('世纪大道', '浦电路(6号线)');
        this.addEdge('世纪大道', '源深体育中心');
        this.addEdge('世纪大道', '杨高中路');
        this.addEdge('世纪大道', '商城路');
        this.addEdge('东昌路', '世纪大道');
        this.addEdge('东昌路', '陆家嘴');
        this.addEdge('陆家嘴', '东昌路');
        this.addEdge('陆家嘴', '南京东路');
        this.addEdge('南京东路', '陆家嘴');
        this.addEdge('南京东路', '人民广场');
        this.addEdge('南京东路', '天潼路');
        this.addEdge('南京东路', '豫园');
        this.addEdge('南京西路', '人民广场');
        this.addEdge('南京西路', '静安寺');
        this.addEdge('南京西路', '陕西南路');
        this.addEdge('南京西路', '汉中路');
        this.addEdge('南京西路', '自然博物馆');
        this.addEdge('南京西路', '淮海中路');
        this.addEdge('静安寺', '南京西路');
        this.addEdge('静安寺', '江苏路');
        this.addEdge('静安寺', '常熟路');
        this.addEdge('静安寺', '昌平路');
        this.addEdge('江苏路', '静安寺');
        this.addEdge('江苏路', '中山公园');
        this.addEdge('江苏路', '隆德路');
        this.addEdge('江苏路', '交通大学');
        this.addEdge('中山公园', '江苏路');
        this.addEdge('中山公园', '娄山关路');
        this.addEdge('中山公园', '金沙江路');
        this.addEdge('中山公园', '延安西路');
        this.addEdge('娄山关路', '中山公园');
        this.addEdge('娄山关路', '威宁路');
        this.addEdge('娄山关路', '长风公园');
        this.addEdge('娄山关路', '红宝石路');
        this.addEdge('威宁路', '娄山关路');
        this.addEdge('威宁路', '北新泾');
        this.addEdge('北新泾', '威宁路');
        this.addEdge('北新泾', '淞虹路');
        this.addEdge('淞虹路', '北新泾');
        this.addEdge('淞虹路', '虹桥2号航站楼');
        this.addEdge('虹桥2号航站楼', '淞虹路');
        this.addEdge('虹桥2号航站楼', '虹桥火车站');
        this.addEdge('虹桥2号航站楼', '虹桥1号航站楼');
        this.addEdge('虹桥火车站', '虹桥2号航站楼');
        this.addEdge('虹桥火车站', '徐泾东');
        this.addEdge('虹桥火车站', '诸光路');
        this.addEdge('徐泾东', '虹桥火车站');
        this.addEdge('江杨北路', '铁力路');
        this.addEdge('铁力路', '江杨北路');
        this.addEdge('铁力路', '友谊路');
        this.addEdge('友谊路', '铁力路');
        this.addEdge('友谊路', '宝杨路');
        this.addEdge('宝杨路', '友谊路');
        this.addEdge('宝杨路', '水产路');
        this.addEdge('水产路', '宝杨路');
        this.addEdge('水产路', '淞滨路');
        this.addEdge('淞滨路', '水产路');
        this.addEdge('淞滨路', '张华浜');
        this.addEdge('张华浜', '淞滨路');
        this.addEdge('张华浜', '淞发路');
        this.addEdge('淞发路', '张华浜');
        this.addEdge('淞发路', '长江南路');
        this.addEdge('长江南路', '淞发路');
        this.addEdge('长江南路', '殷高西路');
        this.addEdge('殷高西路', '长江南路');
        this.addEdge('殷高西路', '江湾镇');
        this.addEdge('江湾镇', '殷高西路');
        this.addEdge('江湾镇', '大柏树');
        this.addEdge('大柏树', '江湾镇');
        this.addEdge('大柏树', '赤峰路');
        this.addEdge('赤峰路', '大柏树');
        this.addEdge('赤峰路', '虹口足球场');
        this.addEdge('虹口足球场', '赤峰路');
        this.addEdge('虹口足球场', '东宝兴路');
        this.addEdge('虹口足球场', '西藏北路');
        this.addEdge('虹口足球场', '曲阳路');
        this.addEdge('东宝兴路', '虹口足球场');
        this.addEdge('东宝兴路', '宝山路');
        this.addEdge('宝山路', '东宝兴路');
        this.addEdge('宝山路', '上海火车站');
        this.addEdge('宝山路', '海伦路');
        this.addEdge('中潭路', '上海火车站');
        this.addEdge('中潭路', '镇坪路');
        this.addEdge('镇坪路', '中潭路');
        this.addEdge('镇坪路', '曹杨路');
        this.addEdge('镇坪路', '长寿路');
        this.addEdge('镇坪路', '岚皋路');
        this.addEdge('曹杨路', '镇坪路');
        this.addEdge('曹杨路', '金沙江路');
        this.addEdge('曹杨路', '枫桥路');
        this.addEdge('曹杨路', '隆德路');
        this.addEdge('金沙江路', '曹杨路');
        this.addEdge('金沙江路', '中山公园');
        this.addEdge('金沙江路', '大渡河路');
        this.addEdge('金沙江路', '隆德路');
        this.addEdge('延安西路', '中山公园');
        this.addEdge('延安西路', '虹桥路');
        this.addEdge('虹桥路', '延安西路');
        this.addEdge('虹桥路', '宜山路');
        this.addEdge('虹桥路', '交通大学');
        this.addEdge('虹桥路', '宋园路');
        this.addEdge('宜山路', '虹桥路');
        this.addEdge('宜山路', '漕溪路');
        this.addEdge('宜山路', '徐家汇');
        this.addEdge('宜山路', '桂林路');
        this.addEdge('漕溪路', '宜山路');
        this.addEdge('漕溪路', '龙漕路');
        this.addEdge('龙漕路', '漕溪路');
        this.addEdge('龙漕路', '石龙路');
        this.addEdge('龙漕路', '漕宝路');
        this.addEdge('龙漕路', '龙华');
        this.addEdge('石龙路', '龙漕路');
        this.addEdge('石龙路', '上海南站');
        this.addEdge('海伦路', '宝山路');
        this.addEdge('海伦路', '临平路');
        this.addEdge('海伦路', '邮电新村');
        this.addEdge('海伦路', '四川北路');
        this.addEdge('临平路', '海伦路');
        this.addEdge('临平路', '大连路');
        this.addEdge('大连路', '临平路');
        this.addEdge('大连路', '杨树浦路');
        this.addEdge('大连路', '提篮桥');
        this.addEdge('大连路', '江浦公园');
        this.addEdge('杨树浦路', '大连路');
        this.addEdge('杨树浦路', '浦东大道');
        this.addEdge('浦东大道', '杨树浦路');
        this.addEdge('浦东大道', '世纪大道');
        this.addEdge('浦电路(4号线)', '世纪大道');
        this.addEdge('浦电路(4号线)', '蓝村路');
        this.addEdge('蓝村路', '浦电路(4号线)');
        this.addEdge('蓝村路', '塘桥');
        this.addEdge('蓝村路', '上海儿童医学中心');
        this.addEdge('蓝村路', '浦电路(6号线)');
        this.addEdge('塘桥', '蓝村路');
        this.addEdge('塘桥', '南浦大桥');
        this.addEdge('南浦大桥', '塘桥');
        this.addEdge('南浦大桥', '西藏南路');
        this.addEdge('西藏南路', '南浦大桥');
        this.addEdge('西藏南路', '鲁班路');
        this.addEdge('西藏南路', '中华艺术宫');
        this.addEdge('西藏南路', '陆家浜路');
        this.addEdge('鲁班路', '西藏南路');
        this.addEdge('鲁班路', '大木桥路');
        this.addEdge('大木桥路', '鲁班路');
        this.addEdge('大木桥路', '东安路');
        this.addEdge('大木桥路', '龙华中路');
        this.addEdge('大木桥路', '嘉善路');
        this.addEdge('东安路', '大木桥路');
        this.addEdge('东安路', '上海体育场');
        this.addEdge('东安路', '龙华中路');
        this.addEdge('东安路', '肇嘉浜路');
        this.addEdge('上海体育场', '东安路');
        this.addEdge('上海体育场', '上海体育馆');
        this.addEdge('闵行开发区', '文井路');
        this.addEdge('文井路', '闵行开发区');
        this.addEdge('文井路', '华宁路');
        this.addEdge('华宁路', '文井路');
        this.addEdge('华宁路', '金平路');
        this.addEdge('金平路', '华宁路');
        this.addEdge('金平路', '东川路');
        this.addEdge('东川路', '金平路');
        this.addEdge('东川路', '剑川路');
        this.addEdge('东川路', '江川路');
        this.addEdge('剑川路', '东川路');
        this.addEdge('剑川路', '北桥');
        this.addEdge('北桥', '剑川路');
        this.addEdge('北桥', '颛桥');
        this.addEdge('颛桥', '北桥');
        this.addEdge('颛桥', '银都路');
        this.addEdge('银都路', '颛桥');
        this.addEdge('银都路', '春申路');
        this.addEdge('春申路', '银都路');
        this.addEdge('春申路', '莘庄');
        this.addEdge('江川路', '东川路');
        this.addEdge('江川路', '西渡');
        this.addEdge('西渡', '江川路');
        this.addEdge('西渡', '萧塘');
        this.addEdge('萧塘', '西渡');
        this.addEdge('萧塘', '奉浦大道');
        this.addEdge('奉浦大道', '萧塘');
        this.addEdge('奉浦大道', '环城东路');
        this.addEdge('环城东路', '奉浦大道');
        this.addEdge('环城东路', '望园路');
        this.addEdge('望园路', '环城东路');
        this.addEdge('望园路', '金海湖');
        this.addEdge('金海湖', '望园路');
        this.addEdge('金海湖', '奉贤新城');
        this.addEdge('奉贤新城', '金海湖');
        this.addEdge('东方体育中心', '灵岩南路');
        this.addEdge('东方体育中心', '凌兆新村');
        this.addEdge('东方体育中心', '杨思');
        this.addEdge('东方体育中心', '龙耀路');
        this.addEdge('东方体育中心', '三林');
        this.addEdge('灵岩南路', '东方体育中心');
        this.addEdge('灵岩南路', '上南路');
        this.addEdge('上南路', '灵岩南路');
        this.addEdge('上南路', '华夏西路');
        this.addEdge('华夏西路', '上南路');
        this.addEdge('华夏西路', '高青路');
        this.addEdge('高青路', '华夏西路');
        this.addEdge('高青路', '东明路');
        this.addEdge('东明路', '高青路');
        this.addEdge('东明路', '高科西路');
        this.addEdge('东明路', '成山路');
        this.addEdge('东明路', '华鹏路');
        this.addEdge('高科西路', '东明路');
        this.addEdge('高科西路', '临沂新村');
        this.addEdge('高科西路', '杨高南路');
        this.addEdge('高科西路', '云台路');
        this.addEdge('临沂新村', '高科西路');
        this.addEdge('临沂新村', '上海儿童医学中心');
        this.addEdge('上海儿童医学中心', '临沂新村');
        this.addEdge('上海儿童医学中心', '蓝村路');
        this.addEdge('浦电路(6号线)', '蓝村路');
        this.addEdge('浦电路(6号线)', '世纪大道');
        this.addEdge('源深体育中心', '世纪大道');
        this.addEdge('源深体育中心', '民生路');
        this.addEdge('民生路', '源深体育中心');
        this.addEdge('民生路', '北洋泾路');
        this.addEdge('北洋泾路', '民生路');
        this.addEdge('北洋泾路', '德平路');
        this.addEdge('德平路', '北洋泾路');
        this.addEdge('德平路', '云山路');
        this.addEdge('云山路', '德平路');
        this.addEdge('云山路', '金桥路');
        this.addEdge('金桥路', '云山路');
        this.addEdge('金桥路', '博兴路');
        this.addEdge('博兴路', '金桥路');
        this.addEdge('博兴路', '五莲路');
        this.addEdge('五莲路', '博兴路');
        this.addEdge('五莲路', '巨峰路');
        this.addEdge('巨峰路', '五莲路');
        this.addEdge('巨峰路', '东靖路');
        this.addEdge('巨峰路', '东陆路');
        this.addEdge('巨峰路', '杨高北路');
        this.addEdge('东靖路', '巨峰路');
        this.addEdge('东靖路', '五洲大道');
        this.addEdge('五洲大道', '东靖路');
        this.addEdge('五洲大道', '洲海路');
        this.addEdge('洲海路', '五洲大道');
        this.addEdge('洲海路', '外高桥保税区南');
        this.addEdge('外高桥保税区南', '洲海路');
        this.addEdge('外高桥保税区南', '航津路');
        this.addEdge('航津路', '外高桥保税区南');
        this.addEdge('航津路', '外高桥保税区北');
        this.addEdge('外高桥保税区北', '航津路');
        this.addEdge('外高桥保税区北', '港城路');
        this.addEdge('港城路', '外高桥保税区北');
        this.addEdge('港城路', '基隆路');
        this.addEdge('港城路', '高桥');
        this.addEdge('花木路', '龙阳路');
        this.addEdge('芳华路', '龙阳路');
        this.addEdge('芳华路', '锦绣路');
        this.addEdge('锦绣路', '芳华路');
        this.addEdge('锦绣路', '杨高南路');
        this.addEdge('杨高南路', '锦绣路');
        this.addEdge('杨高南路', '高科西路');
        this.addEdge('云台路', '高科西路');
        this.addEdge('云台路', '耀华路');
        this.addEdge('耀华路', '云台路');
        this.addEdge('耀华路', '长清路');
        this.addEdge('耀华路', '成山路');
        this.addEdge('耀华路', '中华艺术宫');
        this.addEdge('长清路', '耀华路');
        this.addEdge('长清路', '后滩');
        this.addEdge('长清路', '世博大道');
        this.addEdge('长清路', '成山路');
        this.addEdge('后滩', '长清路');
        this.addEdge('后滩', '龙华中路');
        this.addEdge('龙华中路', '后滩');
        this.addEdge('龙华中路', '东安路');
        this.addEdge('龙华中路', '龙华');
        this.addEdge('龙华中路', '大木桥路');
        this.addEdge('肇嘉浜路', '东安路');
        this.addEdge('肇嘉浜路', '常熟路');
        this.addEdge('肇嘉浜路', '嘉善路');
        this.addEdge('肇嘉浜路', '徐家汇');
        this.addEdge('昌平路', '静安寺');
        this.addEdge('昌平路', '长寿路');
        this.addEdge('长寿路', '昌平路');
        this.addEdge('长寿路', '镇坪路');
        this.addEdge('长寿路', '武宁路');
        this.addEdge('长寿路', '江宁路');
        this.addEdge('岚皋路', '镇坪路');
        this.addEdge('岚皋路', '新村路');
        this.addEdge('新村路', '岚皋路');
        this.addEdge('新村路', '大华三路');
        this.addEdge('大华三路', '新村路');
        this.addEdge('大华三路', '行知路');
        this.addEdge('行知路', '大华三路');
        this.addEdge('行知路', '大场镇');
        this.addEdge('大场镇', '行知路');
        this.addEdge('大场镇', '场中路');
        this.addEdge('场中路', '大场镇');
        this.addEdge('场中路', '上大路');
        this.addEdge('上大路', '场中路');
        this.addEdge('上大路', '南陈路');
        this.addEdge('南陈路', '上大路');
        this.addEdge('南陈路', '上海大学');
        this.addEdge('上海大学', '南陈路');
        this.addEdge('上海大学', '祁华路');
        this.addEdge('祁华路', '上海大学');
        this.addEdge('祁华路', '顾村公园');
        this.addEdge('顾村公园', '祁华路');
        this.addEdge('顾村公园', '刘行');
        this.addEdge('顾村公园', '锦秋路');
        this.addEdge('刘行', '顾村公园');
        this.addEdge('刘行', '潘广路');
        this.addEdge('潘广路', '刘行');
        this.addEdge('潘广路', '罗南新村');
        this.addEdge('罗南新村', '潘广路');
        this.addEdge('罗南新村', '美兰湖');
        this.addEdge('美兰湖', '罗南新村');
        this.addEdge('沈杜公路', '联航路');
        this.addEdge('沈杜公路', '三鲁公路');
        this.addEdge('联航路', '沈杜公路');
        this.addEdge('联航路', '江月路');
        this.addEdge('江月路', '联航路');
        this.addEdge('江月路', '浦江镇');
        this.addEdge('浦江镇', '江月路');
        this.addEdge('浦江镇', '芦恒路');
        this.addEdge('芦恒路', '浦江镇');
        this.addEdge('芦恒路', '凌兆新村');
        this.addEdge('凌兆新村', '芦恒路');
        this.addEdge('凌兆新村', '东方体育中心');
        this.addEdge('杨思', '东方体育中心');
        this.addEdge('杨思', '成山路');
        this.addEdge('成山路', '杨思');
        this.addEdge('成山路', '耀华路');
        this.addEdge('成山路', '长清路');
        this.addEdge('成山路', '东明路');
        this.addEdge('中华艺术宫', '耀华路');
        this.addEdge('中华艺术宫', '西藏南路');
        this.addEdge('陆家浜路', '西藏南路');
        this.addEdge('陆家浜路', '老西门');
        this.addEdge('陆家浜路', '小南门');
        this.addEdge('陆家浜路', '马当路');
        this.addEdge('老西门', '陆家浜路');
        this.addEdge('老西门', '大世界');
        this.addEdge('老西门', '豫园');
        this.addEdge('老西门', '一大会址·新天地');
        this.addEdge('大世界', '老西门');
        this.addEdge('大世界', '人民广场');
        this.addEdge('曲阜路', '人民广场');
        this.addEdge('曲阜路', '中兴路');
        this.addEdge('曲阜路', '汉中路');
        this.addEdge('曲阜路', '天潼路');
        this.addEdge('中兴路', '曲阜路');
        this.addEdge('中兴路', '西藏北路');
        this.addEdge('西藏北路', '中兴路');
        this.addEdge('西藏北路', '虹口足球场');
        this.addEdge('曲阳路', '虹口足球场');
        this.addEdge('曲阳路', '四平路');
        this.addEdge('四平路', '曲阳路');
        this.addEdge('四平路', '鞍山新村');
        this.addEdge('四平路', '同济大学');
        this.addEdge('四平路', '邮电新村');
        this.addEdge('鞍山新村', '四平路');
        this.addEdge('鞍山新村', '江浦路');
        this.addEdge('江浦路', '鞍山新村');
        this.addEdge('江浦路', '黄兴路');
        this.addEdge('黄兴路', '江浦路');
        this.addEdge('黄兴路', '延吉中路');
        this.addEdge('延吉中路', '黄兴路');
        this.addEdge('延吉中路', '黄兴公园');
        this.addEdge('黄兴公园', '延吉中路');
        this.addEdge('黄兴公园', '翔殷路');
        this.addEdge('翔殷路', '黄兴公园');
        this.addEdge('翔殷路', '嫩江路');
        this.addEdge('嫩江路', '翔殷路');
        this.addEdge('嫩江路', '市光路');
        this.addEdge('市光路', '嫩江路');
        this.addEdge('曹路', '民雷路');
        this.addEdge('民雷路', '曹路');
        this.addEdge('民雷路', '顾唐路');
        this.addEdge('顾唐路', '民雷路');
        this.addEdge('顾唐路', '金海路');
        this.addEdge('金海路', '顾唐路');
        this.addEdge('金海路', '金吉路');
        this.addEdge('金海路', '申江路');
        this.addEdge('金吉路', '金海路');
        this.addEdge('金吉路', '金桥');
        this.addEdge('金桥', '金吉路');
        this.addEdge('金桥', '台儿庄路');
        this.addEdge('台儿庄路', '金桥');
        this.addEdge('台儿庄路', '蓝天路');
        this.addEdge('蓝天路', '台儿庄路');
        this.addEdge('蓝天路', '芳甸路');
        this.addEdge('芳甸路', '蓝天路');
        this.addEdge('芳甸路', '杨高中路');
        this.addEdge('杨高中路', '芳甸路');
        this.addEdge('杨高中路', '世纪大道');
        this.addEdge('商城路', '世纪大道');
        this.addEdge('商城路', '小南门');
        this.addEdge('小南门', '商城路');
        this.addEdge('小南门', '陆家浜路');
        this.addEdge('马当路', '陆家浜路');
        this.addEdge('马当路', '打浦桥');
        this.addEdge('马当路', '一大会址·新天地');
        this.addEdge('马当路', '世博会博物馆');
        this.addEdge('打浦桥', '马当路');
        this.addEdge('打浦桥', '嘉善路');
        this.addEdge('嘉善路', '打浦桥');
        this.addEdge('嘉善路', '肇嘉浜路');
        this.addEdge('嘉善路', '大木桥路');
        this.addEdge('嘉善路', '陕西南路');
        this.addEdge('桂林路', '宜山路');
        this.addEdge('桂林路', '漕河泾开发区');
        this.addEdge('桂林路', '吴中路');
        this.addEdge('桂林路', '桂林公园');
        this.addEdge('漕河泾开发区', '桂林路');
        this.addEdge('漕河泾开发区', '合川路');
        this.addEdge('合川路', '漕河泾开发区');
        this.addEdge('合川路', '星中路');
        this.addEdge('星中路', '合川路');
        this.addEdge('星中路', '七宝');
        this.addEdge('七宝', '星中路');
        this.addEdge('七宝', '中春路');
        this.addEdge('中春路', '七宝');
        this.addEdge('中春路', '九亭');
        this.addEdge('九亭', '中春路');
        this.addEdge('九亭', '泗泾');
        this.addEdge('泗泾', '九亭');
        this.addEdge('泗泾', '佘山');
        this.addEdge('佘山', '泗泾');
        this.addEdge('佘山', '洞泾');
        this.addEdge('洞泾', '佘山');
        this.addEdge('洞泾', '松江大学城');
        this.addEdge('松江大学城', '洞泾');
        this.addEdge('松江大学城', '松江新城');
        this.addEdge('松江新城', '松江大学城');
        this.addEdge('松江新城', '松江体育中心');
        this.addEdge('松江体育中心', '松江新城');
        this.addEdge('松江体育中心', '醉白池');
        this.addEdge('醉白池', '松江体育中心');
        this.addEdge('醉白池', '松江南站');
        this.addEdge('松江南站', '醉白池');
        this.addEdge('基隆路', '港城路');
        this.addEdge('高桥', '港城路');
        this.addEdge('高桥', '高桥西');
        this.addEdge('高桥西', '高桥');
        this.addEdge('高桥西', '双江路');
        this.addEdge('双江路', '高桥西');
        this.addEdge('双江路', '国帆路');
        this.addEdge('国帆路', '双江路');
        this.addEdge('国帆路', '新江湾城');
        this.addEdge('新江湾城', '国帆路');
        this.addEdge('新江湾城', '殷高东路');
        this.addEdge('殷高东路', '新江湾城');
        this.addEdge('殷高东路', '三门路');
        this.addEdge('三门路', '殷高东路');
        this.addEdge('三门路', '江湾体育场');
        this.addEdge('江湾体育场', '三门路');
        this.addEdge('江湾体育场', '五角场');
        this.addEdge('五角场', '江湾体育场');
        this.addEdge('五角场', '国权路');
        this.addEdge('国权路', '五角场');
        this.addEdge('国权路', '同济大学');
        this.addEdge('同济大学', '国权路');
        this.addEdge('同济大学', '四平路');
        this.addEdge('邮电新村', '四平路');
        this.addEdge('邮电新村', '海伦路');
        this.addEdge('四川北路', '海伦路');
        this.addEdge('四川北路', '天潼路');
        this.addEdge('天潼路', '四川北路');
        this.addEdge('天潼路', '南京东路');
        this.addEdge('天潼路', '曲阜路');
        this.addEdge('天潼路', '国际客运中心');
        this.addEdge('豫园', '南京东路');
        this.addEdge('豫园', '老西门');
        this.addEdge('一大会址·新天地', '老西门');
        this.addEdge('一大会址·新天地', '陕西南路');
        this.addEdge('一大会址·新天地', '淮海中路');
        this.addEdge('一大会址·新天地', '马当路');
        this.addEdge('上海图书馆', '陕西南路');
        this.addEdge('上海图书馆', '交通大学');
        this.addEdge('交通大学', '上海图书馆');
        this.addEdge('交通大学', '虹桥路');
        this.addEdge('交通大学', '江苏路');
        this.addEdge('交通大学', '徐家汇');
        this.addEdge('宋园路', '虹桥路');
        this.addEdge('宋园路', '伊犁路');
        this.addEdge('伊犁路', '宋园路');
        this.addEdge('伊犁路', '水城路');
        this.addEdge('水城路', '伊犁路');
        this.addEdge('水城路', '龙溪路');
        this.addEdge('龙溪路', '水城路');
        this.addEdge('龙溪路', '龙柏新村');
        this.addEdge('龙溪路', '上海动物园');
        this.addEdge('龙柏新村', '龙溪路');
        this.addEdge('龙柏新村', '紫藤路');
        this.addEdge('紫藤路', '龙柏新村');
        this.addEdge('紫藤路', '航中路');
        this.addEdge('航中路', '紫藤路');
        this.addEdge('上海动物园', '龙溪路');
        this.addEdge('上海动物园', '虹桥1号航站楼');
        this.addEdge('虹桥1号航站楼', '上海动物园');
        this.addEdge('虹桥1号航站楼', '虹桥2号航站楼');
        this.addEdge('嘉定北', '嘉定西');
        this.addEdge('嘉定西', '嘉定北');
        this.addEdge('嘉定西', '白银路');
        this.addEdge('白银路', '嘉定西');
        this.addEdge('白银路', '嘉定新城');
        this.addEdge('嘉定新城', '白银路');
        this.addEdge('嘉定新城', '马陆');
        this.addEdge('嘉定新城', '上海赛车场');
        this.addEdge('马陆', '嘉定新城');
        this.addEdge('马陆', '陈翔公路');
        this.addEdge('陈翔公路', '马陆');
        this.addEdge('陈翔公路', '南翔');
        this.addEdge('南翔', '陈翔公路');
        this.addEdge('南翔', '桃浦新村');
        this.addEdge('桃浦新村', '南翔');
        this.addEdge('桃浦新村', '武威路');
        this.addEdge('武威路', '桃浦新村');
        this.addEdge('武威路', '祁连山路');
        this.addEdge('祁连山路', '武威路');
        this.addEdge('祁连山路', '李子园');
        this.addEdge('李子园', '祁连山路');
        this.addEdge('李子园', '上海西站');
        this.addEdge('上海西站', '李子园');
        this.addEdge('上海西站', '真如');
        this.addEdge('上海西站', '武威东路');
        this.addEdge('上海西站', '铜川路');
        this.addEdge('真如', '上海西站');
        this.addEdge('真如', '枫桥路');
        this.addEdge('枫桥路', '真如');
        this.addEdge('枫桥路', '曹杨路');
        this.addEdge('隆德路', '曹杨路');
        this.addEdge('隆德路', '江苏路');
        this.addEdge('隆德路', '金沙江路');
        this.addEdge('隆德路', '武宁路');
        this.addEdge('上海游泳馆', '徐家汇');
        this.addEdge('上海游泳馆', '龙华');
        this.addEdge('龙华', '上海游泳馆');
        this.addEdge('龙华', '云锦路');
        this.addEdge('龙华', '龙漕路');
        this.addEdge('龙华', '龙华中路');
        this.addEdge('云锦路', '龙华');
        this.addEdge('云锦路', '龙耀路');
        this.addEdge('龙耀路', '云锦路');
        this.addEdge('龙耀路', '东方体育中心');
        this.addEdge('三林', '东方体育中心');
        this.addEdge('三林', '三林东');
        this.addEdge('三林东', '三林');
        this.addEdge('三林东', '浦三路');
        this.addEdge('浦三路', '三林东');
        this.addEdge('浦三路', '御桥');
        this.addEdge('御桥', '浦三路');
        this.addEdge('御桥', '罗山路');
        this.addEdge('御桥', '康桥');
        this.addEdge('罗山路', '御桥');
        this.addEdge('罗山路', '秀沿路');
        this.addEdge('罗山路', '华夏中路');
        this.addEdge('罗山路', '周浦东');
        this.addEdge('秀沿路', '罗山路');
        this.addEdge('秀沿路', '康新公路');
        this.addEdge('康新公路', '秀沿路');
        this.addEdge('康新公路', '迪士尼');
        this.addEdge('迪士尼', '康新公路');
        this.addEdge('上海赛车场', '嘉定新城');
        this.addEdge('上海赛车场', '昌吉东路');
        this.addEdge('昌吉东路', '上海赛车场');
        this.addEdge('昌吉东路', '上海汽车城');
        this.addEdge('上海汽车城', '昌吉东路');
        this.addEdge('上海汽车城', '安亭');
        this.addEdge('安亭', '上海汽车城');
        this.addEdge('安亭', '兆丰路');
        this.addEdge('兆丰路', '安亭');
        this.addEdge('兆丰路', '光明路');
        this.addEdge('光明路', '兆丰路');
        this.addEdge('光明路', '花桥');
        this.addEdge('花桥', '光明路');
        this.addEdge('七莘路', '虹莘路');
        this.addEdge('虹莘路', '七莘路');
        this.addEdge('虹莘路', '顾戴路');
        this.addEdge('顾戴路', '虹莘路');
        this.addEdge('顾戴路', '东兰路');
        this.addEdge('东兰路', '顾戴路');
        this.addEdge('东兰路', '虹梅路');
        this.addEdge('虹梅路', '东兰路');
        this.addEdge('虹梅路', '虹漕路');
        this.addEdge('虹漕路', '虹梅路');
        this.addEdge('虹漕路', '桂林公园');
        this.addEdge('桂林公园', '虹漕路');
        this.addEdge('桂林公园', '漕宝路');
        this.addEdge('桂林公园', '桂林路');
        this.addEdge('桂林公园', '上海南站');
        this.addEdge('国际客运中心', '天潼路');
        this.addEdge('国际客运中心', '提篮桥');
        this.addEdge('提篮桥', '国际客运中心');
        this.addEdge('提篮桥', '大连路');
        this.addEdge('江浦公园', '大连路');
        this.addEdge('江浦公园', '宁国路');
        this.addEdge('宁国路', '江浦公园');
        this.addEdge('宁国路', '隆昌路');
        this.addEdge('隆昌路', '宁国路');
        this.addEdge('隆昌路', '爱国路');
        this.addEdge('爱国路', '隆昌路');
        this.addEdge('爱国路', '复兴岛');
        this.addEdge('复兴岛', '爱国路');
        this.addEdge('复兴岛', '东陆路');
        this.addEdge('东陆路', '复兴岛');
        this.addEdge('东陆路', '巨峰路');
        this.addEdge('杨高北路', '巨峰路');
        this.addEdge('杨高北路', '金京路');
        this.addEdge('金京路', '杨高北路');
        this.addEdge('金京路', '申江路');
        this.addEdge('申江路', '金京路');
        this.addEdge('申江路', '金海路');
        this.addEdge('金运路', '金沙江西路');
        this.addEdge('金沙江西路', '金运路');
        this.addEdge('金沙江西路', '丰庄');
        this.addEdge('丰庄', '金沙江西路');
        this.addEdge('丰庄', '祁连山南路');
        this.addEdge('祁连山南路', '丰庄');
        this.addEdge('祁连山南路', '真北路');
        this.addEdge('真北路', '祁连山南路');
        this.addEdge('真北路', '大渡河路');
        this.addEdge('大渡河路', '真北路');
        this.addEdge('大渡河路', '金沙江路');
        this.addEdge('大渡河路', '梅岭北路');
        this.addEdge('大渡河路', '长风公园');
        this.addEdge('武宁路', '隆德路');
        this.addEdge('武宁路', '长寿路');
        this.addEdge('江宁路', '长寿路');
        this.addEdge('江宁路', '汉中路');
        this.addEdge('自然博物馆', '汉中路');
        this.addEdge('自然博物馆', '南京西路');
        this.addEdge('淮海中路', '南京西路');
        this.addEdge('淮海中路', '一大会址·新天地');
        this.addEdge('世博会博物馆', '马当路');
        this.addEdge('世博会博物馆', '世博大道');
        this.addEdge('世博大道', '世博会博物馆');
        this.addEdge('世博大道', '长清路');
        this.addEdge('华鹏路', '东明路');
        this.addEdge('华鹏路', '下南路');
        this.addEdge('下南路', '华鹏路');
        this.addEdge('下南路', '北蔡');
        this.addEdge('北蔡', '下南路');
        this.addEdge('北蔡', '陈春路');
        this.addEdge('陈春路', '北蔡');
        this.addEdge('陈春路', '莲溪路');
        this.addEdge('莲溪路', '陈春路');
        this.addEdge('莲溪路', '华夏中路');
        this.addEdge('华夏中路', '莲溪路');
        this.addEdge('华夏中路', '中科路');
        this.addEdge('华夏中路', '龙阳路');
        this.addEdge('华夏中路', '罗山路');
        this.addEdge('中科路', '华夏中路');
        this.addEdge('中科路', '学林路');
        this.addEdge('学林路', '中科路');
        this.addEdge('学林路', '张江路');
        this.addEdge('张江路', '学林路');
        this.addEdge('锦秋路', '顾村公园');
        this.addEdge('锦秋路', '丰翔路');
        this.addEdge('丰翔路', '锦秋路');
        this.addEdge('丰翔路', '南大路');
        this.addEdge('南大路', '丰翔路');
        this.addEdge('南大路', '祁安路');
        this.addEdge('祁安路', '南大路');
        this.addEdge('祁安路', '古浪路');
        this.addEdge('古浪路', '祁安路');
        this.addEdge('古浪路', '武威东路');
        this.addEdge('武威东路', '古浪路');
        this.addEdge('武威东路', '上海西站');
        this.addEdge('铜川路', '上海西站');
        this.addEdge('铜川路', '梅岭北路');
        this.addEdge('梅岭北路', '铜川路');
        this.addEdge('梅岭北路', '大渡河路');
        this.addEdge('长风公园', '大渡河路');
        this.addEdge('长风公园', '娄山关路');
        this.addEdge('红宝石路', '娄山关路');
        this.addEdge('红宝石路', '姚虹路');
        this.addEdge('姚虹路', '红宝石路');
        this.addEdge('姚虹路', '吴中路');
        this.addEdge('吴中路', '姚虹路');
        this.addEdge('吴中路', '桂林路');
        this.addEdge('华东理工大学', '上海南站');
        this.addEdge('华东理工大学', '罗秀路');
        this.addEdge('罗秀路', '华东理工大学');
        this.addEdge('罗秀路', '朱梅路');
        this.addEdge('朱梅路', '罗秀路');
        this.addEdge('朱梅路', '华泾西');
        this.addEdge('华泾西', '朱梅路');
        this.addEdge('华泾西', '虹梅南路');
        this.addEdge('虹梅南路', '华泾西');
        this.addEdge('虹梅南路', '景西路');
        this.addEdge('景西路', '虹梅南路');
        this.addEdge('景西路', '曙建路');
        this.addEdge('曙建路', '景西路');
        this.addEdge('曙建路', '双柏路');
        this.addEdge('双柏路', '曙建路');
        this.addEdge('双柏路', '元江路');
        this.addEdge('元江路', '双柏路');
        this.addEdge('元江路', '永德路');
        this.addEdge('永德路', '元江路');
        this.addEdge('永德路', '紫竹高新区');
        this.addEdge('紫竹高新区', '永德路');
        this.addEdge('周浦东', '罗山路');
        this.addEdge('周浦东', '鹤沙航城');
        this.addEdge('鹤沙航城', '周浦东');
        this.addEdge('鹤沙航城', '航头东');
        this.addEdge('航头东', '鹤沙航城');
        this.addEdge('航头东', '新场');
        this.addEdge('新场', '航头东');
        this.addEdge('新场', '野生动物园');
        this.addEdge('野生动物园', '新场');
        this.addEdge('野生动物园', '惠南');
        this.addEdge('惠南', '野生动物园');
        this.addEdge('惠南', '惠南东');
        this.addEdge('惠南东', '惠南');
        this.addEdge('惠南东', '书院');
        this.addEdge('书院', '惠南东');
        this.addEdge('书院', '临港大道');
        this.addEdge('临港大道', '书院');
        this.addEdge('临港大道', '滴水湖');
        this.addEdge('滴水湖', '临港大道');
        this.addEdge('诸光路', '虹桥火车站');
        this.addEdge('诸光路', '蟠龙路');
        this.addEdge('蟠龙路', '诸光路');
        this.addEdge('蟠龙路', '徐盈路');
        this.addEdge('徐盈路', '蟠龙路');
        this.addEdge('徐盈路', '徐泾北城');
        this.addEdge('徐泾北城', '徐盈路');
        this.addEdge('徐泾北城', '嘉松中路');
        this.addEdge('嘉松中路', '徐泾北城');
        this.addEdge('嘉松中路', '赵巷');
        this.addEdge('赵巷', '嘉松中路');
        this.addEdge('赵巷', '汇金路');
        this.addEdge('汇金路', '赵巷');
        this.addEdge('汇金路', '青浦新城');
        this.addEdge('青浦新城', '汇金路');
        this.addEdge('青浦新城', '漕盈路');
        this.addEdge('漕盈路', '青浦新城');
        this.addEdge('漕盈路', '淀山湖大道');
        this.addEdge('淀山湖大道', '漕盈路');
        this.addEdge('淀山湖大道', '朱家角');
        this.addEdge('朱家角', '淀山湖大道');
        this.addEdge('朱家角', '东方绿舟');
        this.addEdge('东方绿舟', '朱家角');
        this.addEdge('长江南路','殷高路');
        this.addEdge('上海财经大学','殷高路');
        this.addEdge('上海财经大学','复旦大学');
        this.addEdge('国权路','复旦大学');
        this.addEdge('国权路','抚顺路');
        this.addEdge('江浦路','抚顺路');
        this.addEdge('江浦路','江浦公园');
        this.addEdge('平凉路','江浦公园');
        this.addEdge('平凉路','丹阳路');
        this.addEdge('昌邑路','丹阳路');
        this.addEdge('昌邑路','民生路');
        this.addEdge('杨高中路','民生路');
        this.addEdge('杨高中路','迎春路');
        this.addEdge('迎春路','龙阳路');
        this.addEdge('芳芯路','龙阳路');
        this.addEdge('芳芯路','北中路');
        this.addEdge('北中路','御桥');
        this.addEdge('御桥','莲溪路');
        this.addEdge('康桥', '御桥');
        this.addEdge('康桥', '周浦');
        this.addEdge('周浦', '康桥');
        this.addEdge('周浦', '繁荣路');
        this.addEdge('繁荣路', '周浦');
        this.addEdge('繁荣路', '沈梅路');
        this.addEdge('沈梅路', '繁荣路');
        this.addEdge('沈梅路', '鹤涛路');
        this.addEdge('鹤涛路', '沈梅路');
        this.addEdge('鹤涛路', '下沙');
        this.addEdge('下沙', '鹤涛路');
        this.addEdge('下沙', '航头');
        this.addEdge('航头', '下沙');
        this.addEdge('三鲁公路', '沈杜公路');
        this.addEdge('三鲁公路', '闵瑞路');
        this.addEdge('闵瑞路', '三鲁公路');
        this.addEdge('闵瑞路', '浦航路');
        this.addEdge('浦航路', '闵瑞路');
        this.addEdge('浦航路', '东城一路');
        this.addEdge('东城一路', '浦航路');
        this.addEdge('东城一路', '汇臻路');
        this.addEdge('汇臻路', '东城一路');
        this.addEdge('封浜','乐秀路');
        this.addEdge('临洮路','乐秀路');
        this.addEdge('临洮路','嘉怡路');
        this.addEdge('定边路','嘉怡路');
        this.addEdge('定边路','真新新村');
        this.addEdge('真光路','真新新村');
        this.addEdge('真光路','铜川路');
        this.addEdge('真如','铜川路');
        this.addEdge('真如','中宁路');
        this.addEdge('曹杨路','中宁路');
        this.addEdge('曹杨路','武宁路');
        this.addEdge('武定路','武宁路');
        this.addEdge('武定路','静安寺');
        this.addEdge('一大会址·黄陂南路','静安寺');
        this.addEdge('一大会址·黄陂南路','大世界');
        this.addEdge('豫园','大世界');
        this.addEdge('豫园','陆家嘴');
        this.addEdge('浦东南路','陆家嘴');
        this.addEdge('浦东南路','浦东大道');
        this.addEdge('源深路','浦东大道');
        this.addEdge('源深路','昌邑路');
        this.addEdge('歇浦路','昌邑路');
        this.addEdge('歇浦路','云山路');
        this.addEdge('蓝天路','云山路');
        this.addEdge('蓝天路','黄杨路');
        this.addEdge('云顺路','黄杨路');
        this.addEdge('云顺路','浦东足球场');
        this.addEdge('金粤路','浦东足球场');
        this.addEdge('金粤路','桂桥路');


        this.addLine('1号线', '1号线', 'E3002A');
        this.addLine('2号线', '2号线', '86B81C');
        this.addLine('3号线', '3号线', 'FCD600');
        this.addLine('4号线', '4号线', '5A2B8D');
        this.addLine('5号线(莘庄--闵行开发区)', '5号线(莘庄--闵行开发区)', '96499A');
        this.addLine('5号线(莘庄--奉贤新城)', '5号线(莘庄--奉贤新城)', '96499A');
        this.addLine('6号线', '6号线', 'F0087D');
        this.addLine('7号线', '7号线', 'EE782E');
        this.addLine('8号线', '8号线', '01A2E2');
        this.addLine('9号线', '9号线', '69C7F4');
        this.addLine('10号线(航中路-基隆路)', '10号线(航中路-基隆路)', 'C6AFD4');
        this.addLine('10号线(虹桥火车站-基隆路)', '10号线(虹桥火车站-基隆路)', 'C6AFD4');
        this.addLine('11号线(嘉定北-迪士尼)', '11号线(嘉定北-迪士尼)', '871C2A');
        this.addLine('11号线(花桥-迪士尼)', '11号线(花桥-迪士尼)', '871C2A');
        this.addLine('12号线', '12号线', '007A61');
        this.addLine('13号线', '13号线', 'EB81B9');
        this.addLine('14号线', '14号线', '338042');
        this.addLine('15号线', '15号线', 'DAC17D');
        this.addLine('16号线', '16号线', '98D1C0');
        this.addLine('17号线', '17号线', 'B85A4E');
        this.addLine('18号线', '18号线', 'D0970A');
        this.addLine('磁悬浮', '磁悬浮', '008187');
        this.addLine('浦江线', '浦江线', 'B5B5B6');
    }
}
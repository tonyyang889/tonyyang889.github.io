/**
 * 发布页 https://www.jpyy.com/
 *//JS文件参考：https://clun.top/box.json  https://clun.top/js/金牌影视.js  （tvbox无法用）  https://gh.927223.xyz/https://raw.githubusercontent.com/xyq254245/xyqonlinerule/main/XYQTVBox.json  https://www.610pkea.com,https://www.gs4x7nq4.com,https://www.gs4x7nq4.com-https://m.hkybqufgh.com,https://m.sizhengxt.com,https://m.9zhoukj.com,https://m.sizhengxt.com,https://m.jiabaide.cn,https://m.sunnafh.com

const baseUrl = 'https://www.x8kb9k8.com';
const API_BASE = baseUrl + '/api/mw-movie';
const API_SIGN_KEY = 'cb808529bae6b6be45ecfab29a4889bc';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
const HEADERS = { 'User-Agent': UA, 'Referer': baseUrl + '/', 'Accept': 'text/html' };
const API_HEADERS = { 'User-Agent': UA, 'Referer': baseUrl + '/', 'Accept': 'application/json' };
const PLAY_HEADERS = { 'User-Agent': UA, 'Referer': baseUrl + '/', 'Origin': baseUrl };

// ================== 过滤模块（新增，不改动原代码） ==================
// 要屏蔽的影片名称关键词，不区分大小写、去空格后做“包含”匹配。
// 把下面示例词替换/追加成你实际要屏蔽的片名即可。
const BLOCKED_KEYWORDS = [
'聊天软件','神奇的女人','第三者','情夜','两个淘气的','性技巧','代孕','则天外传','灼热之舌','直播','君子好逑','婆家人','平面设计','姐夫','勾魂恶梦','纵欲','紫罗兰','雷利博','深探','米拉索尔','做某事','姐妹','致命游戏','腐花','秘密日记','火辣监狱','美丽的图画','薄化妆','会议','现在不行','密爱','爱情也有版权','忍耐','外遇','食母','巴甫洛夫','性生活','家庭作业','我是你的','素描少女','吃拉面','最后的深爱','隐秘的故事','一对一','深爱的恋情','性感女孩','欲诱','恩怨情天','美国禁忌','奴隶契约','学习的背叛','性是谎言','爱爱对','尤里和','同居的目的','再教育物语','卑触家的','少年人成为大人','生孩子妊','肉园','女人的叹息','Fleur','魔斗姬','偶像女友','妈妈喝骂','女友的真实样','神圣昂磷','他被她拥抱','拓展纪录','欢迎来到抖M','我被妈妈诈骗了','尼僧背德','普里出租','於宇同与春香传','兄弟的妻子','天使们：都','万逆转','性唤醒','善良的妈妈','不良影响','女员工的滋味','课中坏事','一个好妈妈','学生的妈妈','梦想成真','明明说过要用','危情','零零性','危情杀机','野兽之夜','派对和谎言','游走','网恋蜜友','末日村庄','不能说的秘密','九个满月','乳镇','性赞助','朗吉特','箱中女','树林里的夫妻','性狂热','祝你好运','恶习','鸡年寻欢','快乐的保姆','女士邀请','人快跑','初尝禁果','借来的片刻','招待女','妻子的滋味','拉斯加北极','敲击真相','她唇之下','年终点评','他人之妻','人肉叉烧包','朋友的妻子','下流','幻象之人','奇欲','香味','迪迪好莱坞','天边一朵云','云杜娘','不住的誘惑','表妹','坏小姨','奸情','欲孽迷宫','马尔法','美国爱经','儿子的妻子','床战','初体验','私生活','肮脏的玩国王游戏','银饰','节后的星期','狂爱仪式','钢琴教师','大学与狗窝','女经理','哥哥不挑食','你想换爱','开放的姐姐','莫妮卡妹妹','小媳妇','18岁的乔','性感的姐姐','你不配她','寂静的树','萨拉卡布','茶馆妈妈','异形之恋','宝拉','春宫','世界中心','辣妞征集','失身少女','上海丽人','私密地带','萍与雅','娼妓','三人冷水','埃洛伊','性行为','午夜情','性与传染','艾拉妮丝','爱我多深','感官世界','十五天就','我的过错','枫与铃','妻NTR','百劫红颜','堕落夜','痴梦少女','爱的健身房','妹之恋','大哥哥你一个人吗','进球如麻','误爆萌萌','妹妹太爱我','圣华女','爱之病','变性记','强暴','床位','地中海厨娘','情感的力量','爱你所爱','无法忍受','性版','女猫','聆听即相信','泰根和','达里奥','激进行为','甜蜜鲍比','六魔女','迷你宝贝','教科书没教的','3分钟合作','花心','天蝎座','两个人的夜','摇荡的心','禁止成年人','林美大战','小蜜桃','性恐怖','血恋','我的朋友','他的老婆','不法奸禁','母亲的恋人','初体验之日','南京的基','我老公的','搭车','青涩体验','伊丽莎白','岳母','监禁','史上最糟糕的','朋友妈妈','表姐们','粉红女士','我的妈妈是前女友','监幽','生粹庄','重回天鹅湖','心在跳','契约结婚','妻子的秘','哥哥给我','焦燥','无名小卒的','卖妻','爱情蛙跳跳','性婚姻','援交','网红生死战','犯罪娇妻','众归于我','欲女','催眠舞蹈团','家庭教师','老千的目的','白昼先生','课后记忆','你还爱我吗','吸血少女','黑人男友','欲海','性虐','笼中女囚','极欲','禁果','贱男','美丽的野兽','婦的男人','女老师','魅魔猎人','性灵','搜寻伊娃','有机体的','悬赏之惑','巫术面具','森林女王','岳母的简介','马里科镇','三头兽','私语时刻','儿子的女友','毕业生代表','不良侦探','贝拉卢','4人4性','沉浮水手','室友的妻子','深浅','露西妮','买下我','性伴侣','小三人生','性林医院','她的诱人','指尖传出的','哀情口令','西塔','春光乍泄','表兄妹','四大名妓','蜜桃','相识','一夜换身','打底裤','触摸','洗衣店','雌吹','野性北极','灭火宝贝','想要的女朋友','婚礼当天','新城妈妈','图霍格','奸臣','嘶嘶秘事','波索杜','晚熟之情','莉妮萨','精灵新郞','旁观者','玉女聊','伊娃','来来去去','塔米的','性伴侣','他的滋味','女鸨安','交缠','键','好姐姐们','木工厂','囚情三友','2对1猎取','如狼似虎','禁忌','姐姐朋友','危险信号','表弟弟','做我的奴隶','性感司机','秘密性三角','爱一个人','新城妈妈','Paraluman','韩国女性','洞内交易','成为你的客人','24小时开放','女教师','隐藏的秘密','成人世界','小姐','色戒','一路向西','玉蒲团','嫂子','情色','青楼','金瓶','官人','五十度灰','蜜桃成熟时','满清十大酷刑','艳谭','挡不住的疯情','惊变','赤裸羔羊','卿本佳人','我为卿狂','豪放','诱惑','欲望','兽性','虐之恋','南洋十大邪术','邪完再邪','蛇魔追魂降','强奸','偷情','可可西里的美丽传说','一支梨花压海棠','苦月亮','戏梦巴黎','性爱','高潮','技师','痴女','痴汉','自慰','寡妇','巨乳','乳房','的女人','拘束小妹','按摩','乳头','淫荡','水多','内射','爆乳','荡妇','操','享受','美妻','颜射','肛','艳遇','爱抚','情人','骑乘','情欲','情事','大姐','小姐','美女','性欲','人妻','素女','罩杯','潮吹','交流','激情','乳交','阴交','阴道','女优','男优','365日','名模','嫩模','熟女','黑丝','出轨','陪酒','三陪','陪侍','敏感','豪情','打炮','交配','性癖','性交','快感','欲求','炮友','淫乱','出台','坐台','母狗','GAY','同性','SM','变态','恋童','情妇','淫','播种','调教','发廊','酒廊','乱交','G点','AV','裸','继母','继父','胸部','肉体','肉棒','豪放','内衣','极品','风俗','体液','成人','bayo','榨干','职员','狂欢','出差','湿','女友妹妹','女友姐姐','性事','灯草','献身','洗澡','内裤','脱光','童贞','掌控','排泄','不伦','接吻','肉色','能上','脱','治疗','进补','臀','巨物','情妇','大物','小姨子','发情','继母','射','房事','性教','胸','成熟','玩弄','调教','艳谭','高校教师','花鸟','大波','大开眼','后宫','花与蛇','禁室','乐之街','空房间','囡囡','咸湿','活色','偷窥','禁宫','夜蒲','的房子','新建文件','屠夫','偷香','做爱','下女','即是空','房间','处女','明明不喜欢','同意','引诱','情妇','阿尔玛','欢愉','格尔达','上瘾','温濡','妓院','方子传','窥视','花与蛇','晚娘','爱人','斯巴达','美味的','罪恶纵横','交通费','女生宿舍','真爱的伪术','花芯','色欲','爱欲','楼上的女','挡不住的','爱的新世界','丽塔','坏小子','醉酒','女教授','叫兽','男朋友','公公','前后运动','第一次','前列腺','女上司','你的妈妈','前男友','做的爱','邻居','露营','邻家','挥棒','征服的','女郎','艾曼','变身成','虐待','红辣椒','红鞋','和天使一样','夫妻成长','聚会','猛男','艳情','老娘','人偶','年轻','奈莉','秘书','画舫','脐','勃','女儿的','换妻','情迷','青春学堂','巧巧','漂亮姐姐','拷问','女仆','妈妈的','沙西米','服务','拳拳到肉','世界尽头的爱','食物','十年爱','失恋杀人','尸','轮廓','蛇与','火口','幻影','坏时机','快乐星','皮鞭','铁轮','同班同学','晚九','朝九','人鱼传说','性智能','我来自北京','未知方程','微交','朋友的','无水之','无颜之月','味道','下众之爱','心肝','爱之涡','爱神','花为','花宵','六月之蛇','烈性','腥红','性冷','一丝不挂','性谈','夜生活','艳舞','性史','花街','鬼狐','同床','蛇魔','烧腊','鬼叫','美人图','十楼','失乐园','生日女郎','娼妇','压海棠','云上的日子','战国洛','珍品','野兰花','女同事','好想和','讨厌','女人至上','艾曼妞','央求','罪恶的','天使的胆量','前辈','日本','女猎人','已婚','恶女军团','堕落时代','欲室','本能','性侵','极道','粉红沙龙','伴游','四大美人','部长','性犯罪','辣椒','春妇','美味','与我同','暴行','桃色','夜蒲','空即是色','色即是空','学园','人间中毒','河畔','会所','差劲','雌猫','上流','银湖','爱情人偶','性之','郁金香','倡','解禁','婚前试爱','逆爱','雏妓','鸭王','团鬼','丽拉','女子监狱','空姐','不纯洁','宅男','宅女','抚摸','目睹','丰满','床上','居酒屋','放荡','棒','家访','下手','巨物','胸罩','奶罩','婶婶','醉酒','排卵','觊觎','欲求','大学生','阿姨','婚外情','洞穴','G罩','呻吟','屁股','爱的度量','办公室','继妹','艾莉','家政','晚上','比基尼','姨妈','驯服','角色扮演','裤裆','丈夫','上司','色狼','电车','推车','浴室','通奸','继女','新都市','暴欲','儿媳','不伦','色女','桃色','玩物','吸食','慾火','玩火','蒲塔','净化','最后一次2020','迷恋2015','魔鬼天使','狂野三千','奸杀','爸爸的','韵事','床2012','99个月亮','多布拉多','妻子保卫','循环','送货员','灭门','玩具','性喜剧','五选一','借钱','寄生春','妓女','比翼双飞','秘密2022','这只是一个','性福','隔壁','活死人','只爱你一个','妒忌','艳降','保龄球','漂亮的保姆','热爱2014','帕利','交换','碧翠丝','羊魔','血液','有求必应','三民窒','一种心情','大妞','不要睡觉','2对1','酒店温存','爱心护士','初体验','骗子规则','二十五和二十','奇怪的亲','制服','保守的泳衣','老板娘的加班','都会性男','陈列','Sarpseir','妻子的朋友','第一份工作','殉道与快乐','烈火女','新员工','快乐或痛苦','三打一','Libido','1982年的','DongDok','绝望的爱','未知的所有','万逆转','朋友妻子','玩国王','悲伤天使','少女母亲','高级工作','经理的恶作剧','要的就是你','家中出我妻','果汁','真人娃娃','摄影之爱','情爱魔力','饥饿的猫','养老金客人','红唇滚滚','深坐','早花','樱桃嘴','塑料性','禁宫奇女','我会是你的','不贞的季节','定之爱','谁和她睡过了','忍者女杀手','爱之教典','乐美儿','卡车上的坏人','古拉','最后一对','心跳时刻','18岁的教室','我的女孩','我的妹妹','爱的精灵','东京十日','新倾国倾城','夫妻战争','58天','透明女孩','性与爱','性狩人','野花','像这样的东西','加勒比女海盗','落翅女','幻想列车','人体模型','公司合作','死胡同','家庭主妇','三人场景','奴隶市','妻子的姐姐','初次体验','妻子的','精牌女','性感的腰部','牛欲牛','18班','妻子专用','贝尔酒店','爱情的限度','性的研究','思乳','红楼春上春','幸福游艇','成为女人','玉女寿司','月宫宝盒','新的爸爸','情不自禁','护士','影子缠身','韩国推荐','三人爱恋','下午六点的恋人','新儿子','女士宿舍','极乐酷刑','唐朝奸妃','风尘三女侠','饥饿的狼','爱爱全视角','肉蒲团','牡丹灯笼','实习教师','妹妹的朋友','可爱女生宿舍','性劫兰桂坊','性奴','性火坑乳','性工作者','性的厉鬼','南洋第一邪降','爱的界线','搭讪','之后','西西里的美丽','血爱成河','昼颜','阿诺拉','今时之欲','不方便','爱情与灵药','好男好女','善良妈妈的朋友','挑战赛游戏','可疑的美容院','好女孩','肉欲','慰安妇','热牛奶','白百合','不雅医院','少妇安吉娜','不听话女孩','五十度黑','红心女王','不良少女','Bayo','甜心宝贝','木材','深喉','德川女','布拉芙','华丽的外出','寂寞男孩','性瘾','无耻之心','情陷夜','点九美','洞菲律宾','音欲','神明','母与女','艳妇','舞女','色降','接线员','五神通','特殊安保','外出','禁区三','风筝','熔炉','空枕难眠','两个母亲','贼王','情书','花花公司','挑逗','智齿','捉奸','还未开始','火车','不夜城','小手指','请穿上衣服','杀了他','甜蜜释放','万逆转','陷阱','只摸1分钟','隐藏的面孔','游玩生活','不知羞耻','交插点','窈窕马戏','塞西莉','爱情誓言','她美丽','透明人间','妹子出租','裙子里面','双面人格','女子大生','床底的名字','邪恶入侵','爱的小历史','缉毒之女','极乐','魔乳','神奇女人','大叔让我爱','风花雪月','三分之二','冷酷之女','女孩我最大','迷欲','同级生','争艳女王','女孩上陆','不能向上','少女妄想','忍者女龟','违抗者','天生一对','恋之罪','江户川','观房','冰冷热','双人床','墨东绮','孽欲','百合的雨','欲奴','峡谷2013','轻蔑','法利赛','狂野之花','你爱的时候','早恋2013','这样的夏天','前卫的众神','愈快乐','女杀油','我们X她','水管工','露露情史','漂亮的妹妹','S与M','赛琳娜','落鸟','阿德拉','女阴','奈美','我的淘气女友','今晚出柜','干柴烈火','爱丽丝旅馆','女高校生','寄性兽医','未来世纪','女爱男欢','娘王','困惑的浪漫','野店1994','蜈蚣咒','剑奴','性女','残存','不忠2002','丰狂','性执事','泡沫2022','超级天堂','人食人','少女情怀','金钱之味','不扣纽的女孩','天使的性','飞虎出征','浪得过火','索多玛','延边女士','女友的妈妈','水手服','她来自胡','感受大海','欲焰','樱姬','爱情玩偶','爱奴','绿色椅子','青春期的','寻找偶像','妹妹的样子','女集中营','姐姐的朋友','春色漾','受难记','快乐到死','无主之花','红字2004','黄真伊','黑天使','保险女王','温柔地','家教高级','别人的目的','爱情游戏','与女神同行','丑闻2003','名妓2014','善良的妻子','自由夫人','无主之花','禁止想象','辛勤','危墙','拔作','爽到','奉子成婚','非常残酷','杏林','亲吻','乱世银光','斗者','告诉我你','西项日落','大正伪','胡乱的','痴人','玛琪娜','爱有此沉重','雷鱼','好的开始','风流名妓','奸魔','秘密生活','三奸','双姝艳','英雄好色','香港奇案','暴力档案','终极猎杀','O的故事','禁止性爱','聚会的目的','入场券','课后记','老娘我最','秘密室','老婆的姐姐','李秀与','恋爱谈','恋爱的味道','恋人共享','两位母亲','两个母亲','两个女人','两个小姨子','两个淘气','列性摔跤','麻将之夜','蝙蝠宝贝','护士宿舍','巨乳','七美德','田埂精灵','火热的女人','梦犯','特区爱奴','尸城','雌猫们','莫比乌斯','猫女孩','野蛮地区','野生','意难忘','最差劲','淫欲','愈合伴侣','食物链','十手舞','日历女孩','切漫画','色狱','新的哥哥','韩国阿姨','XL上司','娼年','捕风者','爱妹物语','爱之女巫','不羁的心','礼仪老师','拳拳到肉','摄像头','Mamasan','最后一封情书','美好的意外','摇摆艳夏','Trianggulo','需要维护的爱','热带夜晚','Mayumi','春画先生','性梦爱','干脆杀了他','关于约会','热线女孩','第二处女','凤姐','引诱','奇欲记','情妇','我叫阿尔玛','嘶嘶秘事','欢愉','格尔达','不方便的记忆','女性因素','老水仙','上瘾','湿濡的女人','安娜情欲','捉奸侦探','罪恶纵横','交通费','10天的爱人','禁止性爱','性瘾','花芯','忠贞','致命的诱惑','情欲王朝','先性后爱','零零性性','春情荡漾','罗曼史','珍品','周末同床','工作女郎','戏梦巴黎','内情','撒玛利亚女孩','罗马欲乐园','她唇之下','姐姐的S丑闻','芳名卡门','五十度','家教高级课程','色欲迷墙','性之剧毒','与我同眠','禁室培欲','成年人俱乐部','愈合伴侣','A片主人公','年轻气盛','野战惊魂','放荡青春','詹妮弗的肉体','一个女孩和一个男孩','慈禧秘密生活','偷月情','法利赛人','活色生香','诱人的飞行','上流社会','深情触摸','红色骆驼','娜塔莉','红X粉','同船爱歌','女房客','我的妻子','二次曝光','恩娇','红字','化学反应','花容月貌','贪婪','马赛克日本','布拉芙夫人','午夜巴塞罗那','安非他命','火口的两人','谎言和录像带','待绽蔷薇','妹妹的样子有点怪','女仆的安慰食物','爱很烂','玩火险恶局','红颜祸水','爱的旅馆','楼上的女孩','禁止的爱','幻想G点','漂流欲室','桃色机密','知性','妻子闺蜜','妓生','初恋滋味','小学妹','蜜友','两个姐姐','粗暴','腥生活','黑森林','泄欲','性感好友','非你不可','密切追踪','禁爱','情动夏','小恶魔','万事腥','元子役','举弱男','学妹上','失身','彩花也','滥爱','媚药','欲友','巅峰浪潮','无胜算','俊九搞','夹肉反击','帅家教','混血蜜儿','和我老公','好色','温泉旅','寄身嫂','一个人咖啡','她的日与夜','相性拔','换乘夫妻','够浪男','灵女友','性感魔女','色鬼','家族性话','精字塔','芽依','妈妈无防备','榨汁女王','请多指教','是前女儿','苦尽甘来','清纯女','宝物岛','纯情甜妹','爱笑女','温柔姐姐','帅哥收割','外欲','天隆奇精','单亲妈妈','痴情','陪玩的','免费的','水手女生','巅峰狂','金钱攻略','甜美少女','狗血','纤细女生','乳动','妹子','共度良宵','悲伤后妈','美肌女王','性板','优雅姐姐','有夫之','幸福出租车','雨中女孩','兄长夫人','天真妹妹','激战萝莉','眼镜女生','骑鸡女孩','女王诞生','甜蜜姐姐','下属娇妻','苗条女士','母子交尾','背叛闺蜜','清甜女神','快乐成双','熟侄女','爱从性开始','天真女生','禁欲','神乳','奢华盛','神秘女明星','文学少女','初恋女友','假性真做','替夫还债','美丽的妈妈','美乳','美术生','淑女出道','堕落女生','金智英','甜美小可爱','狙击伴侣','性感美','苗条侄女','金发','清纯妹','结婚前','活塞','辦公','春色小','美鲍','泡泡浴','模特姐','与粉丝约会','肉身还债','萝莉','兄弟的女','职场之花','极限突破','饥渴前女','甜蜜驯养','极荡的','公寓派对','苗条下','用身体','爱上义','妻母','部下的','纯爱相','邻人夫','名妓','继子','叔母','职业女性','母子浓','枕头','最爱的妻','大哥夫妇','全部技巧','渴望同学会','绝对服从','错过末','女主人','大屈辱','此情依旧',
];

function __norm(s) {
  return (s == null ? '' : String(s)).toLowerCase().replace(/\s+/g, '');
}
function __isBlockedName(name) {
  const n = __norm(name);
  if (!n) return false;
  for (let i = 0; i < BLOCKED_KEYWORDS.length; i++) {
    const k = __norm(BLOCKED_KEYWORDS[i]);
    if (k && n.indexOf(k) >= 0) return true;
  }
  return false;
}
function __isBlockedItem(item) {
  if (!item) return true;
  const name = item.vod_name != null ? item.vod_name : (item.name != null ? item.name : '');
  return __isBlockedName(name);
}
function __filterList(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(function (it) { return !__isBlockedItem(it); });
}
// 安全解析原函数返回的 JSON 字符串
function __parseOut(out) {
  try { return JSON.parse(out); } catch (e) { return null; }
}
function __stringifyOut(obj) {
  return JSON.stringify(obj);
}
// ================== 过滤模块结束 ==================

async function init(cfg) { return {}; }
function destroy() { return {}; }
function live(u) { return JSON.stringify([]); }
function proxy(p) { return [404, 'text/plain', 'no proxy']; }
function sniffer() { return false; }
function isVideo(url) {
  const u = String(url || '').split(/[?#]/)[0].toLowerCase();
  return ['.m3u8', '.mp4', '.mkv', '.flv'].some(function (s) { return u.endsWith(s); });
}
async function action(v) { return JSON.stringify({ msg: 'ok' }); }
function output(v) { return JSON.stringify(v); }
function str(v) { return v == null ? '' : String(v); }
function deviceId() { return 'jinpai-web-' + str(stableUuid()); }
function stableUuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; var v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); }); }
function stableQuery(params) { return Object.keys(params).sort().map(function (k) { return k + '=' + str(params[k]); }).join('&'); }
function md5Text(value) { return md5X(value); }
function rotateLeft(value, amount) { return (value << amount) | (value >>> (32 - amount)); }
function sha1Text(value) {
  const source = str(value);
  const bytes = [];
  for (let index = 0; index < source.length; index++) {
    let code = source.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff && index + 1 < source.length) {
      const next = source.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        index++;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
  }
  const bitLength = bytes.length * 8;
  bytes.push(128);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  bytes.push((high >>> 24) & 255, (high >>> 16) & 255, (high >>> 8) & 255, high & 255);
  bytes.push((low >>> 24) & 255, (low >>> 16) & 255, (low >>> 8) & 255, low & 255);
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = [];
    for (let index = 0; index < 16; index++) {
      const position = offset + index * 4;
      words[index] = ((bytes[position] << 24) | (bytes[position + 1] << 16) | (bytes[position + 2] << 8) | bytes[position + 3]) >>> 0;
    }
    for (let index = 16; index < 80; index++) words[index] = rotateLeft(words[index - 3] ^ words[index - 8] ^ words[index - 14] ^ words[index - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let index = 0; index < 80; index++) {
      let f, k;
      if (index < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (index < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (index < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const next = (rotateLeft(a, 5) + (f >>> 0) + e + k + words[index]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = next;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }
  return [h0, h1, h2, h3, h4].map(function (value) { return value.toString(16).padStart(8, '0'); }).join('');
}
function signApi(url, params, referer) {
  var query = stableQuery(params);
  var t = Date.now().toString();
  var source = query + (query ? '&' : '') + 'key=' + API_SIGN_KEY + '&t=' + t;
  return { url: url + (query ? '?' + query : ''), headers: { 'User-Agent': UA, Accept: 'application/json', Referer: referer || baseUrl + '/', 'client-type': '1', sign: sha1Text(md5Text(source)), t: t, deviceId: deviceId() } };
}
function stripTags(s) { return str(s).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(); }

function parseRespText(resp) {
  if (resp == null) return '';
  if (typeof resp === 'string') return resp;
  if (typeof resp === 'object') {
    if (typeof resp.content === 'string') return resp.content;
    if (typeof resp.data === 'string') return resp.data;
  }
  return str(resp);
}
async function apiGet(path, params, referer) {
  const signed = signApi(API_BASE + path, params || {}, referer);
  const response = await req(signed.url, { headers: signed.headers });
  const text = parseRespText(response);
  const data = JSON.parse(text);
  if (Number(data.code) !== 200) throw new Error(str(data.msg || 'API request failed'));
  return data.data || {};
}
function mapApiList(list) {
  const result = [];
  for (const item of list || []) { const mapped = mapVodItem(item); if (mapped) result.push(mapped); }
  return result;
}
async function apiCategory(tid, pg, extend) {
  const params = { clientType: 1, pageNum: parseInt(pg, 10) || 1, pageSize: 48, type1: str(tid || '1') };
  const selected = extend || {};
  const type = str(selected.type || '').trim();
  const cls = str(selected.class || '').trim();
  const area = str(selected.area || '').trim();
  const year = str(selected.year || '').trim();
  const lang = str(selected.lang || '').trim();
  if (type) params.type = type;
  if (cls) params.v_class = cls;
  if (area) params.area = area;
  if (year) params.year = year;
  if (lang) params.lang = lang;
  const data = await apiGet('/anonymous/video/list', params);
  const list = mapApiList(data.list);
  return { list: list, page: Number(data.pageNum) || params.pageNum, pagecount: Number(data.totalPage) || 1, limit: Number(data.pageSize) || 48, total: Number(data.totalCount) || list.length };
}
async function apiDetail(vid) {
  const data = await apiGet('/anonymous/video/detail', { id: str(vid) });
  const episodes = Array.isArray(data.episodeList) ? data.episodeList : [];
  const list = episodes.map(function (episode) {
    const name = str(episode.name || '正片').replace(/\$/g, '＄').replace(/#/g, '＃');
    return name + '$' + str(vid) + '_' + str(episode.nid || '');
  }).join('#');
  return {
    vod_id: str(vid),
    vod_name: str(data.vodName || ''),
    vod_pic: str(data.vodPic || ''),
    vod_actor: str(data.vodActor || ''),
    vod_director: str(data.vodDirector || ''),
    vod_content: stripTags(data.vodContent || data.vodBlurb || ''),
    vod_area: str(data.vodArea || ''),
    vod_lang: str(data.vodLang || ''),
    vod_year: str(data.vodYear || data.vodPubdate || '').slice(0, 4),
    type_name: str(data.typeName || data.vodClass || ''),
    vod_remarks: str(data.vodRemarks || data.vodVersion || ''),
    vod_play_from: list ? '金牌影院' : '',
    vod_play_url: list
  };
}
async function apiSearch(key, page) {
  const data = await apiGet('/anonymous/video/searchByWordPageable', { keyword: str(key), pageNum: parseInt(page, 10) || 1, pageSize: 48, sourceCode: '', type: '' });
  const list = mapApiList(data.list);
  return { list: list, page: Number(data.pageNum) || parseInt(page, 10) || 1, pagecount: Number(data.totalPage) || 1, limit: Number(data.pageSize) || 48, total: Number(data.totalCount) || list.length };
}
async function httpGet(url) {
  const r = await req(url, { headers: HEADERS });
  return parseRespText(r);
}
function flightText(html) {
  const src = str(html || '');
  const re = /self\.__next_f\.push\(\[1,([\s\S]*?)\]\)<\/script>/g;
  const parts = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    let c = m[1];
    try { c = JSON.parse(c); } catch (e) { try { c = JSON.parse('[' + c + ']')[1]; } catch (e2) { c = c.split('\\n').join('\n').split('\\"').join('"'); } }
    if (typeof c !== 'string') c = str(c);
    parts.push(c);
  }
  return parts.join('\n');
}
function extractBalanced(s, start) {
  const open = s[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === open) depth++;
      else if (ch === close) { depth--; if (depth === 0) return s.slice(start, i + 1); }
    }
  }
  return '';
}
function extractJsonByKey(text, key) {
  const pat = '"' + key + '"';
  let idx = text.indexOf(pat);
  while (idx >= 0) {
    let j = idx + pat.length;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] === ':') {
      j++;
      while (j < text.length && /\s/.test(text[j])) j++;
      if (text[j] === '{' || text[j] === '[') {
        const sub = extractBalanced(text, j);
        if (sub) { try { return JSON.parse(sub); } catch (e) {} }
      }
    }
    idx = text.indexOf(pat, idx + 1);
  }
  return null;
}
function mapVodItem(o) {
  if (!o) return null;
  const vodId = str(o.vodId != null ? o.vodId : o.id);
  if (!vodId) return null;
  let remarks = str(o.vodRemarks || o.vodVersion || o.vodSerial || o.remark || '');
  if (!remarks && o.vodScore) remarks = str(o.vodScore);
  return {
    vod_id: vodId,
    vod_name: str(o.vodName || o.name || ''),
    vod_pic: str(o.vodPic || o.img || ''),
    vod_remarks: remarks,
    vod_year: str(o.vodYear || ''),
    vod_area: str(o.vodArea || ''),
    type_name: str(o.vodClass || o.typeName || '')
  };
}
function parseCardsFallback(html) {
  const src = str(html || '');
  const re = /<a[^>]*class="[^"]*content-card[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
  const list = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const href = m[1];
    const inner = m[2];
    const idm = /(\d{4,})/.exec(href);
    if (!idm) continue;
    const vodId = idm[1];
    if (list.some(function (x) { return x.vod_id === vodId; })) continue;
    let name = '';
    const tm = /<div[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/div>/.exec(inner);
    if (tm) name = stripTags(tm[1]);
    if (!name) { const am = /alt="([^"]+)"/.exec(inner); if (am) name = am[1]; }
    if (!name) continue;
    let pic = '';
    const imSet = /<img[^>]*srcSet="([^"]+)"/.exec(inner);
    const imSrc = /<img[^>]*src="([^"]+)"/.exec(inner);
    const imOrig = /data-original="([^"]+)"/.exec(inner);
    const bg = /background-image:url\((https?:[^)]+)\)/.exec(inner);
    const cand = (imOrig && imOrig[1]) || (imSet && imSet[1].split(',')[0].split(' ')[0]) || (imSrc && imSrc[1]) || (bg && bg[1]) || '';
    if (cand && cand.indexOf('site_logo') < 0 && cand.indexOf('data:') !== 0) pic = cand;
    let score = '';
    const sm = /<div[^>]*class="[^"]*score[^"]*"[^>]*>(.*?)<\/div>/.exec(inner);
    if (sm) score = stripTags(sm[1]);
    list.push({ vod_id: vodId, vod_name: name, vod_pic: pic, vod_remarks: score });
    if (list.length >= 48) break;
  }
  return list;
}
function v(n, val) { return { n: n, v: val == null ? '' : str(val) }; }

async function home(filter) {
  const classes = [
    { type_id: '1', type_name: '电影' },
    { type_id: '2', type_name: '电视剧' },
    { type_id: '3', type_name: '综艺' },
    { type_id: '4', type_name: '动漫' },
    { type_id: '88', type_name: '短剧' }
  ];
  const filters = {
    '1': [
      { key: 'class', name: '剧情', value: [v('全部', ''), v('喜剧', '喜剧'), v('动作', '动作'), v('爱情', '爱情'), v('科幻', '科幻'), v('悬疑', '悬疑'), v('奇幻', '奇幻'), v('恐怖', '恐怖'), v('剧情', '剧情'), v('犯罪', '犯罪'), v('动画', '动画'), v('惊悚', '惊悚'), v('战争', '战争'), v('冒险', '冒险'), v('灾难', '灾难'), v('伦理', '伦理'), v('其他', '其他')] },
      { key: 'area', name: '地区', value: [v('全部', ''), v('中国大陆', '中国大陆'), v('中国香港', '中国香港'), v('中国台湾', '中国台湾'), v('美国', '美国'), v('日本', '日本'), v('韩国', '韩国'), v('印度', '印度'), v('泰国', '泰国'), v('英国', '英国'), v('法国', '法国'), v('其他', '其他')] },
      { key: 'year', name: '年份', value: [v('全部', ''), v('2026', '2026'), v('2025', '2025'), v('2024', '2024'), v('2023', '2023'), v('2022', '2022'), v('2021', '2021'), v('2020', '2020'), v('2019', '2019'), v('2018', '2018'), v('2017', '2017'), v('2016', '2016'), v('2015', '2015'), v('2014', '2014'), v('2013', '2013'), v('2012', '2012'), v('2011', '2011'), v('2010', '2010'), v('2009~2000', '2009~2000')] },
      { key: 'lang', name: '语言', value: [v('全部', ''), v('国语', '国语'), v('英语', '英语'), v('粤语', '粤语'), v('韩语', '韩语'), v('日语', '日语'), v('其他', '其他')] }
    ],
    '2': [
      { key: 'type', name: '类型', value: [v('全部', ''), v('国产剧', '14'), v('欧美剧', '15'), v('港台剧', '16'), v('日韩剧', '62'), v('其他剧', '68')] },
      { key: 'class', name: '剧情', value: [v('全部', ''), v('古装', '古装'), v('战争', '战争'), v('喜剧', '喜剧'), v('家庭', '家庭'), v('犯罪', '犯罪'), v('动作', '动作'), v('奇幻', '奇幻'), v('剧情', '剧情'), v('历史', '历史'), v('短片', '短片'), v('其他', '其他')] },
      { key: 'area', name: '地区', value: [v('全部', ''), v('中国大陆', '中国大陆'), v('中国香港', '中国香港'), v('中国台湾', '中国台湾'), v('日本', '日本'), v('韩国', '韩国'), v('美国', '美国'), v('泰国', '泰国'), v('其他', '其他')] },
      { key: 'year', name: '年份', value: [v('全部', ''), v('2026', '2026'), v('2025', '2025'), v('2024', '2024'), v('2023', '2023'), v('2022', '2022'), v('2021', '2021'), v('2020', '2020'), v('2019', '2019'), v('2018', '2018'), v('2017', '2017'), v('2016', '2016'), v('2015', '2015'), v('2014', '2014'), v('2013', '2013'), v('2012', '2012'), v('2011', '2011'), v('2010', '2010')] },
      { key: 'lang', name: '语言', value: [v('全部', ''), v('国语', '国语'), v('英语', '英语'), v('粤语', '粤语'), v('韩语', '韩语'), v('日语', '日语'), v('泰语', '泰语'), v('其他', '其他')] }
    ],
    '3': [
      { key: 'type', name: '类型', value: [v('全部', ''), v('国产综艺', '69'), v('港台综艺', '70'), v('日韩综艺', '72'), v('欧美综艺', '73')] },
      { key: 'class', name: '剧情', value: [v('全部', ''), v('真人秀', '真人秀'), v('音乐', '音乐'), v('脱口秀', '脱口秀')] },
      { key: 'area', name: '地区', value: [v('全部', ''), v('中国大陆', '中国大陆'), v('中国香港', '中国香港'), v('中国台湾', '中国台湾'), v('日本', '日本'), v('韩国', '韩国'), v('美国', '美国'), v('其他', '其他')] },
      { key: 'year', name: '年份', value: [v('全部', ''), v('2026', '2026'), v('2025', '2025'), v('2024', '2024'), v('2023', '2023'), v('2022', '2022'), v('2021', '2021'), v('2020', '2020')] },
      { key: 'lang', name: '语言', value: [v('全部', ''), v('国语', '国语'), v('英语', '英语'), v('粤语', '粤语'), v('韩语', '韩语'), v('日语', '日语'), v('其他', '其他')] }
    ],
    '4': [
      { key: 'type', name: '类型', value: [v('全部', ''), v('国产动漫', '75'), v('日韩动漫', '76'), v('欧美动漫', '77')] },
      { key: 'class', name: '剧情', value: [v('全部', ''), v('喜剧', '喜剧'), v('科幻', '科幻'), v('热血', '热血'), v('冒险', '冒险'), v('动作', '动作'), v('运动', '运动'), v('战争', '战争'), v('动画', '动画')] },
      { key: 'area', name: '地区', value: [v('全部', ''), v('中国大陆', '中国大陆'), v('日本', '日本'), v('美国', '美国'), v('其他', '其他')] },
      { key: 'year', name: '年份', value: [v('全部', ''), v('2026', '2026'), v('2025', '2025'), v('2024', '2024'), v('2023', '2023'), v('2022', '2022'), v('2021', '2021'), v('2020', '2020'), v('2019', '2019'), v('2018', '2018'), v('2017', '2017'), v('2016', '2016'), v('2015', '2015'), v('2014', '2014'), v('2013', '2013'), v('2012', '2012'), v('2011', '2011'), v('2010', '2010')] },
      { key: 'lang', name: '语言', value: [v('全部', ''), v('国语', '国语'), v('英语', '英语'), v('日语', '日语'), v('其他', '其他')] }
    ],
    '88': [
      { key: 'type', name: '类型', value: [v('全部', ''), v('喜剧', '100'), v('奇幻', '99'), v('惊悚', '98'), v('悬疑', '97'), v('古装', '96'), v('爱情', '95'), v('剧情', '94')] },
      { key: 'class', name: '剧情', value: [v('全部', ''), v('逆袭', '逆袭'), v('甜宠', '甜宠'), v('虐恋', '虐恋'), v('穿越', '穿越'), v('重生', '重生'), v('剧情', '剧情'), v('科幻', '科幻'), v('武侠', '武侠'), v('爱情', '爱情'), v('动作', '动作'), v('战争', '战争'), v('冒险', '冒险'), v('其他', '其他')] },
      { key: 'year', name: '年份', value: [v('全部', ''), v('2026', '2026'), v('2025', '2025'), v('2024', '2024'), v('2023', '2023'), v('2022', '2022'), v('2021', '2021'), v('2020', '2020'), v('更早', '更早')] }
    ]
  };
  return output({ class: classes, filters: filters });
}

async function homeVod() {
  try {
    const html = await httpGet(baseUrl + '/');
    const ft = flightText(html);
    const keys = ['homeNewMoviePageData', 'homeBroadcastPageData', 'newestTvPageData', 'newestVarietyPageData', 'newestCartoonPageData', 'newestShortTvPageData'];
    let list = [];
    const seen = {};
    for (const k of keys) {
      const o = extractJsonByKey(ft, k);
      const arr = o && o.list ? o.list : null;
      if (arr) {
        for (const it of arr.slice(0, 6)) { const m = mapVodItem(it); if (m && !seen[m.vod_id]) { seen[m.vod_id] = 1; list.push(m); } }
      }
      if (list.length >= 12) break;
    }
    if (!list.length) list = parseCardsFallback(html);
    return output({ list: list.slice(0, 24) });
  } catch (e) {
    return output({ list: await apiHomeList() });
  }
}
async function apiHomeList() {
  const data = await apiGet('/anonymous/v1/movie/recommend', { clientType: 1, modulesType: '1', pageNum: 1 });
  return mapApiList(data.list);
}

function buildCategoryUrl(tid, pg, extend) {
  extend = extend || {};
  let url = baseUrl + '/vod/show/id/' + encodeURIComponent(str(tid || '1'));
  const t = str(extend.type || '').trim();
  const c = str(extend.class || '').trim();
  const a = str(extend.area || '').trim();
  const y = str(extend.year || '').trim();
  const l = str(extend.lang || '').trim();
  if (t) url += '/type/' + encodeURIComponent(t);
  if (c) url += '/class/' + encodeURIComponent(c);
  if (a) url += '/area/' + encodeURIComponent(a);
  if (y) url += '/year/' + encodeURIComponent(y);
  if (l) url += '/lang/' + encodeURIComponent(l);
  const page = parseInt(pg, 10) || 1;
  if (page > 1) url += '/page/' + page;
  return { url: url, page: page };
}

async function category(tid, pg, filter, extend) {
  const page = parseInt(pg, 10) || 1;
  try {
    const data = await apiCategory(tid, page, extend);
    return output(data);
  } catch (e) {
    const built = buildCategoryUrl(tid, page, extend);
    const html = await httpGet(built.url);
    const ft = flightText(html);
    const vd = extractJsonByKey(ft, 'videoList');
    const source = vd && vd.data ? vd.data : vd;
    if (source && Array.isArray(source.list) && source.list.length) {
      const list = mapApiList(source.list);
      return output({ list: list, page: Number(source.pageNum) || page, pagecount: Number(source.totalPage) || 1, limit: Number(source.pageSize) || 48, total: Number(source.totalCount) || list.length });
    }
    const list = parseCardsFallback(html);
    return output({ list: list, page: page, pagecount: list.length ? page + 1 : 1, limit: 48, total: list.length ? 9999 : 0 });
  }
}

function detailId(v) { const m = /(\d{4,})/.exec(str(v)); return m ? m[1] : str(v).trim(); }

async function detail(id) {
  const vid = detailId(id);
  try {
    const vod = await apiDetail(vid);
    if (!vod.vod_name && !vod.vod_play_url) return output({ list: [] });
    return output({ list: [vod] });
  } catch (e) {
    const html = await httpGet(baseUrl + '/detail/' + vid);
    const ft = flightText(html);
    const get = function (k) {
      const m = new RegExp('"' + k + '":"(.*?)"').exec(ft);
      return m ? m[1] : '';
    };
    const eps = extractJsonByKey(ft, 'episodeList') || [];
    const list = eps.map(function (ep) { return str(ep.name || '正片') + '$' + vid + '_' + str(ep.nid || ''); }).join('#');
    return output({ list: [{ vod_id: vid, vod_name: get('vodName'), vod_pic: get('vodPic'), vod_actor: get('vodActor'), vod_director: get('vodDirector'), vod_content: stripTags(get('vodContent') || get('vodBlurb')), vod_area: get('vodArea'), vod_lang: get('vodLang'), vod_year: get('vodYear') || get('vodPubdate'), type_name: get('typeName') || get('vodClass'), vod_remarks: get('vodRemarks') || get('vodVersion'), vod_play_from: list ? '金牌影院' : '', vod_play_url: list }] });
  }
}

async function search(key, quick, pg) {
  const page = parseInt(pg, 10) || 1;
  const wd = str(key || '').trim();
  if (!wd) return output({ list: [], page: page, pagecount: 1, limit: 48, total: 0 });
  try {
    return output(await apiSearch(wd, page));
  } catch (e) {
    const html = await httpGet(baseUrl + '/vod/search/' + encodeURIComponent(wd) + (page > 1 ? '?page=' + page : ''));
    const ft = flightText(html);
    const result = extractJsonByKey(ft, 'result') || extractJsonByKey(ft, 'videoList');
    const data = result && result.data ? result.data : result;
    if (data && Array.isArray(data.list) && data.list.length) {
      const list = mapApiList(data.list);
      return output({ list: list, page: Number(data.pageNum) || page, pagecount: Number(data.totalPage) || 1, limit: Number(data.pageSize) || 48, total: Number(data.totalCount) || list.length });
    }
    const list = parseCardsFallback(html);
    return output({ list: list, page: page, pagecount: list.length ? page + 1 : 1, limit: 48, total: list.length ? 9999 : 0 });
  }
}

async function apiPlay(vodId, nid, referer) {
  const data = await apiGet('/anonymous/v2/video/episode/url', { clientType: 1, id: str(vodId), nid: str(nid) }, referer);
  return Array.isArray(data.list) ? data.list : [];
}
function playItem(item) {
  const url = str(item && item.url);
  return url && item && (item.flag === true || item.needLogin === false) ? item : null;
}
function selectPlayItem(list) {
  for (const item of list || []) { const selected = playItem(item); if (selected) return selected; }
  return null;
}
async function play(flag, id, vipFlags) {
  const s = str(id || '');
  let vodId = '', nid = '';
  const m = /(\d+)_(\d+)/.exec(s);
  if (m) { vodId = m[1]; nid = m[2]; }
  else { const nums = s.match(/\d+/g) || []; if (nums.length >= 2) { vodId = nums[nums.length - 2]; nid = nums[nums.length - 1]; } }
  const playPage = vodId && nid ? baseUrl + '/vod/play/' + vodId + '/sid/' + nid : s;
  if (vodId && nid) {
    const list = await apiPlay(vodId, nid, playPage);
    const selected = selectPlayItem(list);
    if (selected) return output({ parse: 0, url: selected.url, header: PLAY_HEADERS });
    throw new Error('播放线路不可用');
  }
  if (s.indexOf('http') === 0 && /\.m3u8(?:[?#]|$)/i.test(s)) return output({ parse: 0, url: s, header: PLAY_HEADERS });
  const html = await httpGet(playPage);
  const all = flightText(html) + '\n' + str(html);
  const m3 = /(https?:[^"'\\s<>]+\.m3u8[^"'\\s<>]*)/i.exec(all);
  if (m3) return output({ parse: 0, url: m3[1], header: PLAY_HEADERS });
  const mp4 = /(https?:[^"'\\s<>]+\.mp4[^"'\\s<>]*)/i.exec(all);
  if (mp4) return output({ parse: 0, url: mp4[1], header: PLAY_HEADERS });
  throw new Error('播放地址不可用');
}

async function homeContent(filter) { return home(filter); }
async function homeVideoContent() { return homeVod(); }
async function categoryContent(tid, pg, filter, extend) { return category(tid, pg, filter, extend); }
async function detailContent(ids) { const id = Array.isArray(ids) ? ids[0] : ids; return detail(id); }
async function searchContent(key, quick, pg) { return search(key, quick, pg); }
async function playerContent(flag, id, vipFlags) { return play(flag, id, vipFlags); }

// ================== 过滤包装（新增，不改动原代码函数体） ==================
// 思路：把原有的 homeVod / category / detail / search / searchContent 等
// 换成“先调用原函数拿 JSON 字符串，再解析、过滤列表、重新序列化返回”的版本。
// 原函数体一行未改，只在导出前重新赋值同名引用（JS 函数声明可被重新赋值）。
const __originHomeVod = homeVod;
const __originCategory = category;
const __originDetail = detail;
const __originSearch = search;

homeVod = async function () {
  const out = await __originHomeVod();
  const obj = __parseOut(out);
  if (obj && Array.isArray(obj.list)) obj.list = __filterList(obj.list);
  return __stringifyOut(obj || { list: [] });
};

category = async function (tid, pg, filter, extend) {
  const out = await __originCategory(tid, pg, filter, extend);
  const obj = __parseOut(out);
  if (obj && Array.isArray(obj.list)) obj.list = __filterList(obj.list);
  return __stringifyOut(obj || { list: [] });
};

detail = async function (id) {
  const out = await __originDetail(id);
  const obj = __parseOut(out);
  if (obj && Array.isArray(obj.list)) {
    // 详情列表里若命中黑名单，直接清空（防止直链访问）
    obj.list = obj.list.filter(function (it) { return !__isBlockedItem(it); });
  }
  return __stringifyOut(obj || { list: [] });
};

search = async function (key, quick, pg) {
  // 搜索关键词本身命中黑名单，直接返回空，保证“搜不到”
  if (__isBlockedName(key)) {
    const page = parseInt(pg, 10) || 1;
    return JSON.stringify({ list: [], page: page, pagecount: 1, limit: 48, total: 0 });
  }
  const out = await __originSearch(key, quick, pg);
  const obj = __parseOut(out);
  if (obj && Array.isArray(obj.list)) obj.list = __filterList(obj.list);
  return __stringifyOut(obj || { list: [] });
};

// TVBox 实际调用的是下面这些 *Content 包装函数，同步替换
homeVideoContent = async function () { return homeVod(); };
categoryContent = async function (tid, pg, filter, extend) { return category(tid, pg, filter, extend); };
detailContent = async function (ids) { const id = Array.isArray(ids) ? ids[0] : ids; return detail(id); };
searchContent = async function (key, quick, pg) { return search(key, quick, pg); };
// ================== 过滤包装结束 ==================

export default { init, home, homeVod, category, detail, search, play, live, proxy, action, sniffer, isVideo, destroy, homeContent, homeVideoContent, categoryContent, detailContent, searchContent, playerContent };

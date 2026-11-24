/**
 * OK影视 / CatVodSpider JS版 - 4kvms.org（4k影视）播放源
 * 结构参考「片库.js」：屏蔽过滤、多线路回退、超时保护
 * https://4kvm.site/ https://www.4kvm.cc/ https://www.4kvm.tv/ https://www.4kvm.pro https://www.pipiysb.com/ https://www.4kvm.net https://www.4kvm.com https://www.4kvm.org/
 */
const HOST = "https://www.4kvms.org";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const HEADERS = { "User-Agent": UA };

// ==================== 屏蔽过滤配置 ====================
// 完整片名黑名单（精确匹配，不区分大小写、忽略首尾空格）
const BLOCK_NAMES = [
    // 在这里逐条加入要屏蔽的完整片名，例如：
    // "某限制级电影",
    // "Another Adult Movie",
];

// 关键词黑名单（片名包含任一关键词即被过滤），适合批量屏蔽
const BLOCK_KEYWORDS = [
    '聊天软件','突如其来','神奇的女人','第三者','情夜','两个淘气的','性技巧','代孕','则天外传','灼热之舌','直播','君子好逑','婆家人','平面设计','姐夫','勾魂恶梦','纵欲','紫罗兰','雷利博','深探','米拉索尔','做某事','姐妹','致命游戏','腐花','秘密日记','火辣监狱','美丽的图画','薄化妆','会议','现在不行','密爱','爱情也有版权','忍耐','外遇','食母','巴甫洛夫','性生活','家庭作业','我是你的','素描少女','吃拉面','最后的深爱','隐秘的故事','一对一','深爱的恋情','性感女孩','欲诱','恩怨情天','美国禁忌','奴隶契约','学习的背叛','性是谎言','爱爱对','尤里和','同居的目的','再教育物语','卑触家的','少年人成为大人','生孩子妊','肉园','女人的叹息','Fleur','魔斗姬','偶像女友','妈妈喝骂','女友的真实样','神圣昂磷','他被她拥抱','拓展纪录','欢迎来到抖M','我被妈妈诈骗了','尼僧背德','普里出租','於宇同与春香传','兄弟的妻子','天使们：都','万逆转','性唤醒','善良的妈妈','不良影响','女员工的滋味','课中坏事','一个好妈妈','学生的妈妈','梦想成真','明明说过要用','危情','零零性','危情杀机','野兽之夜','派对和谎言','游走','网恋蜜友','末日村庄','不能说的秘密','九个满月','乳镇','性赞助','朗吉特','箱中女','树林里的夫妻','性狂热','祝你好运','恶习','鸡年寻欢','快乐的保姆','女士邀请','人快跑','初尝禁果','借来的片刻','招待女','妻子的滋味','拉斯加北极','敲击真相','她唇之下','年终点评','他人之妻','人肉叉烧包','朋友的妻子','下流','幻象之人','奇欲','香味','迪迪好莱坞','天边一朵云','云杜娘','不住的誘惑','表妹','坏小姨','奸情','欲孽迷宫','马尔法','美国爱经','儿子的妻子','床战','初体验','私生活','肮脏的玩国王游戏','银饰','节后的星期','狂爱仪式','钢琴教师','大学与狗窝','女经理','哥哥不挑食','你想换爱','开放的姐姐','莫妮卡妹妹','小媳妇','18岁的乔','性感的姐姐','你不配她','寂静的树','萨拉卡布','茶馆妈妈','异形之恋','宝拉','春宫','世界中心','辣妞征集','失身少女','上海丽人','私密地带','萍与雅','娼妓','三人冷水','埃洛伊','性行为','午夜情','性与传染','艾拉妮丝','爱我多深','感官世界','十五天就','我的过错','枫与铃','妻NTR','百劫红颜','堕落夜','痴梦少女','爱的健身房','妹之恋','大哥哥你一个人吗','进球如麻','误爆萌萌','妹妹太爱我','圣华女','爱之病','变性记','强暴','床位','地中海厨娘','情感的力量','爱你所爱','无法忍受','性版','女猫','聆听即相信','泰根和','达里奥','激进行为','甜蜜鲍比','六魔女','迷你宝贝','教科书没教的','3分钟合作','花心','天蝎座','两个人的夜','摇荡的心','禁止成年人','林美大战','小蜜桃','性恐怖','血恋','我的朋友','他的老婆','不法奸禁','母亲的恋人','初体验之日','南京的基','我老公的','搭车','青涩体验','伊丽莎白','岳母','监禁','史上最糟糕的','朋友妈妈','表姐们','粉红女士','我的妈妈是前女友','监幽','生粹庄','重回天鹅湖','心在跳','契约结婚','妻子的秘','哥哥给我','焦燥','无名小卒的','卖妻','爱情蛙跳跳','性婚姻','援交','网红生死战','犯罪娇妻','众归于我','欲女','催眠舞蹈团','家庭教师','老千的目的','白昼先生','课后记忆','你还爱我吗','吸血少女','黑人男友','欲海','性虐','笼中女囚','极欲','禁果','贱男','美丽的野兽','婦的男人','女老师','魅魔猎人','性灵','搜寻伊娃','有机体的','悬赏之惑','巫术面具','森林女王','岳母的简介','马里科镇','三头兽','私语时刻','儿子的女友','毕业生代表','不良侦探','贝拉卢','4人4性','沉浮水手','室友的妻子','深浅','露西妮','买下我','性伴侣','小三人生','性林医院','她的诱人','指尖传出的','哀情口令','西塔','春光乍泄','表兄妹','四大名妓','蜜桃','相识','一夜换身','打底裤','触摸','洗衣店','雌吹','野性北极','灭火宝贝','想要的女朋友','婚礼当天','新城妈妈','图霍格','奸臣','嘶嘶秘事','波索杜','晚熟之情','莉妮萨','精灵新郞','旁观者','玉女聊','伊娃','来来去去','塔米的','性伴侣','他的滋味','女鸨安','交缠','键','好姐姐们','木工厂','囚情三友','2对1猎取','如狼似虎','禁忌','姐姐朋友','危险信号','表弟弟','做我的奴隶','性感司机','秘密性三角','爱一个人','新城妈妈','Paraluman','韩国女性','洞内交易','成为你的客人','24小时开放','女教师','隐藏的秘密','成人世界','小姐','色戒','一路向西','玉蒲团','嫂子','情色','青楼','金瓶','官人','五十度灰','蜜桃成熟时','满清十大酷刑','艳谭','挡不住的疯情','惊变','赤裸羔羊','卿本佳人','我为卿狂','豪放','诱惑','欲望','兽性','虐之恋','南洋十大邪术','邪完再邪','蛇魔追魂降','强奸','偷情','可可西里的美丽传说','一支梨花压海棠','苦月亮','戏梦巴黎','性爱','高潮','技师','痴女','痴汉','自慰','寡妇','巨乳','乳房','的女人','拘束小妹','按摩','乳头','淫荡','水多','内射','爆乳','荡妇','操','享受','美妻','颜射','肛','艳遇','爱抚','情人','骑乘','情欲','情事','大姐','小姐','美女','性欲','人妻','素女','罩杯','潮吹','交流','激情','乳交','阴交','阴道','女优','男优','365日','名模','嫩模','熟女','黑丝','出轨','陪酒','三陪','陪侍','敏感','豪情','打炮','交配','性癖','性交','快感','欲求','炮友','淫乱','出台','坐台','母狗','GAY','同性','SM','变态','恋童','情妇','淫','播种','调教','发廊','酒廊','乱交','G点','AV','裸','继母','继父','胸部','肉体','肉棒','豪放','内衣','极品','风俗','体液','成人','bayo','榨干','职员','狂欢','出差','湿','女友妹妹','女友姐姐','性事','灯草','献身','洗澡','内裤','脱光','童贞','掌控','排泄','不伦','接吻','肉色','能上','脱','治疗','进补','臀','巨物','情妇','大物','小姨子','发情','继母','射','房事','性教','胸','成熟','玩弄','调教','艳谭','高校教师','花鸟','大波','大开眼','后宫','花与蛇','禁室','乐之街','空房间','囡囡','咸湿','活色','偷窥','禁宫','夜蒲','的房子','新建文件','屠夫','偷香','做爱','下女','即是空','房间','处女','明明不喜欢','同意','引诱','情妇','阿尔玛','欢愉','格尔达','上瘾','温濡','妓院','方子传','窥视','花与蛇','晚娘','爱人','斯巴达','美味的','罪恶纵横','交通费','女生宿舍','真爱的伪术','花芯','色欲','爱欲','楼上的女','挡不住的','爱的新世界','丽塔','坏小子','醉酒','女教授','叫兽','男朋友','公公','前后运动','第一次','前列腺','女上司','你的妈妈','前男友','做的爱','邻居','露营','邻家','挥棒','征服的','女郎','艾曼','变身成','虐待','红辣椒','红鞋','和天使一样','夫妻成长','聚会','猛男','艳情','老娘','人偶','年轻','奈莉','秘书','画舫','脐','勃','女儿的','换妻','情迷','青春学堂','巧巧','漂亮姐姐','拷问','女仆','妈妈的','沙西米','服务','拳拳到肉','世界尽头的爱','食物','十年爱','失恋杀人','尸','轮廓','蛇与','火口','幻影','坏时机','快乐星','皮鞭','铁轮','同班同学','晚九','朝九','人鱼传说','性智能','我来自北京','未知方程','微交','朋友的','无水之','无颜之月','味道','下众之爱','心肝','爱之涡','爱神','花为','花宵','六月之蛇','烈性','腥红','性冷','一丝不挂','性谈','夜生活','艳舞','性史','花街','鬼狐','同床','蛇魔','烧腊','鬼叫','美人图','十楼','失乐园','生日女郎','娼妇','压海棠','云上的日子','战国洛','珍品','野兰花','女同事','好想和','讨厌','女人至上','艾曼妞','央求','罪恶的','天使的胆量','前辈','日本','女猎人','已婚','恶女军团','堕落时代','欲室','本能','性侵','极道','粉红沙龙','伴游','四大美人','部长','性犯罪','辣椒','春妇','美味','与我同','暴行','桃色','夜蒲','空即是色','色即是空','学园','人间中毒','河畔','会所','差劲','雌猫','上流','银湖','爱情人偶','性之','郁金香','倡','解禁','婚前试爱','逆爱','雏妓','鸭王','团鬼','丽拉','女子监狱','空姐','不纯洁','宅男','宅女','抚摸','目睹','丰满','床上','居酒屋','放荡','棒','家访','下手','巨物','胸罩','奶罩','婶婶','醉酒','排卵','觊觎','欲求','大学生','阿姨','婚外情','洞穴','G罩','呻吟','屁股','爱的度量','办公室','继妹','艾莉','家政','晚上','比基尼','姨妈','驯服','角色扮演','裤裆','丈夫','上司','色狼','电车','推车','浴室','通奸','继女','新都市','暴欲','儿媳','不伦','色女','桃色','玩物','吸食','慾火','玩火','蒲塔','净化','最后一次2020','迷恋2015','魔鬼天使','狂野三千','奸杀','爸爸的','韵事','床2012','99个月亮','多布拉多','妻子保卫','循环','送货员','灭门','玩具','性喜剧','五选一','借钱','寄生春','妓女','比翼双飞','秘密2022','这只是一个','性福','隔壁','活死人','只爱你一个','妒忌','艳降','保龄球','漂亮的保姆','热爱2014','帕利','交换','碧翠丝','羊魔','血液','有求必应','三民窒','一种心情','大妞','不要睡觉','2对1','酒店温存','爱心护士','初体验','骗子规则','二十五和二十','奇怪的亲','制服','保守的泳衣','老板娘的加班','都会性男','陈列','Sarpseir','妻子的朋友','第一份工作','殉道与快乐','烈火女','新员工','快乐或痛苦','三打一','Libido','1982年的','DongDok','绝望的爱','未知的所有','万逆转','朋友妻子','玩国王','悲伤天使','少女母亲','高级工作','经理的恶作剧','要的就是你','家中出我妻','果汁','真人娃娃','摄影之爱','情爱魔力','饥饿的猫','养老金客人','红唇滚滚','深坐','早花','樱桃嘴','塑料性','禁宫奇女','我会是你的','不贞的季节','定之爱','谁和她睡过了','忍者女杀手','爱之教典','乐美儿','卡车上的坏人','古拉','最后一对','心跳时刻','18岁的教室','我的女孩','我的妹妹','爱的精灵','东京十日','新倾国倾城','夫妻战争','58天','透明女孩','性与爱','性狩人','野花','像这样的东西','加勒比女海盗','落翅女','幻想列车','人体模型','公司合作','死胡同','家庭主妇','三人场景','奴隶市','妻子的姐姐','初次体验','妻子的','精牌女','性感的腰部','牛欲牛','18班','妻子专用','贝尔酒店','爱情的限度','性的研究','思乳','红楼春上春','幸福游艇','成为女人','玉女寿司','月宫宝盒','新的爸爸','情不自禁','护士','影子缠身','韩国推荐','三人爱恋','下午六点的恋人','新儿子','女士宿舍','极乐酷刑','唐朝奸妃','风尘三女侠','饥饿的狼','爱爱全视角','肉蒲团','牡丹灯笼','实习教师','妹妹的朋友','可爱女生宿舍','性劫兰桂坊','性奴','性火坑乳','性工作者','性的厉鬼','南洋第一邪降','爱的界线','搭讪','之后','西西里的美丽','血爱成河','昼颜','阿诺拉','今时之欲','不方便','爱情与灵药','好男好女','善良妈妈的朋友','挑战赛游戏','可疑的美容院','好女孩','肉欲','慰安妇','热牛奶','白百合','不雅医院','少妇安吉娜','不听话女孩','五十度黑','红心女王','不良少女','Bayo','甜心宝贝','木材','深喉','德川女','布拉芙','华丽的外出','寂寞男孩','性瘾','无耻之心','情陷夜','点九美','洞菲律宾','音欲','神明','母与女','艳妇','舞女','色降','接线员','五神通','特殊安保','外出','禁区三','风筝','熔炉','空枕难眠','两个母亲','贼王','情书','花花公司','挑逗','智齿','捉奸','还未开始','火车','不夜城','小手指','请穿上衣服','杀了他','甜蜜释放','万逆转','陷阱','只摸1分钟','隐藏的面孔','游玩生活','不知羞耻','交插点','窈窕马戏','塞西莉','爱情誓言','她美丽','透明人间','妹子出租','裙子里面','双面人格','女子大生','床底的名字','邪恶入侵','爱的小历史','缉毒之女','极乐','魔乳','神奇女人','大叔让我爱','风花雪月','三分之二','冷酷之女','女孩我最大','迷欲','同级生','争艳女王','女孩上陆','不能向上','少女妄想','忍者女龟','违抗者','天生一对','恋之罪','江户川','观房','冰冷热','双人床','墨东绮','孽欲','百合的雨','欲奴','峡谷2013','轻蔑','法利赛','狂野之花','你爱的时候','早恋2013','这样的夏天','前卫的众神','愈快乐','女杀油','我们X她','水管工','露露情史','漂亮的妹妹','S与M','赛琳娜','落鸟','阿德拉','女阴','奈美','我的淘气女友','今晚出柜','干柴烈火','爱丽丝旅馆','女高校生','寄性兽医','未来世纪','女爱男欢','娘王','困惑的浪漫','野店1994','蜈蚣咒','剑奴','性女','残存','不忠2002','丰狂','性执事','泡沫2022','超级天堂','人食人','少女情怀','金钱之味','不扣纽的女孩','天使的性','飞虎出征','浪得过火','索多玛','延边女士','女友的妈妈','水手服','她来自胡','感受大海','欲焰','樱姬','爱情玩偶','爱奴','绿色椅子','青春期的','寻找偶像','妹妹的样子','女集中营','姐姐的朋友','春色漾','受难记','快乐到死','无主之花','红字2004','黄真伊','黑天使','保险女王','温柔地','家教高级','别人的目的','爱情游戏','与女神同行','丑闻2003','名妓2014','善良的妻子','自由夫人','无主之花','禁止想象','辛勤','危墙','拔作','爽到','奉子成婚','非常残酷','杏林','亲吻','乱世银光','斗者','告诉我你','西项日落','大正伪','胡乱的','痴人','玛琪娜','爱有此沉重','雷鱼','好的开始','风流名妓','奸魔','秘密生活','三奸','双姝艳','英雄好色','香港奇案','暴力档案','终极猎杀','O的故事','禁止性爱','聚会的目的','入场券','课后记','老娘我最','秘密室','老婆的姐姐','李秀与','恋爱谈','恋爱的味道','恋人共享','两位母亲','两个母亲','两个女人','两个小姨子','两个淘气','列性摔跤','麻将之夜','蝙蝠宝贝','护士宿舍','巨乳','七美德','田埂精灵','火热的女人','梦犯','特区爱奴','尸城','雌猫们','莫比乌斯','猫女孩','野蛮地区','野生','意难忘','最差劲','淫欲','愈合伴侣','食物链','十手舞','日历女孩','切漫画','色狱','新的哥哥','韩国阿姨','XL上司','娼年','捕风者','爱妹物语','爱之女巫','不羁的心','礼仪老师','拳拳到肉','摄像头','Mamasan','最后一封情书','美好的意外','摇摆艳夏','Trianggulo','需要维护的爱','热带夜晚','Mayumi','春画先生','性梦爱','干脆杀了他','关于约会','热线女孩','第二处女','凤姐','引诱','奇欲记','情妇','我叫阿尔玛','嘶嘶秘事','欢愉','格尔达','不方便的记忆','女性因素','老水仙','上瘾','湿濡的女人','安娜情欲','捉奸侦探','罪恶纵横','交通费','10天的爱人','禁止性爱','性瘾','花芯','忠贞','致命的诱惑','情欲王朝','先性后爱','零零性性','春情荡漾','罗曼史','珍品','周末同床','工作女郎','戏梦巴黎','内情','撒玛利亚女孩','罗马欲乐园','她唇之下','姐姐的S丑闻','芳名卡门','五十度','家教高级课程','色欲迷墙','性之剧毒','与我同眠','禁室培欲','成年人俱乐部','愈合伴侣','A片主人公','年轻气盛','野战惊魂','放荡青春','詹妮弗的肉体','一个女孩和一个男孩','慈禧秘密生活','偷月情','法利赛人','活色生香','诱人的飞行','上流社会','深情触摸','红色骆驼','娜塔莉','红X粉','同船爱歌','女房客','我的妻子','二次曝光','恩娇','红字','化学反应','花容月貌','贪婪','马赛克日本','布拉芙夫人','午夜巴塞罗那','安非他命','火口的两人','谎言和录像带','待绽蔷薇','妹妹的样子有点怪','女仆的安慰食物','爱很烂','玩火险恶局','红颜祸水','爱的旅馆','楼上的女孩','禁止的爱','幻想G点','漂流欲室','桃色机密','知性','妻子闺蜜','妓生','初恋滋味','小学妹','蜜友','两个姐姐','粗暴','腥生活','黑森林','泄欲','性感好友','非你不可','密切追踪','禁爱','情动夏','小恶魔','万事腥','元子役','举弱男','学妹上','失身','彩花也','滥爱','媚药','欲友','巅峰浪潮','无胜算','俊九搞','夹肉反击','帅家教','混血蜜儿','和我老公','好色','温泉旅','寄身嫂','一个人咖啡','她的日与夜','相性拔','换乘夫妻','够浪男','灵女友','性感魔女','色鬼','家族性话','精字塔','芽依','妈妈无防备','榨汁女王','请多指教','是前女儿','苦尽甘来','清纯女','宝物岛','纯情甜妹','爱笑女','温柔姐姐','帅哥收割','外欲','天隆奇精','单亲妈妈','痴情','陪玩的','免费的','水手女生','巅峰狂','金钱攻略','甜美少女','狗血','纤细女生','乳动','妹子','共度良宵','悲伤后妈','美肌女王','性板','优雅姐姐','有夫之','幸福出租车','雨中女孩','兄长夫人','天真妹妹','激战萝莉','眼镜女生','骑鸡女孩','女王诞生','甜蜜姐姐','下属娇妻','苗条女士','母子交尾','背叛闺蜜','清甜女神','快乐成双','熟侄女','爱从性开始','天真女生','禁欲','神乳','奢华盛','神秘女明星','文学少女','初恋女友','假性真做','替夫还债','美丽的妈妈','美乳','美术生','淑女出道','堕落女生','金智英','甜美小可爱','狙击伴侣','性感美','苗条侄女','金发','清纯妹','结婚前','活塞','辦公','春色小','美鲍','泡泡浴','模特姐','与粉丝约会','肉身还债','萝莉','兄弟的女','职场之花','极限突破','饥渴前女','甜蜜驯养','极荡的','公寓派对','苗条下','用身体','爱上义','妻母','部下的','纯爱相','邻人夫','名妓','继子','叔母','职业女性','母子浓','枕头','最爱的妻','大哥夫妇','全部技巧','渴望同学会','绝对服从','错过末','女主人','大屈辱','此情依旧',"限制级", "三级", "三級", "伦理", "倫理", "成人", "情色", "色情","R18", "R-18", "18+", "18禁", "无码", "無碼", "A片", "AV", "hentai", "adult", "erotic", "porn"
];


// 站点年份筛选使用内部 ID（不是年份数字），以下为 /filter 页实际选项值，覆盖范围 2004-2027
const YEAR_IDS = {
    "2027": "78", "2026": "1", "2025": "3", "2024": "4", "2023": "56", "2022": "13",
    "2021": "2", "2020": "6", "2019": "8", "2018": "9", "2017": "12",
    "2016": "11", "2015": "14", "2014": "15", "2013": "22", "2012": "10",
    "2011": "17", "2010": "25", "2009": "20", "2008": "23", "2007": "30",
    "2006": "31", "2005": "7", "2004": "24"
};

// OK影视 筛选值构造：v(显示名, 实际值) -> {n, v}
// 注意：筛选选项必须用 n/v 字段，写成 name/value 在 OK影视 里会显示成无文字的椭圆
function v(name, value) { return { n: name, v: value }; }

const ARTICLE_REG = /<a\s+href="\/play\/([A-Za-z0-9_-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
const IMG_REG = /<img[^>]*?data-src="([^"]+)"[^>]*?alt="([^"]*)"/i;
const IMG_REG2 = /<img[^>]*?alt="([^"]*)"[^>]*?data-src="([^"]+)"/i;
const CLEAN_REG = /<[^>]+>/g;

function mylog(...args) { console.log("[4kvms]", ...args); }

function buildUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return HOST + (path.startsWith("/") ? "" : "/") + path;
}

function decodeEnt(s) {
    return String(s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, " ");
}

function isBlocked(name) {
    if (!name) return false;
    const n = String(name).trim().toLowerCase();
    if (!n) return false;
    for (let i = 0; i < BLOCK_NAMES.length; i++) {
        if (n === String(BLOCK_NAMES[i]).trim().toLowerCase()) return true;
    }
    for (let i = 0; i < BLOCK_KEYWORDS.length; i++) {
        const k = String(BLOCK_KEYWORDS[i]).toLowerCase();
        if (k && n.indexOf(k) !== -1) return true;
    }
    return false;
}

function filterList(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (let i = 0; i < list.length; i++) {
        if (!list[i]) continue;
        if (isBlocked(list[i].vod_name)) { mylog("已过滤屏蔽内容: " + list[i].vod_name); continue; }
        out.push(list[i]);
    }
    return out;
}

function cleanText(s) { return decodeEnt(String(s || "").replace(CLEAN_REG, " ")).replace(/\s+/g, " ").trim(); }

function getVodList(html) {
    const list = [];
    const seen = {};
    ARTICLE_REG.lastIndex = 0;
    let m;
    while ((m = ARTICLE_REG.exec(String(html || ""))) !== null) {
        const slug = m[1];
        if (seen[slug]) continue;
        const body = m[2];
        let pic = "", title = "";
        let im = body.match(IMG_REG);
        if (im) { pic = im[1]; title = im[2]; }
        else {
            im = body.match(IMG_REG2);
            if (im) { title = im[1]; pic = im[2]; }
        }
        title = cleanText(title || (body.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i) || [])[1]);
        if (!title) continue;
        const text = cleanText(body);
        const remarks = (text.match(/全\d+集|更新至\d+集|完结|正片/) || [])[0] || "";
        const year = (text.match(/(?:19|20)\d{2}/) || [])[0] || "";
        seen[slug] = true;
        list.push({
            vod_id: slug,
            vod_name: title,
            vod_pic: buildUrl(decodeEnt(pic)),
            vod_remarks: remarks,
            vod_year: year
        });
    }
    mylog("共提取到 " + list.length + " 条数据");
    return list;
}

async function init(cfg) { mylog("Spider Init Done"); }

function buildYearFilter() {
    const values = [v("全部", "")];
    for (let y = 2027; y >= 2004; y--) {
        const s = String(y);
        values.push(v(s, YEAR_IDS[s] || s));
    }
    return { key: "year", name: "年份", value: values };
}

async function home(filter) {
    try {
        const res = await req(HOST, { headers: HEADERS, timeout: 10000 });
        // 分类值对应站点 /filter?classify= 参数：电视剧=2 电影=1 动漫=3
        const classes = [
            { type_id: "2", type_name: "电视剧" },
            { type_id: "1", type_name: "电影" },
            { type_id: "3", type_name: "动漫" }
        ];
        const yearFilter = buildYearFilter();
        const filters = { "2": [yearFilter], "1": [yearFilter], "3": [yearFilter] };
        return JSON.stringify({
            class: classes,
            filters: filters,
            list: filterList(getVodList(res.content))
        });
    } catch (e) {
        mylog(e.message);
        const yearFilter = buildYearFilter();
        return JSON.stringify({
            class: [
                { type_id: "2", type_name: "电视剧" },
                { type_id: "1", type_name: "电影" },
                { type_id: "3", type_name: "动漫" }
            ],
            filters: { "2": [yearFilter], "1": [yearFilter], "3": [yearFilter] },
            list: []
        });
    }
}

async function homeVod() {
    try {
        const res = await req(HOST, { headers: HEADERS, timeout: 10000 });
        return JSON.stringify({ list: filterList(getVodList(res.content)) });
    } catch (e) {
        return JSON.stringify({ list: [] });
    }
}

async function category(tid, pg, filter, extend) {
    const page = String(pg || "1");
    // extend 由 OK影视 根据 home() 返回的 filters 传入，键名 year
    const year = (extend && (extend.year || extend.years)) || "";
    const url = HOST + "/filter?classify=" + encodeURIComponent(tid || "")
        + "&years=" + encodeURIComponent(year)
        + "&page=" + encodeURIComponent(page);
    mylog("分类 URL: " + url);
    try {
        const res = await req(url, { headers: HEADERS, timeout: 10000 });
        const html = res.content || "";
        const list = filterList(getVodList(html));
        // 页面底部：第 1 页 / 共 122 页，共 3658 个结果
        const pageInfo = html.match(/共\s*(\d+)\s*页[，,]\s*共\s*(\d+)\s*个结果/);
        const pagecount = pageInfo ? parseInt(pageInfo[1], 10) : 1;
        const total = pageInfo ? parseInt(pageInfo[2], 10) : list.length;
        return JSON.stringify({ list: list, page: parseInt(page, 10), pagecount: pagecount, limit: 30, total: total });
    } catch (e) {
        mylog(e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 1, limit: 30, total: 0 });
    }
}

async function search(key, quick, pg) {
    // OK影视 有时传入已编码的关键词，先还原再统一编码，避免双重编码导致搜不到
    let kw = String(key || "").trim();
    try { kw = decodeURIComponent(kw); } catch (e) { /* 已是原文则忽略 */ }
    const url = HOST + "/search?q=" + encodeURIComponent(kw);
    mylog("搜索: " + url);
    try {
        const res = await req(url, { headers: HEADERS, timeout: 10000 });
        const list = filterList(getVodList(res.content));
        return JSON.stringify({ list: list, page: 1, pagecount: 1, limit: 30, total: list.length });
    } catch (e) {
        mylog(e.message);
        return JSON.stringify({ list: [], page: 1, pagecount: 1, limit: 30, total: 0 });
    }
}

function parseEpisodeTargets(html) {
    const targets = {};
    const reg = /<a\b([^>]*\bdata-episode="[^"]*"[^>]*)>/gi;
    let m;
    while ((m = reg.exec(String(html || ""))) !== null) {
        const attrs = m[1];
        const get = function (n) { const r = attrs.match(new RegExp("\\b" + n + "=\"([^\"]*)\"", "i")); return r ? r[1] : ""; };
        const href = get("href");
        const dataId = get("dataid") || get("data-id");
        const slug = (href.match(/\/play\/([A-Za-z0-9_-]+)/i) || [])[1] || "";
        const line = parseInt(get("data-line"), 10) || 1;
        const ep = parseInt(get("data-episode"), 10) || 1;
        if (!dataId || !slug) continue;
        if (!targets[slug]) targets[slug] = { dataId: dataId, slug: slug, line: line, ep: ep };
    }
    return targets;
}

async function detail(id) {
    const url = HOST + "/play/" + id;
    mylog("详情 URL: " + url);
    try {
        const res = await req(url, { headers: HEADERS, timeout: 10000 });
        const html = res.content || "";
        const title = cleanText((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
        if (isBlocked(title)) return JSON.stringify({ list: [] });
        const desc = decodeEnt((html.match(/<meta name="description" content="([^"]*)"/i) || [])[1]);
        let pic = decodeEnt((html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1] || "");
        if (pic) pic = buildUrl(pic);
        const year = (html.match(/(?:19|20)\d{2}/) || [])[0] || "";

        const targets = parseEpisodeTargets(html);
        const byLine = {};
        for (const slug in targets) {
            const t = targets[slug];
            if (!byLine[t.line]) byLine[t.line] = [];
            byLine[t.line].push({ ep: t.ep, name: "第" + t.ep + "集", url: buildUrl("/play/" + slug) });
        }
        const lines = Object.keys(byLine).map(Number).sort(function (a, b) { return a - b; });
        const fromList = [], urlList = [];
        for (let i = 0; i < lines.length; i++) {
            const eps = byLine[lines[i]].sort(function (a, b) { return a.ep - b.ep; });
            if (!eps.length) continue;
            fromList.push("影视" + (i + 1));
            urlList.push(eps.map(function (e) { return e.name + "$" + e.url; }).join("#"));
        }

        const vod = {
            vod_id: id, vod_name: title, vod_pic: pic, vod_year: year,
            vod_remarks: (html.match(/全\d+集|更新至\d+集|完结/) || [])[0] || "",
            vod_content: cleanText(desc),
            vod_play_from: fromList.join("$$$"),
            vod_play_url: urlList.join("$$$")
        };
        return JSON.stringify({ list: [vod] });
    } catch (e) {
        mylog(e.message);
        return JSON.stringify({ list: [] });
    }
}

/* ---------- WASM 签名：尝试直接取站点 m3u8；不支持则交回 App 解析 ---------- */
function b64ToBytes(b64) {
    const s = String(b64 || "").replace(/\s/g, "");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const out = [];
    for (let i = 0; i < s.length; i += 4) {
        const a = chars.indexOf(s[i]), b = chars.indexOf(s[i + 1]);
        const c = s[i + 2] === "=" ? -1 : chars.indexOf(s[i + 2]);
        const d = s[i + 3] === "=" ? -1 : chars.indexOf(s[i + 3]);
        if (a < 0 || b < 0) break;
        out.push((a << 2) | (b >> 4));
        if (c >= 0) out.push(((b & 15) << 4) | (c >> 2));
        if (d >= 0) out.push(((c & 3) << 6) | d);
    }
    return new Uint8Array(out);
}

function utf8Bytes(str) {
    const out = [];
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
        const c = s.charCodeAt(i);
        if (c < 128) out.push(c);
        else if (c < 2048) out.push(192 | (c >> 6), 128 | (c & 63));
        else out.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    return new Uint8Array(out);
}

function utf8Str(bytes) {
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
        const b = bytes[i];
        if (b < 128) out += String.fromCharCode(b);
        else if (b < 224) out += String.fromCharCode(((b & 31) << 6) | (bytes[++i] & 63));
        else out += String.fromCharCode(((b & 15) << 12) | ((bytes[++i] & 63) << 6) | (bytes[++i] & 63));
    }
    return out;
}

async function createWasmBuilder(bytes, meta) {
    let wasm = null, vectorLength = 0;
    const heap = [];
    for (let i = 0; i < 1024; i++) heap.push(undefined);
    heap.push(undefined, null, true, false);
    let heapNext = heap.length;
    const fakeMetas = {
        "nb-st": { __meta: true, content: String(meta.st || Date.now()) },
        "nb-plt": { __meta: true, content: String(meta.plt || Date.now()) }
    };
    const fakeDocument = { getElementById: function (id) { return fakeMetas[id] || null; } };
    const fakeWindow = { __window: true, document: fakeDocument };

    function getObject(i) { return heap[i]; }
    function addObject(v) { if (heapNext === heap.length) heap.push(heap.length + 1); const i = heapNext; heapNext = heap[i]; heap[i] = v; return i; }
    function dropObject(i) { if (i < 1028) return; heap[i] = heapNext; heapNext = i; }
    function takeObject(i) { const v = getObject(i); dropObject(i); return v; }
    function memory() { return new Uint8Array(wasm.memory.buffer); }
    function view() { return new DataView(wasm.memory.buffer); }
    function readString(p, l) { return utf8Str(memory().subarray(p >>> 0, (p >>> 0) + l)); }
    function passString(v) {
        const enc = utf8Bytes(v);
        const p = wasm.__wbindgen_export(enc.length, 1) >>> 0;
        memory().subarray(p, p + enc.length).set(enc);
        vectorLength = enc.length;
        return p;
    }

    const bridge = {
        __wbg___wbindgen_is_undefined_52709e72fb9f179c: function (a) { return getObject(a) === undefined; },
        __wbindgen_object_drop_ref: function (a) { takeObject(a); },
        __wbg_static_accessor_GLOBAL_8adb955bd33fac2f: function () { return addObject(fakeWindow); },
        __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913: function () { return addObject(fakeWindow); },
        __wbg_static_accessor_WINDOW_bb9f1ba69d61b386: function () { return addObject(fakeWindow); },
        __wbg_static_accessor_SELF_f207c857566db248: function () { return addObject(fakeWindow); },
        __wbindgen_object_clone_ref: function (a) { return addObject(getObject(a)); },
        __wbg_instanceof_Window_23e677d2c6843922: function (a) { return !!(getObject(a) && getObject(a).__window); },
        __wbg_document_c0320cd4183c6d9b: function (a) { const v = getObject(a).document; return v == null ? 0 : addObject(v); },
        __wbg_getElementById_d1f25d287b19a833: function (a, p, l) { const v = getObject(a).getElementById(readString(p, l)); return v == null ? 0 : addObject(v); },
        __wbg_instanceof_HtmlMetaElement_07f78901e9785572: function (a) { return !!(getObject(a) && getObject(a).__meta); },
        __wbg_content_4373268a6f34e443: function (ret, a) { const p = passString(getObject(a).content); view().setInt32(ret, p, true); view().setInt32(ret + 4, vectorLength, true); },
        __wbg_now_16f0c993d5dd6c27: function () { return Date.now(); },
        __wbg___wbindgen_throw_6ddd609b62940d55: function (p, l) { throw new Error(readString(p, l)); }
    };
    const result = await WebAssembly.instantiate(bytes, { "./nbmovie_wasm_bg.js": bridge });
    wasm = result.instance ? result.instance.exports : result.exports;
    return function (dataId, secretKey, quality, playKey) {
        const ret = wasm.__wbindgen_add_to_stack_pointer(-16);
        const p0 = passString(dataId), l0 = vectorLength;
        const p1 = passString(secretKey), l1 = vectorLength;
        const p2 = passString(quality), l2 = vectorLength;
        const p3 = passString(playKey), l3 = vectorLength;
        wasm.build_play_url(ret, p0, l0, p1, l1, p2, l2, p3, l3);
        const out = view().getInt32(ret, true), len = view().getInt32(ret + 4, true);
        const value = readString(out, len);
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_export3(out, len, 1);
        return value;
    };
}

async function getDirectPlayUrl(html, pageUrl, dataId, slug) {
    if (typeof WebAssembly === "undefined") return "";
    try {
        const wasmPath = (html.match(/data-bg="([^"]+\.wasm)"/i) || [])[1] || "/static/wasm/nbmovie_wasm_bg.d5d51939.wasm";
        const userlink = (html.match(/\buserlink\s*:\s*["']([^"']+)["']/i) || [])[1] || "0";
        const st = (html.match(/id="nb-st"[^>]*content="([^"]*)"/i) || [])[1] || "";
        const plt = (html.match(/id="nb-plt"[^>]*content="([^"]*)"/i) || [])[1] || "";
        const wasmRes = await req(buildUrl(wasmPath), { headers: HEADERS, buffer: 2, timeout: 10000 });
        const bytes = b64ToBytes(wasmRes.content || "");
        if (!bytes.length) return "";
        const builder = await createWasmBuilder(bytes, { st: st, plt: plt });
        const signed = buildUrl(builder(String(dataId), slug, "1080", String(userlink)));
        mylog("签名播放地址: " + signed);
        const playRes = await req(signed, { headers: { "User-Agent": UA, "Referer": pageUrl }, timeout: 10000 });
        const data = JSON.parse(playRes.content || "{}");
        const qualities = (data.data && data.data.quality_urls) || data.quality_urls || [];
        for (let i = 0; i < qualities.length; i++) {
            const q = qualities[i] || {};
            const u = String(q.url || "");
            if (q.locked === true || (q.isvip === true && q.locked !== false)) continue;
            if (/^https?:\/\//i.test(u) && /\.(m3u8|mp4)(?:[?#]|$)/i.test(u)) return u;
        }
    } catch (e) {
        mylog("WASM 直连解析失败: " + e.message);
    }
    return "";
}

async function play(flag, id, flags) {
    const pageUrl = buildUrl(id);
    const slug = (String(id).match(/\/play\/([A-Za-z0-9_-]+)/i) || [])[1] || String(id);
    mylog("开始获取播放地址: " + pageUrl);
    try {
        const res = await req(pageUrl, { headers: HEADERS, timeout: 10000 });
        const html = res.content || "";
        const title = cleanText((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
        if (isBlocked(title)) return JSON.stringify({ parse: 0, url: "" });

        const targets = parseEpisodeTargets(html);
        const target = targets[slug] || (function () {
            for (const k in targets) return targets[k];
            return null;
        })();
        if (target) {
            const direct = await getDirectPlayUrl(html, pageUrl, target.dataId, target.slug);
            if (direct) return JSON.stringify({ parse: 0, url: direct });
        }

        // WASM 直连不可用时，把播放页交给 OK影视 自己配置的解析线路
        mylog("直连不可用，交回 App 解析: " + pageUrl);
        return JSON.stringify({ parse: 1, url: pageUrl });
    } catch (e) {
        mylog("播放失败: " + e.message);
        return JSON.stringify({ parse: 0, url: "" });
    }
}

export default { init, home, homeVod, category, detail, search, play };

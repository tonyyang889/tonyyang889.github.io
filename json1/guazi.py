# coding = utf-8
#!/usr/bin/python
import re
import sys
import json
import time
import base64
import hashlib
import random
import string
import urllib.parse
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
from base.spider import Spider

sys.path.append('..')

class Spider(Spider):
    def __init__(self):
        self.name = "瓜子"
        self.hosts = [
            'https://apinew.uozvr.com',
            'https://api.w32z7vtd.com',
            'https://api.6a7nnf7.com',
            'https://api.umygrx3.com',
            'https://api.rmedphk.com'
        ]
        self.host_index = 0
        self.host = self.hosts[self.host_index]

        # AES 固定密钥（与Java版一致）
        self.AES_KEY = 'OITxa5OqAYjhswxx'
        self.AES_IV = 'rCMNwZASNBKZ8mXV'

        # RSA 公钥/私钥
        self.RSA_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDUM5+/y8sPsWkd1/RQS64X259EUwxFXFE5HlA65MqrxnPs0JqoSRojSDy5QhwvROlaD6TwRQHKMY2OAZ6SnQeUJsChTEFIR9qUkwrs3/MVUMxjsv6JS6Oe/juclyJGTgVmDhB55EafXsD0SQYVj/QXXsxR6ewR5E2kL52yAAD4yQIDAQAB"
        self.RSA_PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGAe6hKrWLi1zQmjTT1
ozbE4QdFeJGNxubxld6GrFGximxfMsMB6BpJhpcTouAqywAFppiKetUBBbXwYsYU
1wNr648XVmPmCMCy4rY8vdliFnbMUj086DU6Z+/oXBdWU3/b1G0DN3E9wULRSwcK
ZT3wj/cCI1vsCm3gj2R5SqkA9Y0CAwEAAQKBgAJH+4CxV0/zBVcLiBCHvSANm0l7
HetybTh/j2p0Y1sTXro4ALwAaCTUeqdBjWiLSo9lNwDHFyq8zX90+gNxa7c5EqcW
V9FmlVXr8VhfBzcZo1nXeNdXFT7tQ2yah/odtdcx+vRMSGJd1t/5k5bDd9wAvYdI
DblMAg+wiKKZ5KcdAkEA1cCakEN4NexkF5tHPRrR6XOY/XHfkqXxEhMqmNbB9U34
saTJnLWIHC8IXys6Qmzz30TtzCjuOqKRRy+FMM4TdwJBAJQZFPjsGC+RqcG5UvVM
iMPhnwe/bXEehShK86yJK/g/UiKrO87h3aEu5gcJqBygTq3BBBoH2md3pr/W+hUM
WBsCQQChfhTIrdDinKi6lRxrdBnn0Ohjg2cwuqK5zzU9p/N+S9x7Ck8wUI53DKm8
jUJE8WAG7WLj/oCOWEh+ic6NIwTdAkEAj0X8nhx6AXsgCYRql1klbqtVmL8+95KZ
K7PnLWG/IfjQUy3pPGoSaZ7fdquG8bq8oyf5+dzjE/oTXcByS+6XRQJAP/5ciy1b
L3NhUhsaOVy55MHXnPjdcTX0FaLi+ybXZIfIQ2P4rb19mVq1feMbCXhz+L1rG8oa
t5lYKfpe8k83ZA==
-----END RSA PRIVATE KEY-----"""

        self.DEVICE_OLD_KEY = "aLFBMWpxBrIDAD1Si/KVvm41"

        # 设备信息（随机生成）
        self.deviceId = str(864150060000000 + random.randint(0, 9999))
        self.deviceKey = ''.join(random.choices('0123456789ABCDEF', k=40))  # 20字节hex大写
        self.token = ""
        self.token_id = ""
        self.registered = False

        self.header = {
            'User-Agent': 'Lavf/57.83.100',
            'code': 'GZ0369',
            'deviceId': self.deviceId,
            'lang': 'zh_cn',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Version': '2604028',
            'PackageName': 'com.ae06aebdbb.y286327f5a.ofe849883320260517',
            'Ver': '3.0.3.2',
            'api-ver': '3.0.3.2',
            'Referer': self.host
        }

        self.cache = {}
        self.cache_timeout = 300

        # ======================================================================== 添加敏感词过滤功能 ==========================================================================================
        # 限制级电影关键词过滤列表（可自行添加）
        self.filter_keywords = ['聊天软件','神奇的女人','第三者','情夜','两个淘气的','性技巧','代孕','则天外传','灼热之舌','直播','君子好逑','婆家人','平面设计','姐夫','勾魂恶梦','纵欲','紫罗兰','雷利博','深探','米拉索尔','做某事','姐妹','致命游戏','腐花','秘密日记','火辣监狱','美丽的图画','薄化妆','会议','现在不行','密爱','爱情也有版权','忍耐','外遇','食母','巴甫洛夫','性生活','家庭作业','我是你的','素描少女','吃拉面','最后的深爱','隐秘的故事','一对一','深爱的恋情','性感女孩','欲诱','恩怨情天','美国禁忌','奴隶契约','学习的背叛','性是谎言','爱爱对','尤里和','同居的目的','再教育物语','卑触家的','少年人成为大人','生孩子妊','肉园','女人的叹息','Fleur','魔斗姬','偶像女友','妈妈喝骂','女友的真实样','神圣昂磷','他被她拥抱','拓展纪录','欢迎来到抖M','我被妈妈诈骗了','尼僧背德','普里出租','於宇同与春香传','兄弟的妻子','天使们：都','万逆转','性唤醒','善良的妈妈','不良影响','女员工的滋味','课中坏事','一个好妈妈','学生的妈妈','梦想成真','明明说过要用','危情','零零性','危情杀机','野兽之夜','派对和谎言','游走','网恋蜜友','末日村庄','不能说的秘密','九个满月','乳镇','性赞助','朗吉特','箱中女','树林里的夫妻','性狂热','祝你好运','恶习','鸡年寻欢','快乐的保姆','女士邀请','人快跑','初尝禁果','借来的片刻','招待女','妻子的滋味','拉斯加北极','敲击真相','她唇之下','年终点评','他人之妻','人肉叉烧包','朋友的妻子','下流','幻象之人','奇欲','香味','迪迪好莱坞','天边一朵云','云杜娘','不住的誘惑','表妹','坏小姨','奸情','欲孽迷宫','马尔法','美国爱经','儿子的妻子','床战','初体验','私生活','肮脏的玩国王游戏','银饰','节后的星期','狂爱仪式','钢琴教师','大学与狗窝','女经理','哥哥不挑食','你想换爱','开放的姐姐','莫妮卡妹妹','小媳妇','18岁的乔','性感的姐姐','你不配她','寂静的树','萨拉卡布','茶馆妈妈','异形之恋','宝拉','春宫','世界中心','辣妞征集','失身少女','上海丽人','私密地带','萍与雅','娼妓','三人冷水','埃洛伊','性行为','午夜情','性与传染','艾拉妮丝','爱我多深','感官世界','十五天就','我的过错','枫与铃','妻NTR','百劫红颜','堕落夜','痴梦少女','爱的健身房','妹之恋','大哥哥你一个人吗','进球如麻','误爆萌萌','妹妹太爱我','圣华女','爱之病','变性记','强暴','床位','地中海厨娘','情感的力量','爱你所爱','无法忍受','性版','女猫','聆听即相信','泰根和','达里奥','激进行为','甜蜜鲍比','六魔女','迷你宝贝','教科书没教的','3分钟合作','花心','天蝎座','两个人的夜','摇荡的心','禁止成年人','林美大战','小蜜桃','性恐怖','血恋','我的朋友','他的老婆','不法奸禁','母亲的恋人','初体验之日','南京的基','我老公的','搭车','青涩体验','伊丽莎白','岳母','监禁','史上最糟糕的','朋友妈妈','表姐们','粉红女士','我的妈妈是前女友','监幽','生粹庄','重回天鹅湖','心在跳','契约结婚','妻子的秘','哥哥给我','焦燥','无名小卒的','卖妻','爱情蛙跳跳','性婚姻','援交','网红生死战','犯罪娇妻','众归于我','欲女','催眠舞蹈团','家庭教师','老千的目的','白昼先生','课后记忆','你还爱我吗','吸血少女','黑人男友','欲海','性虐','笼中女囚','极欲','禁果','贱男','美丽的野兽','婦的男人','女老师','魅魔猎人','性灵','搜寻伊娃','有机体的','悬赏之惑','巫术面具','森林女王','岳母的简介','马里科镇','三头兽','私语时刻','儿子的女友','毕业生代表','不良侦探','贝拉卢','4人4性','沉浮水手','室友的妻子','深浅','露西妮','买下我','性伴侣','小三人生','性林医院','她的诱人','指尖传出的','哀情口令','西塔','春光乍泄','表兄妹','四大名妓','蜜桃','相识','一夜换身','打底裤','触摸','洗衣店','雌吹','野性北极','灭火宝贝','想要的女朋友','婚礼当天','新城妈妈','图霍格','奸臣','嘶嘶秘事','波索杜','晚熟之情','莉妮萨','精灵新郞','旁观者','玉女聊','伊娃','来来去去','塔米的','性伴侣','他的滋味','女鸨安','交缠','键','好姐姐们','木工厂','囚情三友','2对1猎取','如狼似虎','禁忌','姐姐朋友','危险信号','表弟弟','做我的奴隶','性感司机','秘密性三角','爱一个人','新城妈妈','Paraluman','韩国女性','洞内交易','成为你的客人','24小时开放','女教师','隐藏的秘密','成人世界','小姐','色戒','一路向西','玉蒲团','嫂子','情色','青楼','金瓶','官人','五十度灰','蜜桃成熟时','满清十大酷刑','艳谭','挡不住的疯情','惊变','赤裸羔羊','卿本佳人','我为卿狂','豪放','诱惑','欲望','兽性','虐之恋','南洋十大邪术','邪完再邪','蛇魔追魂降','强奸','偷情','可可西里的美丽传说','一支梨花压海棠','苦月亮','戏梦巴黎','性爱','高潮','技师','痴女','痴汉','自慰','寡妇','巨乳','乳房','的女人','拘束小妹','按摩','乳头','淫荡','水多','内射','爆乳','荡妇','操','享受','美妻','颜射','肛','艳遇','爱抚','情人','骑乘','情欲','情事','大姐','小姐','美女','性欲','人妻','素女','罩杯','潮吹','交流','激情','乳交','阴交','阴道','女优','男优','365日','名模','嫩模','熟女','黑丝','出轨','陪酒','三陪','陪侍','敏感','豪情','打炮','交配','性癖','性交','快感','欲求','炮友','淫乱','出台','坐台','母狗','GAY','同性','SM','变态','恋童','情妇','淫','播种','调教','发廊','酒廊','乱交','G点','AV','裸','继母','继父','胸部','肉体','肉棒','豪放','内衣','极品','风俗','体液','成人','bayo','榨干','职员','狂欢','出差','湿','女友妹妹','女友姐姐','性事','灯草','献身','洗澡','内裤','脱光','童贞','掌控','排泄','不伦','接吻','肉色','能上','脱','治疗','进补','臀','巨物','情妇','大物','小姨子','发情','继母','射','房事','性教','胸','成熟','玩弄','调教','艳谭','高校教师','花鸟','大波','大开眼','后宫','花与蛇','禁室','乐之街','空房间','囡囡','咸湿','活色','偷窥','禁宫','夜蒲','的房子','新建文件','屠夫','偷香','做爱','下女','即是空','房间','处女','明明不喜欢','同意','引诱','情妇','阿尔玛','欢愉','格尔达','上瘾','温濡','妓院','方子传','窥视','花与蛇','晚娘','爱人','斯巴达','美味的','罪恶纵横','交通费','女生宿舍','真爱的伪术','花芯','色欲','爱欲','楼上的女','挡不住的','爱的新世界','丽塔','坏小子','醉酒','女教授','叫兽','男朋友','公公','前后运动','第一次','前列腺','女上司','你的妈妈','前男友','做的爱','邻居','露营','邻家','挥棒','征服的','女郎','艾曼','变身成','虐待','红辣椒','红鞋','和天使一样','夫妻成长','聚会','猛男','艳情','老娘','人偶','年轻','奈莉','秘书','画舫','脐','勃','女儿的','换妻','情迷','青春学堂','巧巧','漂亮姐姐','拷问','女仆','妈妈的','沙西米','服务','拳拳到肉','世界尽头的爱','食物','十年爱','失恋杀人','尸','轮廓','蛇与','火口','幻影','坏时机','快乐星','皮鞭','铁轮','同班同学','晚九','朝九','人鱼传说','性智能','我来自北京','未知方程','微交','朋友的','无水之','无颜之月','味道','下众之爱','心肝','爱之涡','爱神','花为','花宵','六月之蛇','烈性','腥红','性冷','一丝不挂','性谈','夜生活','艳舞','性史','花街','鬼狐','同床','蛇魔','烧腊','鬼叫','美人图','十楼','失乐园','生日女郎','娼妇','压海棠','云上的日子','战国洛','珍品','野兰花','女同事','好想和','讨厌','女人至上','艾曼妞','央求','罪恶的','天使的胆量','前辈','日本','女猎人','已婚','恶女军团','堕落时代','欲室','本能','性侵','极道','粉红沙龙','伴游','四大美人','部长','性犯罪','辣椒','春妇','美味','与我同','暴行','桃色','夜蒲','空即是色','色即是空','学园','人间中毒','河畔','会所','差劲','雌猫','上流','银湖','爱情人偶','性之','郁金香','倡','解禁','婚前试爱','逆爱','雏妓','鸭王','团鬼','丽拉','女子监狱','空姐','不纯洁','宅男','宅女','抚摸','目睹','丰满','床上','居酒屋','放荡','棒','家访','下手','巨物','胸罩','奶罩','婶婶','醉酒','排卵','觊觎','欲求','大学生','阿姨','婚外情','洞穴','G罩','呻吟','屁股','爱的度量','办公室','继妹','艾莉','家政','晚上','比基尼','姨妈','驯服','角色扮演','裤裆','丈夫','上司','色狼','电车','推车','浴室','通奸','继女','新都市','暴欲','儿媳','不伦','色女','桃色','玩物','吸食','慾火','玩火','蒲塔','净化','最后一次2020','迷恋2015','魔鬼天使','狂野三千','奸杀','爸爸的','韵事','床2012','99个月亮','多布拉多','妻子保卫','循环','送货员','灭门','玩具','性喜剧','五选一','借钱','寄生春','妓女','比翼双飞','秘密2022','这只是一个','性福','隔壁','活死人','只爱你一个','妒忌','艳降','保龄球','漂亮的保姆','热爱2014','帕利','交换','碧翠丝','羊魔','血液','有求必应','三民窒','一种心情','大妞','不要睡觉','2对1','酒店温存','爱心护士','初体验','骗子规则','二十五和二十','奇怪的亲','制服','保守的泳衣','老板娘的加班','都会性男','陈列','Sarpseir','妻子的朋友','第一份工作','殉道与快乐','烈火女','新员工','快乐或痛苦','三打一','Libido','1982年的','DongDok','绝望的爱','未知的所有','万逆转','朋友妻子','玩国王','悲伤天使','少女母亲','高级工作','经理的恶作剧','要的就是你','家中出我妻','果汁','真人娃娃','摄影之爱','情爱魔力','饥饿的猫','养老金客人','红唇滚滚','深坐','早花','樱桃嘴','塑料性','禁宫奇女','我会是你的','不贞的季节','定之爱','谁和她睡过了','忍者女杀手','爱之教典','乐美儿','卡车上的坏人','古拉','最后一对','心跳时刻','18岁的教室','我的女孩','我的妹妹','爱的精灵','东京十日','新倾国倾城','夫妻战争','58天','透明女孩','性与爱','性狩人','野花','像这样的东西','加勒比女海盗','落翅女','幻想列车','人体模型','公司合作','死胡同','家庭主妇','三人场景','奴隶市','妻子的姐姐','初次体验','妻子的','精牌女','性感的腰部','牛欲牛','18班','妻子专用','贝尔酒店','爱情的限度','性的研究','思乳','红楼春上春','幸福游艇','成为女人','玉女寿司','月宫宝盒','新的爸爸','情不自禁','护士','影子缠身','韩国推荐','三人爱恋','下午六点的恋人','新儿子','女士宿舍','极乐酷刑','唐朝奸妃','风尘三女侠','饥饿的狼','爱爱全视角','肉蒲团','牡丹灯笼','实习教师','妹妹的朋友','可爱女生宿舍','性劫兰桂坊','性奴','性火坑乳','性工作者','性的厉鬼','南洋第一邪降','爱的界线','搭讪','之后','西西里的美丽','血爱成河','昼颜','阿诺拉','今时之欲','不方便','爱情与灵药','好男好女','善良妈妈的朋友','挑战赛游戏','可疑的美容院','好女孩','肉欲','慰安妇','热牛奶','白百合','不雅医院','少妇安吉娜','不听话女孩','五十度黑','红心女王','不良少女','Bayo','甜心宝贝','木材','深喉','德川女','布拉芙','华丽的外出','寂寞男孩','性瘾','无耻之心','情陷夜','点九美','洞菲律宾','音欲','神明','母与女','艳妇','舞女','色降','接线员','五神通','特殊安保','外出','禁区三','风筝','熔炉','空枕难眠','两个母亲','贼王','情书','花花公司','挑逗','智齿','捉奸','还未开始','火车','不夜城','小手指','请穿上衣服','杀了他','甜蜜释放','万逆转','陷阱','只摸1分钟','隐藏的面孔','游玩生活','不知羞耻','交插点','窈窕马戏','塞西莉','爱情誓言','她美丽','透明人间','妹子出租','裙子里面','双面人格','女子大生','床底的名字','邪恶入侵','爱的小历史','缉毒之女','极乐','魔乳','神奇女人','大叔让我爱','风花雪月','三分之二','冷酷之女','女孩我最大','迷欲','同级生','争艳女王','女孩上陆','不能向上','少女妄想','忍者女龟','违抗者','天生一对','恋之罪','江户川','观房','冰冷热','双人床','墨东绮','孽欲','百合的雨','欲奴','峡谷2013','轻蔑','法利赛','狂野之花','你爱的时候','早恋2013','这样的夏天','前卫的众神','愈快乐','女杀油','我们X她','水管工','露露情史','漂亮的妹妹','S与M','赛琳娜','落鸟','阿德拉','女阴','奈美','我的淘气女友','今晚出柜','干柴烈火','爱丽丝旅馆','女高校生','寄性兽医','未来世纪','女爱男欢','娘王','困惑的浪漫','野店1994','蜈蚣咒','剑奴','性女','残存','不忠2002','丰狂','性执事','泡沫2022','超级天堂','人食人','少女情怀','金钱之味','不扣纽的女孩','天使的性','飞虎出征','浪得过火','索多玛','延边女士','女友的妈妈','水手服','她来自胡','感受大海','欲焰','樱姬','爱情玩偶','爱奴','绿色椅子','青春期的','寻找偶像','妹妹的样子','女集中营','姐姐的朋友','春色漾','受难记','快乐到死','无主之花','红字2004','黄真伊','黑天使','保险女王','温柔地','家教高级','别人的目的','爱情游戏','与女神同行','丑闻2003','名妓2014','善良的妻子','自由夫人','无主之花','禁止想象','辛勤','危墙','拔作','爽到','奉子成婚','非常残酷','杏林','亲吻','乱世银光','斗者','告诉我你','西项日落','大正伪','胡乱的','痴人','玛琪娜','爱有此沉重','雷鱼','好的开始','风流名妓','奸魔','秘密生活','三奸','双姝艳','英雄好色','香港奇案','暴力档案','终极猎杀','O的故事','禁止性爱','聚会的目的','入场券','课后记','老娘我最','秘密室','老婆的姐姐','李秀与','恋爱谈','恋爱的味道','恋人共享','两位母亲','两个母亲','两个女人','两个小姨子','两个淘气','列性摔跤','麻将之夜','蝙蝠宝贝','护士宿舍','巨乳','七美德','田埂精灵','火热的女人','梦犯','特区爱奴','尸城','雌猫们','莫比乌斯','猫女孩','野蛮地区','野生','意难忘','最差劲','淫欲','愈合伴侣','食物链','十手舞','日历女孩','切漫画','色狱','新的哥哥','韩国阿姨','XL上司','娼年','捕风者','爱妹物语','爱之女巫','不羁的心','礼仪老师','拳拳到肉','摄像头','Mamasan','最后一封情书','美好的意外','摇摆艳夏','Trianggulo','需要维护的爱','热带夜晚','Mayumi','春画先生','性梦爱','干脆杀了他','关于约会','热线女孩','第二处女','凤姐','引诱','奇欲记','情妇','我叫阿尔玛','嘶嘶秘事','欢愉','格尔达','不方便的记忆','女性因素','老水仙','上瘾','湿濡的女人','安娜情欲','捉奸侦探','罪恶纵横','交通费','10天的爱人','禁止性爱','性瘾','花芯','忠贞','致命的诱惑','情欲王朝','先性后爱','零零性性','春情荡漾','罗曼史','珍品','周末同床','工作女郎','戏梦巴黎','内情','撒玛利亚女孩','罗马欲乐园','她唇之下','姐姐的S丑闻','芳名卡门','五十度','家教高级课程','色欲迷墙','性之剧毒','与我同眠','禁室培欲','成年人俱乐部','愈合伴侣','A片主人公','年轻气盛','野战惊魂','放荡青春','詹妮弗的肉体','一个女孩和一个男孩','慈禧秘密生活','偷月情','法利赛人','活色生香','诱人的飞行','上流社会','深情触摸','红色骆驼','娜塔莉','红X粉','同船爱歌','女房客','我的妻子','二次曝光','恩娇','红字','化学反应','花容月貌','贪婪','马赛克日本','布拉芙夫人','午夜巴塞罗那','安非他命','火口的两人','谎言和录像带','待绽蔷薇','妹妹的样子有点怪','女仆的安慰食物','爱很烂','玩火险恶局','红颜祸水','爱的旅馆','楼上的女孩','禁止的爱','幻想G点','漂流欲室','桃色机密',
            # 这里添加你想过滤的电影名称关键词
            # 示例：
            # "限制级电影名1",
            # "限制级电影名2",
        ]
        # 编译正则表达式用于快速匹配
        self.filter_pattern = None
        if self.filter_keywords:
            # 使用正则表达式匹配，不区分大小写
            pattern = '|'.join(re.escape(keyword) for keyword in self.filter_keywords)
            self.filter_pattern = re.compile(pattern, re.IGNORECASE)
        # ====== 过滤功能结束 ======


    # ====== 添加过滤方法 ======
    def _is_filtered(self, text):
        """检查文本是否包含过滤关键词"""
        if not text or self.filter_pattern is None:
            return False
        return bool(self.filter_pattern.search(text))

    def _filter_video_list(self, video_list):
        """过滤视频列表，移除包含敏感词的项目"""
        if not video_list:
            return video_list
        filtered = []
        for video in video_list:
            # 检查视频名称是否包含敏感词
            vod_name = video.get('vod_name', '')
            if not self._is_filtered(vod_name):
                filtered.append(video)
        return filtered
    # ================================================================== 过滤方法结束 ==========================================================================================
        # 初始化token
        self.init_token()

    def getName(self):
        return self.name

    def init(self, extend=''):
        pass

    # ---------- 设备注册与认证 ----------
    def init_token(self):
        """初始化token：注册设备 -> 刷新"""
        print("===== 初始化设备认证 =====")
        try:
            if not self.registered:
                self.sign_up()
            # 刷新获取最终token
            self.refresh_token()
        except Exception as e:
            print(f"初始化token失败: {e}")
            # 兜底使用原有硬编码（几乎没用）
            self.token = '024212ef0975c5306a1434e113a46463.bc77313e11a248558a6ca244ca980944ec3421fa480c50e0229ad91f1cb15aea582603202cd71796885c9e5163e500f1b72f737059aff1ddb8beea47c5a331d6760540345b7f88b2302a0e6e09589f9dcf3ff9175d8c905f990203f5fc04748008ea7a366571cbf5b09509a873dcfba3cf1d5590385f5f7ef6e01d1850974aa220eb5178c89e61c24411af9b9a19435e.06fde789ece48d9b33c5dc857e04e9b5838f08264d928b87237d3476c4484b46'

    def sign_up(self):
        """注册设备"""
        print("注册新设备...")
        params = {
            "new_key": self.deviceKey,
            "old_key": self.DEVICE_OLD_KEY,
            "phone_type": 1,
            "code": ""
        }
        result = self._auth_request('/App/Authentication/Device/signUp', params)
        self._apply_auth(result)
        self.registered = True

    def sign_in(self):
        """登录设备"""
        print("设备登录...")
        params = {
            "new_key": self.deviceKey,
            "old_key": self.DEVICE_OLD_KEY
        }
        result = self._auth_request('/App/Authentication/Device/signIn', params)
        self._apply_auth(result)

    def _apply_auth(self, result):
        """从认证响应中提取token"""
        new_token = result.get('token', '')
        if not new_token:
            raise Exception("认证失败，无token返回: {}".format(result))
        self.token = new_token
        new_token_id = result.get('app_user_id', '')
        if new_token_id:
            self.token_id = new_token_id
        print(f"获取token成功, token前缀: {self.token[:30]}...")

    def refresh_token(self):
        """刷新token"""
        print("刷新token...")
        result = self._auth_request('/App/Authentication/Authenticator/refresh', {})
        self._apply_auth(result)

    def _auth_request(self, path, params):
        """认证类请求（不需要ensure_token）"""
        return self._send_encrypted_request(params, path, is_auth=True)

    # ---------- 业务请求核心（修复加密与签名） ----------
    def ensure_token(self):
        """确保token有效，如未就绪则重新获取"""
        if not self.token or not self.token_id:
            if self.registered:
                self.sign_in()
            else:
                self.sign_up()
            self.refresh_token()

    def _send_encrypted_request(self, data, path, is_auth=False):
        """
        发送加密请求，返回解密后的字典
        :param data: 业务参数字典
        :param path: 请求路径
        :param is_auth: 是否为认证类请求（signUp/signIn/refresh），此时不使用ensure_token
        """
        try:
            if not is_auth:
                self.ensure_token()

            # 1. 将参数转为JSON并AES加密
            json_params = json.dumps(data)
            encrypted = self.aes_encrypt(json_params, self.AES_KEY, self.AES_IV)
            request_key = encrypted.upper()  # Java中是bytesToHex(encrypted).toUpperCase()

            # 2. 生成keys (RSA加密 iv/key JSON)
            key_json = json.dumps({"iv": self.AES_IV, "key": self.AES_KEY})
            keys = self.rsa_encrypt(key_json, self.RSA_PUBLIC_KEY)

            # 3. 生成签名
            t = str(int(time.time()))
            sign_str = f"token_id=,token={self.token},phone_type=1,request_key={request_key},app_id=1,time={t},keys={keys}*&zvdvdvddbfikkkumtmdwqppp?|4Y!s!2br"
            signature = self.get_md5(sign_str)  # 已改为大写

            # 4. 构建请求体
            body = {
                'token': self.token,
                'token_id': '',
                'phone_type': '1',
                'time': t,
                'phone_model': 'xiaomi-25031',  # 与Java版保持一致
                'keys': keys,
                'request_key': request_key,
                'signature': signature,
                'app_id': '1',
                'ad_version': '1'
            }

            # 5. 发送请求
            url = f"{self.host}{path}"
            response = self.post(url, headers=self.header, data=body, timeout=10)

            if response.status_code != 200:
                raise Exception(f"HTTP {response.status_code}")

            resp_json = response.json()
            # 检查业务code（若不为200可能token过期）
            if 'code' in resp_json and resp_json['code'] != 200:
                print(f"业务错误码: {resp_json['code']}, 信息: {resp_json}")
                # 如果不是认证请求，尝试重新获取token后重试一次（这里简单处理，外层get_data已有重试）
                raise Exception("业务错误")

            data_section = resp_json.get('data')
            if not data_section:
                raise Exception("响应缺少data字段")

            encrypted_response = data_section.get('response_key', '')
            encrypted_keys = data_section.get('keys', '')

            # 6. 解密响应
            decrypted_keys_json = self.rsa_decrypt(encrypted_keys, self.RSA_PRIVATE_KEY)
            key_info = json.loads(decrypted_keys_json)
            resp_key = key_info['key']
            resp_iv = key_info['iv']
            decrypted_data = self.aes_decrypt(encrypted_response, resp_key, resp_iv)
            return json.loads(decrypted_data)

        except Exception as e:
            print(f"请求失败 [{path}]: {e}")
            return None

    def get_data(self, data, path, use_cache=True):
        """带重试和域名轮询的数据获取（保持原框架）"""
        try:
            cache_key = f"{path}_{hash(str(data))}" if use_cache else None
            if use_cache and cache_key in self.cache:
                cached_data, timestamp = self.cache[cache_key]
                if time.time() - timestamp < self.cache_timeout:
                    return cached_data

            for attempt in range(3):
                tried = 0
                while tried < len(self.hosts):
                    self.host = self.hosts[self.host_index]
                    self.header['Referer'] = self.host
                    result = self._send_encrypted_request(data, path)
                    if result is not None:
                        print(f"请求成功: {path}, 域名: {self.host}")
                        if use_cache and cache_key:
                            self.cache[cache_key] = (result, time.time())
                        return result

                    # 切换到下一个域名
                    self.host_index = (self.host_index + 1) % len(self.hosts)
                    tried += 1

                # 所有域名失败，尝试重新认证并重试
                if attempt < 2:
                    print("所有域名失败，尝试重新认证...")
                    try:
                        self.ensure_token()
                    except:
                        pass
                    self.host_index = 0
                else:
                    break
            return None
        except Exception as e:
            print(f"get_data异常: {e}")
            return None

    # ---------- 加解密工具 ----------
    def aes_encrypt(self, text, key, iv):
        try:
            key_bytes = key.encode('utf-8')
            iv_bytes = iv.encode('utf-8')
            cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
            encrypted = cipher.encrypt(pad(text.encode('utf-8'), AES.block_size))
            return encrypted.hex().upper()
        except Exception as e:
            print(f"AES加密失败: {e}")
            return ""

    def aes_decrypt(self, text, key, iv):
        try:
            key_bytes = key.encode('utf-8')
            iv_bytes = iv.encode('utf-8')
            cipher = AES.new(key_bytes, AES.MODE_CBC, iv_bytes)
            encrypted_bytes = bytes.fromhex(text)
            decrypted = unpad(cipher.decrypt(encrypted_bytes), AES.block_size)
            return decrypted.decode('utf-8')
        except Exception as e:
            print(f"AES解密失败: {e}")
            return ""

    def rsa_encrypt(self, text, public_key_str):
        """RSA公钥加密（PKCS1v1.5）"""
        try:
            key = RSA.import_key("-----BEGIN PUBLIC KEY-----\n" + public_key_str + "\n-----END PUBLIC KEY-----")
            cipher = PKCS1_v1_5.new(key)
            encrypted = cipher.encrypt(text.encode('utf-8'))
            return base64.b64encode(encrypted).decode('utf-8')
        except Exception as e:
            print(f"RSA加密失败: {e}")
            return ""

    def rsa_decrypt(self, encrypted_data, private_key_str):
        """RSA私钥解密"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            rsa_key = RSA.import_key(private_key_str)
            cipher = PKCS1_v1_5.new(rsa_key)
            decrypted = cipher.decrypt(encrypted_bytes, None)
            return decrypted.decode('utf-8') if decrypted else ""
        except Exception as e:
            print(f"RSA解密失败: {e}")
            return ""

    def get_md5(self, text):
        return hashlib.md5(text.encode()).hexdigest().upper()  # 与Java一致大写

    # ---------- 业务方法（添加过滤） ----------
    def homeContent(self, filter):
        result = {}
        classes = [
            {"type_name": "电影", "type_id": "1"},
            {"type_name": "电视剧", "type_id": "2"},
            {"type_name": "动漫", "type_id": "4"},
            {"type_name": "综艺", "type_id": "3"},
            {"type_name": "短剧", "type_id": "64"}
        ]
        result['class'] = classes
        filters = {}
        for cate in classes:
            tid = cate['type_id']
            filters[tid] = [
                {"key": "area", "name": "地区", "value": [
                    {"n": "全部", "v": "0"}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"},
                    {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"},
                    {"n": "日本", "v": "日本"}, {"n": "英国", "v": "英国"}, {"n": "法国", "v": "法国"},
                    {"n": "泰国", "v": "泰国"}, {"n": "印度", "v": "印度"}, {"n": "其他", "v": "其他"}
                ]},
                {"key": "year", "name": "年份", "value": [
                    {"n": "全部", "v": "0"},{"n": "2026", "v": "2026"}, {"n": "2025", "v": "2025"}, {"n": "2024", "v": "2024"},
                    {"n": "2023", "v": "2023"}, {"n": "2022", "v": "2022"}, {"n": "2021", "v": "2021"},
                    {"n": "2020", "v": "2020"}, {"n": "2019", "v": "2019"}, {"n": "2018", "v": "2018"},
                    {"n": "2017", "v": "2017"}, {"n": "2016", "v": "2016"}, {"n": "2015", "v": "2015"},
                    {"n": "2014", "v": "2014"}, {"n": "2013", "v": "2013"}, {"n": "2012", "v": "2012"},
                    {"n": "2011", "v": "2011"}, {"n": "2010", "v": "2010"}, {"n": "2009", "v": "2009"},
                    {"n": "2008", "v": "2008"}, {"n": "2007", "v": "2007"}, {"n": "2006", "v": "2006"},
                    {"n": "2005", "v": "2005"}, {"n": "更早", "v": "2004"}
                ]},
                {"key": "sort", "name": "排序", "value": [
                    {"n": "最新", "v": "d_id"}, {"n": "最热", "v": "d_hits"}, {"n": "推荐", "v": "d_score"}
                ]}
            ]
        result['filters'] = filters
        return result

    def homeVideoContent(self):
        return {'list': []}

    def categoryContent(self, tid, pg, filter, extend):
        videos = []
        try:
            body = {
                "area": extend.get('area', '0'),
                "year": extend.get('year', '0'),
                "pageSize": "30",
                "sort": extend.get('sort', 'd_id'),
                "page": str(pg),
                "tid": tid
            }
            cache_key = f"category_{tid}_{pg}_{hash(str(body))}"
            data = self.get_cached_data(cache_key, body, '/App/IndexList/indexList')
            if data and 'list' in data:
                for item in data['list']:
                    vod_continu = item.get('vod_continu', 0)
                    remarks = '电影' if vod_continu == 0 else f'更新至{vod_continu}集'
                    video = {
                        "vod_id": f"{item.get('vod_id', '')}/{vod_continu}",
                        "vod_name": item.get('vod_name', ''),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": remarks
                    }
                    videos.append(video)
                # ====== 应用过滤 ======
                videos = self._filter_video_list(videos)
        except Exception as e:
            print(f"获取分类内容失败: {e}")
        return {'list': videos, 'page': int(pg), 'pagecount': 9999, 'limit': 30, 'total': 999999}

    def detailContent(self, ids):
        try:
            vod_id = ids[0].split('/')[0]
            t = str(int(time.time()))
            body1 = {"token_id": self.token_id, "vod_id": vod_id, "mobile_time": t, "token": self.token}
            qdata = self.get_data(body1, '/App/IndexPlay/playInfo')
            body2 = {"vurl_cloud_id": "2", "vod_d_id": vod_id}
            jdata = self.get_data(body2, '/App/Resource/Vurl/show')
            if not qdata or 'vodInfo' not in qdata:
                return {'list': []}
            vod = qdata['vodInfo']
            
            # ====== 检查详情页是否包含敏感词 ======
            vod_name = vod.get('vod_name', '')
            if self._is_filtered(vod_name):
                print(f"过滤敏感内容: {vod_name}")
                return {'list': []}
            # ====== 过滤结束 ======
            
            video_detail = {
                "vod_id": vod_id,
                "vod_name": vod.get('vod_name', ''),
                "vod_pic": vod.get('vod_pic', ''),
                "vod_year": vod.get('vod_year', ''),
                "vod_area": vod.get('vod_area', ''),
                "vod_actor": vod.get('vod_actor', ''),
                "vod_director": vod.get('vod_director', ''),
                "vod_content": vod.get('vod_use_content', '').strip(),
                "vod_play_from": "瓜子影视"
            }
            play_list = []
            if jdata and 'list' in jdata:
                for index, item in enumerate(jdata['list']):
                    if 'play' in item:
                        n, p = [], []
                        for key, value in item['play'].items():
                            if 'param' in value and value['param']:
                                n.append(key)
                                p.append(value['param'])
                        if p:
                            play_name = str(index + 1) if len(jdata['list']) != 1 else vod.get('vod_name', '')
                            play_url = f"{p[-1]}||{'@'.join(n)}"
                            play_list.append(f"{play_name}${play_url}")
            video_detail["vod_play_url"] = "#".join(play_list)
            return {'list': [video_detail]}
        except Exception as e:
            print(f"获取详情失败: {e}")
            return {'list': []}

    def searchContent(self, key, quick, pg=1):
        videos = []
        try:
            body = {"keywords": key, "order_val": "1", "page": str(pg)}
            data = self.get_data(body, '/App/Index/findMoreVod', use_cache=False)
            if data and 'list' in data:
                for item in data['list']:
                    vod_continu = item.get('vod_continu', 0)
                    remarks = '电影' if vod_continu == 0 else f'更新至{vod_continu}集'
                    videos.append({
                        "vod_id": f"{item.get('vod_id', '')}/{vod_continu}",
                        "vod_name": item.get('vod_name', ''),
                        "vod_pic": item.get('vod_pic', ''),
                        "vod_remarks": remarks
                    })
                # ====== 应用过滤 ======
                videos = self._filter_video_list(videos)
        except Exception as e:
            print(f"搜索失败: {e}")
        return {'list': videos, 'page': int(pg), 'pagecount': 9999, 'limit': 30, 'total': 999999}

    def playerContent(self, flag, id, vipFlags):
        try:
            parts = id.split('||')
            if len(parts) < 2:
                return {"parse": 0, "playUrl": "", "url": ""}
            param_str = parts[0]
            resolutions = parts[1].split('@') if len(parts) > 1 else []
            params = {}
            for pair in param_str.split('&'):
                if '=' in pair:
                    key, value = pair.split('=', 1)
                    params[key] = value
            if resolutions:
                resolutions.sort(key=lambda x: int(x) if x.isdigit() else 0, reverse=True)
                params['resolution'] = resolutions[0]
                data = self.get_data(params, '/App/Resource/VurlDetail/showOne', use_cache=False)
                if data and 'url' in data:
                    return {"parse": 0, "playUrl": "", "url": data['url'],
                            "header": json.dumps({"User-Agent": "Lavf/57.83.100", "Referer": "http://WJiZxLXA2.com/"}), 'danmaku': 'http://127.0.0.1:9978/proxy?do=diydanmu'}
            return {"parse": 0, "playUrl": "", "url": ""}
        except Exception as e:
            print(f"播放解析失败: {e}")
            return {"parse": 0, "playUrl": "", "url": ""}

    def isVideoFormat(self, url):
        video_formats = ['.m3u8', '.mp4', '.avi', '.mkv', '.flv', '.ts']
        return any(url.lower().endswith(fmt) for fmt in video_formats)

    def manualVideoCheck(self):
        pass

    def localProxy(self, params):
        return None

    def get_cached_data(self, cache_key, data, path):
        current_time = time.time()
        if cache_key in self.cache:
            cached_data, timestamp = self.cache[cache_key]
            if current_time - timestamp < self.cache_timeout:
                return cached_data
        result = self.get_data(data, path)
        if result:
            self.cache[cache_key] = (result, current_time)
        return result

if __name__ == '__main__':
    pass
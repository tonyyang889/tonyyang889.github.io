# -*- coding: utf-8 -*-
# @Author  : Doubebly
# @Time    : 2025/5/29 22:07  移植自 QuickJS 源《金牌影视.js》：https://www.x8kb9k8.com
# 代码来源：https://clun.top/box.json-https://clun.top/py/goldmedal.py  https://github.com/franksun1211/TXT/blob/main/TVbox/VS194-SU147/drpy_js/金牌.py 

import sys
import html
import time
import json
import hashlib
import re
import requests

sys.path.append('..')
from base.spider import Spider

DEFAULT_HOST = 'https://www.x8kb9k8.com'
SIGN_KEY = 'cb808529bae6b6be45ecfab29a4889bc'
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
PAGE_SIZE = 48
ERROR_URL = ('https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/'
             'xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4')
TAG_RE = re.compile(r'<[^>]*>')


class Spider(Spider):
    def getName(self):
        return "GoldMedal"

    def init(self, extend=''):
        host = DEFAULT_HOST
        if extend:
            cfg = extend
            if isinstance(cfg, str):
                try:
                    cfg = json.loads(cfg) if cfg.strip().startswith('{') else {'host': cfg}
                except Exception:
                    cfg = {'host': extend}
            if isinstance(cfg, dict):
                host = str(cfg.get('host') or cfg.get('ext') or host).strip() or host
        host = host.rstrip('/')
        if host and not host.startswith('http'):
            host = 'http://' + host
        self.home_url = host + '/'
        self.api_base = host + '/api/mw-movie'
        self.ua = UA
        self.device_id = 'jinpai-py-' + hashlib.md5(
            self.home_url.encode('utf-8')).hexdigest()[:16]
        self.error_url = ERROR_URL

    def getDependence(self):
        return []

    def isVideoFormat(self, url):
        u = str(url or '').split('?')[0].split('#')[0].lower()
        return u.endswith('.m3u8') or u.endswith('.mp4') or u.endswith('.mkv') or u.endswith('.flv')

    def manualVideoCheck(self):
        return False

    # ------------------------------------------------------------------
    # 网络与签名
    # ------------------------------------------------------------------
    def _sort_query(self, params):
        return '&'.join('%s=%s' % (k, params[k]) for k in sorted(params.keys()))

    def _api_call(self, path, params, referer=None):
        query = self._sort_query(params)
        ts = str(int(time.time() * 1000))
        source = query + ('&' if query else '') + 'key=' + SIGN_KEY + '&t=' + ts
        md5_hex = hashlib.md5(source.encode('utf-8')).hexdigest()
        sign = hashlib.sha1(md5_hex.encode('utf-8')).hexdigest()
        url = self.api_base + path + (('?' + query) if query else '')
        headers = {
            'User-Agent': self.ua,
            'Accept': 'application/json',
            'Referer': referer or self.home_url,
            'client-type': '1',
            'sign': sign,
            't': ts,
            'deviceId': self.device_id,
        }
        res = requests.get(url, headers=headers, timeout=15, verify=False)
        data = res.json()
        if int(data.get('code') or 0) != 200:
            raise RuntimeError('api %s code=%s msg=%s' % (path, data.get('code'), data.get('msg')))
        return data.get('data') or {}

    # ------------------------------------------------------------------
    # 通用工具
    # ------------------------------------------------------------------
    def _clean_text(self, value):
        text = TAG_RE.sub('', str(value or ''))
        text = html.unescape(text).replace('\u00a0', ' ')
        return text.strip()

    def _safe_name(self, name):
        text = str(name if name not in (None, '') else '正片')
        return text.replace('$', '＄').replace('#', '＃')

    def _remarks(self, item):
        remarks = str(item.get('vodRemarks') or item.get('vodVersion')
                      or item.get('vodSerial') or item.get('remark') or '').strip()
        if not remarks and item.get('vodScore'):
            remarks = str(item.get('vodScore'))
        return remarks

    def _map_item(self, item):
        if not item:
            return None
        vid = str(item.get('vodId') if item.get('vodId') is not None else (item.get('id') or ''))
        if not vid:
            return None
        return {
            'vod_id': vid,
            'vod_name': str(item.get('vodName') or item.get('name') or ''),
            'vod_pic': str(item.get('vodPic') or item.get('img') or ''),
            'vod_remarks': self._remarks(item),
            'vod_year': str(item.get('vodYear') or ''),
            'vod_area': str(item.get('vodArea') or ''),
            'type_name': str(item.get('vodClass') or item.get('typeName') or ''),
        }

    def _map_list(self, items):
        result = []
        for item in items or []:
            mapped = self._map_item(item)
            if mapped:
                result.append(mapped)
        return result

    @staticmethod
    def _to_page(pg):
        """页码归一化：非法或小于 1 一律回 1。"""
        try:
            return max(1, int(pg))
        except Exception:
            return 1

    def _normalize_page(self, data, pg):
        if not isinstance(data, dict):
            data = {'list': data if isinstance(data, list) else []}
        if not isinstance(data.get('list'), list):
            data['list'] = []
        page = self._to_page(pg)
        if not data.get('page'):
            data['page'] = page
        if not data.get('limit'):
            data['limit'] = len(data['list'])
        if not data.get('pagecount'):
            data['pagecount'] = page + 1 if data['list'] else page
        return data

    def _empty_page(self, pg):
        return self._normalize_page({'list': []}, pg)

    @staticmethod
    def _log_err(where, exc):
        """异常不静默吞掉：输出可诊断信息（Chaquopy 下进入应用日志）。"""
        try:
            print('[goldmedal] %s 失败: %s: %s' % (where, type(exc).__name__, exc))
        except Exception:
            pass

    # ------------------------------------------------------------------
    # 接口封装
    # ------------------------------------------------------------------
    def _api_category(self, tid, pg, extend):
        params = {
            'clientType': 1,
            'pageNum': self._to_page(pg),
            'pageSize': PAGE_SIZE,
            'type1': str(tid or '1'),
        }
        selected = extend if isinstance(extend, dict) else {}
        # 服务端不接受空字符串过滤值，非空才下发
        mapping = (('type', 'type'), ('class', 'v_class'), ('area', 'area'),
                   ('year', 'year'), ('lang', 'lang'))
        for src_key, api_key in mapping:
            val = str(selected.get(src_key) or '').strip()
            if val:
                params[api_key] = val
        data = self._api_call('/anonymous/video/list', params)
        items = self._map_list(data.get('list'))
        return {
            'list': items,
            'page': int(data.get('pageNum') or params['pageNum']),
            'pagecount': int(data.get('totalPage') or 1),
            'limit': int(data.get('pageSize') or PAGE_SIZE),
            'total': int(data.get('totalCount') or len(items)),
        }

    def _api_detail(self, vid):
        data = self._api_call('/anonymous/video/detail', {'id': str(vid)})
        episodes = data.get('episodeList')
        if not isinstance(episodes, list):
            episodes = []
        parts = []
        for ep in episodes:
            name = self._safe_name(ep.get('name'))
            nid = str(ep.get('nid') or '')
            if not nid:
                continue
            parts.append(name + '$' + str(vid) + '_' + nid)
        play_url = '#'.join(parts)
        if not data.get('vodName') and not play_url:
            return None
        year = str(data.get('vodYear') or data.get('vodPubdate') or '')[:4]
        return {
            'vod_id': str(vid),
            'vod_name': str(data.get('vodName') or ''),
            'vod_pic': str(data.get('vodPic') or ''),
            'vod_actor': str(data.get('vodActor') or ''),
            'vod_director': str(data.get('vodDirector') or ''),
            'vod_content': self._clean_text(data.get('vodContent') or data.get('vodBlurb') or ''),
            'vod_area': str(data.get('vodArea') or ''),
            'vod_lang': str(data.get('vodLang') or ''),
            'vod_year': year,
            'type_name': str(data.get('typeName') or data.get('vodClass') or ''),
            'vod_remarks': str(data.get('vodRemarks') or data.get('vodVersion') or ''),
            'vod_play_from': '金牌影院' if play_url else '',
            'vod_play_url': play_url,
        }

    def _api_search(self, key, pg):
        # 注意：服务端不接受 type='' 与 sourceCode=''，非空才下发
        params = {
            'keyword': str(key),
            'pageNum': self._to_page(pg),
            'pageSize': PAGE_SIZE,
        }
        data = self._api_call('/anonymous/video/searchByWordPageable', params)
        items = self._map_list(data.get('list'))
        return {
            'list': items,
            'page': int(data.get('pageNum') or params['pageNum']),
            'pagecount': int(data.get('totalPage') or 1),
            'limit': int(data.get('pageSize') or PAGE_SIZE),
            'total': int(data.get('totalCount') or len(items)),
        }

    def _api_play(self, vod_id, nid, referer=None):
        data = self._api_call('/anonymous/v2/video/episode/url',
                              {'clientType': 1, 'id': str(vod_id), 'nid': str(nid)},
                              referer=referer)
        items = data.get('list')
        return items if isinstance(items, list) else []

    @staticmethod
    def _playable(item):
        """JS playItem 的判据：flag 为真或无需登录。实测三条线路服务端均可拉取，
        此判据用于「优先挑选」，不作为「是否可取」的硬门槛。"""
        if not item or not item.get('url'):
            return False
        return item.get('flag') is True or item.get('needLogin') is False

    def _select_play(self, items):
        """线路排序：JS 判定优先的线路排前，其余有直链者按原序兜底。

        旧实现直接取 list[0]，会命中 JS 明确标注为需登录/非优先的线路；
        这里改为「优先 + 兜底」，既忠实移植 JS，也保证不因过滤而丢线路。
        """
        valid = [it for it in items if it and it.get('url')]
        if not valid:
            return []
        preferred = [it for it in valid if self._playable(it)]
        others = [it for it in valid if not self._playable(it)]
        ordered = preferred + others
        result = []
        for idx, it in enumerate(ordered):
            name = str(it.get('resolutionName') or '线路%d' % (idx + 1))
            result.append({'n': name, 'v': str(it.get('url'))})
        return result

    # ------------------------------------------------------------------
    # 六壳接口
    # ------------------------------------------------------------------
    def homeContent(self, filter):
        classes = [
            {'type_id': '1', 'type_name': '电影'},
            {'type_id': '2', 'type_name': '电视剧'},
            {'type_id': '3', 'type_name': '综艺'},
            {'type_id': '4', 'type_name': '动漫'},
            {'type_id': '88', 'type_name': '短剧'},
        ]

        def options(values):
            """把取值列表转成 filters 的 value 结构，首项补「全部」。"""
            items = [('全部', '')]
            for one in values:
                if isinstance(one, tuple):
                    items.append(one)
                else:
                    items.append((one, one))
            return [{'n': n, 'v': val} for n, val in items]

        year_full = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019',
                     '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010']
        area_all = ['中国大陆', '中国香港', '中国台湾', '美国', '日本', '韩国',
                    '印度', '泰国', '英国', '法国', '其他']

        # 结构：{分类 type_id: [(filters key, 显示名, 取值列表), ...]}
        spec = {
            '1': [
                ('class', '剧情', ['喜剧', '动作', '爱情', '科幻', '悬疑', '奇幻', '剧情',
                                   '恐怖', '犯罪', '动画', '惊悚', '战争', '冒险', '灾难',
                                   '伦理', '其他']),
                ('area', '地区', area_all),
                ('year', '年份', year_full + [('2009~2000', '2009~2000')]),
                ('lang', '语言', ['国语', '英语', '粤语', '韩语', '日语', '其他']),
            ],
            '2': [
                ('type', '类型', [('国产剧', '14'), ('欧美剧', '15'), ('港台剧', '16'),
                                  ('日韩剧', '62'), ('其他剧', '68')]),
                ('class', '剧情', ['古装', '战争', '喜剧', '家庭', '犯罪', '动作', '奇幻',
                                   '剧情', '历史', '短片', '其他']),
                ('area', '地区', area_all),
                ('year', '年份', year_full),
                ('lang', '语言', ['国语', '英语', '粤语', '韩语', '日语', '泰语', '其他']),
            ],
            '3': [
                ('type', '类型', [('国产综艺', '69'), ('港台综艺', '70'),
                                  ('日韩综艺', '72'), ('欧美综艺', '73')]),
                ('class', '剧情', ['真人秀', '音乐', '脱口秀']),
                ('area', '地区', area_all),
                ('year', '年份', year_full[:10]),
                ('lang', '语言', ['国语', '英语', '粤语', '韩语', '日语', '其他']),
            ],
            '4': [
                ('type', '类型', [('国产动漫', '75'), ('日韩动漫', '76'), ('欧美动漫', '77')]),
                ('class', '剧情', ['喜剧', '科幻', '热血', '冒险', '动作', '运动', '战争', '动画']),
                ('area', '地区', ['中国大陆', '日本', '美国', '其他']),
                ('year', '年份', year_full),
                ('lang', '语言', ['国语', '英语', '日语', '其他']),
            ],
            '88': [
                ('type', '类型', [('喜剧', '100'), ('奇幻', '99'), ('惊悚', '98'),
                                  ('悬疑', '97'), ('古装', '96'), ('爱情', '95'), ('剧情', '94')]),
                ('class', '剧情', ['逆袭', '甜宠', '虐恋', '穿越', '重生', '剧情', '科幻',
                                   '武侠', '爱情', '动作', '战争', '冒险', '其他']),
                ('year', '年份', year_full[:8] + [('更早', '更早')]),
            ],
        }
        filters = {}
        for tid, group in spec.items():
            filters[tid] = [
                {'key': key, 'name': name, 'value': options(values)}
                for key, name, values in group
            ]
        return {'class': classes, 'filters': filters}

    def homeVideoContent(self):
        items = []
        try:
            data = self._api_call('/anonymous/home/hotSearch', {})
            if isinstance(data, list):
                items = self._map_list(data)
        except Exception as exc:
            self._log_err('homeVideoContent hotSearch', exc)
        if not items:
            try:
                items = self._api_search('热门', '1').get('list') or []
            except Exception as exc:
                self._log_err('homeVideoContent 后备搜索', exc)
        return {'list': items, 'parse': 0, 'jx': 0}

    def categoryContent(self, tid, pg, filter, extend):
        page = self._to_page(pg)
        try:
            data = self._api_category(tid, page, extend)
        except Exception as exc:
            self._log_err('categoryContent tid=%s pg=%s' % (tid, page), exc)
            return self._empty_page(page)
        return self._normalize_page(data, page)

    def detailContent(self, ids):
        vid = str(ids[0] if isinstance(ids, (list, tuple)) and ids else ids or '')
        if not vid:
            return {'list': [], 'parse': 0, 'jx': 0}
        try:
            vod = self._api_detail(vid)
        except Exception as exc:
            self._log_err('detailContent id=%s' % vid, exc)
            vod = None
        if not vod:
            return {'list': [], 'parse': 0, 'jx': 0}
        return {'list': [vod], 'parse': 0, 'jx': 0}

    def searchContent(self, key, quick, pg="1"):
        page = self._to_page(pg)
        word = str(key or '').strip()
        if not word:
            return self._empty_page(page)
        try:
            data = self._api_search(word, page)
        except Exception as exc:
            self._log_err('searchContent key=%s pg=%s' % (word, page), exc)
            return self._empty_page(page)
        return self._normalize_page(data, page)

    def playerContent(self, flag, pid, vipFlags):
        header = {
            'User-Agent': self.ua,
            'Referer': self.home_url,
            'Origin': self.home_url.rstrip('/'),
        }
        raw = str(pid or '')
        parts = raw.split('_')
        vod_id = parts[0].strip() if parts else ''
        nid = parts[1].strip() if len(parts) > 1 else ''
        if not vod_id or not nid or not vod_id.isdigit():
            nums = [x for x in raw.split('/') if x.strip().isdigit()]
            if len(nums) >= 2:
                vod_id, nid = nums[-2], nums[-1]
        if not vod_id or not nid:
            return {'url': self.error_url, 'header': header, 'parse': 0, 'jx': 0}
        referer = '%svod/play/%s/sid/%s' % (self.home_url, vod_id, nid)
        try:
            items = self._api_play(vod_id, nid, referer)
        except Exception as exc:
            self._log_err('playerContent id=%s nid=%s' % (vod_id, nid), exc)
            return {'url': self.error_url, 'header': header, 'parse': 0, 'jx': 0}
        selected = self._select_play(items)
        if not selected:
            self._log_err('playerContent id=%s nid=%s 无可用线路' % (vod_id, nid), 'empty list')
            return {'url': self.error_url, 'header': header, 'parse': 0, 'jx': 0}
        # 契约：url 主线保持单字符串（旧壳只认单值）；可播线路优先排首位
        return {
            'parse': 0,
            'url': selected[0]['v'],
            'header': header,
        }

    def liveContent(self, url):
        return ''

    def action(self, action):
        return {}

    def localProxy(self, params):
        return None

    def destroy(self):
        return '正在Destroy'

# ==================== 以下为添加的过滤代码（不修改原有代码） ====================

# 保存原始方法
_original_homeVideoContent = Spider.homeVideoContent
_original_categoryContent = Spider.categoryContent
_original_searchContent = Spider.searchContent

# 配置需要过滤的关键词（可根据需要修改）
FILTER_KEYWORDS = [
    '聊天软件','神奇的女人','第三者','情夜','两个淘气的','性技巧','代孕','则天外传','灼热之舌','直播','君子好逑','婆家人','平面设计','姐夫','勾魂恶梦','纵欲','紫罗兰','雷利博','深探','米拉索尔','做某事','姐妹','致命游戏','腐花','秘密日记','火辣监狱','美丽的图画','薄化妆','会议','现在不行','密爱','爱情也有版权','忍耐','外遇','食母','巴甫洛夫','性生活','家庭作业','我是你的','素描少女','吃拉面','最后的深爱','隐秘的故事','一对一','深爱的恋情','性感女孩','欲诱','恩怨情天','美国禁忌','奴隶契约','学习的背叛','性是谎言','爱爱对','尤里和','同居的目的','再教育物语','卑触家的','少年人成为大人','生孩子妊','肉园','女人的叹息','Fleur','魔斗姬','偶像女友','妈妈喝骂','女友的真实样','神圣昂磷','他被她拥抱','拓展纪录','欢迎来到抖M','我被妈妈诈骗了','尼僧背德','普里出租','於宇同与春香传','兄弟的妻子','天使们：都','万逆转','性唤醒','善良的妈妈','不良影响','女员工的滋味','课中坏事','一个好妈妈','学生的妈妈','梦想成真','明明说过要用','危情','零零性','危情杀机','野兽之夜','派对和谎言','游走','网恋蜜友','末日村庄','不能说的秘密','九个满月','乳镇','性赞助','朗吉特','箱中女','树林里的夫妻','性狂热','祝你好运','恶习','鸡年寻欢','快乐的保姆','女士邀请','人快跑','初尝禁果','借来的片刻','招待女','妻子的滋味','拉斯加北极','敲击真相','她唇之下','年终点评','他人之妻','人肉叉烧包','朋友的妻子','下流','幻象之人','奇欲','香味','迪迪好莱坞','天边一朵云','云杜娘','不住的誘惑','表妹','坏小姨','奸情','欲孽迷宫','马尔法','美国爱经','儿子的妻子','床战','初体验','私生活','肮脏的玩国王游戏','银饰','节后的星期','狂爱仪式','钢琴教师','大学与狗窝','女经理','哥哥不挑食','你想换爱','开放的姐姐','莫妮卡妹妹','小媳妇','18岁的乔','性感的姐姐','你不配她','寂静的树','萨拉卡布','茶馆妈妈','异形之恋','宝拉','春宫','世界中心','辣妞征集','失身少女','上海丽人','私密地带','萍与雅','娼妓','三人冷水','埃洛伊','性行为','午夜情','性与传染','艾拉妮丝','爱我多深','感官世界','十五天就','我的过错','枫与铃','妻NTR','百劫红颜','堕落夜','痴梦少女','爱的健身房','妹之恋','大哥哥你一个人吗','进球如麻','误爆萌萌','妹妹太爱我','圣华女','爱之病','变性记','强暴','床位','地中海厨娘','情感的力量','爱你所爱','无法忍受','性版','女猫','聆听即相信','泰根和','达里奥','激进行为','甜蜜鲍比','六魔女','迷你宝贝','教科书没教的','3分钟合作','花心','天蝎座','两个人的夜','摇荡的心','禁止成年人','林美大战','小蜜桃','性恐怖','血恋','我的朋友','他的老婆','不法奸禁','母亲的恋人','初体验之日','南京的基','我老公的','搭车','青涩体验','伊丽莎白','岳母','监禁','史上最糟糕的','朋友妈妈','表姐们','粉红女士','我的妈妈是前女友','监幽','生粹庄','重回天鹅湖','心在跳','契约结婚','妻子的秘','哥哥给我','焦燥','无名小卒的','卖妻','爱情蛙跳跳','性婚姻','援交','网红生死战','犯罪娇妻','众归于我','欲女','催眠舞蹈团','家庭教师','老千的目的','白昼先生','课后记忆','你还爱我吗','吸血少女','黑人男友','欲海','性虐','笼中女囚','极欲','禁果','贱男','美丽的野兽','婦的男人','女老师','魅魔猎人','性灵','搜寻伊娃','有机体的','悬赏之惑','巫术面具','森林女王','岳母的简介','马里科镇','三头兽','私语时刻','儿子的女友','毕业生代表','不良侦探','贝拉卢','4人4性','沉浮水手','室友的妻子','深浅','露西妮','买下我','性伴侣','小三人生','性林医院','她的诱人','指尖传出的','哀情口令','西塔','春光乍泄','表兄妹','四大名妓','蜜桃','相识','一夜换身','打底裤','触摸','洗衣店','雌吹','野性北极','灭火宝贝','想要的女朋友','婚礼当天','新城妈妈','图霍格','奸臣','嘶嘶秘事','波索杜','晚熟之情','莉妮萨','精灵新郞','旁观者','玉女聊','伊娃','来来去去','塔米的','性伴侣','他的滋味','女鸨安','交缠','键','好姐姐们','木工厂','囚情三友','2对1猎取','如狼似虎','禁忌','姐姐朋友','危险信号','表弟弟','做我的奴隶','性感司机','秘密性三角','爱一个人','新城妈妈','Paraluman','韩国女性','洞内交易','成为你的客人','24小时开放','女教师','隐藏的秘密','成人世界','小姐','色戒','一路向西','玉蒲团','嫂子','情色','青楼','金瓶','官人','五十度灰','蜜桃成熟时','满清十大酷刑','艳谭','挡不住的疯情','惊变','赤裸羔羊','卿本佳人','我为卿狂','豪放','诱惑','欲望','兽性','虐之恋','南洋十大邪术','邪完再邪','蛇魔追魂降','强奸','偷情','可可西里的美丽传说','一支梨花压海棠','苦月亮','戏梦巴黎','性爱','高潮','技师','痴女','痴汉','自慰','寡妇','巨乳','乳房','的女人','拘束小妹','按摩','乳头','淫荡','水多','内射','爆乳','荡妇','操','享受','美妻','颜射','肛','艳遇','爱抚','情人','骑乘','情欲','情事','大姐','小姐','美女','性欲','人妻','素女','罩杯','潮吹','交流','激情','乳交','阴交','阴道','女优','男优','365日','名模','嫩模','熟女','黑丝','出轨','陪酒','三陪','陪侍','敏感','豪情','打炮','交配','性癖','性交','快感','欲求','炮友','淫乱','出台','坐台','母狗','GAY','同性','SM','变态','恋童','情妇','淫','播种','调教','发廊','酒廊','乱交','G点','AV','裸','继母','继父','胸部','肉体','肉棒','豪放','内衣','极品','风俗','体液','成人','bayo','榨干','职员','狂欢','出差','湿','女友妹妹','女友姐姐','性事','灯草','献身','洗澡','内裤','脱光','童贞','掌控','排泄','不伦','接吻','肉色','能上','脱','治疗','进补','臀','巨物','情妇','大物','小姨子','发情','继母','射','房事','性教','胸','成熟','玩弄','调教','艳谭','高校教师','花鸟','大波','大开眼','后宫','花与蛇','禁室','乐之街','空房间','囡囡','咸湿','活色','偷窥','禁宫','夜蒲','的房子','新建文件','屠夫','偷香','做爱','下女','即是空','房间','处女','明明不喜欢','同意','引诱','情妇','阿尔玛','欢愉','格尔达','上瘾','温濡','妓院','方子传','窥视','花与蛇','晚娘','爱人','斯巴达','美味的','罪恶纵横','交通费','女生宿舍','真爱的伪术','花芯','色欲','爱欲','楼上的女','挡不住的','爱的新世界','丽塔','坏小子','醉酒','女教授','叫兽','男朋友','公公','前后运动','第一次','前列腺','女上司','你的妈妈','前男友','做的爱','邻居','露营','邻家','挥棒','征服的','女郎','艾曼','变身成','虐待','红辣椒','红鞋','和天使一样','夫妻成长','聚会','猛男','艳情','老娘','人偶','年轻','奈莉','秘书','画舫','脐','勃','女儿的','换妻','情迷','青春学堂','巧巧','漂亮姐姐','拷问','女仆','妈妈的','沙西米','服务','拳拳到肉','世界尽头的爱','食物','十年爱','失恋杀人','尸','轮廓','蛇与','火口','幻影','坏时机','快乐星','皮鞭','铁轮','同班同学','晚九','朝九','人鱼传说','性智能','我来自北京','未知方程','微交','朋友的','无水之','无颜之月','味道','下众之爱','心肝','爱之涡','爱神','花为','花宵','六月之蛇','烈性','腥红','性冷','一丝不挂','性谈','夜生活','艳舞','性史','花街','鬼狐','同床','蛇魔','烧腊','鬼叫','美人图','十楼','失乐园','生日女郎','娼妇','压海棠','云上的日子','战国洛','珍品','野兰花','女同事','好想和','讨厌','女人至上','艾曼妞','央求','罪恶的','天使的胆量','前辈','日本','女猎人','已婚','恶女军团','堕落时代','欲室','本能','性侵','极道','粉红沙龙','伴游','四大美人','部长','性犯罪','辣椒','春妇','美味','与我同','暴行','桃色','夜蒲','空即是色','色即是空','学园','人间中毒','河畔','会所','差劲','雌猫','上流','银湖','爱情人偶','性之','郁金香','倡','解禁','婚前试爱','逆爱','雏妓','鸭王','团鬼','丽拉','女子监狱','空姐','不纯洁','宅男','宅女','抚摸','目睹','丰满','床上','居酒屋','放荡','棒','家访','下手','巨物','胸罩','奶罩','婶婶','醉酒','排卵','觊觎','欲求','大学生','阿姨','婚外情','洞穴','G罩','呻吟','屁股','爱的度量','办公室','继妹','艾莉','家政','晚上','比基尼','姨妈','驯服','角色扮演','裤裆','丈夫','上司','色狼','电车','推车','浴室','通奸','继女','新都市','暴欲','儿媳','不伦','色女','桃色','玩物','吸食','慾火','玩火','蒲塔','净化','最后一次2020','迷恋2015','魔鬼天使','狂野三千','奸杀','爸爸的','韵事','床2012','99个月亮','多布拉多','妻子保卫','循环','送货员','灭门','玩具','性喜剧','五选一','借钱','寄生春','妓女','比翼双飞','秘密2022','这只是一个','性福','隔壁','活死人','只爱你一个','妒忌','艳降','保龄球','漂亮的保姆','热爱2014','帕利','交换','碧翠丝','羊魔','血液','有求必应','三民窒','一种心情','大妞','不要睡觉','2对1','酒店温存','爱心护士','初体验','骗子规则','二十五和二十','奇怪的亲','制服','保守的泳衣','老板娘的加班','都会性男','陈列','Sarpseir','妻子的朋友','第一份工作','殉道与快乐','烈火女','新员工','快乐或痛苦','三打一','Libido','1982年的','DongDok','绝望的爱','未知的所有','万逆转','朋友妻子','玩国王','悲伤天使','少女母亲','高级工作','经理的恶作剧','要的就是你','家中出我妻','果汁','真人娃娃','摄影之爱','情爱魔力','饥饿的猫','养老金客人','红唇滚滚','深坐','早花','樱桃嘴','塑料性','禁宫奇女','我会是你的','不贞的季节','定之爱','谁和她睡过了','忍者女杀手','爱之教典','乐美儿','卡车上的坏人','古拉','最后一对','心跳时刻','18岁的教室','我的女孩','我的妹妹','爱的精灵','东京十日','新倾国倾城','夫妻战争','58天','透明女孩','性与爱','性狩人','野花','像这样的东西','加勒比女海盗','落翅女','幻想列车','人体模型','公司合作','死胡同','家庭主妇','三人场景','奴隶市','妻子的姐姐','初次体验','妻子的','精牌女','性感的腰部','牛欲牛','18班','妻子专用','贝尔酒店','爱情的限度','性的研究','思乳','红楼春上春','幸福游艇','成为女人','玉女寿司','月宫宝盒','新的爸爸','情不自禁','护士','影子缠身','韩国推荐','三人爱恋','下午六点的恋人','新儿子','女士宿舍','极乐酷刑','唐朝奸妃','风尘三女侠','饥饿的狼','爱爱全视角','肉蒲团','牡丹灯笼','实习教师','妹妹的朋友','可爱女生宿舍','性劫兰桂坊','性奴','性火坑乳','性工作者','性的厉鬼','南洋第一邪降','爱的界线','搭讪','之后','西西里的美丽','血爱成河','昼颜','阿诺拉','今时之欲','不方便','爱情与灵药','好男好女','善良妈妈的朋友','挑战赛游戏','可疑的美容院','好女孩','肉欲','慰安妇','热牛奶','白百合','不雅医院','少妇安吉娜','不听话女孩','五十度黑','红心女王','不良少女','Bayo','甜心宝贝','木材','深喉','德川女','布拉芙','华丽的外出','寂寞男孩','性瘾','无耻之心','情陷夜','点九美','洞菲律宾','音欲','神明','母与女','艳妇','舞女','色降','接线员','五神通','特殊安保','外出','禁区三','风筝','熔炉','空枕难眠','两个母亲','贼王','情书','花花公司','挑逗','智齿','捉奸','还未开始','火车','不夜城','小手指','请穿上衣服','杀了他','甜蜜释放','万逆转','陷阱','只摸1分钟','隐藏的面孔','游玩生活','不知羞耻','交插点','窈窕马戏','塞西莉','爱情誓言','她美丽','透明人间','妹子出租','裙子里面','双面人格','女子大生','床底的名字','邪恶入侵','爱的小历史','缉毒之女','极乐','魔乳','神奇女人','大叔让我爱','风花雪月','三分之二','冷酷之女','女孩我最大','迷欲','同级生','争艳女王','女孩上陆','不能向上','少女妄想','忍者女龟','违抗者','天生一对','恋之罪','江户川','观房','冰冷热','双人床','墨东绮','孽欲','百合的雨','欲奴','峡谷2013','轻蔑','法利赛','狂野之花','你爱的时候','早恋2013','这样的夏天','前卫的众神','愈快乐','女杀油','我们X她','水管工','露露情史','漂亮的妹妹','S与M','赛琳娜','落鸟','阿德拉','女阴','奈美','我的淘气女友','今晚出柜','干柴烈火','爱丽丝旅馆','女高校生','寄性兽医','未来世纪','女爱男欢','娘王','困惑的浪漫','野店1994','蜈蚣咒','剑奴','性女','残存','不忠2002','丰狂','性执事','泡沫2022','超级天堂','人食人','少女情怀','金钱之味','不扣纽的女孩','天使的性','飞虎出征','浪得过火','索多玛','延边女士','女友的妈妈','水手服','她来自胡','感受大海','欲焰','樱姬','爱情玩偶','爱奴','绿色椅子','青春期的','寻找偶像','妹妹的样子','女集中营','姐姐的朋友','春色漾','受难记','快乐到死','无主之花','红字2004','黄真伊','黑天使','保险女王','温柔地','家教高级','别人的目的','爱情游戏','与女神同行','丑闻2003','名妓2014','善良的妻子','自由夫人','无主之花','禁止想象','辛勤','危墙','拔作','爽到','奉子成婚','非常残酷','杏林','亲吻','乱世银光','斗者','告诉我你','西项日落','大正伪','胡乱的','痴人','玛琪娜','爱有此沉重','雷鱼','好的开始','风流名妓','奸魔','秘密生活','三奸','双姝艳','英雄好色','香港奇案','暴力档案','终极猎杀','O的故事','禁止性爱','聚会的目的','入场券','课后记','老娘我最','秘密室','老婆的姐姐','李秀与','恋爱谈','恋爱的味道','恋人共享','两位母亲','两个母亲','两个女人','两个小姨子','两个淘气','列性摔跤','麻将之夜','蝙蝠宝贝','护士宿舍','巨乳','七美德','田埂精灵','火热的女人','梦犯','特区爱奴','尸城','雌猫们','莫比乌斯','猫女孩','野蛮地区','野生','意难忘','最差劲','淫欲','愈合伴侣','食物链','十手舞','日历女孩','切漫画','色狱','新的哥哥','韩国阿姨','XL上司','娼年','捕风者','爱妹物语','爱之女巫','不羁的心','礼仪老师','拳拳到肉','摄像头','Mamasan','最后一封情书','美好的意外','摇摆艳夏','Trianggulo','需要维护的爱','热带夜晚','Mayumi','春画先生','性梦爱','干脆杀了他','关于约会','热线女孩','第二处女','凤姐','引诱','奇欲记','情妇','我叫阿尔玛','嘶嘶秘事','欢愉','格尔达','不方便的记忆','女性因素','老水仙','上瘾','湿濡的女人','安娜情欲','捉奸侦探','罪恶纵横','交通费','10天的爱人','禁止性爱','性瘾','花芯','忠贞','致命的诱惑','情欲王朝','先性后爱','零零性性','春情荡漾','罗曼史','珍品','周末同床','工作女郎','戏梦巴黎','内情','撒玛利亚女孩','罗马欲乐园','她唇之下','姐姐的S丑闻','芳名卡门','五十度','家教高级课程','色欲迷墙','性之剧毒','与我同眠','禁室培欲','成年人俱乐部','愈合伴侣','A片主人公','年轻气盛','野战惊魂','放荡青春','詹妮弗的肉体','一个女孩和一个男孩','慈禧秘密生活','偷月情','法利赛人','活色生香','诱人的飞行','上流社会','深情触摸','红色骆驼','娜塔莉','红X粉','同船爱歌','女房客','我的妻子','二次曝光','恩娇','红字','化学反应','花容月貌','贪婪','马赛克日本','布拉芙夫人','午夜巴塞罗那','安非他命','火口的两人','谎言和录像带','待绽蔷薇','妹妹的样子有点怪','女仆的安慰食物','爱很烂','玩火险恶局','红颜祸水','爱的旅馆','楼上的女孩','禁止的爱','幻想G点','漂流欲室','桃色机密',
    # 可以继续添加更多关键词
]

# 配置需要精确过滤的电影名（完全匹配）
EXACT_FILTER_NAMES = [
    # '具体电影名1',
    # '具体电影名2',
]

def should_filter(vod_name):
    """判断是否应该过滤该视频"""
    if not vod_name:
        return False
    
    # 精确匹配
    if vod_name in EXACT_FILTER_NAMES:
        return True
    
    # 关键词模糊匹配
    for keyword in FILTER_KEYWORDS:
        if keyword in vod_name:
            return True
    
    return False

def filter_video_list(video_list):
    """过滤视频列表"""
    if not video_list:
        return video_list
    
    filtered_list = []
    filtered_count = 0
    
    for item in video_list:
        vod_name = item.get('vod_name', '')
        if not should_filter(vod_name):
            filtered_list.append(item)
        else:
            filtered_count += 1
            print(f"[过滤] 已屏蔽: {vod_name}")
    
    if filtered_count > 0:
        print(f"[过滤] 共屏蔽 {filtered_count} 个视频")
    
    return filtered_list

# 重写 homeVideoContent 方法
def new_homeVideoContent(self):
    result = _original_homeVideoContent(self)
    if 'list' in result:
        result['list'] = filter_video_list(result['list'])
    return result

# 重写 categoryContent 方法
def new_categoryContent(self, cid, page, filter, ext):
    result = _original_categoryContent(self, cid, page, filter, ext)
    if 'list' in result:
        result['list'] = filter_video_list(result['list'])
    return result

# 重写 searchContent 方法
def new_searchContent(self, key, quick, page='1'):
    result = _original_searchContent(self, key, quick, page)
    if 'list' in result:
        result['list'] = filter_video_list(result['list'])
    return result

# 应用猴子补丁
Spider.homeVideoContent = new_homeVideoContent
Spider.categoryContent = new_categoryContent
Spider.searchContent = new_searchContent

# ==================== 过滤代码添加完毕 ====================

if __name__ == '__main__':
    pass

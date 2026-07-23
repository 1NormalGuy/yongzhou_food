import type { OpenStatus, Price, Restaurant, RestaurantCategory } from '../types'

const images = [
  'photo-1569058242253-92a9c755a0ec', 'photo-1529193591184-b1d58069ecdd',
  'photo-1547592180-85f173990554', 'photo-1563227812-0ea4c22e6cc8',
  'photo-1563379926898-05f4575a45d8', 'photo-1495474472287-4d71bcdd2085',
  'photo-1558030006-450675393462', 'photo-1544025162-d76694265947',
  'photo-1569718212165-3a8278d5f624', 'photo-1601050690597-df0568f70950',
  'photo-1582878826629-29b7ad1cdc43', 'photo-1552611052-33e04de081de',
  'photo-1529692236671-f1f6cf9683ba', 'photo-1569050467447-ce54b3bbc37d',
  'photo-1547592053-70f50e4e3c80', 'photo-1563245372-f21724e3856d',
  'photo-1555126634-323283e090fa', 'photo-1529042410759-befb1204b468',
  'photo-1551183053-bf91a1d81141', 'photo-1534797258760-1bd2cc95a5bd',
]

const img = (index: number) => `https://images.unsplash.com/${images[(index - 1) % images.length]}?auto=format&fit=crop&w=720&q=82`

type RestaurantInput = {
  id: string; name: string; address: string; lat: number; lng: number
  featuredDish: string[]; cuisine: string[]; price?: Price; rating?: number
  reviews?: number; openStatus?: OpenStatus; hours?: string; phone?: string; category?: RestaurantCategory
}

const dessertKeywords = ['甜品', '饮品', '咖啡', '烘焙', '冷饮', '糖水']
const classifyRestaurant = (input: RestaurantInput): RestaurantCategory => {
  const searchable = [input.name, ...input.cuisine, ...input.featuredDish].join(' ')
  return dessertKeywords.some((keyword) => searchable.includes(keyword)) ? 'dessert' : 'meal'
}

const restaurant = (sourceIndex: number, input: RestaurantInput): Restaurant => ({
  sourceIndex,
  image: img(sourceIndex),
  category: input.category ?? classifyRestaurant(input),
  price: input.price ?? (sourceIndex % 5 === 0 ? '¥¥¥' : sourceIndex % 3 === 0 ? '¥¥' : '¥'),
  rating: input.rating ?? 4.3 + ((sourceIndex * 7) % 6) / 10,
  reviews: input.reviews ?? 86 + sourceIndex * 29,
  openStatus: input.openStatus ?? (sourceIndex % 11 === 0 ? 'closed' : sourceIndex % 7 === 0 ? 'closing' : 'open'),
  hours: input.hours ?? '10:00–22:00',
  ...input,
})

export const YONGZHOU_CENTER = { lat: 26.4345, lng: 111.608 }

// 编号严格对应用户提供图片中的 1–45；同店多图按独立地图点保留。
export const restaurants: Restaurant[] = [
  restaurant(1, { id: 'suibian', name: '随缘小菜馆', address: '冷水滩区', lat: 26.4358, lng: 111.6123, cuisine: ['永州菜', '家常菜'], featuredDish: ['黑鸭煲', '银卷饼'], price: '¥¥', rating: 4.7, reviews: 328 }),
  restaurant(2, { id: 'diwang', name: '帝王烧烤', address: '冷水滩区', lat: 26.4413, lng: 111.6029, cuisine: ['烧烤', '夜宵'], featuredDish: ['两块钱的牛肉串'], price: '¥¥', rating: 4.6, reviews: 516, hours: '17:00–次日 02:00' }),
  restaurant(3, { id: 'shengxiangting', name: '盛香亭转转小火锅', address: '零陵、冷水滩均有门店', lat: 26.4327, lng: 111.6054, cuisine: ['火锅', '湘味'], featuredDish: ['卤味锅底', '糯糯三拼'], price: '¥¥', rating: 4.5, reviews: 742 }),
  restaurant(4, { id: 'shuxin', name: '舒心冷饮', address: '冷水滩区市委对面', lat: 26.4269, lng: 111.6167, cuisine: ['冷饮', '甜品'], featuredDish: ['葡萄冰'], rating: 4.8, reviews: 201, hours: '12:00–23:00' }),
  restaurant(5, { id: 'pangge', name: '胖哥俩', address: '冷水滩区万达广场三楼', lat: 26.4525, lng: 111.5952, cuisine: ['肉蟹煲', '海鲜'], featuredDish: ['肉蟹煲'], price: '¥¥¥', rating: 4.4, reviews: 1086 }),
  restaurant(6, { id: 'dashu', name: '大树咖啡', address: '永州市体育馆对面', lat: 26.4238, lng: 111.5988, cuisine: ['咖啡厅', '轻食'], featuredDish: ['拍照打卡'], price: '¥¥', rating: 4.9, reviews: 389, hours: '09:00–23:30' }),
  restaurant(7, { id: 'malagu', name: '马拉古烧烤', address: '冷水滩区帝王广场', lat: 26.4402, lng: 111.6001, cuisine: ['烧烤', '夜宵'], featuredDish: ['牛肉串'], price: '¥¥', hours: '18:00–次日 01:30' }),
  restaurant(8, { id: 'xiangyonghui', name: '湘永汇', address: '冷水滩区湘永名邸', lat: 26.4303, lng: 111.6204, cuisine: ['湘菜', '烧烤'], featuredDish: ['彩椒牛肉串', '牛油砂锅粥', '鱼片粥'], price: '¥¥', rating: 4.6, reviews: 633, hours: '16:30–次日 01:00' }),
  restaurant(9, { id: 'lingnanxiaosheng', name: '岭南小生', address: '冷水滩区万达广场三楼', lat: 26.4518, lng: 111.5961, cuisine: ['粤菜', '茶点'], featuredDish: ['虾饺', '干炒牛河'], price: '¥¥' }),
  restaurant(10, { id: 'hongfangzi-yanjiang', name: '红房子下河线餐厅·沿江点', address: '冷水滩区河西沿江路', lat: 26.4387, lng: 111.5914, cuisine: ['永州菜', '河鲜'], featuredDish: ['蒜蓉罗氏虾', '风生水起鸡'], price: '¥¥¥', rating: 4.7, reviews: 455 }),
  restaurant(11, { id: 'hongfangzi-hexi', name: '红房子下河线餐厅·河西点', address: '冷水滩区河西', lat: 26.4431, lng: 111.5872, cuisine: ['永州菜', '河鲜'], featuredDish: ['蒜蓉罗氏虾', '风生水起鸡'], price: '¥¥¥', rating: 4.6, reviews: 391 }),
  restaurant(12, { id: 'bukezhaji', name: '不可炸鸡', address: '冷水滩区步步高一楼', lat: 26.4334, lng: 111.6063, cuisine: ['炸鸡', '快餐'], featuredDish: ['芝士炸鸡', '芝士球'], price: '¥¥' }),
  restaurant(13, { id: '7080', name: '7080', address: '冷水滩区万达广场三楼', lat: 26.4531, lng: 111.5968, cuisine: ['甜品', '小吃'], featuredDish: ['香芋拔丝'] }),
  restaurant(14, { id: 'shengxiaojie', name: '盛小姐与偏爱', address: '帝王广场、万达广场均有门店', lat: 26.4454, lng: 111.6046, cuisine: ['烘焙', '咖啡'], featuredDish: ['碱水结', '开心果碱水'], price: '¥¥' }),
  restaurant(15, { id: 'yinxin', name: '尹新粉店', address: '新田县', lat: 25.9042, lng: 112.2037, cuisine: ['米粉', '早餐'], featuredDish: ['新田米粉'], rating: 4.7, reviews: 764, hours: '05:30–13:30' }),
  restaurant(16, { id: 'heganmianshang', name: '和擀面庄', address: '冷水滩区帝王广场', lat: 26.4437, lng: 111.6071, cuisine: ['面馆', '小吃'], featuredDish: ['酸菜牛肉面'] }),
  restaurant(17, { id: 'xiangcheng-hexi', name: '湘城一品·河西点', address: '冷水滩区河西', lat: 26.4461, lng: 111.5898, cuisine: ['小吃', '早餐'], featuredDish: ['咸蛋黄烧卖'], rating: 4.8, reviews: 177, hours: '06:30–14:00' }),
  restaurant(18, { id: 'qumazi', name: '屈麻子牛肉粉', address: '冷水滩区李达中学附近', lat: 26.4196, lng: 111.6135, cuisine: ['牛肉粉', '早餐'], featuredDish: ['牛肉粉'], hours: '06:00–14:00' }),
  restaurant(19, { id: 'shanghai-tangbao', name: '上海手工灌汤包', address: '冷水滩区帝王广场', lat: 26.4425, lng: 111.6018, cuisine: ['汤包', '小吃'], featuredDish: ['蟹黄小笼包'] }),
  restaurant(20, { id: 'liujidaximen', name: '刘记大西门凉拌粉', address: '冷水滩区河西', lat: 26.4475, lng: 111.5858, cuisine: ['米粉', '永州小吃'], featuredDish: ['腊肠腊肉双拼煲仔饭', '凉拌粉'], rating: 4.9, reviews: 865, hours: '06:00–14:30' }),
  restaurant(21, { id: 'xiaopu', name: '肖蒲罐罐米线', address: '冷水滩区嘉隆广场', lat: 26.4241, lng: 111.6101, cuisine: ['米线', '小吃'], featuredDish: ['百香果酸汤米线', '臭豆腐米线', '丰富配菜'], rating: 4.7, reviews: 621 }),
  restaurant(22, { id: 'hongdousha', name: '红豆沙桂花小丸子', address: '冷水滩区富源小区摊位', lat: 26.4551, lng: 111.6144, cuisine: ['甜品', '小吃'], featuredDish: ['红豆沙桂花小丸子'] }),
  restaurant(23, { id: 'aiziwang', name: '矮子王烧烤', address: '冷水滩区河西', lat: 26.4492, lng: 111.5931, cuisine: ['烧烤', '夜宵'], featuredDish: ['饺子', '烤豆腐串', '喝螺'], price: '¥¥', hours: '17:00–次日 02:00' }),
  restaurant(24, { id: 'zhenbaoluwei', name: '真宝卤味', address: '冷水滩区富源小区大新超市门口', lat: 26.4558, lng: 111.6154, cuisine: ['卤味', '凉菜'], featuredDish: ['香酥鸭', '凉拌菜'], price: '¥¥', rating: 4.6, reviews: 412 }),
  restaurant(25, { id: 'guangshunxing', name: '广顺兴', address: '冷水滩区帝王广场', lat: 26.4394, lng: 111.6041, cuisine: ['粤菜', '煲类'], featuredDish: ['叉烧', '烧鹅', '猪肚鸡煲'], price: '¥¥¥' }),
  restaurant(26, { id: 'deyi', name: '德一牛肉粉', address: '永州市体育馆对面', lat: 26.4224, lng: 111.5971, cuisine: ['牛肉粉', '早餐'], featuredDish: ['牛肉粉', '牛排粉'], rating: 4.8, reviews: 994, hours: '06:00–14:00' }),
  restaurant(27, { id: 'meigancai', name: '梅干菜扣肉饼', address: '冷水滩区富源小区摊位', lat: 26.4543, lng: 111.6162, cuisine: ['饼类', '街头小吃'], featuredDish: ['梅干菜扣肉饼'] }),
  restaurant(28, { id: 'xiangcheng-lengshuitan', name: '湘城一品·冷水滩点', address: '冷水滩区', lat: 26.4315, lng: 111.6182, cuisine: ['小吃', '早餐'], featuredDish: ['咸蛋黄烧卖'], rating: 4.7, reviews: 203, hours: '06:30–14:00' }),
  restaurant(29, { id: 'douxi', name: '都喜料理', address: '冷水滩区万达广场附近', lat: 26.4571, lng: 111.6016, cuisine: ['日料', '融合菜'], featuredDish: ['三文鱼', '鹅肝饭'], price: '¥¥¥' }),
  restaurant(30, { id: 'guizhousuantang', name: '贵州酸汤火锅', address: '零陵区春天广场三楼', lat: 26.2186, lng: 111.6195, cuisine: ['火锅', '贵州菜'], featuredDish: ['瀑布土豆丝'], price: '¥¥', rating: 4.7, reviews: 536 }),
  restaurant(31, { id: 'fenzitiaodong', name: '分子跳动', address: '冷水滩区万达广场一楼', lat: 26.4509, lng: 111.5974, cuisine: ['烘焙', '咖啡'], featuredDish: ['可颂'], price: '¥¥' }),
  restaurant(32, { id: 'kechuanshaokao', name: '客串烧烤', address: '零陵区', lat: 26.2247, lng: 111.6212, cuisine: ['烧烤', '夜宵'], featuredDish: ['小龙虾'], price: '¥¥', hours: '17:00–次日 02:00' }),
  restaurant(33, { id: 'haidilao', name: '海底捞', address: '冷水滩区', lat: 26.4282, lng: 111.6086, cuisine: ['火锅', '川味'], featuredDish: ['奶酪鱼条', '炸牛奶'], price: '¥¥¥', rating: 4.8, reviews: 1320 }),
  restaurant(34, { id: 'hongfangzi-xiangjiang', name: '红房子下河线餐厅·湘江点', address: '冷水滩区湘江东路', lat: 26.4342, lng: 111.5862, cuisine: ['永州菜', '河鲜'], featuredDish: ['蒜蓉罗氏虾', '风生水起鸡'], price: '¥¥¥', rating: 4.7, reviews: 428 }),
  restaurant(35, { id: 'xiangsu-jiliubing', name: '香酥鸡柳饼', address: '零陵区东山景区对面', lat: 26.2171, lng: 111.6264, cuisine: ['饼类', '小吃'], featuredDish: ['香酥鸡柳饼', '特制泡菜'] }),
  restaurant(36, { id: 'qingbuliang', name: '清补凉', address: '零陵区春天广场肯德基对面', lat: 26.2192, lng: 111.6178, cuisine: ['糖水', '甜品'], featuredDish: ['清补凉'] }),
  restaurant(37, { id: 'pangdashuai', name: '胖大帅爆炒浇头盖浇面', address: '零陵区华天酒店附近', lat: 26.2149, lng: 111.6268, cuisine: ['面馆', '快餐'], featuredDish: ['爆炒三嫩盖浇面'], rating: 4.6, reviews: 347 }),
  restaurant(38, { id: 'ximenli', name: '西门里', address: '零陵区大西门', lat: 26.2211, lng: 111.6126, cuisine: ['包点', '早餐'], featuredDish: ['三块钱的酱肉包'], hours: '06:30–15:00' }),
  restaurant(39, { id: 'aqinjia', name: '阿亲家烤肉自助', address: '零陵区、冷水滩区均有门店', lat: 26.2278, lng: 111.6171, cuisine: ['烤肉', '自助餐'], featuredDish: ['单点炸鸡', '芝士玉米粒'], price: '¥¥¥' }),
  restaurant(40, { id: 'gongfutang', name: '功夫唐', address: '新田县', lat: 25.9074, lng: 112.1989, cuisine: ['湘菜', '中餐'], featuredDish: ['爆炒牛肉', '饺子', '烤鱼'], price: '¥¥', rating: 4.5, reviews: 618 }),
  restaurant(41, { id: 'daidai-luosifen', name: '呆呆螺蛳粉', address: '零陵区卫校对面', lat: 26.2313, lng: 111.6235, cuisine: ['螺蛳粉', '小吃'], featuredDish: ['螺蛳粉', '甜肠炸蛋'] }),
  restaurant(42, { id: 'wangji-gucheng', name: '王记古城面馆', address: '零陵区', lat: 26.2256, lng: 111.6089, cuisine: ['面馆', '早餐'], featuredDish: ['牛腩干拌面', '牛杂干拌面'] }),
  restaurant(43, { id: 'hema-yeshi', name: '河马夜市', address: '冷水滩区河西永州大市场', lat: 26.4512, lng: 111.5816, cuisine: ['夜市', '烧烤'], featuredDish: ['炸南瓜花', '蒜香烤鱼', '生腌蟹钳'], price: '¥¥', hours: '17:00–次日 02:00' }),
  restaurant(44, { id: 'huiwei-heiyabao', name: '回味黑鸭煲', address: '冷水滩区万达广场三楼', lat: 26.4546, lng: 111.5943, cuisine: ['煲类', '永州菜'], featuredDish: ['黑鸭煲', '糖醋里脊'], price: '¥¥' }),
  restaurant(45, { id: 'cuipi-shaoji', name: '脆皮烧鸡', address: '冷水滩区富源小区摊位', lat: 26.4564, lng: 111.6139, cuisine: ['烧鸡', '街头小吃'], featuredDish: ['脆皮烧鸡'] }),
]

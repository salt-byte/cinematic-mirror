
export interface StylingOption {
  title: string;
  subtitle: string;
  image: string;
  palette: { hex: string; name: string; enName: string }[];
  materials: string[];
  tailoring: string[];
  scriptSnippet: string;
  directorNote: string;
}

export interface MovieCharacter {
  id: string;
  name: string;
  movie: string;
  traits: string[]; // 用于 AI 匹配的性格标签
  stylings: StylingOption[]; // 多套造型，每套有独立的分析
}


export const MOVIE_DATABASE: MovieCharacter[] = [
  {
    id: "clueless-cher",
    name: "雪儿",
    movie: "独领风骚",
    traits: ["精致", "自信", "学院风", "场域掌控", "少女甜美", "社交强者", "明亮的女性力量"],
    stylings: [
      {
        title: "黄格纹的入场宣言",
        subtitle: "90年代校园 preppy · 高级时装剪裁下沉 · 危险又甜美",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/Cher/2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvQ2hlci8yLnBuZyIsImlhdCI6MTc2OTg0OTQwMSwiZXhwIjoyMDg1MjA5NDAxfQ.aGYfF5hbvU3CtKoLP7SOGtXsABXfrVh-Cf2zrVz7wfA",
        palette: [
          { hex: "#E2C04E", name: "明亮黄", enName: "Bright Yellow" },
          { hex: "#111111", name: "格纹墨黑", enName: "Ink Black" },
          { hex: "#F5F2EA", name: "校园米白", enName: "Campus Ivory" },
          { hex: "#B46A3C", name: "储物柜棕", enName: "Locker Brown" },
          { hex: "#C9A28B", name: "蜜桃肤", enName: "Peach Skin" }
        ],
        materials: ["格纹粗花呢或羊毛混纺", "针织开衫质感", "棉质打底", "弹力长袜", "皮革手袋配件"],
        tailoring: [
          "短款收腰外套制造上半身权力感",
          "高腰迷你裙把比例推到最前",
          "同纹成套让人物从人群里直接跳出来",
          "裙长落在危险又甜美的临界点",
          "线条利落且轻盈，带来可爱外表下的控制力"
        ],
        scriptSnippet:
          "在走廊里她一边打电话一边向前走，黄格纹像聚光灯一样把视线拉到她身上。周围的嘈杂退成背景，她的节奏像在给校园立规矩。",
        directorNote:
          "此前流行的颓废摇滚气质偏松垮和破洞感，这套造型用精致，明亮，秩序感把校园重新划分等级。设计思路是把高级时装周的剪裁搬进高中走廊，让每个转身都像在走秀。套装来源指向 Jean Paul Gaultier 的格纹语言，造型团队会对裙长反复校准，最终停在危险又甜美的位置，既挑衅又无辜。黄色在校园场景里最能瞬间抓住眼球，它让她获得女王需要的场域感。演法上要轻松，语气像随口指挥世界，步子稳定，眼神笃定，仿佛你天生就该站在画面中央。"
      },
      {
        title: "优等生红色变体",
        subtitle: "校服进化 · 番茄红背心 · 条纹衬衫叠穿 · 红色视觉闭环",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/Cher/3.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvQ2hlci8zLmpwZyIsImlhdCI6MTc2OTg5NDQ2MCwiZXhwIjoyMDg1MjU0NDYwfQ.-cuJozMC7Xcbi4FfvaHdZEPTl7tDVvzDgijp5EhyH2M",
        palette: [
          { hex: "#B5121B", name: "番茄红", enName: "Tomato Red" },
          { hex: "#7A0F1A", name: "红格纹", enName: "Red Tartan" },
          { hex: "#F7F3EA", name: "衬衫米白", enName: "Cream White" },
          { hex: "#A9B2B9", name: "细条纹灰", enName: "Pinstripe Gray" },
          { hex: "#111111", name: "袜靴黑", enName: "Sock Black" }
        ],
        materials: ["羊毛或针织背心料", "棉质细条纹衬衫", "羊毛或呢料格纹裙", "弹力针织长袜", "皮革或漆皮鞋面配件"],
        tailoring: [
          "背心是短款上移比例，直接把视觉重心抬高",
          "衬衫选长款并露出下摆与袖口，内长外短形成层次",
          "格纹迷你裙维持学院语境，同时让下半身更轻快",
          "黑色长袜收束腿部线条，给红色体系一个稳定落点",
          "红色发箍与红背心呼应，把上半身的红做成连续的视觉线"
        ],
        scriptSnippet:
          "她和人说话时侧身带笑，手里拎着水杯，语气像在讨论一件理所当然的事。红色先被看到，然后才轮到别人反应过来她讲的是什么。",
        directorNote:
          "这套搭配的核心是校服感的升级版本，用背心加衬衫的组合做出优等生的规整，但通过条纹衬衫替代纯白衬衫，让画面更有细节和呼吸感。红色在发箍，背心，格纹裙里反复出现，并且跨越针织，棉布，呢料三种质地，形成统一又不单调的红色闭环。短背心加高腰格纹裙把比例推得很明确，甜度高但不松散，长袜把整体压住，避免红色过于张扬。适合表达精致有秩序的自信，同时保留一点俏皮感。"
      },
      {
        title: "购物战利品的微笑",
        subtitle: "比佛利山甜心 · 奢牌日常化 · 轻松的优越感",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p1919582787.jpg?sa_cv=43669229c6f75b13cc3d89c0a80b9e6d&sa_ct=697dc280",
        palette: [
          { hex: "#0B0B0B", name: "羊绒黑", enName: "Cashmere Black" },
          { hex: "#FFFFFF", name: "领口白", enName: "Collar White" },
          { hex: "#BFC5C9", name: "菱格灰", enName: "Argyle Gray" },
          { hex: "#C6A066", name: "奢金棕", enName: "Luxury Tan" }
        ],
        materials: ["细针织羊毛或羊绒混纺", "挺括棉质衬衫", "菱格纹针织裙料", "纸质购物袋", "金属光泽皮革鞋面"],
        tailoring: [
          "外层针织开衫做成短西装轮廓，肩线干净",
          "白衬衫领口外翻，制造乖巧的学院语气",
          "菱格迷你裙把腿部比例推到最前",
          "膝下袜强化少女感与秩序感",
          "银色玛丽珍用反光点亮全身，精致里带一点炫耀"
        ],
        scriptSnippet:
          "她拎着一堆袋子从街边走过，表情像刚完成一件很重要的正事。对她来说这不叫乱花钱，这叫把生活整理到正确的样子，顺便让世界知道她今天心情很好。",
        directorNote:
          "她的购物从来不是失控，而是一种管理感，把品味和阶层穿成日常。镜头要让购物袋成为道具台词，品牌字样像路标一样一闪而过，重点放在她的步伐和那个带点得意的微笑。动作上肩膀放松，走得像在自家地盘巡视，抬下巴但不端着，让观众一眼读到她的底气来自选择权，来自她觉得一切都应该被摆放得体面。"
      },
      {
        title: "法式 preppy 的冷淡智感",
        subtitle: "贝雷帽点题 · 黑白条纹西装 · 翻领白衬衫 · 美丽废物配饰",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2906654321.jpg?sa_cv=0bdb568b6b7a86df828dd8fd5b6b757a&sa_ct=697dc5d2",
        palette: [
          { hex: "#0B0B0B", name: "贝雷黑", enName: "Beret Black" },
          { hex: "#2C2C2C", name: "条纹炭灰", enName: "Charcoal Stripe" },
          { hex: "#FFFFFF", name: "翻领白", enName: "Crisp White" },
          { hex: "#C9C2B8", name: "珍珠灰", enName: "Pearl Gray" },
          { hex: "#F2C7B6", name: "肤粉", enName: "Blush Skin" }
        ],
        materials: ["羊毛混纺条纹西装料", "挺括棉质白衬衫", "毛毡贝雷帽", "珍珠或金属小耳饰", "羽毛装饰笔"],
        tailoring: [
          "短款修身西装外套压在腰线上方，削弱条纹的老成感",
          "细条纹带来自然的理性和严谨气质，但不厚重",
          "白衬衫领口明显外翻，制造九十年代精致感与层次",
          "贝雷帽把学院风往法式方向拧一下，气质更偏智更冷",
          "羽毛笔属于轻浮的精致小道具，让严肃造型多一点玩味"
        ],
        scriptSnippet:
          "她坐在桌前，表情写着不耐烦但依旧很体面。黑白条纹把她的态度收得很利落，贝雷帽像句号一样把整套造型钉在一种聪明又挑剔的气质上。",
        directorNote:
          "这套属于法式学院风的变体，整体用黑白灰建立智力感和距离感。条纹西装天然带严谨气质，但通过短款剪裁和明显外翻的白衬衫领口，把严肃变得更轻更时髦。贝雷帽是视觉锚点，强化法式氛围并让脸部更集中。配饰的重点是羽毛笔这类精致但没必要的小物，它会让人物显得更讲究也更戏谑，属于美丽废物的代表。整体适合表达看起来很聪明又有点挑剔的状态，同时保留她一贯的精致掌控感。"
      },
      {
        title: "红格纹的偏智感",
        subtitle: "苏格兰格纹 · 私校制服感 · 复古学院甜酷",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2906654326.jpg?sa_cv=6205b4f05fc5e8234f4eb05e239664b2&sa_ct=697dc45b",
        palette: [
          { hex: "#7A0F1A", name: "酒红格纹", enName: "Burgundy Tartan" },
          { hex: "#0B0B0B", name: "贝雷黑", enName: "Beret Black" },
          { hex: "#2A1B1B", name: "深巧克力棕", enName: "Deep Cocoa" },
          { hex: "#F2E7D7", name: "奶油肤米", enName: "Cream Beige" },
          { hex: "#2F4A2C", name: "草地深绿", enName: "Deep Field Green" }
        ],
        materials: ["羊毛或呢料格纹面料", "呢帽或毛毡贝雷帽", "内搭针织或棉质上衣", "弹力高筒袜", "皮革包袋与金属扣饰"],
        tailoring: [
          "格纹外套偏直筒或微A字轮廓，长度压在大腿中上段，显腿长也显气场",
          "双排扣与翻领增强制服感，让造型更有权威与秩序",
          "成套格纹把识别度拉满，画面里一眼就知道她在掌控氛围",
          "贝雷帽把甜美往文化感方向推，制造一点偏智的“我很会”的感觉",
          "黑色高筒袜把下半身收紧，形成上松下紧的节奏，复古感更强"
        ],
        scriptSnippet:
          "她站在校园的热闹里喝着饮料，笑得很轻松。红格纹把她从人群里拎出来，贝雷帽让这份张扬看起来很有分寸，像在说我当然知道自己在做什么。",
        directorNote:
          "这套红格纹比黄色那套更成熟，视觉重量更大。格纹在西方语境里自带私立学校制服的联想，能快速建立阶层感和规则感。酒红与黑色的组合把甜度压低，让气质更厚一点，更像在用穿搭表达态度。贝雷帽是关键配件，它把造型从单纯的精致拉到带文化感的复古样本，同时也起到收拢整体轮廓的作用。整体适合用来表现她开始追求更有内容的形象，外放依旧在，但更讲究表达与分寸。"
      }
    ]
  },
  {
    id: "vivian_prettywoman",
    name: "薇薇安",
    movie: "漂亮女人",
    traits: ["外放", "机敏", "自尊", "渴望被尊重", "幽默", "不服输", "成长"],
    stylings: [
      {
        title: "白衬衫的松弛自信",
        subtitle: "90年代极简性感 · 生活化精致 · 领口与腰线的对话",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p780978782.jpg?sa_cv=e81e7bcd95a359174095d8623b24cec8&sa_ct=697e74e9",
        palette: [
          { hex: "#FFFFFF", name: "衬衫白", enName: "Crisp White" },
          { hex: "#1F5FBF", name: "宝石蓝", enName: "Gem Blue" },
          { hex: "#C79A7B", name: "暖肤色", enName: "Warm Skin" },
          { hex: "#7A4A33", name: "栗棕发", enName: "Chestnut Brown" },
          { hex: "#2B2B2B", name: "影调灰黑", enName: "Shadow Charcoal" }
        ],
        materials: ["挺括棉质衬衫", "麂皮或绒感短裙面料", "极简小耳饰金属", "轻薄底妆与自然唇色"],
        tailoring: [
          "衬衫选偏宽松的版型，肩线自然下落，制造不费力的松弛感",
          "下摆打结把腰线拉出来，用很简单的动作完成比例重塑",
          "领口开到锁骨附近，靠留白制造性感，不靠暴露堆叠",
          "袖口挽起让手臂线条更利落，也让整套更像日常而非造型",
          "短裙用高腰与迷你长度把腿部比例推到前面，上松下紧更有节奏"
        ],
        scriptSnippet:
          "她把白衬衫随手打了个结，袖子挽到手肘，坐在一旁等人，表情很放松。蓝色短裙把腿部线条衬得更干净，整个人看起来像是刚把生活重新整理了一遍。",
        directorNote:
          "这套的核心是用最基础的单品做出层次感和态度。上半身用宽松白衬衫制造呼吸感，下半身用高腰短裙给出明确比例，领口与打结位置共同决定性感的尺度。白与蓝的强对比让画面更清爽，挽袖和开领增加随意感，避免过度精致带来的距离感。它适合表达一种正在变得更自信的状态，外表简单，但每个细节都在服务于更利落的自我呈现。"
      },
      {
        title: "棕波点的优雅规训",
        subtitle: "红黑白体系外的复古变奏 · 轮廓感女人味 · 体面到发光",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2907664083.jpg?sa_cv=67def017caa3cd436829ba80b80c08a9&sa_ct=697e789a",
        palette: [
          { hex: "#5B3A2E", name: "可可棕", enName: "Cocoa Brown" },
          { hex: "#F7F2E8", name: "奶油白", enName: "Cream White" },
          { hex: "#C9B18A", name: "草帽米", enName: "Straw Beige" },
          { hex: "#2A2A2A", name: "皮带深棕", enName: "Deep Leather" },
          { hex: "#B07A5A", name: "暖肤橘棕", enName: "Warm Tan" }
        ],
        materials: ["挺括棉质或混纺连衣裙料", "皮革腰带", "草编或硬挺帽檐材质", "珍珠耳饰", "哑光质感的轻薄底妆"],
        tailoring: [
          "无袖连衣裙强调肩臂线条，干净利落",
          "收腰设计配合宽腰带把腰线钉死，塑造沙漏比例",
          "中长裙摆带分量感，走动时有摇摆的优雅节奏",
          "波点图案自带复古滤镜，同时让大面积棕色不沉闷",
          "平顶宽檐帽把造型抬到更正式的场合语境，整体更贵气"
        ],
        scriptSnippet:
          "她戴着宽檐帽站在阳光里，棕色波点裙把整个人包得很体面。腰带勒出明确的线条，波点却让气质不显刻意，像是她终于找到了属于自己的优雅方式。",
        directorNote:
          "这套的重点是用复古语言把气质变得更端正。棕色属于更成熟的基调，靠白色波点提亮，避免显老。腰带是关键结构件，它让连衣裙从“好看”变成“有态度”，把身体比例整理得很清晰。帽子和珍珠耳饰把场景从日常拉到正式，强调一种被尊重的感觉。整体表达的是她在学习用更体面的符号进入新的世界，风格仍然温柔，但已经有了边界感和分寸感。"
      },
      {
        title: "红裙晚宴的高光时刻",
        subtitle: "红白经典配色 · 复古好莱坞曲线 · 仪式感女人味",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/pretty%20woman/4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvcHJldHR5IHdvbWFuLzQucG5nIiwiaWF0IjoxNzY5ODk2MjAwLCJleHAiOjIwODUyNTYyMDB9.cVvUvG6n3x6x3LsZJWV_ibznHPqdKRiDiODdwa9wVII",
        palette: [
          { hex: "#B0121B", name: "正红", enName: "Classic Red" },
          { hex: "#F5EFE6", name: "手套白", enName: "Glove White" },
          { hex: "#D7A36B", name: "暖金光", enName: "Warm Gold" },
          { hex: "#7A3E2A", name: "栗棕发", enName: "Chestnut" },
          { hex: "#2A1F1C", name: "影调棕黑", enName: "Deep Shadow" }
        ],
        materials: ["缎面或丝质礼服面料", "挺括内衬与塑形胸衣结构", "真丝或缎面长手套", "细金属耳饰或简洁珠宝", "柔雾底妆与暖调唇色"],
        tailoring: [
          "露肩设计把锁骨与肩颈线条放到最显眼的位置，气质立刻变得更正式",
          "心形或微V领口把上半身比例收得更集中，视觉重心更优雅",
          "贴身胸腰剪裁强化曲线，腰部的收束让整体更有力量感",
          "裙身褶皱与垂坠把贴身感软化，既性感又不紧绷",
          "红裙配白手套形成强对比，复古电影感很强，也让仪式感更完整"
        ],
        scriptSnippet:
          "她低头看着裙摆的垂坠，笑得有点不敢相信。红色把她整个人点亮，白手套把动作变得更克制更体面，像是她第一次用一种更笃定的方式进入一个新场合。",
        directorNote:
          "这套造型的核心是用红色建立存在感，用白色手套把热烈收进礼仪里。正红天然抢眼，但靠露肩领口与贴身结构把性感控制在高级范围内，避免显得用力。褶皱和垂坠负责增加柔软度，让曲线更流动。整体观感是复古，精致，外放，同时带着被认真对待的体面感，很适合表现人物在身份转换中的自信上升与边界感建立。"
      },
      {
        title: "白裙与黑帽的上流入场",
        subtitle: "红黑白经典体系 · 复古名媛轮廓 · 低调但极强的权威感",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2874794649.jpg?sa_cv=c1b633eb79749fe6f79febde3a38df4c&sa_ct=697e78bb",
        palette: [
          { hex: "#F6F1E7", name: "象牙白", enName: "Ivory" },
          { hex: "#0B0B0B", name: "帽檐黑", enName: "Hat Black" },
          { hex: "#1E1E1E", name: "手拿包黑", enName: "Clutch Black" },
          { hex: "#D6B36A", name: "金扣金", enName: "Button Gold" },
          { hex: "#D88A78", name: "珊瑚唇", enName: "Coral Lip" }
        ],
        materials: ["挺括的棉质或丝羊毛混纺裙料", "硬挺宽檐帽材质", "真丝或缎面手套", "漆皮或皮革手拿包", "金属纽扣与珍珠耳饰"],
        tailoring: [
          "连衣裙是利落直筒或微收腰的正式轮廓，线条干净",
          "前中排扣把造型做成纵向中轴，视觉更端正更有秩序",
          "七分袖长度露出手套的褶皱层次，让细节更高级",
          "宽檐帽用大面积黑色框住脸部，气场立刻被放大",
          "黑白对比加金色纽扣点题，经典感很强，几乎不会过时"
        ],
        scriptSnippet:
          "她穿着象牙白的连衣裙走在阳光里，黑色宽檐帽把视线牢牢聚在脸上。纽扣一颗颗排下去像在宣告规矩，白手套和黑手包让每个动作都显得很克制也很贵气。",
        directorNote:
          "这套是典型的上流社交场合制服思路，用白色做干净底色，用黑色配件建立权威边界，再用金色纽扣补一点贵气。连衣裙的关键是面料挺度和线条的克制，靠剪裁而不是装饰取胜。宽檐帽是最强识别点，它既制造复古氛围，也能把人物从街景里直接框出来。手套和手拿包让动作更优雅，同时把“体面”具象化。整体表达的是进入新阶层时的自我整理，外表非常安静，但存在感非常强。"
      }
    ]
  },
  {
    id: "sally_whenharrymetsally",
    name: "莎莉",
    movie: "当哈利遇到莎莉",
    traits: ["理性克制", "高标准", "细节控", "有边界感", "嘴硬心软", "慢热", "需要安全感", "成熟后的松动与坦诚"],
    stylings: [
      {
        title: "蝴蝶结领的自持感",
        subtitle: "理性优等生 · 格纹西装 · 红酒色领结点睛 · 干净的边界感",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/harry/5.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvaGFycnkvNS5wbmciLCJpYXQiOjE3Njk4OTY2MjksImV4cCI6MjA4NTI1NjYyOX0.nr3F7qXKoEpO7ezis2k34o8aW4bjRVLQGNVckEwyjdg",
        palette: [
          { hex: "#3B3B3B", name: "格纹炭灰", enName: "Charcoal Plaid" },
          { hex: "#FFFFFF", name: "衬衫白", enName: "Shirt White" },
          { hex: "#6B1E2C", name: "酒红蝴蝶结", enName: "Burgundy Bow" },
          { hex: "#C9BFAF", name: "发色浅金", enName: "Soft Blonde" },
          { hex: "#7D8A96", name: "通勤灰蓝", enName: "Commute Blue Gray" }
        ],
        materials: ["羊毛混纺格纹西装料", "挺括棉质白衬衫", "缎面或真丝蝴蝶结领带", "皮革或仿皮肩背包", "小体积金属耳饰"],
        tailoring: [
          "西装外套肩线利落偏方，强调可靠与秩序感",
          "格纹密度细，视觉更稳，不会抢表情",
          "白衬衫领口外翻，增加层次也让脸部更亮",
          "酒红蝴蝶结在胸口形成焦点，把严谨里的一点情绪露出来",
          "肩背包走实用通勤路线，整体更像随时可进入工作或学习状态"
        ],
        scriptSnippet:
          "她在人群里走得不快，表情带一点疲惫和不耐烦。格纹把她包得很得体，蝴蝶结又把那点情绪拎出来，像是她已经把生活整理好了，只是不想被打扰。",
        directorNote:
          "这套很贴合莎莉的性格关键词，理性，高标准，边界感强。灰色格纹负责建立可信度和距离感，白衬衫负责清爽与干净，酒红蝴蝶结负责把人物从通勤感里拉出一点个人风格，让她看起来有要求也有脾气。整体轮廓端正，细节集中在领口区域，表达的是把自己整理得很体面，同时对周围保持审慎的观察与挑剔。"
      },
      {
        title: "灰西装与高腰裤的独立感",
        subtitle: "理性通勤风 · 中性剪裁 · 花纹内搭柔化 · 慢热但不示弱",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/harry/6.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvaGFycnkvNi5wbmciLCJpYXQiOjE3Njk4OTY5NjksImV4cCI6MjA4NTI1Njk2OX0.ujfoBPqI8Yz1Jny52lCscj-3T_VdnBeV78tNLPWWNqM",
        palette: [
          { hex: "#9A9A9A", name: "羊毛灰", enName: "Wool Gray" },
          { hex: "#2B2B2B", name: "深黑", enName: "Deep Black" },
          { hex: "#4A4F43", name: "橄榄灰绿", enName: "Olive Gray" },
          { hex: "#A35A4A", name: "花点砖红", enName: "Brick Red Dots" },
          { hex: "#0B0B0B", name: "皮革黑", enName: "Leather Black" }
        ],
        materials: ["羊毛或呢料西装外套", "针织或雪纺碎花上衣", "垂坠羊毛或混纺长裤", "毛毡礼帽", "皮革手套与皮鞋", "皮革大容量单肩包"],
        tailoring: [
          "西装外套偏宽松肩线但整体收得利落，气质更成熟",
          "高腰长裤把腰线抬高，腿部比例更长，步伐更有力量",
          "裤腿偏直筒垂坠，不强调曲线，强调独立与行动力",
          "内搭的碎花点缀在黑底上，负责把严肃感变得更有人情味",
          "帽子和手套形成完整的复古通勤配件组，既实用也更有态度"
        ],
        scriptSnippet:
          "她在秋天的落叶里走得很稳，灰色西装把她的边界感撑起来。花纹内搭像一点没说出口的情绪，藏在黑底里，不吵但一直在。",
        directorNote:
          "这套搭配属于莎莉的成熟通勤版本。灰色西装外套建立专业感和距离感，橄榄灰绿的高腰长裤让造型更耐看也更有生活气。全身的剪裁偏中性，强调行动力和自持，符合她理性克制的底色。黑色皮革配件把造型压住，避免松散。内搭的黑底碎花是关键，它把人物从过度冷硬里拉回一点温柔，让整体看起来既有标准也有情绪，但情绪被很好地管理着。"
      },
      {
        title: "绿黑礼服的克制艳光",
        subtitle: "复古派对感 · 结构化肩线 · 甜美外壳下的边界",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/harry/7.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvaGFycnkvNy5wbmciLCJpYXQiOjE3Njk4OTcyMDAsImV4cCI6MjA4NTI1NzIwMH0.jkc_PqaaDC0xyul0Y9ce4QSfeDL9FDLQQ0E1w9YI2N0",
        palette: [
          { hex: "#0E3B2E", name: "祖母绿", enName: "Emerald Green" },
          { hex: "#0B0B0B", name: "礼服黑", enName: "Dress Black" },
          { hex: "#D6B36A", name: "项链金", enName: "Chain Gold" },
          { hex: "#E7B2A0", name: "玫瑰唇", enName: "Rose Lip" },
          { hex: "#F2E7DD", name: "暖肤米", enName: "Warm Beige" }
        ],
        materials: ["缎面或塔夫绸礼服面料", "挺括内衬与肩部垫片结构", "细金链项链", "小体积金属耳饰", "柔雾底妆与微光唇色"],
        tailoring: [
          "方圆之间的领口线条把锁骨位置收得很优雅，性感但不放纵",
          "泡泡袖与硬挺肩线制造存在感，像把气场直接架起来",
          "上半身结构偏收紧，强调端正与克制，符合她的自持感",
          "绿黑拼色把礼服从纯黑里拉出层次，复古但不沉闷",
          "金链项链只做轻点缀，不抢戏，反而让整体更显得有分寸"
        ],
        scriptSnippet:
          "她站得很直，笑容不大，但很稳。绿黑的光泽把她衬得更成熟，肩线撑起一种礼貌的距离感，好像她已经准备好进入热闹，但依然保留选择退出的权利。",
        directorNote:
          "这套礼服是莎莉的社交版本，重点不是张扬，而是把存在感变得更规整。硬挺肩线和泡泡袖提供气场，领口与收腰负责控制尺度，让性感看起来很有规矩。祖母绿在黑色里出现，会让气质更高级也更有记忆点，同时不破坏她一贯的克制。配饰选择极简金链，表达的不是炫耀而是完成度。整体适合表现她开始允许自己更柔软更亮，但仍然保持边界与自尊。"
      },
      {
        title: "橄榄绿廓形风衣的气场",
        subtitle: "90年代大衣权力感 · 手套与小包的克制精致 · 把情绪藏进轮廓里",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/harry/8.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvaGFycnkvOC5wbmciLCJpYXQiOjE3Njk4OTczMDcsImV4cCI6MjA4NTI1NzMwN30.fvGC5lF-jL4kwMaxOkgQ6pW6dDXjNlKaDhxgKNmQClg",
        palette: [
          { hex: "#3E3A2F", name: "橄榄军绿", enName: "Olive Drab" },
          { hex: "#6B4A2E", name: "皮手套棕", enName: "Leather Brown" },
          { hex: "#1F1F1F", name: "包袋深黑", enName: "Bag Black" },
          { hex: "#C7A08A", name: "暖肤粉", enName: "Warm Blush" },
          { hex: "#6E6A64", name: "冷街景灰", enName: "City Gray" }
        ],
        materials: ["厚实羊毛呢或混纺大衣料", "皮革手套", "皮革小手提包", "低调金属扣件", "柔雾底妆与低饱和唇色"],
        tailoring: [
          "大衣是明显的廓形与落肩，靠体积制造权威感",
          "宽翻领把上半身框住，脸部更集中，也更显严肃",
          "中长长度覆盖身形，气质更像把自己包起来的防御",
          "手套让动作更克制，强化“我很体面但我有距离”的讯号",
          "小包比例很小，强调精致与控制，和大廓形形成反差"
        ],
        scriptSnippet:
          "她站在街边没有多余动作，肩膀被大衣撑得很稳。橄榄绿把情绪压低，皮手套把手势收住，像是在告诉别人她可以很柔软，但今天先不。",
        directorNote:
          "这套造型是莎莉在低谷或防御状态里的典型表达。大廓形大衣用体积建立安全感和边界感，橄榄军绿比黑色更有情绪温度，但依然克制。宽翻领和中长长度把身形包裹起来，强调不想被轻易读懂。皮手套和小包是控制感的细节，它们让整体不至于狼狈，反而显得更有分寸。整套传达的是外表很强，内心很敏感的矛盾感，很符合她慢热且需要安全感的底色。"
      }
    ]
  },
  {
    id: "rebecca_confessionsofashopaholic",
    name: "丽贝卡",
    movie: "一个购物狂的自白",
    traits: ["冲动消费", "外向热情", "情绪驱动", "自我安慰型", "爱幻想", "渴望被认可", "嘴甜会社交", "逃避压力", "时尚敏感", "在混乱中学会自控"],
    stylings: [
      {
        title: "黄大衣购物战利品",
        subtitle: "高饱和多巴胺 · 奢牌道具化 · 甜蜜冲动与焦虑并存",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2539559405.jpg?sa_cv=7757c40611913107d2659d77737375b8&sa_ct=697e7e11",
        palette: [
          { hex: "#E5C64A", name: "柠檬黄", enName: "Lemon Yellow" },
          { hex: "#F3D24B", name: "手套黄", enName: "Glove Yellow" },
          { hex: "#111111", name: "斑马黑", enName: "Zebra Black" },
          { hex: "#F6F1E7", name: "奶油白", enName: "Cream White" },
          { hex: "#0E6B5A", name: "祖母绿包", enName: "Emerald Clutch" }
        ],
        materials: ["羊毛呢或混纺大衣料", "皮革手套", "真丝或缎面印花围巾", "漆皮或皮革手拿包", "纸质条纹购物袋与礼盒", "金属质感项链耳饰"],
        tailoring: [
          "大衣用宽松包裹感制造戏剧效果，走到哪都像自带聚光",
          "高饱和黄色把情绪拉到最高点，传递兴奋与即时满足",
          "围巾的强对比图案把视线锁在脸部与上半身，制造“很会穿”的错觉",
          "同色系手套强化精致感，也让动作更夸张更像在展示战利品",
          "祖母绿手包作为跳色，提升层次感，让整体更像刻意的搭配而非随手一堆"
        ],
        scriptSnippet:
          "她抱着成堆条纹购物袋站在柜台边笑得很亮，像刚完成一场重要胜利。对外是“我当然配得上”，对内是“先别想账单”，于是把快乐穿成一整身的黄色。",
        directorNote:
          "这套造型的核心是用高饱和色把冲动合理化。黄色在镜头里极抢眼，天然对应兴奋与奖励机制，特别贴合女主情绪驱动的消费模式。图案围巾和条纹购物袋形成密集的视觉信息，传达一种甜蜜的混乱感，很像她的生活状态。手套和手包负责把失控拉回“精致”，让观众相信她不是随便乱买，她是在用时尚给自己撑场面。复刻时抓三个点就够了：一件够亮的黄大衣，一件强对比的印花围巾，一组能被镜头读到的配件道具，整体就会立刻有那种又可爱又有点心虚的购物狂气质。"
      },
      {
        title: "紫缎短羽绒与玫红连衣裙的多巴胺冲锋",
        subtitle: "高饱和混搭 · 情绪上头的自信 · 把奢牌当护身符",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/libeca/p2539561051.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvbGliZWNhL3AyNTM5NTYxMDUxLmpwZyIsImlhdCI6MTc2OTg5Nzg0MCwiZXhwIjoyMDg1MjU3ODQwfQ.QuIqmIFdhoXvMnTB0PB-XDRuPjtplBEe-RkhUDfICQc",
        palette: [
          { hex: "#E81E63", name: "玫红", enName: "Hot Pink" },
          { hex: "#7A2A8A", name: "紫缎紫", enName: "Satin Purple" },
          { hex: "#F07A2B", name: "橘手套", enName: "Tangerine" },
          { hex: "#F2EFE8", name: "奶油白", enName: "Cream White" },
          { hex: "#D4AF37", name: "链条金", enName: "Chain Gold" }
        ],
        materials: ["缎面或亮面尼龙短羽绒", "针织或提花连衣裙料", "麂皮或绒面手套", "皮革拼帆布大号旅行袋", "仿皮草腿套或毛绒饰边", "金属链条装饰与金扣腰带"],
        tailoring: [
          "短款外套把上半身收紧，制造冲刺感和轻盈感",
          "玫红连衣裙用收腰与A字摆把甜感推满，走路自带弹性",
          "橘色手套把手部动作变成表演道具，情绪更外放",
          "毛绒腿部细节把造型从时装拉向童话，强化她的幻想倾向",
          "大号品牌包占据画面中心，像把安全感拎在手上"
        ],
        scriptSnippet:
          "她在街上走得很快，像怕快乐来不及发生。紫色亮面外套反光到发光，玫红裙摆一路甩出节奏，橘色手套和大号购物袋把存在感抬到最高，整个人像一颗移动的奖励按钮。",
        directorNote:
          "这套穿搭的重点是情绪驱动的高饱和叠加。玫红与紫缎的撞色很直接，传递兴奋和上头感，特别贴合女主用购物对抗压力的习惯。短外套和收腰裙形成上紧下松的比例，既显身材也显“马上要去下一站”的行动力。橘色手套是点睛，它让肢体更夸张更有戏，像在向世界展示自己今天的胜利。毛绒与链条把甜和奢同时加码，形成天真里带点张扬的消费主义幻想。整体观感很强烈，很可爱，也会让人隐约感觉到她把自信押在物件上的那一点点不安。"
      },
      {
        title: "黑白粗花与紫手套的焦虑时髦",
        subtitle: "图案外套当盔甲 · 亮粉上衣硬撑甜美 · 读账单也要精致到发光",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2539559299.jpg?sa_cv=651123aa49aa845088784eb3613917e7&sa_ct=697e7fe5",
        palette: [
          { hex: "#111111", name: "棋盘黑", enName: "Checker Black" },
          { hex: "#F5F2EA", name: "奶油白", enName: "Cream White" },
          { hex: "#E55AAE", name: "糖果粉", enName: "Candy Pink" },
          { hex: "#6B2E83", name: "手套紫", enName: "Grape Purple" },
          { hex: "#C9A06A", name: "大扣金", enName: "Buckle Gold" }
        ],
        materials: ["粗花呢或圈圈纱外套料", "真丝感或缎面上衣料", "皮革手套", "漆皮或压纹皮革手拿包", "金属大扣腰带", "亮片或宝石感项链装饰"],
        tailoring: [
          "外套用夸张纹理和大面积黑白对比制造存在感，像把情绪包进外壳里",
          "内搭亮粉色把气氛拉回甜美，形成外硬内软的反差",
          "领口的大蝴蝶结和闪亮项链把视线固定在脸部附近，显得更“有精神”",
          "宽腰带加巨型金扣把腰线钉住，强化控制感，也让整套更像精心搭配",
          "紫色手套和紫色包做同色呼应，细节很张扬，符合她用配件给自己打气的习惯"
        ],
        scriptSnippet:
          "她站在路边读着一张纸，眉头先紧了一秒又马上把表情收回去。手套很亮，外套很贵气，像在对自己说今天也要体面，哪怕这张纸写的内容让人心里发凉。",
        directorNote:
          "这套好看在用强烈对比把焦虑变成风格。黑白粗花外套像盔甲，给她一个看起来很稳的外壳，粉色内搭继续维持她一贯的甜感和戏剧感。腰带的大金扣是关键，它把散乱的层次重新收束，视觉上更利落，也更像她想把生活重新掌控的心理动作。紫色手套和包属于高调小心机，颜色不低调，但面积小，所以既抢眼又不至于俗，特别贴合她在压力下更想用“精致感”证明自己没崩的状态。想复刻的话抓三点就够了，一件黑白纹理外套，一个亮色内搭，和一组同色系手套或包，立刻有那种强装镇定的时髦感。"
      },
      {
        title: "粉裙与橘毛的冲动宣言",
        subtitle: "甜度过载的 Mix & Match · 皮草感短外套放大存在感 · 用金属腰封把失控收回一点点",
        image: "https://mzignrzkgmjblvauahqu.supabase.co/storage/v1/object/sign/cinematic/libeca/9.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWFlN2VmMy0xOTIzLTRkMzMtOGMyMi0wNzEwYmRhMTliMDkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjaW5lbWF0aWMvbGliZWNhLzkucG5nIiwiaWF0IjoxNzY5ODk4MjYyLCJleHAiOjIwODUyNTgyNjJ9.6rPZZUQNFcL3N7whZVGE-9_MggQchlWPaadDTACP1MA",
        palette: [
          { hex: "#D85A8B", name: "莓果粉", enName: "Berry Pink" },
          { hex: "#D07A2D", name: "焦糖橘", enName: "Caramel Orange" },
          { hex: "#C9A06A", name: "金扣金", enName: "Buckle Gold" },
          { hex: "#C43D3D", name: "口红红", enName: "Lip Red" },
          { hex: "#111111", name: "漆皮黑", enName: "Patent Black" }
        ],
        materials: ["弹力针织或羊毛混纺连衣裙料", "仿皮草或圈圈绒短外套", "金属装饰腰封", "皮革红色手袋", "金属光泽高跟鞋", "亮泽唇妆与发丝卷度造型"],
        tailoring: [
          "粉色连衣裙用贴身直筒把身形变成一条干净的主线，甜感很直给",
          "橘色短外套用夸张绒感堆体积，把上半身的存在感立刻抬高，像情绪外放的外壳",
          "金属蝴蝶结腰封把腰线锁住，视觉上把“可爱”变成“有主张”，也让整体更像精心搭配",
          "红色手袋是高饱和点睛，带一点炫耀和胜利感，符合她买到心头好时的兴奋",
          "金色高跟鞋把全身拉亮，和腰封形成金属呼应，让造型从甜变成闪耀的购物战袍"
        ],
        scriptSnippet:
          "她站在店里听销售说话，眼神已经飘到下一件。粉色很乖，橘毛很吵，金色腰封又硬把气场提起来，像在心里给自己盖章：我今天一定要把快乐买到手。",
        directorNote:
          "这套很贴合丽贝卡那种情绪驱动的消费气质，颜色和材质都在抢镜，组合起来会有“有点多但又停不下来”的戏剧感。粉色负责甜和无辜，橘色短外套负责夸张和冲动，腰封负责把散乱的层次收束成一个明确的中心点。红包和金鞋属于奖励机制式的细节，强化她对“闪亮”和“被看到”的渴望。想复刻的话重点抓三样：一个饱和粉的贴身裙，一个有体积的短外套，再加一个强金属腰带或大扣件，立刻就有那种把欲望穿在身上的效果。"
      },
    ]
  },
  {
    id: "andy_thedevilwearsprada",
    name: "安迪",
    movie: "穿Prada的女王",
    traits: ["理想主义", "自尊心强", "适应力高", "学习型人格", "外柔内刚", "对规则逐渐敏感", "在压力中成长", "价值观挣扎", "职业化觉醒", "逐步建立自我边界"],
    stylings: [
      {
        title: "白色极简外壳里的职业觉醒",
        subtitle: "去装饰化的权威感 · 中性色建立信任 · 把野心收进线条里",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p457124410.jpg?sa_cv=a51372cedcb21ccbc0c5433e38dd14c9&sa_ct=697e8195",
        palette: [
          { hex: "#F2EFEA", name: "象牙白", enName: "Ivory White" },
          { hex: "#B8B8B8", name: "羊毛灰", enName: "Wool Gray" },
          { hex: "#8E8E8E", name: "金属银", enName: "Soft Silver" },
          { hex: "#2B2B2B", name: "城市黑", enName: "Urban Black" },
          { hex: "#D6CFC7", name: "冷肤裸色", enName: "Cool Nude" }
        ],
        materials: ["高密度羊毛或羊绒混纺大衣料", "细腻皮革手套", "金属链条肩带包", "结构感帽饰面料", "低饱和妆容与自然直发"],
        tailoring: [
          "白色大衣是极简直线剪裁，用干净轮廓替代任何装饰性细节",
          "腰带只起到收束作用，不强调曲线，而是让比例更理性",
          "立领设计把身体往上提，制造一种冷静且专业的姿态",
          "帽子压低视线，让表情更难被读懂，强化职场防御感",
          "整体没有高饱和色彩，靠材质和剪裁说话，明显是职业化转折点"
        ],
        scriptSnippet:
          "她站在街口没有多余表情，白色把她从人群里抽离出来。没有张扬，也不需要解释，看起来像是终于知道自己该站在哪里。",
        directorNote:
          "这是安迪完成风格转向的重要阶段。颜色被刻意压到最低，所有注意力都交给剪裁和姿态。白色不是柔软，而是一种冷静的中性力量，象征她开始用专业而不是讨好来建立位置。帽子和手套让她看起来更有边界感，也更像这个行业的一部分。整套造型不讨喜，但非常有效，正是她从被动适应走向主动选择的视觉标志。"
      },
      {
        title: "祖母绿大衣里的自我站位",
        subtitle: "高饱和色的冷处理 · 轮廓优先于讨好 · 把野心穿成风景",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p1208989459.jpg?sa_cv=1b8c33ea1bf30168115d6de02fae475b&sa_ct=697e8379",
        palette: [
          { hex: "#1F7A4F", name: "祖母绿", enName: "Emerald Green" },
          { hex: "#FFFFFF", name: "手套白", enName: "Glove White" },
          { hex: "#2A2A2A", name: "墨镜黑", enName: "Sunglasses Black" },
          { hex: "#B89B5E", name: "金属扣金", enName: "Muted Gold" },
          { hex: "#C8A36A", name: "裸感高跟金", enName: "Nude Gold" }
        ],
        materials: ["高密度羊毛或羊绒大衣料", "光滑皮革手套", "结构感皮革高跟鞋", "硬挺内衬与金属纽扣", "低饱和妆容与顺直发型"],
        tailoring: [
          "双排扣大衣用明确的中轴线建立秩序感，视觉上非常“站得住”",
          "A字微扩的下摆在走动时形成流动，但整体依然受控",
          "高饱和祖母绿并不甜，而是偏冷，传达一种不需要解释的自信",
          "白色手套是关键反差细节，让造型更像职业制服而不是时装秀",
          "金色高跟鞋弱化攻击性，只保留成熟与完成度"
        ],
        scriptSnippet:
          "她走在街上没有回头。绿色很亮，却一点不吵，像是终于找到适合自己的位置，不再需要躲在任何人身后。",
        directorNote:
          "这套是安迪真正完成身份切换的标志性造型。颜色第一次如此鲜明，但剪裁和搭配依然极度克制，说明她已经学会如何驾驭而不是被时尚吞没。祖母绿是权力色，但比黑色更有生命力，也更容易被记住。白手套和墨镜建立清晰边界，让她看起来不再是来学习的新人，而是这个系统里可以被尊重的一员。整套造型表达的是一种安静却明确的野心：我在这里，而且我知道我在做什么。"
      },
      {
        title: "黑白香奈儿里的专业觉醒",
        subtitle: "制服化优雅 · 去情绪化表达 · 用细节完成身份跃迁",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p2904836768.jpg?sa_cv=a9d231ccccd38b3cf8a7989e4e11a56f&sa_ct=697e8308",
        palette: [
          { hex: "#0F0F0F", name: "制服黑", enName: "Uniform Black" },
          { hex: "#FFFFFF", name: "衬衫白", enName: "Shirt White" },
          { hex: "#E8E2D6", name: "珍珠米白", enName: "Pearl Ivory" },
          { hex: "#8A8A8A", name: "粗花呢灰", enName: "Tweed Gray" },
          { hex: "#C9A06A", name: "低调金", enName: "Soft Gold" }
        ],
        materials: ["挺括针织或精纺羊毛上衣", "纯棉白衬衫", "珍珠与金属混合长项链", "粗花呢帽料", "低光泽妆感与干净发丝"],
        tailoring: [
          "黑色上衣轮廓极简，像一件职业制服，把注意力从身体移开",
          "白衬衫翻领形成清晰边界，让造型更理性也更可信",
          "多层珍珠项链增加重量感，是身份而不是装饰",
          "粗花呢帽子压低表情存在感，让人先看到态度再看到情绪",
          "整体剪裁不强调曲线，而强调秩序和完成度"
        ],
        scriptSnippet:
          "她坐在那里没有多余表情。黑与白把一切情绪压平，只剩下该被认真对待的部分。",
        directorNote:
          "这是安迪真正进入体系内部的关键造型。她不再用颜色证明自己，而是用黑白和材质说话。白衬衫和黑上衣构成最标准的职业结构，珍珠项链并不是甜美元素，而是一种行业标识，象征她已经理解这个世界的语言。帽子和简化的妆容刻意弱化个人情绪，让专业先于性格出现。整套造型传达的是一种冷静的成熟感，她不需要被喜欢，她需要被信任。"
      },
      {
        title: "黑色Chanel剪裁下的职场加冕",
        subtitle: "制服化精英感 · 用品牌语言完成身份跃迁 · 走路本身就是宣言",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p614765715.jpg?sa_cv=2f8da575ad5586a44019c3d0a61e8844&sa_ct=697e83c0",
        palette: [
          { hex: "#0A0A0A", name: "编辑黑", enName: "Editor Black" },
          { hex: "#C8A25A", name: "古董金", enName: "Antique Gold" },
          { hex: "#5B4A3A", name: "粗花呢棕", enName: "Tweed Brown" },
          { hex: "#3E6F4E", name: "个人绿", enName: "Personal Green" },
          { hex: "#F2EFEA", name: "办公室暖白", enName: "Office Ivory" }
        ],
        materials: [
          "羊毛绉纱或粗花呢Chanel西装外套",
          "金属纽扣与徽章装饰",
          "皮革过膝长靴",
          "多层金属项链",
          "皮革手套与小号手袋"
        ],
        tailoring: [
          "西装外套是明确的收腰与硬肩结构，把身体塑造成标准的权力轮廓",
          "双排扣与金属滚边强化制服属性，成为进入体系内部的视觉通行证",
          "短裙或内搭下摆刚好露出，让比例集中在外套与腿部线条",
          "过膝长靴把腿拉成连续直线，走路节奏自带压迫感",
          "小尺寸绿色手袋保留个人性格，但被整体黑色完全框住"
        ],
        scriptSnippet: "她穿过玻璃门时已经不需要解释自己。西装先一步抵达，靴子在地面敲出节奏，所有视线自然让路。",
        directorNote: "这是安迪完成身份转译后的关键造型。Chanel西装不只是好看，它是一种行业内部的语言，告诉所有人她已经读懂规则并开始使用规则。黑色负责权威，金色负责等级，粗花呢是历史与传承的隐喻。过膝靴让身体在移动中持续输出力量感，而那只小小的绿色包是她仍然保留的自我线索，但被严格控制在安全范围内。这一身不再讨论喜不喜欢，它只负责确认位置。"
      },
      {
        title: "黑色羊羔毛大衣下的过渡期自我",
        subtitle: "收敛中的实验感 · 仍在学习规则的途中 · 用低调完成一次自我校准",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p614766002.jpg?sa_cv=d960e135e949ad6be287adfd8d111097&sa_ct=697e8431",
        palette: [
          { hex: "#0F0F10", name: "编辑室黑", enName: "Editorial Black" },
          { hex: "#7A4A2E", name: "铁锈棕", enName: "Rust Brown" },
          { hex: "#2E2A28", name: "深影灰", enName: "Shadow Gray" },
          { hex: "#5C3A2E", name: "皮靴棕", enName: "Leather Brown" },
          { hex: "#C9C2B8", name: "城市雾白", enName: "Urban Ivory" }
        ],
        materials: [
          "蒙古羊羔毛或粗纺羊毛大衣",
          "天鹅绒或哑光质感短裙",
          "皮革高筒靴",
          "针织帽与蕾丝或网眼连裤袜",
          "柔雾妆感与低饱和唇色"
        ],
        tailoring: [
          "大衣是干净直筒轮廓，没有明显收腰，强调理性与功能性",
          "整体黑色压低存在感，更像是在融入环境而不是主导视线",
          "高筒皮靴和短裙形成纵向对比，让造型仍然保留时尚张力",
          "针织帽引入一点生活气息，削弱过度精英感",
          "包袋与配件偏向实用，说明她此刻更关注效率而非表达"
        ],
        scriptSnippet: "她一边走一边看手机，步伐不再犹豫，却还没有完全笃定。黑色大衣很安静，像是在替她挡住外界的噪音。",
        directorNote: "这是安迪处在身份过渡期的重要造型。她已经不再是最初的格格不入，但也尚未完全进入权力核心。黑色羊羔毛大衣选择了质感而非夸张，说明她开始理解什么叫对的衣服，但还没有用衣服说狠话。针织帽和手机的出现，让她仍然显得真实而有生活重量。整体表达的是一种正在学习如何平衡自我与体系的状态，外表已经专业，内心仍在调整。这一身不是高光，却非常关键。"
      },
      {
        title: "皮革与牛仔构成的自我站稳时刻",
        subtitle: "去装饰化的职业日常 · 把力量收回身体本身 · 不靠品牌也成立的成熟感",
        image: "https://nenya.doubanio.com/view/photo/xl/public/p614766229.jpg?sa_cv=49410ef28108a0805e8472d1a916c6a7&sa_ct=697e86fb",
        palette: [
          { hex: "#4A2F1E", name: "皮革棕", enName: "Leather Brown" },
          { hex: "#0F0F10", name: "理性黑", enName: "Rational Black" },
          { hex: "#1E2A33", name: "深靛牛仔", enName: "Dark Denim" },
          { hex: "#6B4A3A", name: "麂皮靴棕", enName: "Suede Brown" },
          { hex: "#E6E1DA", name: "冷日光灰白", enName: "Daylight Ivory" }
        ],
        materials: [
          "柔韧但有厚度的皮革夹克",
          "哑光针织高领上衣",
          "硬挺深色牛仔布",
          "麂皮高筒靴",
          "实用型皮革通勤包与金属吊坠项链"
        ],
        tailoring: [
          "皮革夹克是贴身但不紧的标准比例，强调肩线和躯干稳定性",
          "高领上衣把颈部完全收住，情绪被压低，语气更冷静",
          "深色牛仔裤替代裙装，传达不再需要展示感的职业自信",
          "高筒靴让腿部线条向下延伸，行走时更有重量感",
          "整体没有明显夸张点，所有单品都在为行动服务"
        ],
        scriptSnippet: "她走在雨后的街道上，手插在夹克口袋里。没有回头确认，也没有刻意加快脚步，一切都刚刚好地跟着她走。",
        directorNote: "这是安迪完成内化阶段后的关键日常造型。她已经不需要通过显性的时尚符号来证明自己是否属于这个行业，而是开始用功能性和舒适度筛选衣服。皮夹克和牛仔裤看似普通，但剪裁和质感都非常准确，说明她已经学会分辨什么是长期成立的单品。高领上衣和深色调让情绪保持内敛，整个人更像是在为自己工作，而不是为体系表演。这一身不是为了被看见，而是为了走得更远。"
      }
    ]
  }
];

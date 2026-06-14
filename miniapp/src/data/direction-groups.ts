// 高考专业方向决策辅助工具 - 方向组知识表
// 首版只做方向组级,不做具体专业级精细结论
// 文案遵守合规边界,不使用"最适合/最优解/精准匹配"等被禁词

import type { DirectionGroup } from '@/types/assessment';

export const directionGroups: DirectionGroup[] = [
  {
    id: 'cs-ai',
    title: '计算机、数据与人工智能类',
    tags: ['软件工程', '数据科学', '人工智能', '网络安全', '智能科学与技术'],
    learningStyle: ['逻辑分析与解题', '动手实验与实操'],
    studyPressure: '高',
    jobBreadth: '宽',
    pathClarity: '中等',
    advancedDegreeDependency: '中',
    industryVolatility: '中',
    cityConcentration: '高',
    platformDependency: '中',
    growthPotential: '高',
    riskNotes: [
      '热门方向内部分化明显,起薪与岗位质量差异较大',
      '技术迭代快,需要持续更新技能与项目经验',
      '就业机会高度集中在少数一线及强二线城市',
      '学历与项目经历都会影响第一份工作的起点'
    ],
    suitableFor: [
      '对逻辑、代码与动手实操有兴趣且能持续投入',
      '能接受较强学习压力和长期自我迭代',
      '愿意在城市机会上做优先取舍'
    ],
    cautionFor: [
      '只因热度而选择,缺乏持续学习的意愿',
      '对学习过程的高压与刷题节奏明显抗拒',
      '对城市与平台差异完全没有心理准备'
    ]
  },
  {
    id: 'engineering-auto',
    title: '工程、自动化与智能制造类',
    tags: ['自动化', '电气工程', '机械工程', '机器人工程', '智能制造工程'],
    learningStyle: ['动手实验与实操', '逻辑分析与解题'],
    studyPressure: '高',
    jobBreadth: '中',
    pathClarity: '中等',
    advancedDegreeDependency: '中',
    industryVolatility: '低',
    cityConcentration: '中',
    platformDependency: '中',
    growthPotential: '高',
    riskNotes: [
      '课程偏硬核,制图、实验与编程压力都不小',
      '不同院校的产业资源差异会明显影响就业',
      '行业整体较稳,但方向选错容易陷入传统工种',
      '智能制造和机器人方向更看重项目与实习积累'
    ],
    suitableFor: [
      '对实体产业、机器设备和工程实践有真实兴趣',
      '愿意读偏工科的高强度课程',
      '能接受稳中求进的成长节奏'
    ],
    cautionFor: [
      '对数理与实操课程明显排斥',
      '期待一毕业就进入一线热门岗位',
      '对工厂、车间、出差场景没有心理准备'
    ]
  },
  {
    id: 'medical-health',
    title: '医学与健康服务类',
    tags: ['临床医学', '口腔医学', '中医学', '护理学', '公共卫生'],
    learningStyle: ['理论阅读和记忆', '动手实验与实操'],
    studyPressure: '高',
    jobBreadth: '中',
    pathClarity: '清晰',
    advancedDegreeDependency: '高',
    industryVolatility: '低',
    cityConcentration: '中',
    platformDependency: '高',
    growthPotential: '中',
    riskNotes: [
      '培养周期长,多数方向需要长期读研甚至读博',
      '课程密度与考试压力显著高于多数方向',
      '职业身份与执照高度绑定,转换成本高',
      '早期收入与后期回报之间存在明显的延迟'
    ],
    suitableFor: [
      '对生命科学和帮助他人有持续动力',
      '家庭能支持较长培养周期与经济压力',
      '接受长期高强度学习与考试'
    ],
    cautionFor: [
      '只看到稳定和体面,没准备好长期付出',
      '对长期读研、规培、考试的节奏无法接受',
      '把医学等同于轻松体面而低估其难度'
    ]
  },
  {
    id: 'finance-management',
    title: '财经管理类',
    tags: ['金融学', '会计学', '工商管理', '经济学', '财务管理'],
    learningStyle: ['理论阅读和记忆', '逻辑分析与解题'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '中等',
    advancedDegreeDependency: '中',
    industryVolatility: '中',
    cityConcentration: '高',
    platformDependency: '高',
    growthPotential: '中',
    riskNotes: [
      '就业高度依赖院校层次与城市金融资源',
      '不同细分方向(银行、券商、考公、考研)差异巨大',
      '证书与实习会显著影响起点,但不能完全替代学历',
      '宏观周期对就业影响明显,行业波动需纳入考虑'
    ],
    suitableFor: [
      '对数字、商业逻辑和社会资源运作有兴趣',
      '愿意主动积累证书、实习和项目经历',
      '接受强竞争、强平台依赖的就业环境'
    ],
    cautionFor: [
      '只凭"财经好就业"的印象做选择',
      '不愿意主动争取证书、实习和额外学习',
      '对一线城市生活与高竞争环境没有准备'
    ]
  },
  {
    id: 'law-public',
    title: '法学与公共事务类',
    tags: ['法学', '政治学与行政学', '公共事业管理', '国际事务', '社会学'],
    learningStyle: ['理论阅读和记忆', '表达沟通与协作'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '分化明显',
    advancedDegreeDependency: '高',
    industryVolatility: '低',
    cityConcentration: '中',
    platformDependency: '高',
    growthPotential: '中',
    riskNotes: [
      '法考与公考是两条主要路径,需要提前明确方向',
      '纯法学就业竞争激烈,学历与院校层次影响显著',
      '公共管理类与社会学类需结合公务员或研究路径',
      '不同细分方向的现实路径差异巨大,容易被笼统误导'
    ],
    suitableFor: [
      '对规则、文本、社会议题有持续兴趣',
      '愿意接受长期考试、读研与资格门槛',
      '对法律或公共事务职业路径有较清晰认知'
    ],
    cautionFor: [
      '把法学等同于"好考公"而忽略其竞争与难度',
      '对长期备考与考试周期明显排斥',
      '没有明确方向,只是觉得"听起来不错"'
    ]
  },
  {
    id: 'education',
    title: '教育与师范类',
    tags: ['教育学', '汉语言文学(师范)', '数学与应用数学(师范)', '英语(师范)', '学前教育'],
    learningStyle: ['理论阅读和记忆', '表达沟通与协作'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '清晰',
    advancedDegreeDependency: '中',
    industryVolatility: '低',
    cityConcentration: '低',
    platformDependency: '中',
    growthPotential: '中',
    riskNotes: [
      '教师编制与定向就业受地区与政策影响明显',
      '不同学段、学科的真实工作强度差异较大',
      '学历提升对职称与调动影响显著',
      '行业整体稳定,但收入与城市机会有限'
    ],
    suitableFor: [
      '对教学、与学生沟通、学科本身有持续兴趣',
      '家庭倾向稳定、可预期的工作节奏',
      '愿意接受编制路径下的规则与考核'
    ],
    cautionFor: [
      '只因"求稳"选择,缺乏对教学与孩子的耐心',
      '对长期站讲台、备课、与家长沟通没有心理准备',
      '期待通过教育方向快速获得高收入'
    ]
  },
  {
    id: 'media-content',
    title: '传媒、内容与传播类',
    tags: ['新闻学', '传播学', '广播电视学', '广告学', '网络与新媒体'],
    learningStyle: ['表达沟通与协作', '动手实验与实操'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '分化明显',
    advancedDegreeDependency: '低',
    industryVolatility: '高',
    cityConcentration: '高',
    platformDependency: '高',
    growthPotential: '中',
    riskNotes: [
      '行业变化快,平台与岗位形态迭代迅速',
      '起薪与上升空间高度依赖作品、城市与平台',
      '就业方向分散,容易陷入"啥都能做但都不精"',
      '高强度加班与不稳定项目是常见现实'
    ],
    suitableFor: [
      '对内容创作、传播、表达有持续热情',
      '愿意主动经营作品集、实习与个人表达',
      '能接受强不确定性与高强度工作节奏'
    ],
    cautionFor: [
      '把传媒等同于"轻松光鲜",忽略高强度与不稳定',
      '不愿做持续输出与作品积累',
      '对高波动行业与城市集中缺乏心理准备'
    ]
  },
  {
    id: 'design-art',
    title: '设计与艺术应用类',
    tags: ['视觉传达设计', '环境设计', '产品设计', '数字媒体艺术', '工业设计'],
    learningStyle: ['动手实验与实操', '表达沟通与协作'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '中等',
    advancedDegreeDependency: '中',
    industryVolatility: '中',
    cityConcentration: '高',
    platformDependency: '中',
    growthPotential: '中',
    riskNotes: [
      '就业结果与作品集质量高度相关,院校差异明显',
      '实习与项目经验是行业核心敲门砖',
      '高强度改稿与跨专业协作是常态',
      '城市与产业聚集地会明显影响起点与上限'
    ],
    suitableFor: [
      '对视觉表达、审美与设计实践有真实兴趣',
      '愿意持续做项目、积累作品与跨学科协作',
      '能接受反复改稿与不确定反馈的工作节奏'
    ],
    cautionFor: [
      '把设计与艺术等同于"轻松有趣",忽略其工作量',
      '不愿做长期作品积累与主动学习',
      '对城市差异与行业门槛没有清晰认知'
    ]
  },
  {
    id: 'basic-research',
    title: '基础学科与科研潜力类',
    tags: ['数学', '物理学', '化学', '生物科学', '基础医学'],
    learningStyle: ['理论阅读和记忆', '逻辑分析与解题'],
    studyPressure: '高',
    jobBreadth: '窄',
    pathClarity: '中等',
    advancedDegreeDependency: '高',
    industryVolatility: '低',
    cityConcentration: '中',
    platformDependency: '高',
    growthPotential: '高',
    riskNotes: [
      '多数方向必须长期读研甚至读博,培养周期长',
      '本科直接就业面较窄,需提前规划深造路径',
      '真正进入科研或交叉应用岗位需要长期积累',
      '院校层次与导师资源对成长路径影响极大'
    ],
    suitableFor: [
      '对基础学科本身有强烈兴趣,愿意长期深耕',
      '家庭与个人都能接受较长培养周期',
      '对科研、教学或交叉应用方向有清晰意愿'
    ],
    cautionFor: [
      '只因"擅长某科"就选择,缺乏对科研路径的认知',
      '对长期读研与不确定就业结果没有心理准备',
      '把基础学科当作"保底选项"而低估其投入'
    ]
  },
  {
    id: 'humanities-social',
    title: '语言、人文与社会科学类',
    tags: ['汉语言文学', '英语', '日语', '历史学', '哲学'],
    learningStyle: ['理论阅读和记忆', '表达沟通与协作'],
    studyPressure: '中',
    jobBreadth: '中',
    pathClarity: '分化明显',
    advancedDegreeDependency: '中',
    industryVolatility: '低',
    cityConcentration: '中',
    platformDependency: '中',
    growthPotential: '中',
    riskNotes: [
      '就业方向高度分化,需要尽早聚焦细分方向',
      '不读研的情况下,部分方向就业起点相对模糊',
      '收入与岗位机会受院校层次与个人积累影响明显',
      '容易陷入"什么都学一点但不专"的认知陷阱'
    ],
    suitableFor: [
      '对语言、文本、人文议题有持续阅读与思考习惯',
      '愿意围绕具体方向做长期积累(读研/翻译/编辑/教学等)',
      '对就业路径分化有较成熟预期'
    ],
    cautionFor: [
      '只因"不想学数学"而选择人文方向',
      '期待"学个语言/文学"就自动有不错就业',
      '对长期收入与岗位分化没有现实预期'
    ]
  }
];

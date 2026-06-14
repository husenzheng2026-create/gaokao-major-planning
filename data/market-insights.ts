import type { DirectionGroupId } from '@/types/assessment';

export interface MarketSource {
  label: string;
  url: string;
  publishedAt: string;
}

export interface DirectionMarketInsight {
  directionId: DirectionGroupId;
  summary: string;
  supplyTrend: string;
  employmentScope: string;
  advancedStudyLoad: string;
  cityConcentration: string;
  aiSignal: string;
  industryMomentum: string;
  admissionSignal: string;
  caution: string;
  sources: MarketSource[];
}

const sourceLibrary = {
  majorCatalog2025: {
    label: '教育部本科专业目录(2025)',
    url: 'https://www.edu.cn/rd/gao_xiao_cheng_guo/gao_xiao_zi_xun/202504/t20250423_2665121.shtml',
    publishedAt: '2025-04-23'
  },
  majorCatalog2026: {
    label: '阳光高考本科专业目录(2026)',
    url: 'https://gaokao.chsi.com.cn/gkxx/zc/moe/202604/20260428/2293468783.html',
    publishedAt: '2026-04-28'
  },
  majorKnowledgeBase: {
    label: '阳光高考专业知识库',
    url: 'https://gaokao.chsi.com.cn/zyk/zybk/',
    publishedAt: '持续更新'
  },
  subjectRequirements: {
    label: '阳光高考选科参考',
    url: 'https://gaokao.chsi.com.cn/zyck/xkkm/zt/query',
    publishedAt: '持续更新'
  },
  ncssReports: {
    label: '国家大学生就业服务平台',
    url: 'https://www.ncss.cn/ncss/zt/jyzlbg2024.shtml',
    publishedAt: '2025-04-01'
  },
  stats2025: {
    label: '国家统计局2025统计公报',
    url: 'https://www.stats.gov.cn/sj/zxfbhjd/202602/t20260228_1962662.html',
    publishedAt: '2026-02-28'
  }
} satisfies Record<string, MarketSource>;

export const directionMarketInsights: Record<DirectionGroupId, DirectionMarketInsight> = {
  'cs-ai': {
    directionId: 'cs-ai',
    summary: '仍是热门方向，但岗位质量分化明显，低水平同质化竞争已经很强。',
    supplyTrend: '高校持续扩容，AI相关新专业和交叉方向仍在增加，供给增加意味着“更热”不等于“更好进”。',
    employmentScope: '就业面宽，软件、数据、智能制造、互联网和企业数字化都有入口，但学校层次和项目经历会放大差距。',
    advancedStudyLoad: '读研不是唯一出路，但冲核心岗位、算法或研究岗时，升学价值明显更高。',
    cityConcentration: '高，一线和强二线机会更密集，城市差异会直接影响第一份工作的质量。',
    aiSignal: 'AI增强明显，但低水平重复开发、测试和基础内容岗位替代压力在上升。',
    industryMomentum: '国家统计局披露高技术制造业、高技术服务业仍保持增长，对数字化和智能化人才需求有支撑。',
    admissionSignal: '报考热度高，分数和位次通常更敏感；同校内不同专业方向差距也会拉大。',
    caution: '最容易误判成“只要学计算机就好就业”，实际更像“强者更强、普通者更卷”。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorCatalog2026,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.stats2025
    ]
  },
  'engineering-auto': {
    directionId: 'engineering-auto',
    summary: '不是最喧闹的热门，但在实体产业升级背景下，属于更稳的增量方向。',
    supplyTrend: '与智能制造、机器人、电气等相关方向受产业升级带动，整体仍有扩展信号。',
    employmentScope: '就业面中等偏宽，制造业、设备、自动化集成、新能源链条都有岗位承接。',
    advancedStudyLoad: '本科可就业，但想去头部平台、研发岗或更高成长路径，深造会更有优势。',
    cityConcentration: '中等，既有一线研发岗，也有大量产业城市机会。',
    aiSignal: 'AI更多是增强而不是替代，懂自动化又懂数字化的人会更吃香。',
    industryMomentum: '装备制造业和高技术制造业近年增速较好，对工程应用型人才形成支撑。',
    admissionSignal: '热度没有计算机那么极端，但院校层次、专业细分和实习资源差异很大。',
    caution: '别把它看成“传统工科旧赛道”，也别把“智能+”三个字自动等同高回报。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.ncssReports,
      sourceLibrary.stats2025
    ]
  },
  'medical-health': {
    directionId: 'medical-health',
    summary: '稳定感强，但真正的门槛是培养周期和身份资格，不是“好不好就业”四个字能概括。',
    supplyTrend: '健康与医疗保障等新专业仍在增列，但核心医学类长期保持高门槛和高投入。',
    employmentScope: '就业路径相对清晰，但方向细分差异极大，临床、口腔、护理、公卫不能混为一谈。',
    advancedStudyLoad: '高，长学制、读研规培、执业资格是绕不过去的现实。',
    cityConcentration: '中等，优质资源仍向大城市和强医院体系集中。',
    aiSignal: 'AI更像辅助诊疗和效率工具，短期内对核心专业岗位以增强为主。',
    industryMomentum: '医疗保健相关支出仍稳定增长，需求有底盘，但岗位准入门槛不会因此降低。',
    admissionSignal: '社会认可高、报考韧性强，热门医学专业通常对分数、选科和家庭耐受度要求都高。',
    caution: '最容易误判成“稳定体面”，却低估长期学习、规培和资格路径。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.subjectRequirements,
      sourceLibrary.stats2025
    ]
  },
  'finance-management': {
    directionId: 'finance-management',
    summary: '社会认知高，但就业结果对学校层次、城市平台和实习证书依赖很强。',
    supplyTrend: '供给一直不低，专业多、学校多，意味着竞争往往不是有没有机会，而是谁拿走更好的机会。',
    employmentScope: '就业面中等，银行、企业财务、审计、咨询、考公考编都能走，但分化很明显。',
    advancedStudyLoad: '中等，读研和证书会显著影响起点，但不是所有方向都必须深造。',
    cityConcentration: '高，金融资源和优质岗位仍集中在核心城市。',
    aiSignal: '流程化、重复性分析岗位受自动化影响更大，复合型分析和业务理解更重要。',
    industryMomentum: '不是典型政策增量赛道，更看平台、资源和个人积累能力。',
    admissionSignal: '热度常年不低，但“听起来好”不等于“录进去后收益高”。',
    caution: '最容易踩的坑是只看专业名头，不看学校层次、城市资源和细分方向。',
    sources: [
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.ncssReports,
      sourceLibrary.stats2025
    ]
  },
  'law-public': {
    directionId: 'law-public',
    summary: '方向看起来体面，但真正决定结果的是是否愿意走长期考试和明确路径。',
    supplyTrend: '法学与公共事务相关专业稳定存在，但不同细分方向现实出口差异很大。',
    employmentScope: '就业面中等，法考、公考、读研、企业法务和公共管理路径差别很大。',
    advancedStudyLoad: '高，资格考试、升学和长期备考往往是关键门槛。',
    cityConcentration: '中等，核心法律服务和优质岗位仍更偏大城市和强平台。',
    aiSignal: '标准化检索和基础文本工作会被AI提升效率，但高判断岗位更看逻辑和表达。',
    industryMomentum: '不是高速扩张行业，更多是稳定需求和考试筛选驱动。',
    admissionSignal: '专业名头容易吸引报考，但真正适合的人群其实没那么宽。',
    caution: '最容易误判成“以后考公就行”，但没有路径意识会很被动。',
    sources: [
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.subjectRequirements,
      sourceLibrary.ncssReports
    ]
  },
  education: {
    directionId: 'education',
    summary: '稳定性强于爆发性，是否值得选，关键在于你是否真的接受教师和教育场景本身。',
    supplyTrend: '供给稳定，部分地区和学段受政策、出生人口与编制结构影响更明显。',
    employmentScope: '就业面中等，教师编、民办学校、教育服务机构、培训和内容教育都有分流。',
    advancedStudyLoad: '中等，教师资格、考编和学历提升会影响地区和岗位质量。',
    cityConcentration: '低到中，区域性更强，离家近与稳定诉求匹配度通常更高。',
    aiSignal: 'AI更偏辅助教学和备课，短期内以增强为主，但标准化内容岗位会被压缩。',
    industryMomentum: '行业整体偏稳，不属于高速扩张赛道，更看区域政策和岗位供给。',
    admissionSignal: '热度稳定，但“求稳”用户多，热门城市和热门学科竞争依然不低。',
    caution: '最容易误判成“稳定就轻松”，但备课、沟通和长期职业耐心才是真门槛。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.subjectRequirements,
      sourceLibrary.ncssReports
    ]
  },
  'media-content': {
    directionId: 'media-content',
    summary: '机会不是没有，但更依赖作品、平台和城市，波动性明显高于表面印象。',
    supplyTrend: '与数字内容、智能视听等相关方向仍有新专业增加，但行业结构变化非常快。',
    employmentScope: '就业面中等，媒体、品牌、公关、内容平台、企业传播都能去，但岗位稳定性差异大。',
    advancedStudyLoad: '低到中，核心不一定是读研，而是作品、表达能力和实习经历。',
    cityConcentration: '高，内容产业和头部平台更集中在一线及强二线城市。',
    aiSignal: 'AI对基础文案、基础剪辑和重复生产冲击明显，原创策划和综合表达更重要。',
    industryMomentum: '部分数字内容赛道仍有机会，但整体更依赖平台规则和景气波动。',
    admissionSignal: '看起来不如传统热门工科卷分，但真正就业分化可能更大。',
    caution: '最容易误判成“有表达能力就够了”，实际上极度依赖持续输出和城市平台。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.ncssReports,
      sourceLibrary.stats2025
    ]
  },
  'design-art': {
    directionId: 'design-art',
    summary: '不是纯感性赛道，现实里更像“作品集 + 项目能力 + 产业城市”的综合竞争。',
    supplyTrend: '数字媒体、智能视听、数字戏剧等新方向增加，说明设计正向数字化和交叉应用延伸。',
    employmentScope: '就业面中等，品牌、互联网、制造业设计、空间和数字内容都能承接，但作品集决定上限。',
    advancedStudyLoad: '中等，是否读研取决于细分方向，行业更看作品和项目积累。',
    cityConcentration: '高，设计产业和高质量项目机会更集中在核心城市。',
    aiSignal: 'AI会改变基础出图和重复制作，但审美判断、系统设计和跨团队协作仍然重要。',
    industryMomentum: '和消费、制造、内容产业都相关，景气受行业周期影响明显。',
    admissionSignal: '报考时看起来不像最卷方向，但真正就业门槛往往后置到作品和实习阶段。',
    caution: '最容易误判成“喜欢画画就行”，实际上长期输出和反馈迭代才是常态。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.ncssReports
    ]
  },
  'basic-research': {
    directionId: 'basic-research',
    summary: '后劲强，但回报兑现更慢，更适合愿意长期深造和打基础的人。',
    supplyTrend: '国家仍持续强调基础研究能力，供给调整更多围绕战略急需和科研导向。',
    employmentScope: '本科直接就业面相对窄，升学和科研路径的重要性明显高于多数应用类方向。',
    advancedStudyLoad: '高，读研读博和进实验室往往不是加分项，而是主路径。',
    cityConcentration: '中等，科研资源更多集中在高水平高校和科研平台。',
    aiSignal: 'AI能提升科研效率和数据处理，但不会替代扎实学科基础。',
    industryMomentum: '与国家战略、前沿科技和科研平台建设相关，长期价值高于短期兑现速度。',
    admissionSignal: '不一定是最热报考方向，但真正适合的人群也更窄。',
    caution: '最容易误判成“先学基础以后再说”，但如果不接受长期深造，会很容易后悔。',
    sources: [
      sourceLibrary.majorCatalog2025,
      sourceLibrary.majorCatalog2026,
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.stats2025
    ]
  },
  'humanities-social': {
    directionId: 'humanities-social',
    summary: '并非没有出路，但对个人表达、迁移能力和后续路径设计要求更高。',
    supplyTrend: '整体不是高校新增重点扩张方向，更强调与语言、国际传播、服务和复合能力结合。',
    employmentScope: '就业面中等偏分散，教育、内容、外贸、国际业务、考公和服务业都可能承接。',
    advancedStudyLoad: '中等，部分方向读研价值明显，但更关键的是是否能形成复合竞争力。',
    cityConcentration: '中等，语言和国际化相关机会更偏核心城市与开放地区。',
    aiSignal: 'AI对基础翻译、基础文案和标准化内容影响较大，复合型沟通与文化理解更重要。',
    industryMomentum: '不属于高景气硬科技赛道，更看个人能力组合和路径设计。',
    admissionSignal: '录取热度不像工科那样极端，但“好进”不等于“出来容易”。',
    caution: '最容易误判成“先读再说”，但越缺路径设计，后期越容易焦虑。',
    sources: [
      sourceLibrary.majorKnowledgeBase,
      sourceLibrary.ncssReports,
      sourceLibrary.stats2025
    ]
  }
};

export const marketMethodologyNote =
  '数据依据来自教育部、阳光高考、国家统计局和国家大学生就业服务平台。当前展示为方向级现实信号，不等同于具体学校、具体专业、具体省份的最终录取或就业结果。';

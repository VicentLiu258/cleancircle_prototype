import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  FileVideo,
  Flame,
  Gauge,
  Info,
  Layers3,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
  Video,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';

type TabId = 'portrait' | 'ai' | 'review' | 'governance' | 'calories';
type CourseStatus = '待复核' | '可用于排课' | '异常待处理';
type CourseFilter = 'all' | CourseStatus;
type Decision = 'accept' | 'edit' | 'reject';

interface Evidence {
  time: string;
  title: string;
  detail: string;
}

interface Course {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  secondaryType: string;
  bodyParts: string[];
  equipment: string[];
  duration: number;
  price: number;
  status: CourseStatus;
  overall: number;
  cardio: number;
  muscle: number;
  impact: number;
  jumpLevel: number;
  jumpRatio: number;
  standingRatio: number;
  floorRatio: number;
  met: number;
  metRange: [number, number];
  confidence: number;
  goals: { label: string; value: number }[];
  safety: { label: string; value: string; tone: 'safe' | 'warn' | 'danger' }[];
  keyActions: string[];
  evidence: Evidence[];
  lastRun: string;
}

const COURSES: Course[] = [
  {
    id: 'GWJ_001',
    name: '20分钟低冲击全身健走',
    subtitle: '连续走步 · 无器械 · 适合日常训练',
    type: '健走',
    secondaryType: '有氧',
    bodyParts: ['全身', '腿部', '核心'],
    equipment: ['无器械'],
    duration: 20,
    price: 0,
    status: '可用于排课',
    overall: 3,
    cardio: 3,
    muscle: 2,
    impact: 1,
    jumpLevel: 0,
    jumpRatio: 0,
    standingRatio: 100,
    floorRatio: 0,
    met: 3.5,
    metRange: [3.0, 4.0],
    confidence: 0.92,
    goals: [
      { label: '减脂', value: 4 },
      { label: '塑形', value: 2 },
      { label: '健康生活', value: 5 },
      { label: '产后恢复', value: 3 },
    ],
    safety: [
      { label: '经期风险', value: '低', tone: 'safe' },
      { label: '产后风险', value: '低', tone: 'safe' },
    ],
    keyActions: ['原地走', '侧步', 'Knee Drive', '轻度深蹲'],
    evidence: [
      { time: '02:10–05:30', title: '连续站立走步', detail: '动作密度稳定，未检测到跳跃或落地冲击。' },
      { time: '11:40–15:20', title: '抬膝与摆臂', detail: '心肺刺激中等，站立动作持续出现。' },
      { time: '18:00–19:40', title: '收尾放松', detail: '节奏下降，作为恢复段处理。' },
    ],
    lastRun: '今天 09:42',
  },
  {
    id: 'HIIT_014',
    name: '20分钟跳跃 HIIT',
    subtitle: '高密度间歇 · 跳跃与复合动作',
    type: 'HIIT',
    secondaryType: '有氧',
    bodyParts: ['全身', '腿部', '核心'],
    equipment: ['无器械'],
    duration: 20,
    price: 9.9,
    status: '待复核',
    overall: 5,
    cardio: 5,
    muscle: 4,
    impact: 5,
    jumpLevel: 5,
    jumpRatio: 35,
    standingRatio: 78,
    floorRatio: 22,
    met: 8,
    metRange: [7, 9],
    confidence: 0.78,
    goals: [
      { label: '减脂', value: 5 },
      { label: '塑形', value: 3 },
      { label: '健康生活', value: 2 },
      { label: '产后恢复', value: 1 },
    ],
    safety: [
      { label: '经期风险', value: '高', tone: 'danger' },
      { label: '产后风险', value: '高', tone: 'danger' },
    ],
    keyActions: ['Jumping Jack', 'Burpee', 'Mountain Climber', '深蹲跳'],
    evidence: [
      { time: '03:00–05:10', title: '连续跳跃间歇', detail: '跳跃相关动作占比高，落地冲击持续出现。' },
      { time: '08:20–10:05', title: 'Burpee + 登山者', detail: '复合高强度动作，包含俯撑和快速转换。' },
      { time: '14:30–17:00', title: '高心肺峰值', detail: '休息比例低，心肺负荷达到高等级。' },
    ],
    lastRun: '今天 09:37',
  },
  {
    id: 'STR_022',
    name: '25分钟哑铃全身力量',
    subtitle: '持续抗阻 · 局部肌肉疲劳明显',
    type: '力量',
    secondaryType: 'STRENGTH',
    bodyParts: ['全身', '臀腿', '肩部'],
    equipment: ['哑铃'],
    duration: 25,
    price: 19.9,
    status: '异常待处理',
    overall: 4,
    cardio: 2,
    muscle: 5,
    impact: 1,
    jumpLevel: 0,
    jumpRatio: 0,
    standingRatio: 62,
    floorRatio: 38,
    met: 5,
    metRange: [4.5, 6],
    confidence: 0.61,
    goals: [
      { label: '减脂', value: 3 },
      { label: '塑形', value: 5 },
      { label: '健康生活', value: 3 },
      { label: '产后恢复', value: 1 },
    ],
    safety: [
      { label: '经期风险', value: '中', tone: 'warn' },
      { label: '产后风险', value: '中', tone: 'warn' },
    ],
    keyActions: ['深蹲', '弓步', '哑铃划船', '肩上推举'],
    evidence: [
      { time: '04:20–07:40', title: '持续抗阻组', detail: '哑铃动作连续出现，肌肉负荷较高。' },
      { time: '12:00–14:20', title: '弓步与深蹲组合', detail: '膝部承重和下肢局部疲劳需要人工确认。' },
      { time: '19:10–21:00', title: '过头推举', detail: '肩部负荷标签与器械识别存在冲突。' },
    ],
    lastRun: '昨天 18:26',
  },
];

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'portrait', label: '课程画像', hint: '一节课的完整标签' },
  { id: 'ai', label: 'AI 初次打标', hint: '事实识别与批次进度' },
  { id: 'review', label: '人工复核', hint: '确认、修改与发布' },
  { id: 'governance', label: '版本与证据治理', hint: '字段证据 × 审核 × 发布快照' },
];

const COURSE_FILTERS: { id: CourseFilter; label: string; count: string }[] = [
  { id: 'all', label: '全部', count: '312' },
  { id: '待复核', label: '待复核', count: '86' },
  { id: '异常待处理', label: '异常', count: '12' },
];

function formatCoursePrice(price: number) {
  return price === 0 ? '免费' : `¥${price.toFixed(1)}`;
}

function getCourseFilterLabel(filter: CourseFilter) {
  return COURSE_FILTERS.find((item) => item.id === filter)?.label ?? '全部';
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const styles = {
    可用于排课: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    待复核: 'border-amber-200 bg-amber-50 text-amber-700',
    异常待处理: 'border-rose-200 bg-rose-50 text-rose-700',
  };
  const icons = {
    可用于排课: CheckCircle2,
    待复核: CircleDashed,
    异常待处理: AlertTriangle,
  };
  const Icon = icons[status];

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold', styles[status])}>
      <Icon size={12} />
      {status}
    </span>
  );
}

function ScoreBar({ value, color = 'bg-slate-700' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 flex-1 gap-0.5 rounded-full bg-slate-100">
        {[1, 2, 3, 4, 5].map((step) => (
          <span key={step} className={cn('h-full flex-1 rounded-full', step <= value ? color : 'bg-slate-100')} />
        ))}
      </div>
      <span className="w-4 text-right text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, suffix, note, color }: { label: string; value: string; suffix?: string; note: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={cn('h-2 w-2 rounded-full', color)} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}<span className="ml-1 text-sm font-medium text-slate-400">{suffix}</span>
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={16} /></span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
        </div>
      </div>
      {action && <span className="text-[11px] font-medium text-slate-400">{action}</span>}
    </div>
  );
}

export function CourseTaggingDemoView({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabId>('portrait');
  const [selectedId, setSelectedId] = useState('GWJ_001');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [weight, setWeight] = useState('60');
  const [completion, setCompletion] = useState(100);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    safety: 'edit',
    overall: 'accept',
    cardio: 'accept',
    muscle: 'accept',
    impact: 'accept',
  });

  const selectedCourse = COURSES.find((course) => course.id === selectedId) ?? COURSES[0];
  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return COURSES.filter((course) => {
      const matchesSearch = !query || `${course.id} ${course.name} ${course.type}`.toLowerCase().includes(query);
      const matchesFilter = courseFilter === 'all' || course.status === courseFilter;
      return matchesSearch && matchesFilter;
    });
  }, [courseFilter, search]);

  const parsedWeight = Math.max(Number(weight) || 60, 30);
  const effectiveMinutes = selectedCourse.duration * (completion / 100);
  const grossKcal = 0.0175 * selectedCourse.met * parsedWeight * effectiveMinutes;
  const activeKcal = 0.0175 * Math.max(selectedCourse.met - 1, 0) * parsedWeight * effectiveMinutes;
  const calorieLow = 0.0175 * selectedCourse.metRange[0] * parsedWeight * effectiveMinutes;
  const calorieHigh = 0.0175 * selectedCourse.metRange[1] * parsedWeight * effectiveMinutes;
  const roundedGross = Math.max(0, Math.round(grossKcal / 5) * 5);
  const roundedActive = Math.max(0, Math.round(activeKcal / 5) * 5);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const selectCourseFilter = (filter: CourseFilter) => {
    setCourseFilter(filter);
    const nextCourse = COURSES.find((course) => filter === 'all' || course.status === filter);
    if (nextCourse) {
      setSelectedId(nextCourse.id);
      setEvidenceIndex(0);
      setReviewSubmitted(false);
    }
    showToast(`已切换至「${getCourseFilterLabel(filter)}」课程 · ${filter === 'all' ? '展示全部状态' : '仅展示对应状态'}`);
  };

  const runAiBatch = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setIsRunning(false);
      showToast('批次 #42 已完成重新识别，3 节课程进入复核队列');
    }, 1000);
  };

  const setDecision = (key: string, decision: Decision) => {
    setDecisions((current) => ({ ...current, [key]: decision }));
    setReviewSubmitted(false);
  };

  return (
    <div className={cn('text-slate-900', embedded ? 'bg-transparent' : 'min-h-full bg-[#f6f8fb]')}>
      <div className={cn('mx-auto max-w-[1440px]', embedded ? 'px-2 py-2' : 'px-6 py-6 lg:px-8')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Content Ops</span><ChevronRight size={12} /><span>Course Profile &amp; 证据治理</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Course Profile 治理工作台</h1>
            <p className="mt-1 text-sm text-slate-500">把视频转成带字段级证据、置信度、审核记录和版本的课程画像；客观标签不等于医学结论。</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            演示数据 · taxonomy_2026_08_28 · Course Profile v7 · rules_v1.0
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard label="课程总数" value="312" suffix="节" note="已建立课程版本" color="bg-slate-700" />
          <MetricCard label="AI待复核" value="86" suffix="节" note="按置信度和冲突分流" color="bg-amber-400" />
          <MetricCard label="安全复核" value="12" suffix="节" note="需要健康专业人员" color="bg-rose-400" />
          <MetricCard label="今日已发布" value="74" suffix="节" note="可被B12排课规则引用" color="bg-emerald-500" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative rounded-t-xl px-4 py-3 text-left transition',
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-[0_-1px_0_0_rgba(226,232,240,1)]' : 'text-slate-400 hover:text-slate-700',
                )}
              >
                <span className="block text-xs font-bold">{tab.label}</span>
                <span className="mt-0.5 block text-[10px]">{tab.hint}</span>
                {activeTab === tab.id && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-slate-900" />}
              </button>
            ))}
          </div>
          <span className="mb-2 text-[11px] text-slate-400">治理入口：B06 字典 → B07 字段证据复核 → B12 规则模拟 → B13 发布</span>
        </div>

        {toast && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={15} />{toast}
          </div>
        )}

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-5">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-bold text-slate-900">课程池</p>
                <p className="mt-0.5 text-[11px] text-slate-400">按标签批次查看课程</p>
              </div>
              <button type="button" onClick={() => showToast('已打开批量导入向导')} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="批量导入">
                <UploadCloud size={15} />
              </button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索课程 / ID" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="课程状态筛选">
              {COURSE_FILTERS.map((filter) => {
                const isActive = courseFilter === filter.id;
                const tone = filter.id === 'all' ? 'slate' : filter.id === '待复核' ? 'amber' : 'rose';
                return (
                  <button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectCourseFilter(filter.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all duration-200 hover:-translate-y-0.5',
                      isActive && tone === 'slate' && 'border-slate-900 bg-slate-900 text-white shadow-sm',
                      isActive && tone === 'amber' && 'border-amber-300 bg-amber-100 text-amber-800 shadow-sm ring-2 ring-amber-100',
                      isActive && tone === 'rose' && 'border-rose-300 bg-rose-100 text-rose-800 shadow-sm ring-2 ring-rose-100',
                      !isActive && tone === 'slate' && 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                      !isActive && tone === 'amber' && 'border-amber-100 bg-amber-50 text-amber-700 hover:border-amber-200',
                      !isActive && tone === 'rose' && 'border-rose-100 bg-rose-50 text-rose-700 hover:border-rose-200',
                    )}
                  >
                    {filter.label} {filter.count}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] text-slate-500 transition-all duration-300">
              <span>当前筛选：<b className="text-slate-700">{getCourseFilterLabel(courseFilter)}</b> · 展示 {filteredCourses.length} 节演示课程</span>
              {courseFilter !== 'all' && (
                <button type="button" onClick={() => selectCourseFilter('all')} className="font-semibold text-slate-700 underline-offset-2 hover:underline">清除</button>
              )}
            </div>
            <div className="mt-3 space-y-1.5">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(course.id);
                    setEvidenceIndex(0);
                    setReviewSubmitted(false);
                  }}
                  className={cn('w-full rounded-xl border p-3 text-left transition', selectedCourse.id === course.id ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-slate-50')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">{course.name}</p>
                      <p className={cn('mt-1 font-mono text-[10px]', selectedCourse.id === course.id ? 'text-slate-300' : 'text-slate-400')}>{course.id} · {course.duration} min</p>
                    </div>
                    <span className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', course.status === '可用于排课' ? 'bg-emerald-400' : course.status === '待复核' ? 'bg-amber-400' : 'bg-rose-400')} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className={selectedCourse.id === course.id ? 'text-slate-300' : 'text-slate-400'}>{course.type} · {course.overall}级</span>
                    <span className={selectedCourse.id === course.id ? 'text-slate-300' : 'text-slate-400'}>置信 {Math.round(course.confidence * 100)}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className={cn('font-semibold', selectedCourse.id === course.id ? 'text-emerald-300' : 'text-emerald-700')}>价格 {formatCoursePrice(course.price)}</span>
                    <span className={selectedCourse.id === course.id ? 'text-slate-400' : 'text-slate-400'}>{course.lastRun}</span>
                  </div>
                </button>
              ))}
              {filteredCourses.length === 0 && <p className="px-2 py-6 text-center text-xs text-slate-400">没有匹配课程</p>}
            </div>
            <button type="button" onClick={() => showToast('已打开全部312节课程')} className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-slate-200 py-2.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50">
              查看全部课程 <ChevronRight size={13} />
            </button>
          </aside>

          <main className="min-w-0 space-y-5">
            {activeTab === 'portrait' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white"><Video size={20} /></div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold tracking-tight text-slate-950">{selectedCourse.name}</h2><StatusBadge status={selectedCourse.status} /></div>
                        <p className="mt-1 text-sm text-slate-500">{selectedCourse.subtitle}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"><span className="font-mono text-slate-400">{selectedCourse.id}</span><span>·</span><span>{selectedCourse.type}</span><span>·</span><span>{selectedCourse.secondaryType}</span><span>·</span><span>{selectedCourse.duration} 分钟</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2"><button type="button" onClick={() => showToast('已打开视频预览')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Play size={14} />预览视频</button><button type="button" onClick={() => setActiveTab('review')} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"><ClipboardCheck size={14} />去复核</button></div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    {[
                      { label: '综合强度', value: `${selectedCourse.overall}/5`, icon: Gauge, color: 'text-violet-600 bg-violet-50' },
                      { label: '心肺负荷', value: `${selectedCourse.cardio}/5`, icon: Activity, color: 'text-blue-600 bg-blue-50' },
                      { label: '肌肉负荷', value: `${selectedCourse.muscle}/5`, icon: Zap, color: 'text-amber-600 bg-amber-50' },
                      { label: '冲击负荷', value: `${selectedCourse.impact}/5`, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
                    ].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center justify-between"><span className="text-[11px] font-medium text-slate-500">{item.label}</span><span className={cn('flex h-6 w-6 items-center justify-center rounded-lg', item.color)}><Icon size={13} /></span></div><p className="mt-2 text-lg font-bold text-slate-900">{item.value}</p></div>; })}
                  </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Layers3} title="基础属性与动作事实" detail="AI识别出的可观察内容" /><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-[11px] font-semibold text-slate-400">训练部位</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedCourse.bodyParts.map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{item}</span>)}</div></div><div><p className="text-[11px] font-semibold text-slate-400">器械</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedCourse.equipment.map((item) => <span key={item} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{item}</span>)}</div></div></div><div className="mt-5 space-y-3"><div><div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>跳跃动作占比</span><b className="text-slate-700">{selectedCourse.jumpRatio}% · 等级{selectedCourse.jumpLevel}</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.max(selectedCourse.jumpRatio, 2)}%` }} /></div></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] text-slate-400">站立占比</p><p className="mt-1 text-sm font-bold text-slate-800">{selectedCourse.standingRatio}%</p></div><div className="rounded-xl border border-slate-100 p-3"><p className="text-[10px] text-slate-400">地面占比</p><p className="mt-1 text-sm font-bold text-slate-800">{selectedCourse.floorRatio}%</p></div></div></div><div className="mt-5"><p className="text-[11px] font-semibold text-slate-400">关键动作</p><div className="mt-2 flex flex-wrap gap-1.5">{selectedCourse.keyActions.map((item) => <span key={item} className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-600">{item}</span>)}</div></div></section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Target} title="目标贡献与安全特征" detail="用于匹配和安全筛选，不等于医学诊断" /><div className="mt-5 space-y-3">{selectedCourse.goals.map((goal) => <div key={goal.label} className="grid grid-cols-[78px_1fr] items-center gap-3"><span className="text-[11px] text-slate-500">{goal.label}</span><ScoreBar value={goal.value} color={goal.value >= 4 ? 'bg-slate-800' : 'bg-slate-400'} /></div>)}</div><div className="mt-6 border-t border-slate-100 pt-4"><p className="text-[11px] font-semibold text-slate-400">特殊阶段谨慎特征</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{selectedCourse.safety.map((item) => <div key={item.label} className={cn('flex items-center justify-between rounded-xl border px-3 py-2.5', item.tone === 'safe' ? 'border-emerald-100 bg-emerald-50/60' : item.tone === 'warn' ? 'border-amber-100 bg-amber-50/60' : 'border-rose-100 bg-rose-50/60')}><span className="text-[11px] text-slate-600">{item.label}</span><span className={cn('text-xs font-bold', item.tone === 'safe' ? 'text-emerald-700' : item.tone === 'warn' ? 'text-amber-700' : 'text-rose-700')}>{item.value}</span></div>)}</div></div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] leading-relaxed text-blue-700"><Info size={14} className="mr-1 inline-block -mt-0.5" />安全特征用于避让、降权和提示；只有通过复核的标签，才允许被排课规则读取。</div></section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={FileVideo} title="证据片段" detail="点击时间段可跳转到视频对应位置" action={`AI置信度 ${Math.round(selectedCourse.confidence * 100)}%`} /><div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]"><div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-slate-950 p-6 text-white"><div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10"><Play size={22} fill="currentColor" /></div><p className="mt-3 text-xs font-semibold">视频预览占位</p><p className="mt-1 text-[10px] text-slate-400">{selectedCourse.name} · {selectedCourse.duration}:00</p></div></div><div className="space-y-2">{selectedCourse.evidence.map((item, index) => <button type="button" key={item.time} onClick={() => setEvidenceIndex(index)} className={cn('w-full rounded-xl border p-3 text-left transition', evidenceIndex === index ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300')}><div className="flex items-start gap-3"><span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', evidenceIndex === index ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500')}>{index + 1}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[11px] font-bold text-slate-700">{item.time}</span><span className="text-[11px] font-semibold text-slate-800">{item.title}</span></div><p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.detail}</p></div></div></button>)}</div></div></section>

                <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-amber-300"><Flame size={16} /></span><div><p className="text-sm font-bold">卡路里快速预览</p><p className="mt-0.5 text-[11px] text-slate-400">根据当前课程标签和60kg用户完整完成估算</p></div></div></div><button type="button" onClick={() => setActiveTab('calories')} className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200">打开完整估算 <ChevronRight size={14} /></button></div><div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-4"><div><p className="text-[11px] text-slate-400">总消耗</p><p className="mt-1 text-4xl font-bold tracking-tight">{selectedCourse.id === 'GWJ_001' ? '75' : roundedGross}<span className="ml-1 text-sm font-medium text-slate-400">kcal</span></p></div><div><p className="text-[11px] text-slate-400">活动消耗</p><p className="mt-1 text-2xl font-bold">{selectedCourse.id === 'GWJ_001' ? '55' : roundedActive}<span className="ml-1 text-sm font-medium text-slate-400">kcal</span></p></div><div className="mb-1 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300">MET {selectedCourse.met.toFixed(1)} · 课程时长 {selectedCourse.duration} 分钟</div></div></section>
              </>
            )}

            {activeTab === 'ai' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><SectionTitle icon={Sparkles} title="AI初次打标批次 #42" detail="先识别客观事实，再推导课程标签" /><button type="button" onClick={runAiBatch} disabled={isRunning} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-70">{isRunning ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}{isRunning ? '重新识别中…' : '重新运行批次'}</button></div><div className="mt-6 grid gap-3 md:grid-cols-4">{[{ label: '素材准备', value: '312 / 312', done: true }, { label: '多模态识别', value: '312 / 312', done: true }, { label: '标签推导', value: '298 / 312', done: false }, { label: '进入人工复核', value: '86 节', done: false }].map((step, index) => <div key={step.label} className="relative rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-600">0{index + 1} · {step.label}</span>{step.done ? <CheckCircle2 size={15} className="text-emerald-500" /> : <CircleDashed size={15} className="text-amber-500" />}</div><p className="mt-3 text-lg font-bold text-slate-900">{step.value}</p>{index < 3 && <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-slate-200 md:block" />}</div>)}</div><div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-slate-900" style={{ width: '95%' }} /></div><span className="text-xs font-bold text-slate-600">95%</span></div></section>
                <div className="grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={Activity} title="客观事实识别" detail="模型从视频、音频和字幕提取依据" /><div className="mt-5 space-y-2">{['动作：原地走、侧步、Knee Drive、轻度深蹲', '姿态：站立100%，地面0%，仰卧0%', '节奏：中等连续节奏，休息段较少', '器械：未检测到哑铃、弹力带等器械', '跳跃：未检测到跳跃和快速落地'].map((item) => <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-xs text-slate-600"><Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />{item}</div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><SectionTitle icon={BarChart3} title="标签推导结果" detail="规则引擎根据客观事实计算" /><div className="mt-5 grid gap-3 sm:grid-cols-2">{[['综合强度', '3', '依据：心肺3、肌肉2、冲击1'], ['课程类型', '健走 + 有氧', '依据：走步贯穿主训练段'], ['产后谨慎特征', '低', '依据：无跳跃、无高冲击动作'], ['MET区间', '3.0–4.0', '依据：课程类型+强度映射']].map((item) => <div key={item[0]} className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-400">{item[0]}</p><p className="mt-1 text-sm font-bold text-slate-800">{item[1]}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-400">{item[2]}</p></div>)}</div></section></div>
                <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5"><div className="flex items-start gap-3"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" /><div><p className="text-sm font-bold text-amber-900">自动分流规则</p><p className="mt-1 text-xs leading-relaxed text-amber-800">高风险、低置信度（&lt;75%）、证据不足和标签冲突，不进入批量接受；安全类标签必须由健康运营逐条确认。</p></div></div></section>
              </>
            )}

            {activeTab === 'review' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><SectionTitle icon={ClipboardCheck} title="人工复核工作台" detail="B07 · 批次 #42 · 当前课程" /><div className="flex items-center gap-2"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">待复核 12</span><span className="text-[11px] text-slate-400">优先级：{selectedCourse.impact >= 4 ? 'P0 安全' : 'P1 常规'}</span></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="rounded-2xl bg-slate-950 p-6 text-white"><div className="flex min-h-[260px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10"><Play size={24} fill="currentColor" /></div><p className="mt-4 text-sm font-semibold">{selectedCourse.name}</p><p className="mt-1 text-[11px] text-slate-400">点击右侧证据片段，模拟跳转视频时间点</p></div><div className="mt-4 flex items-center gap-3"><span className="font-mono text-[10px] text-slate-400">{selectedCourse.evidence[evidenceIndex].time}</span><div className="h-1.5 flex-1 rounded-full bg-white/10"><div className="h-1.5 w-2/5 rounded-full bg-amber-300" /></div><span className="font-mono text-[10px] text-slate-400">{selectedCourse.duration}:00</span></div></div><div className="space-y-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">审核建议</p><p className="mt-2 text-xs leading-relaxed text-slate-600">AI已识别 {selectedCourse.keyActions.length} 个关键动作，综合强度 {selectedCourse.overall} 级，置信度 {Math.round(selectedCourse.confidence * 100)}%。</p></div><div className="space-y-2">{selectedCourse.evidence.map((item, index) => <button type="button" key={item.time} onClick={() => setEvidenceIndex(index)} className={cn('w-full rounded-xl border px-3 py-2 text-left text-xs', evidenceIndex === index ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}><span className="font-mono text-[10px]">{item.time}</span><span className="ml-2 font-semibold">{item.title}</span></button>)}</div></div></div></section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><SectionTitle icon={ShieldCheck} title="逐项裁决标签" detail="修改或驳回必须填写理由" /><span className="text-[11px] text-slate-400">健康类标签不可批量接受</span></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-100"><div className="grid grid-cols-[minmax(0,1fr)_100px_210px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>标签建议</span><span>置信度</span><span>人工裁决</span></div>{[['综合强度', `${selectedCourse.overall}/5`, selectedCourse.confidence, 'overall'], ['心肺负荷', `${selectedCourse.cardio}/5`, selectedCourse.confidence + 0.02, 'cardio'], ['肌肉负荷', `${selectedCourse.muscle}/5`, Math.max(selectedCourse.confidence - 0.07, 0.1), 'muscle'], ['冲击负荷', `${selectedCourse.impact}/5`, selectedCourse.confidence, 'impact'], ['产后谨慎特征', selectedCourse.safety[1].value, selectedCourse.confidence - 0.05, 'safety']].map((item) => { const key = item[3] as string; const confidence = item[2] as number; return <div key={key} className="grid grid-cols-[minmax(0,1fr)_100px_210px] items-center gap-3 border-t border-slate-100 px-4 py-3"><div><p className="text-xs font-semibold text-slate-700">{item[0] as string}</p><p className="mt-0.5 text-[10px] text-slate-400">AI建议：{item[1] as string} · 证据：{selectedCourse.evidence[0].time}</p></div><span className={cn('font-mono text-xs font-bold', confidence < 0.75 ? 'text-rose-600' : 'text-slate-600')}>{Math.round(confidence * 100)}%</span><div className="flex items-center gap-1"><button type="button" onClick={() => setDecision(key, 'accept')} className={cn('rounded-lg px-2 py-1.5 text-[10px] font-semibold', decisions[key] === 'accept' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400')}>接受</button><button type="button" onClick={() => setDecision(key, 'edit')} className={cn('rounded-lg px-2 py-1.5 text-[10px] font-semibold', decisions[key] === 'edit' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400')}>修改</button><button type="button" onClick={() => setDecision(key, 'reject')} className={cn('rounded-lg px-2 py-1.5 text-[10px] font-semibold', decisions[key] === 'reject' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400')}>驳回</button></div></div>; })}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[11px] text-slate-500"><UserRound size={14} className="text-slate-400" />当前审核人：内容运营 A · 安全类需健康运营终审</div><button type="button" onClick={() => { setReviewSubmitted(true); showToast('复核结果已保存，安全类标签进入健康运营终审'); }} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"><CheckCircle2 size={14} />{reviewSubmitted ? '已保存复核结果' : '提交复核结果'}</button></div></section>
                <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4"><div className="flex items-start gap-3"><Info size={16} className="mt-0.5 shrink-0 text-blue-600" /><p className="text-xs leading-relaxed text-blue-800">课程标签只有在普通标签确认、安全标签终审通过后，才会生成“可用于排课”的发布快照。修改前后值、理由、审核人和时间都会写入审计日志。</p></div></section>
              </>
            )}

            {activeTab === 'governance' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionTitle icon={ShieldCheck} title="Course Profile 发布快照" detail="字段级证据、置信度和审核结果共同决定是否可被排课规则读取" />
                    <StatusBadge status={selectedCourse.status} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Profile 版本', 'v7'],
                      ['Taxonomy', 'taxonomy_2026_08_28'],
                      ['证据完整度', selectedCourse.confidence >= 0.8 ? '完整' : '待补证据'],
                      ['审核状态', selectedCourse.status === '可用于排课' ? 'APPROVED' : 'REVIEW_REQUIRED'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 p-4">
                      <p className="text-[11px] font-semibold text-slate-400">字段来源与置信度</p>
                      <div className="mt-3 space-y-2 text-xs text-slate-600">
                        <p>动作事实：视频关键帧 + 字幕 · {Math.round(selectedCourse.confidence * 100)}%</p>
                        <p>负荷等级：事实 → taxonomy 映射 · {Math.round((selectedCourse.confidence - 0.02) * 100)}%</p>
                        <p>安全字段：证据片段 {selectedCourse.evidence.length} 条 · 需人工终审</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                      <p className="text-[11px] font-semibold text-amber-800">发布门槛</p>
                      <p className="mt-2 text-xs leading-relaxed text-amber-800">低置信、unknown、敏感生命周期风险或字段冲突时，保持 REVIEW_REQUIRED；完成健康复核后才能生成排课可用快照。</p>
                    </div>
                  </div>
                </section>
                <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3"><Info size={16} className="mt-0.5 shrink-0 text-blue-600" /><p className="text-xs leading-relaxed text-blue-800">V1 将卡路里/MET 保留为实验性展示字段，不参与 User Training Profile、Hard Filter 或课程排序；推荐只读取 APPROVED Course Profile 的客观属性和安全字段。</p></div>
                </section>
              </>
            )}

            {activeTab === 'calories' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><SectionTitle icon={Flame} title="课程卡路里估算" detail="课程标签 × 用户体重 × 实际有效训练时长" /><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">模型 v1.0</span></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-4"><div className="rounded-2xl bg-slate-900 p-5 text-white"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-400">当前课程</p><p className="mt-1 text-lg font-bold">{selectedCourse.name}</p><p className="mt-1 text-[11px] text-slate-400">{selectedCourse.type} · 综合强度 {selectedCourse.overall}/5 · MET {selectedCourse.met.toFixed(1)}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300"><Flame size={18} /></span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] text-slate-400">总消耗</p><p className="mt-1 text-3xl font-bold">{roundedGross}<span className="ml-1 text-xs text-slate-400">kcal</span></p></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] text-slate-400">活动消耗</p><p className="mt-1 text-3xl font-bold">{roundedActive}<span className="ml-1 text-xs text-slate-400">kcal</span></p></div></div></div><div className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold text-slate-700">估算输入</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] font-semibold text-slate-400">体重</span><div className="mt-1 flex items-center gap-1"><input value={weight} onChange={(event) => setWeight(event.target.value)} inputMode="decimal" className="w-16 bg-transparent text-lg font-bold text-slate-800 outline-none" /><span className="text-xs text-slate-400">kg</span></div></label><div className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] font-semibold text-slate-400">有效时长</span><p className="mt-1 text-lg font-bold text-slate-800">{effectiveMinutes.toFixed(1)}<span className="ml-1 text-xs font-medium text-slate-400">min</span></p></div></div><label className="mt-4 block"><div className="flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>完成度</span><span className="text-slate-700">{completion}%</span></div><input type="range" min="20" max="100" step="5" value={completion} onChange={(event) => setCompletion(Number(event.target.value))} className="mt-3 w-full accent-slate-900" /></label></div></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"><BarChart3 size={16} /></span><div><p className="text-sm font-bold text-slate-800">结果解释</p><p className="text-[11px] text-slate-400">按当前课程版本和用户输入实时计算</p></div></div><div className="mt-5 space-y-3 text-xs"><div className="flex items-center justify-between"><span className="text-slate-500">MET映射区间</span><span className="font-mono font-bold text-slate-700">{selectedCourse.metRange[0].toFixed(1)}–{selectedCourse.metRange[1].toFixed(1)}</span></div><div className="flex items-center justify-between"><span className="text-slate-500">本次估算区间</span><span className="font-bold text-slate-700">{Math.round(calorieLow / 5) * 5}–{Math.round(calorieHigh / 5) * 5} kcal</span></div><div className="flex items-center justify-between"><span className="text-slate-500">课程置信度</span><span className={cn('font-bold', selectedCourse.confidence >= 0.9 ? 'text-emerald-700' : 'text-amber-700')}>{Math.round(selectedCourse.confidence * 100)}% · {selectedCourse.confidence >= 0.9 ? '高' : '中'}</span></div></div><div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 font-mono text-[10px] leading-relaxed text-slate-500">总消耗 = 0.0175 × MET × 体重kg × 有效分钟数<br />活动消耗 = 0.0175 × (MET − 1) × 体重kg × 有效分钟数</div></div></div></section>
                <div className="grid gap-5 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2"><SectionTitle icon={Clock3} title="课程比较" detail="同一用户完整完成不同课程的估算" /><div className="mt-4 overflow-hidden rounded-xl border border-slate-100"><div className="grid grid-cols-[minmax(0,1fr)_72px_72px_90px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>课程</span><span>MET</span><span>时长</span><span className="text-right">总消耗</span></div>{COURSES.map((course) => { const total = Math.round(0.0175 * course.met * parsedWeight * course.duration / 5) * 5; return <button type="button" key={course.id} onClick={() => setSelectedId(course.id)} className={cn('grid w-full grid-cols-[minmax(0,1fr)_72px_72px_90px] gap-3 border-t border-slate-100 px-4 py-3 text-left text-xs hover:bg-slate-50', selectedCourse.id === course.id && 'bg-slate-50')}><span className="truncate font-semibold text-slate-700">{course.name}</span><span className="font-mono text-slate-500">{course.met.toFixed(1)}</span><span className="text-slate-500">{course.duration}m</span><span className="text-right font-bold text-slate-800">{total} kcal</span></button>; })}</div></section><section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5"><div className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-600" /><p className="text-sm font-bold text-amber-900">运营提示</p></div><ul className="mt-4 space-y-3 text-xs leading-relaxed text-amber-800"><li>• 结果是估算值，建议显示“约”和区间。</li><li>• 影响卡路里的主要因素是MET、体重和有效时长。</li><li>• 冲击和风险标签用于安全筛选，不直接等同于热量。</li><li>• 卡路里结果不能绕过经期、产后等安全规则。</li></ul></section></div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

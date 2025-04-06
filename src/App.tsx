import React, { useEffect, useState, useRef, useMemo } from "react";
import { format, parse, differenceInCalendarMonths, addMonths, subMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { v4 as uuidv4 } from "uuid";
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useTransform, 
  useSpring, 
  useInView, 
  useAnimation, 
  animate
} from "framer-motion";
import { useSpring as useReactSpring, animated } from '@react-spring/web';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart 
} from 'recharts';
import {
  Activity as ActivityIcon,
  ArrowRight as ArrowRightIcon,
  BarChart2,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  ChevronDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Filter as FilterIcon,
  Layers as LayersIcon,
  LayoutTemplate as LayoutTemplateIcon,
  List as ListIcon,
  Menu as MenuIcon,
  PieChart as PieChartIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  User as UserIcon,
  Wallet as WalletIcon,
  AlertTriangle as AlertTriangleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  MousePointer as MousePointerIcon,
  Sparkles as SparklesIcon,
  ChevronsRight as ChevronsRightIcon,
  LifeBuoy as LifeBuoyIcon,
  Flame as FlameIcon,
  Zap as ZapIcon,
  Award as AwardIcon,
  Target as TargetIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  DollarSign as DollarSignIcon,
  Home as HomeIcon,
  Utensils as UtensilsIcon,
  Car as CarIcon,
  Wrench as WrenchIcon,
  Code as CodeIcon,
  BookOpen as BookOpenIcon,
  CircleDot as CircleDotIcon,
  PiggyBank as PiggyBankIcon,
  Tag as TagIcon,
  Shield as ShieldIcon,
  Brain as BrainIcon,
  HeartIcon,
  GraduationCap as GraduationCapIcon,
  Coffee as CoffeeIcon,
  Umbrella as UmbrellaIcon,
  Lightbulb as LightbulbIcon,
  XIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select as UISelect, SelectContent as UISelectContent, SelectItem as UISelectItem, SelectTrigger as UISelectTrigger, SelectValue as UISelectValue } from '@/components/ui/select';
import { toast, ToastContainer } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface Allocation {
  id: string;
  purpose: string;
  amount: number;
  category?: string;
  note?: string;
  manualGroup?: string;
  group?: string; // 添加缺失的group属性
}

interface MonthData {
  income: number;
  allocations: Allocation[];
  activeTemplate?: string;
}

// 定义分类
const CATEGORIES = [
  { id: 'housing', name: '住房', color: '#4f46e5' },
  { id: 'food', name: '餐饮', color: '#16a34a' },
  { id: 'transport', name: '交通', color: '#facc15' },
  { id: 'entertainment', name: '娱乐', color: '#f97316' },
  { id: 'shopping', name: '购物', color: '#3b82f6' },
  { id: 'medical', name: '医疗', color: '#06b6d4' },
  { id: 'education', name: '教育', color: '#eab308' },
  { id: 'saving', name: '储蓄', color: '#6366f1' },
  { id: 'investment', name: '投资', color: '#14b8a6' },
  { id: 'other', name: '其他', color: '#64748b' },
];

const colorPalette = [
  '#3b82f6', // 蓝色
  '#22c55e', // 绿色
  '#f59e0b', // 黄色
  '#ef4444', // 红色
  '#8b5cf6', // 紫色
  '#ec4899', // 粉色
  '#06b6d4', // 青色
  '#14b8a6', // 蓝绿色
  '#f97316', // 橙色
  '#6366f1', // 靛蓝色
];

// 添加分类组数据结构
interface CategoryGroup {
  id: string;
  name: string;
  color: string;
  categories: string[]; // 包含的子分类ID
  recommendedPercentage: number; // 建议比例
  description: string; // 描述
}

// 定义每个模板对应的分类组
const TEMPLATE_GROUPS: Record<string, CategoryGroup[]> = {
  '六罐法则': [
    {
      id: 'necessities',
      name: '生活必需',
      color: '#16a34a',
      categories: ['housing', 'food', 'transport', 'medical'],
      recommendedPercentage: 55,
      description: '日常生活的必要开支，如住房、食品、基本交通和医疗'
    },
    {
      id: 'education',
      name: '教育投资',
      color: '#eab308',
      categories: ['education'],
      recommendedPercentage: 10,
      description: '用于自我提升和学习的支出，包括书籍、课程等'
    },
    {
      id: 'savings',
      name: '储蓄备用',
      color: '#3b82f6',
      categories: ['saving'],
      recommendedPercentage: 10,
      description: '应急基金，以应对突发情况'
    },
    {
      id: 'enjoyment',
      name: '享受生活',
      color: '#f97316',
      categories: ['entertainment'],
      recommendedPercentage: 10,
      description: '提升生活品质的支出，如旅行、爱好、娱乐等'
    },
    {
      id: 'investment',
      name: '长期投资',
      color: '#6366f1',
      categories: ['investment'],
      recommendedPercentage: 10,
      description: '用于长期财富增值的投资'
    },
    {
      id: 'generosity',
      name: '慷慨捐赠',
      color: '#ec4899',
      categories: ['other'],
      recommendedPercentage: 5,
      description: '回馈社会的慈善捐款'
    }
  ],
  
  '50/30/20法则': [
    {
      id: 'necessities',
      name: '必要开支',
      color: '#16a34a',
      categories: ['housing', 'food', 'transport', 'medical'],
      recommendedPercentage: 50,
      description: '生活必需品，包括房租/房贷、水电、食品、基本交通等'
    },
    {
      id: 'personal',
      name: '个人支出',
      color: '#f97316',
      categories: ['entertainment', 'education', 'other'],
      recommendedPercentage: 30,
      description: '提升生活品质的支出，包括娱乐、购物、餐厅等非必需品'
    },
    {
      id: 'financial',
      name: '储蓄投资',
      color: '#3b82f6',
      categories: ['saving', 'investment'],
      recommendedPercentage: 20,
      description: '为未来做准备，包括应急基金、债务偿还和投资'
    }
  ],
  
  '4321预算法': [
    {
      id: 'basicLiving',
      name: '基本生活',
      color: '#16a34a',
      categories: ['housing', 'food', 'transport', 'medical'],
      recommendedPercentage: 40,
      description: '基础生活必需品，包括住房、餐饮、基本服装等'
    },
    {
      id: 'discretionary',
      name: '自由支配',
      color: '#f97316',
      categories: ['entertainment', 'other'],
      recommendedPercentage: 30,
      description: '个人享受和提升生活品质的支出，如娱乐、旅行等'
    },
    {
      id: 'financialGoals',
      name: '财务目标',
      color: '#eab308',
      categories: ['saving', 'education'],
      recommendedPercentage: 20,
      description: '针对性储蓄，如购房首付、教育金等特定目标'
    },
    {
      id: 'investment',
      name: '储蓄投资',
      color: '#6366f1',
      categories: ['investment'],
      recommendedPercentage: 10,
      description: '长期理财增值，为退休或财务自由做准备'
    }
  ],
  
  '零基预算法': [],
  '70/20/10法则': [],
  '创业启动期': [
    {
      id: 'life_essential',
      name: '生活必需',
      color: '#16a34a', // 绿色
      categories: ['housing', 'food'],
      recommendedPercentage: 40,
      description: '维持基本生活所需的必要开支，如房租、食品等基本生活成本'
    },
    {
      id: 'startup_cost',
      name: '创业投入',
      color: '#0891b2', // 青蓝色
      categories: ['transport', 'housing'],
      recommendedPercentage: 30,
      description: '直接投入创业项目的资金，包括产品开发、设备购买等'
    },
    {
      id: 'skill_growth',
      name: '能力提升',
      color: '#9333ea', // 紫色
      categories: ['education'],
      recommendedPercentage: 15,
      description: '提升自身技能和知识的投资，如学习课程、专业书籍等'
    },
    {
      id: 'safety_net',
      name: '安全缓冲',
      color: '#f97316', // 橙色
      categories: ['saving'],
      recommendedPercentage: 10,
      description: '应对不确定性的现金储备，推荐维持至少3个月的生活费'
    },
    {
      id: 'enjoyment',
      name: '生活享受',
      color: '#ec4899', // 粉色
      categories: ['entertainment'],
      recommendedPercentage: 5,
      description: '保持生活平衡和心理健康的小额享受，避免创业疲劳'
    }
  ],
  '创业成长期': [
    {
      id: 'life_stability',
      name: '生活稳定',
      color: '#16a34a', // 绿色
      categories: ['housing', 'food'],
      recommendedPercentage: 30,
      description: '稳定的生活保障，随着收入增长可适当提高生活质量'
    },
    {
      id: 'business_growth',
      name: '业务扩展',
      color: '#0891b2', // 青蓝色
      categories: ['transport', 'housing'],
      recommendedPercentage: 35,
      description: '扩大业务规模的资金，包括市场营销、团队扩充等'
    },
    {
      id: 'networking',
      name: '人脉资源',
      color: '#9333ea', // 紫色
      categories: ['entertainment', 'education'],
      recommendedPercentage: 15,
      description: '行业交流、客户维护等关系建设的投入'
    },
    {
      id: 'financial_planning',
      name: '财务规划',
      color: '#f97316', // 橙色
      categories: ['saving', 'investment'],
      recommendedPercentage: 15,
      description: '长期资产配置和财富增值，为个人财务自由做准备'
    },
    {
      id: 'life_quality',
      name: '生活品质',
      color: '#ec4899', // 粉色
      categories: ['entertainment', 'other'],
      recommendedPercentage: 5,
      description: '提升生活品质，保持创业动力和工作生活平衡'
    }
  ],
  '精益创业': [
    {
      id: 'minimal_living',
      name: '极简生活',
      color: '#16a34a', // 绿色
      categories: ['housing', 'food'],
      recommendedPercentage: 35,
      description: '将生活成本控制在最低水平，延长资金燃烧周期'
    },
    {
      id: 'mvp_development',
      name: '最小验证',
      color: '#0891b2', // 青蓝色
      categories: ['housing', 'transport'],
      recommendedPercentage: 30,
      description: '开发最小可行产品(MVP)所需的最低投入'
    },
    {
      id: 'learning_testing',
      name: '学习测试',
      color: '#9333ea', // 紫色
      categories: ['education', 'entertainment'],
      recommendedPercentage: 20,
      description: '持续学习和市场验证的投入，收集用户反馈'
    },
    {
      id: 'runway_buffer',
      name: '生存缓冲',
      color: '#f97316', // 橙色
      categories: ['saving'],
      recommendedPercentage: 15,
      description: '确保基本生活的应急资金，至少6个月的基本开支'
    }
  ],
};

// 替换预设模板部分，添加更多科学的预算模板和详细介绍
interface TemplateInfo {
  title: string;
  description: string;
  suitableFor: string;
  allocations: (income: number) => Allocation[];
}

// 预设模板
const TEMPLATES: Record<string, TemplateInfo> = {
  '50/30/20法则': {
    title: '50/30/20法则',
    description: '由美国参议员Elizabeth Warren推广的经典预算法则，将收入分为三大类：必要开支、个人支出和储蓄/投资。简单易行，适合大多数人作为起点。',
    suitableFor: '适合初次预算、稳定收入人群、工薪阶层',
    allocations: (income: number) => [
      { id: crypto.randomUUID(), purpose: '必要支出', amount: income * 0.5, category: 'housing', note: '生活必需品，包括房租/房贷、水电、食品、基本交通和基础医疗等' },
      { id: crypto.randomUUID(), purpose: '个人支出', amount: income * 0.3, category: 'entertainment', note: '提升生活品质的支出，包括娱乐、购物、餐厅、旅行等非必需品' },
      { id: crypto.randomUUID(), purpose: '储蓄与投资', amount: income * 0.2, category: 'saving', note: '为未来做准备，包括应急基金、退休储蓄、债务偿还和投资增值' },
    ]
  },
  '零基预算法': {
    title: '零基预算法',
    description: '以"收入-支出=零"为原则的精细预算方法，要求为每一分钱安排归属。强调根据本月实际情况灵活规划，适合需要严格控制支出的人群。',
    suitableFor: '适合财务精细化管理、不稳定收入人群、需要还债人群',
    allocations: (income: number) => [
      { id: crypto.randomUUID(), purpose: '住房费用', amount: 0, category: 'housing', note: '房租/房贷、物业费、水电气网费等' },
      { id: crypto.randomUUID(), purpose: '日常餐饮', amount: 0, category: 'food', note: '日常三餐、食材购买等' },
      { id: crypto.randomUUID(), purpose: '交通出行', amount: 0, category: 'transport', note: '公共交通、油费、车辆维护等' },
      { id: crypto.randomUUID(), purpose: '医疗健康', amount: 0, category: 'medical', note: '医疗保险、门诊费用、药品等' },
      { id: crypto.randomUUID(), purpose: '个人消费', amount: 0, category: 'entertainment', note: '娱乐、爱好、外出就餐等' },
      { id: crypto.randomUUID(), purpose: '紧急备用', amount: 0, category: 'saving', note: '应急基金，建议3-6个月生活费' },
      { id: crypto.randomUUID(), purpose: '未来投资', amount: 0, category: 'investment', note: '退休金、股票、基金等投资' },
      { id: crypto.randomUUID(), purpose: '债务偿还', amount: 0, category: 'other', note: '信用卡、贷款等债务的还款' },
    ]
  },
  '4321预算法': {
    title: '4321预算法',
    description: '简单易记的收入分配策略，将收入按比例分为四大块：40%基本生活、30%自由支配、20%财务目标、10%储蓄投资。平衡了必要支出与个人所需。',
    suitableFor: '适合平衡稳健型人群、初次理财人士',
    allocations: (income: number) => [
      { id: crypto.randomUUID(), purpose: '基本生活(40%)', amount: income * 0.4, category: 'housing', note: '基础生活必需品，包括住房、餐饮、基本服装等' },
      { id: crypto.randomUUID(), purpose: '自由支配(30%)', amount: income * 0.3, category: 'entertainment', note: '个人享受和提升生活品质的支出，如娱乐、旅行等' },
      { id: crypto.randomUUID(), purpose: '财务目标(20%)', amount: income * 0.2, category: 'other', note: '针对性储蓄，如购房首付、教育金等特定目标' },
      { id: crypto.randomUUID(), purpose: '储蓄投资(10%)', amount: income * 0.1, category: 'investment', note: '长期理财增值，为退休或财务自由做准备' },
    ]
  },
  '70/20/10法则': {
    title: '70/20/10法则',
    description: '一种较为激进的理财方法，强调更大比例的当期生活支出和享受。70%用于生活开支，20%用于储蓄，10%用于投资或捐赠。',
    suitableFor: '适合高收入人群、年轻人、追求当下生活品质者',
    allocations: (income: number) => [
      { id: crypto.randomUUID(), purpose: '生活开支(70%)', amount: income * 0.7, category: 'housing', note: '所有日常生活开支，包括住房、食品、交通、娱乐等' },
      { id: crypto.randomUUID(), purpose: '储蓄目标(20%)', amount: income * 0.2, category: 'saving', note: '短期和中期储蓄，包括应急基金和阶段性目标' },
      { id: crypto.randomUUID(), purpose: '投资/捐赠(10%)', amount: income * 0.1, category: 'investment', note: '长期投资或回馈社会的捐赠支出' },
    ]
  },
  '六罐法则': {
    title: '六罐法则',
    description: '源自《小狗钱钱》的理财方法，将收入分为六个"罐子"，分别用于不同目的。注重长期财务安全和生活品质的平衡。',
    suitableFor: '适合家庭理财、长期稳健规划、有多元理财需求者',
    allocations: (income: number) => [
      { id: crypto.randomUUID(), purpose: '生活必需(55%)', amount: income * 0.55, category: 'housing', note: '日常生活的必要开支，如住房、食品、基本服装等' },
      { id: crypto.randomUUID(), purpose: '教育投资(10%)', amount: income * 0.1, category: 'education', note: '用于自我提升和学习的支出，包括书籍、课程等' },
      { id: crypto.randomUUID(), purpose: '储蓄备用(10%)', amount: income * 0.1, category: 'saving', note: '应急基金，以应对突发情况' },
      { id: crypto.randomUUID(), purpose: '享受生活(10%)', amount: income * 0.1, category: 'entertainment', note: '提升生活品质的支出，如旅行、娱乐等' },
      { id: crypto.randomUUID(), purpose: '长期投资(10%)', amount: income * 0.1, category: 'investment', note: '用于长期财富增值的投资' },
      { id: crypto.randomUUID(), purpose: '慷慨捐赠(5%)', amount: income * 0.05, category: 'other', note: '回馈社会的慈善捐款' },
    ]
  },
  '创业启动期': {
    title: '创业启动期预算',
    description: '适合刚开始创业的个人，平衡生活必需与创业投入，保持安全缓冲金',
    suitableFor: '副业创业者、独立创业者、刚离职创业的个人',
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: '房租水电',
        amount: income * 0.25,
        category: 'housing',
        manualGroup: 'life_essential'
      },
      {
        id: crypto.randomUUID(),
        purpose: '日常餐饮',
        amount: income * 0.15,
        category: 'food',
        manualGroup: 'life_essential'
      },
      {
        id: crypto.randomUUID(),
        purpose: '产品开发',
        amount: income * 0.20,
        category: 'housing',
        manualGroup: 'startup_cost'
      },
      {
        id: crypto.randomUUID(),
        purpose: '设备工具',
        amount: income * 0.10,
        category: 'transport',
        manualGroup: 'startup_cost'
      },
      {
        id: crypto.randomUUID(),
        purpose: '技能学习',
        amount: income * 0.15,
        category: 'education',
        manualGroup: 'skill_growth'
      },
      {
        id: crypto.randomUUID(),
        purpose: '应急储备',
        amount: income * 0.10,
        category: 'saving',
        manualGroup: 'safety_net'
      },
      {
        id: crypto.randomUUID(),
        purpose: '减压娱乐',
        amount: income * 0.05,
        category: 'entertainment',
        manualGroup: 'enjoyment'
      }
    ]
  },
  '创业成长期': {
    title: '创业成长期预算',
    description: '适合已有稳定收入的个人创业者，平衡业务增长与个人生活质量提升',
    suitableFor: '有稳定收入的个人创业者、自由职业者、小型工作室经营者',
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: '生活住房',
        amount: income * 0.20,
        category: 'housing',
        manualGroup: 'life_stability'
      },
      {
        id: crypto.randomUUID(),
        purpose: '饮食健康',
        amount: income * 0.10,
        category: 'food',
        manualGroup: 'life_stability'
      },
      {
        id: crypto.randomUUID(),
        purpose: '业务扩展',
        amount: income * 0.20,
        category: 'housing',
        manualGroup: 'business_growth'
      },
      {
        id: crypto.randomUUID(),
        purpose: '市场推广',
        amount: income * 0.15,
        category: 'transport',
        manualGroup: 'business_growth'
      },
      {
        id: crypto.randomUUID(),
        purpose: '行业社交',
        amount: income * 0.10,
        category: 'entertainment',
        manualGroup: 'networking'
      },
      {
        id: crypto.randomUUID(),
        purpose: '进修培训',
        amount: income * 0.05,
        category: 'education',
        manualGroup: 'networking'
      },
      {
        id: crypto.randomUUID(),
        purpose: '长期投资',
        amount: income * 0.08,
        category: 'investment',
        manualGroup: 'financial_planning'
      },
      {
        id: crypto.randomUUID(),
        purpose: '应急储备',
        amount: income * 0.07,
        category: 'saving',
        manualGroup: 'financial_planning'
      },
      {
        id: crypto.randomUUID(),
        purpose: '生活享受',
        amount: income * 0.05,
        category: 'entertainment',
        manualGroup: 'life_quality'
      }
    ]
  },
  '精益创业': {
    title: '精益创业模式',
    description: '基于精益创业理念，最小成本验证创业想法，延长资金跑道，适合资源有限者',
    suitableFor: '兼职创业者、bootstrapping创业者、验证创业想法阶段',
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: '基本住房',
        amount: income * 0.25,
        category: 'housing',
        manualGroup: 'minimal_living'
      },
      {
        id: crypto.randomUUID(),
        purpose: '简单饮食',
        amount: income * 0.10,
        category: 'food',
        manualGroup: 'minimal_living'
      },
      {
        id: crypto.randomUUID(),
        purpose: '原型开发',
        amount: income * 0.20,
        category: 'housing',
        manualGroup: 'mvp_development'
      },
      {
        id: crypto.randomUUID(),
        purpose: '测试设备',
        amount: income * 0.10,
        category: 'transport',
        manualGroup: 'mvp_development'
      },
      {
        id: crypto.randomUUID(),
        purpose: '专业学习',
        amount: income * 0.10,
        category: 'education',
        manualGroup: 'learning_testing'
      },
      {
        id: crypto.randomUUID(),
        purpose: '用户测试',
        amount: income * 0.10,
        category: 'entertainment',
        manualGroup: 'learning_testing'
      },
      {
        id: crypto.randomUUID(),
        purpose: '生存储备',
        amount: income * 0.15,
        category: 'saving',
        manualGroup: 'runway_buffer'
      }
    ]
  },
};

// 添加EmptyPlaceholder组件
interface EmptyPlaceholderProps {
  children: React.ReactNode;
}

const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({ children }) => {
  return (
    <div className="flex justify-center items-center p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
      {children}
    </div>
  );
};

function App() {
  // 状态
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(() => {
    const saved = localStorage.getItem('monthlyData');
    return saved ? JSON.parse(saved) : {};
  });
  const [categories, setCategories] = useState<typeof CATEGORIES>(() => {
    const savedCategories = localStorage.getItem('userCategories');
    return savedCategories ? JSON.parse(savedCategories) : CATEGORIES;
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'income' | 'balance' | 'combined'>('income');
  // 修改布局控制状态，增加'side'选项
  const [chartLayout, setChartLayout] = useState<'top' | 'bottom' | 'side'>('top');
  const [activeTab, setActiveTab] = useState<'budget' | 'reports' | 'categories' | 'templates' | 'settings'>('budget');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const currentMonthKey = format(selectedDate, 'yyyy-MM');
  const currentMonthData = monthlyData[currentMonthKey] || { income: 0, allocations: [] };

  useEffect(() => {
    // 计算分类占比数据
    if (currentMonthData.allocations.length > 0) {
      // 计算分组支出
      calculateGroupExpenses();
    }

    // 同步template状态
    setActiveTemplate(currentMonthData.activeTemplate || null);
  }, [currentMonthData]);

  // 导航相关
  const navigate = useNavigate();

  const updateMonthData = (data: MonthData) => {
    const newMonthlyData = {
      ...monthlyData,
      [currentMonthKey]: data,
    };
    setMonthlyData(newMonthlyData);
    localStorage.setItem('monthlyData', JSON.stringify(newMonthlyData));
  };

  // 修改收入输入框及相关处理函数
  const handleIncomeChange = (value: string) => {
    // 移除所有非数字字符，获取纯数字值
    const numericValue = value.replace(/[^\d]/g, '');

    // 更新月度数据
    updateMonthData({
      ...currentMonthData,
      income: numericValue ? Number(numericValue) : 0,
    });
  };

  // 格式化数字显示，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const addAllocation = () => {
    updateMonthData({
      ...currentMonthData,
      allocations: [
        ...currentMonthData.allocations,
        {
          id: crypto.randomUUID(),
          purpose: '',
          amount: 0,
        },
      ],
    });
  };

  const updateAllocation = (id: string, field: keyof Allocation, value: string | number) => {
    updateMonthData({
      ...currentMonthData,
      allocations: currentMonthData.allocations.map((allocation) =>
        allocation.id === id ? { ...allocation, [field]: value } : allocation
      ),
    });
  };

  const removeAllocation = (id: string) => {
    updateMonthData({
      ...currentMonthData,
      allocations: currentMonthData.allocations.filter((allocation) => allocation.id !== id),
    });
  };

  const handleMonthChange = (offset: number) => {
    const newDate = offset > 0 ? addMonths(selectedDate, offset) : subMonths(selectedDate, Math.abs(offset));
    setSelectedDate(newDate);

    // 获取新月份数据
    const newMonthKey = format(newDate, 'yyyy-MM');
    const newMonthData = monthlyData[newMonthKey] || { income: 0, allocations: [] };

    // 同步更新 activeTemplate 状态
    setActiveTemplate(newMonthData.activeTemplate || null);
  };

  const applyTemplate = (templateName: string) => {
    const template = TEMPLATES[templateName];
    if (template) {
      // 更新活动模板，同时保存到月份数据中
      setActiveTemplate(templateName);

      // 应用模板前添加过渡效果
      const container = document.querySelector('.allocations-table-container');
      if (container) {
        container.classList.add('apply-template-animation');
        setTimeout(() => {
          container.classList.remove('apply-template-animation');
        }, 1000);
      }

      updateMonthData({
        ...currentMonthData,
        allocations: template.allocations(currentMonthData.income),
        activeTemplate: templateName, // 保存到月份数据
      });

      // 显示应用成功的提示
      toast({
        title: `✅ 已应用"${template.title}"模板`,
        description: `${template.description.substring(0, 60)}...`,
        duration: 3000,
      });
    }
  };

  const totalAllocated = currentMonthData.allocations.reduce(
    (sum, allocation) => sum + allocation.amount,
    0
  );
  const balance = currentMonthData.income - totalAllocated;

  const totalBalance = Object.values(monthlyData).reduce(
    (sum, data) => sum + (data.income - data.allocations.reduce((a, b) => a + b.amount, 0)),
    0
  );

  // 为图表准备数据
  const monthlyBalanceData = Object.entries(monthlyData)
    .map(([month, data]) => {
      const monthBalance = data.income - data.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      return {
        month: format(new Date(month + '-01'), 'yyyy年MM月'),
        balance: monthBalance,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // 只显示最近6个月

  // 根据当前月份的分类统计支出
  const categoryData = useMemo(() => {
    if (!currentMonthData.allocations.length) return [];
    
    const data: { [key: string]: { name: string; value: number; color: string } } = {};
    
    currentMonthData.allocations.forEach(alloc => {
      if (alloc.category) {
        const category = categories.find(c => c.id === alloc.category);
        if (category) {
          if (data[category.id]) {
            data[category.id].value += alloc.amount;
          } else {
            data[category.id] = {
              name: category.name,
              value: alloc.amount,
              color: category.color
            };
          }
        }
      } else {
        // 如果没有分类，归入"未分类"
        if (data['uncategorized']) {
          data['uncategorized'].value += alloc.amount;
        } else {
          data['uncategorized'] = {
            name: '未分类',
            value: alloc.amount,
            color: '#94a3b8'
          };
        }
      }
    });
    
    // 将对象转换为数组
    return Object.values(data);
  }, [currentMonthData.allocations, categories]);

  // 保存分类到状态和本地存储
  const saveCategories = (newCategories: typeof CATEGORIES) => {
    setCategories(newCategories);
    localStorage.setItem('categories', JSON.stringify(newCategories));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newCategory = {
      id: newId,
      name: newCategoryName.trim(),
      color: newCategoryColor
    };

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const removeCategory = (id: string) => {
    const updatedCategories = categories.filter(category => category.id !== id);
    saveCategories(updatedCategories);
  };

  useEffect(() => {
    const handleCategorySelection = (value: string, allocationId: string) => {
      if (value === 'manage_categories') {
        setIsAddingCategory(true);
        const allocation = currentMonthData.allocations.find(a => a.id === allocationId);
        if (allocation) {
          updateAllocation(allocationId, 'category', allocation.category || '');
        }
      }
    };
  }, []);

  // 计算各组支出比例和超支状态
  const calculateGroupExpenses = () => {
    if (!activeTemplate || !TEMPLATE_GROUPS[activeTemplate]) {
      return [];
    }

    const groups = TEMPLATE_GROUPS[activeTemplate];
    const result = groups.map(group => {
      // 计算该组中所有分配项的支出总和，优先考虑手动分配的组
      const totalExpense = currentMonthData.allocations
        .filter(alloc => 
            // 如果有手动分配的组，就使用它
          (alloc.manualGroup === group.id) || 
            // 否则使用自动分配的组（通过分类）
          (!alloc.manualGroup && group.categories.includes(alloc.category || ''))
        )
        .reduce((sum, alloc) => sum + alloc.amount, 0);

      // 计算占总收入的比例
      const percentage = currentMonthData.income > 0 
          ? (totalExpense / currentMonthData.income) * 100
          : 0;

      // 判断是否超支
      const isExceeding = percentage > group.recommendedPercentage;

      return {
        ...group,
        totalExpense,
        actualPercentage: percentage,
        isExceeding
      };
    });

    return result;
  };

  // 获取计算结果
  const groupExpenses = calculateGroupExpenses();

  // 获取一个分配项所属的分类组
  const getAllocationGroup = (allocation: Allocation) => {
    // 如果存在手动分配的组ID，直接返回对应组
    if (allocation.manualGroup && activeTemplate && TEMPLATE_GROUPS[activeTemplate]) {
      const groups = TEMPLATE_GROUPS[activeTemplate];
      const manualGroup = groups.find(group => group.id === allocation.manualGroup);
      if (manualGroup) return manualGroup;
    }

    // 否则使用自动分配的组
    if (!activeTemplate || !TEMPLATE_GROUPS[activeTemplate]) {
      return null;
    }

    const groups = TEMPLATE_GROUPS[activeTemplate];
    return groups.find(group => group.categories.includes(allocation.category || '')) || null;
  };

  // 添加手动更新分组的方法
  const updateAllocationGroup = (id: string, groupId: string) => {
    const updatedAllocations = currentMonthData.allocations.map(allocation => {
        if (allocation.id === id) {
          return {
            ...allocation,
          manualGroup: groupId === "auto" ? undefined : groupId // 如果是 "auto" 则清除手动组
          };
        }
        return allocation;
    });

    updateMonthData({
      ...currentMonthData,
      allocations: updatedAllocations,
    });
  };

  // 添加calculateTotalAllocated函数
  const calculateTotalAllocated = () => {
    if (!currentMonthData || !currentMonthData.allocations) return 0;
    return currentMonthData.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  };

  // 计算各分类的分配数据
  const calculateCategoryData = () => {
    return categories.map(category => {
      // 找出属于该分类的分配项
      const allocations = currentMonthData.allocations.filter(
        alloc => alloc.category === category.id
      );
      
      // 计算该分类的总分配金额
      const amount = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      
      // 计算占总收入的百分比
      const percentage = currentMonthData.income > 0 
        ? (amount / currentMonthData.income) * 100 
        : 0;
      
      return {
        ...category,
        amount,
        percentage,
        allocations,
        value: amount // 为饼图提供value属性
      };
    });
  };

  // 计算各分组的数据
  const calculateGroupData = () => {
    if (!activeTemplate || !TEMPLATE_GROUPS[activeTemplate]) {
      return [];
    }
    
    const groups = TEMPLATE_GROUPS[activeTemplate];
    
    return groups.map(group => {
      // 收集该组下所有分类的分配项
      let groupAllocations = [];
      
      // 1. 直接通过manualGroup属性标记的属于此组的分配项
      const manualGrouped = currentMonthData.allocations.filter(
        alloc => alloc.manualGroup === group.id
      );
      groupAllocations = groupAllocations.concat(manualGrouped);
      
      // 2. 通过分类间接属于此组的分配项（排除已经手动分组的）
      const categoryGrouped = currentMonthData.allocations.filter(
        alloc => 
          !alloc.manualGroup && // 未手动分组
          alloc.category && // 有分类
          group.categories.includes(alloc.category) // 分类属于此组
      );
      groupAllocations = groupAllocations.concat(categoryGrouped);
      
      // 计算该组的总分配金额
      const amount = groupAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      
      // 计算占总收入的百分比
      const percentage = currentMonthData.income > 0 
        ? (amount / currentMonthData.income) * 100 
        : 0;
      
      return {
        ...group,
        amount,
        percentage,
        allocations: groupAllocations
      };
    });
  };

  // 修改饼图标签渲染函数，使其更清晰
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.4; // 增加半径，让标签更远离饼图
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // 只显示大于5%的标签，避免拥挤
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{
          filter: 'drop-shadow(0px 1px 1px rgba(255,255,255,0.8))',
          fontWeight: 500,
        }}
      >
        {`${name}: ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // 修复自定义图例渲染函数，确保颜色正确显示
  const renderCustomLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center items-center gap-3 mt-0 pb-3"> {/* 恢复原始顶部边距设置 */}
        {payload.map((entry: any, index: number) => {
          // 查找匹配的分类项，并获取颜色
          const dataItem = categoryData.find(d => d.name === entry.value);
          const color = dataItem ? dataItem.color : colorPalette[index % colorPalette.length];
          
          return (
            <div 
              key={`legend-${index}`} 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-xs shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-gray-700 dark:text-gray-200">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-indigo-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto px-6 md:px-10 py-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent"
            >
              月度收入规划
            </motion.h1>
            <p className="text-muted-foreground">规划和追踪您的月度收入分配</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange(-1)}
              className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl h-12 w-14 flex items-center justify-center border border-blue-200 dark:border-blue-800"
            >
              <ChevronLeftIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                    'w-[240px] justify-start text-left font-medium bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all rounded-xl h-12 border border-blue-200 dark:border-blue-800',
                  !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                {selectedDate ? format(selectedDate, 'yyyy年 MM月', { locale: zhCN }) : <span>选择月份</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                  defaultMonth={selectedDate}
                locale={zhCN}
                initialFocus
              />
            </PopoverContent>
          </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange(1)}
              className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 shadow-md hover:shadow-lg hover:scale-105 transition-all rounded-xl h-12 w-14 flex items-center justify-center border border-blue-200 dark:border-blue-800"
            >
              <ChevronRightIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
        </div>

        {/* 顶部信息卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 月度收入卡片 */}
          <Card className="shadow-lg hover:shadow-xl transition-all transform hover:scale-102 rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-blue-500" />
                月度收入
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <div>
                <Label htmlFor="income" className="text-sm font-medium">
                    {format(selectedDate, "yyyy年 MM月", { locale: zhCN })}收入
                  </Label>
                  <div className="relative mt-2 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                      <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                        ¥
                      </span>
                    </div>
                  <Input
                    id="income"
                    type="text"
                      value={
                        currentMonthData.income
                          ? formatNumber(currentMonthData.income)
                          : ""
                      }
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    placeholder="请输入月收入"
                      className="pl-8 h-12 text-lg rounded-xl border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 shadow-md group-hover:shadow-lg dark:shadow-gray-900/30 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80"
                  />
                  </div>
                </div>
            </CardContent>
          </Card>

          {/* 月度结余卡片 */}
          <Card
            className={cn(
              "shadow-lg transition-all transform hover:scale-102 rounded-2xl overflow-hidden",
              balance >= 0 ? "border-green-500" : "border-red-500",
              "border-2",
            )}
          >
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                月度结余
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">收入：</span>
                  <span>￥{currentMonthData.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">已分配：</span>
                  <span>￥{totalAllocated.toLocaleString()}</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>结余：</span>
                  <motion.span
                    key={balance}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className={
                      balance >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    ￥{balance.toLocaleString()}
                  </motion.span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 总结余卡片 */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <PiggyBankIcon className="h-5 w-5 text-green-500" />
                总结余
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="text-3xl font-bold text-center text-green-600">
                <motion.div
                  key={totalBalance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                ￥{totalBalance.toLocaleString()}
                </motion.div>
              </div>
              <p className="text-center text-muted-foreground text-sm mt-2">
                所有月份累计结余
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 收入分配区域 */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden">
            <CardHeader className="border-b">
                  <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                      <PiggyBankIcon className="h-5 w-5 text-green-500" />
                      收入分配
                </CardTitle>
                    <div className="flex gap-2 items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 flex items-center gap-1 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                          >
                            <LayoutTemplateIcon className="h-4 w-4 text-blue-500" />
                            使用模板
                    </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[420px] p-0 shadow-xl rounded-xl border border-blue-200 dark:border-blue-800">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 border-b border-blue-100 dark:border-blue-800">
                            <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <LayoutTemplateIcon className="h-4 w-4" />
                              选择预算模板
                            </h4>
                            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                              选择适合您当前财务状况的预算分配方案
                            </p>
                          </div>
                          <div className="max-h-[500px] overflow-y-auto p-3">
                            <div className="grid gap-3">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-1">个人理财</div>
                              <div className="grid grid-cols-1 gap-2">
                            {['50/30/20法则', '零基预算法', '4321预算法', '70/20/10法则', '六罐法则'].map((key) => {
                                  const template = TEMPLATES[key];
                                  return (
                                    <Card
                                      key={key}
                                      className="overflow-hidden transition-all hover:shadow-md cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
                                      onClick={() => {
                                        applyTemplate(key);
                                        toast({
                                          title: "✅ 应用成功",
                                          description: `已应用"${template.title}"模板`,
                                          duration: 3000,
                                        });
                                      }}
                                    >
                                      <CardContent className="p-3">
                                        <div className="flex justify-between items-start mb-2">
                                      <div className="font-medium text-base">{template.title}</div>
                                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full whitespace-nowrap ml-2">
                                        {template.suitableFor.split('、')[0]}
                                          </span>
                                        </div>
                                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                                        <div className="space-y-1.5 mb-3">
                                      <div className="text-xs font-medium text-gray-600">适合人群:</div>
                                      <p className="text-xs text-gray-500">{template.suitableFor}</p>
                                        </div>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                                          onClick={() => {
                                            applyTemplate(key);
                                            toast({
                                              title: "✅ 应用成功",
                                              description: `已应用"${template.title}"模板`,
                                              duration: 3000,
                                            });
                                          }}
                                        >
                                          应用此模板
                                        </Button>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                  </div>

                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mt-4 mb-1">创业者专用</div>
                              <div className="grid grid-cols-1 gap-3">
                            {['创业启动期', '创业成长期', '精益创业'].map((key) => {
                                    const template = TEMPLATES[key];
                                    return (
                                      <Card
                                        key={key}
                                        className="overflow-hidden transition-all hover:shadow-lg cursor-pointer border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950"
                                        onClick={() => {
                                          applyTemplate(key);
                                          toast({
                                            title: "✅ 应用成功",
                                            description: `已应用"${template.title}"模板`,
                                            duration: 3000,
                                          });
                                        }}
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start mb-3">
                                      <div className="font-medium text-base text-indigo-700 dark:text-indigo-300">{template.title}</div>
                                            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full whitespace-nowrap ml-2">
                                        {template.suitableFor.split('、')[0]}
                                            </span>
                                          </div>
                                    <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mb-3">{template.description}</p>

                                          <div className="space-y-1.5 mb-3">
                                      <div className="text-xs font-medium text-indigo-600">主要分配:</div>
                                            <div className="grid grid-cols-2 gap-1">
                                        {template.allocations(1000).slice(0, 4).map(alloc => (
                                          <div key={alloc.id} className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            <span>{alloc.purpose}: {Math.round(alloc.amount/10)}%</span>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>

                                          <div className="space-y-1.5 mb-4">
                                      <div className="text-xs font-medium text-indigo-600">适合人群:</div>
                                      <p className="text-xs text-indigo-600/80">{template.suitableFor}</p>
                                          </div>

                                          <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                                            onClick={() => {
                                              applyTemplate(key);
                                              toast({
                                                title: "✅ 应用成功",
                                                description: `已应用"${template.title}"模板`,
                                                duration: 3000,
                                              });
                                            }}
                                          >
                                            应用此模板
                                          </Button>
                                        </CardContent>
                                      </Card>
                                    );
                            })}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                        className="h-10 flex items-center gap-1 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                          >
                        <TagIcon className="h-4 w-4 text-green-500" />
                            管理分类
                          </Button>
                        </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0">{/* 分类内容... */}</PopoverContent>
                      </Popover>

                      <Button
                    variant="default"
                    size="sm"
                        onClick={addAllocation}
                    className="h-10 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                    添加分配项
                      </Button>
                    </div>
                  </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Table className="allocations-table-container">
                    <TableHeader>
                      <TableRow>
                        <TableHead>用途</TableHead>
                        <TableHead className="w-[120px]">金额</TableHead>
                        <TableHead className="w-[120px]">分类</TableHead>
                        {activeTemplate && TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
                            <TableHead className="w-[120px]">所属组</TableHead>
                          )}
                        <TableHead>备注</TableHead>
                        <TableHead className="w-[70px] text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                      {currentMonthData.allocations.map((allocation) => (
                          <motion.tr
                                key={allocation.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                                    <TableCell>
                                      <div className="relative group">
                                        <Input
                                          value={allocation.purpose}
                                          onChange={(e) =>
                                updateAllocation(allocation.id, 'purpose', e.target.value)
                                          }
                                          placeholder="输入用途"
                                          className="w-full h-10 rounded-lg border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 shadow-sm group-hover:shadow pl-2 pr-2 placeholder-gray-400"
                                        />
                                        {!allocation.purpose && (
                                          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                                            <TagIcon className="h-4 w-4 opacity-70" />
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="relative group">
                                        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none z-10">
                                <span className="text-gray-500 dark:text-gray-400">¥</span>
                                        </div>
                                        <Input
                                          type="text"
                                value={allocation.amount ? formatNumber(allocation.amount) : ''}
                                          onChange={(e) => {
                                            // 移除非数字字符
                                  const numericValue = e.target.value.replace(/[^\d]/g, '');
                                  updateAllocation(allocation.id, 'amount', numericValue ? Number(numericValue) : 0)
                                          }}
                                          placeholder="0"
                                          className="pl-6 w-full h-10 rounded-lg border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 shadow-sm group-hover:shadow text-base"
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <UISelect
                                  value={allocation.category || ''}
                                  onValueChange={(value) => updateAllocation(allocation.id, 'category', value)}
                                        >
                                          <UISelectTrigger className="w-full h-9 border-gray-200">
                                            <UISelectValue placeholder="选择分类" />
                                          </UISelectTrigger>
                                          <UISelectContent>
                                            {categories.map((category) => (
                                      <UISelectItem key={category.id} value={category.id}>
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                                  ></div>
                                                  {category.name}
                                                </div>
                                              </UISelectItem>
                                            ))}
                                          </UISelectContent>
                                        </UISelect>
                                      </div>
                                    </TableCell>
                            {activeTemplate && TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
                                        <TableCell>
                                          <UISelect
                                            value={allocation.manualGroup || "auto"}
                                  onValueChange={(value) => updateAllocationGroup(allocation.id, value)}
                                          >
                                            <UISelectTrigger className="w-full h-9 border-gray-200">
                                              <UISelectValue>
                                                {(() => {
                                        const group = getAllocationGroup(allocation);
                                        if (!group) return <span className="text-xs text-gray-400">未分组</span>;

                                                  return (
                                          <div className="flex items-center gap-1.5">
                                                      <div
                                                        className="w-2 h-2 rounded-full"
                                              style={{ backgroundColor: group.color }}
                                                      ></div>
                                            <span className="text-xs">{group.name}</span>
                                                    </div>
                                                  );
                                                })()}
                                              </UISelectValue>
                                            </UISelectTrigger>
                                            <UISelectContent>
                                              <UISelectItem value="auto">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                        <span className="text-gray-600">使用自动分配</span>
                                      </div>
                                              </UISelectItem>
                                    {activeTemplate && TEMPLATE_GROUPS[activeTemplate].map((group) => (
                                      <UISelectItem key={group.id} value={group.id}>
                                                  <div className="flex items-center gap-2">
                                                    <div
                                                      className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: group.color }}
                                                    ></div>
                                                    {group.name}
                                                  </div>
                                                </UISelectItem>
                                              ))}
                                            </UISelectContent>
                                          </UISelect>
                                        </TableCell>
                                      )}
                                    <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="relative w-full">
                                      <Input
                              value={allocation.note || ''}
                                      readOnly
                                        placeholder="添加备注"
                                      className="w-full h-9 text-base cursor-pointer hover:bg-gray-50 truncate pr-8"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-500">编辑备注</h4>
                                    <textarea
                              value={allocation.note || ''}
                              onChange={(e) => updateAllocation(allocation.id, 'note', e.target.value)}
                                      placeholder="在此输入详细备注"
                                      className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                      autoFocus
                                    />
                                    
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button
                                        variant="outline" 
                                          size="sm"
                                        onClick={() => updateAllocation(allocation.id, 'note', '')}
                                        className="text-gray-500"
                                      >
                                        清空
                                      </Button>
                                      <Button 
                                        size="sm"
                                        className="bg-blue-500 hover:bg-blue-600 text-white"
                                        onClick={() => document.body.click()} // 关闭弹窗
                                      >
                                        确定
                                        </Button>
                                      </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                                    </TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => removeAllocation(allocation.id)}
                              variant="outline" 
                              size="icon"
                              className="h-9 w-9 rounded-full bg-red-50 hover:bg-red-100 text-red-500 border-red-200 hover:border-red-300 transition-colors shadow-sm hover:shadow"
                              title="删除此项"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </Button>
                          </TableCell>
                          </motion.tr>
                      ))}
                      </AnimatePresence>
                          </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-6 px-6">
              {/* 删除以下grid和所有三个统计部分 */}
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-blue-500" />
                    分类占比
                  </h3>
                  {currentMonthData.allocations && currentMonthData.allocations.length > 0 ? (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData.filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            labelLine={true}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                          />
                          <RechartsTooltip 
                            formatter={(value, name, props) => [
                              `¥${formatNumber(value)}`, 
                              props.payload.name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-gray-400 italic">
                      暂无分配数据
                    </div>
                  )}
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-indigo-500" />
                    分类金额
                  </h3>
                  {currentMonthData.allocations && currentMonthData.allocations.length > 0 ? (
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categories.map(cat => ({
                          name: cat.name.substring(0, 4), // 缩短名称以适应显示
                          value: currentMonthData.allocations
                            .filter(a => a.category === cat.id)
                            .reduce((sum, a) => sum + (a.amount || 0), 0),
                          color: cat.color
                        })).filter(item => item.value > 0)}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {categories.map((cat) => (
                              <Cell key={cat.id} fill={cat.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] flex items-center justify-center text-gray-400 italic">
                      暂无分配数据
                    </div>
                  )}
                  </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                    <ActivityIcon className="h-4 w-4 text-green-500" />
                    分配统计
                  </h3>
                  <div className="space-y-3">
                    {currentMonthData.allocations && currentMonthData.allocations.length > 0 ? (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">已分配金额</span>
                            <span className="text-sm font-medium">
                              {formatNumber(currentMonthData.allocations.reduce((sum, a) => sum + (a.amount || 0), 0))}
                            </span>
                  </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500" 
                              style={{
                                width: `${Math.min(100, (currentMonthData.allocations.reduce((sum, a) => sum + (a.amount || 0), 0) / currentMonthData.income) * 100)}%`,
                              }}
                            ></div>
                  </div>
                          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                            <span>
                              已分配 {((currentMonthData.allocations.reduce((sum, a) => sum + (a.amount || 0), 0) / currentMonthData.income) * 100).toFixed(1)}%
                            </span>
                            <span>
                              收入 {formatNumber(currentMonthData.income)}
                            </span>
                </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">剩余未分配</div>
                            <div className="flex items-end gap-1">
                              <span className="text-lg font-medium">
                                {formatNumber(currentMonthData.income - currentMonthData.allocations.reduce((sum, a) => sum + (a.amount || 0), 0))}
                              </span>
                              <span className="text-xs text-gray-500 mb-0.5">
                                ({((currentMonthData.income - currentMonthData.allocations.reduce((sum, a) => sum + (a.amount || 0), 0)) / currentMonthData.income * 100).toFixed(1)}%)
                              </span>
                </div>
          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">分配项数</div>
                            <div className="flex items-end gap-1">
                              <span className="text-lg font-medium">{currentMonthData.allocations.length}</span>
                              <span className="text-xs text-gray-500 mb-0.5">项</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-[180px] flex items-center justify-center text-gray-400 italic">
                        暂无分配数据
                      </div>
                    )}
                  </div>
                </div>
              </div> */}
            </CardFooter>
            </Card>
        </div>

        {/* 添加两个表格区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 mt-4"> {/* 减少顶部外边距 */}
          {/* 支出分类占比表 */}
                  <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="shadow-lg hover:shadow-xl transition-all rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden bg-white dark:bg-gray-800 relative mt-2" // 移除额外的pt-6
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 -right-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 -left-20 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl"></div>
              <div 
                className="absolute top-1/4 left-1/3 w-5 h-5 rounded-full bg-blue-500/20 blur-sm"
                style={{ 
                  animation: 'floatingBubble 15s ease-in-out infinite',
                }}
              ></div>
              <div 
                className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-cyan-400/20 blur-sm"
                style={{ 
                  animation: 'floatingBubble 20s ease-in-out infinite 1s',
                }}
              ></div>
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes floatingBubble {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-10px, 15px); }
                    50% { transform: translate(15px, 25px); }
                    75% { transform: translate(10px, -15px); }
                  }
                  
                  /* 移除所有饼图相关元素的轮廓 */
                  .recharts-wrapper,
                  .recharts-surface,
                  .recharts-layer,
                  .recharts-pie,
                  .recharts-pie-sector,
                  .recharts-sector {
                    outline: none !important;
                  }
                `
              }} />
        </div>

            <div className="backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border-b px-6 py-4 flex items-center justify-between relative z-10"> {/* 增加py-6上下内边距 */}
        <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <animated.div
                  style={useReactSpring({
                    from: { transform: 'perspective(500px) rotateY(0deg)' },
                    to: async (next) => {
                      while (true) {
                        await next({ transform: 'perspective(500px) rotateY(15deg)' });
                        await next({ transform: 'perspective(500px) rotateY(-15deg)' });
                        await next({ transform: 'perspective(500px) rotateY(0deg)' });
                        await new Promise(resolve => setTimeout(resolve, 3000));
                      }
                    },
                  })}
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg"
                >
                  <PieChartIcon className="h-5 w-5 text-white" />
                </animated.div>
                <div>
                  <motion.h2 
                    className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    支出分类占比
                  </motion.h2>
                  <motion.p 
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    了解您的消费模式
                  </motion.p>
                </div>
              </motion.div>
            </div>
            
            <div className="p-4 md:p-6 relative z-10"> {/* 增加顶部内边距 */}
              {currentMonthData.allocations && currentMonthData.allocations.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="h-[550px] relative" // 恢复原来的内边距，只增加容器高度
                >
                  {/* 3D转动饼图 */}
                  <animated.div 
                    className="h-full w-full"
                    style={useReactSpring({
                      from: { transform: 'perspective(1000px) rotateX(10deg)' },
                      to: { transform: 'perspective(1000px) rotateX(0deg)' },
                      config: { tension: 100, friction: 30 },
                    })}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 80, right: 20, bottom: 20, left: 20 }}> {/* 增加顶部边距 */}
                        <defs>
                          {categoryData.filter(item => item.value > 0).map((entry, index) => {
                            // 确保使用正确的颜色
                            const color = entry.color || colorPalette[index % colorPalette.length];
                            return (
                              <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0.65}/>
                          </linearGradient>
                            );
                          })}
                        </defs>
                        <Pie
                          data={categoryData.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%" // 保持饼图在容器中间
                          innerRadius={window.innerWidth < 768 ? 35 : 50}
                          outerRadius={window.innerWidth < 768 ? 90 : 120}
                          paddingAngle={3}
                          dataKey="value"
                          labelLine={true}
                          label={renderCustomizedLabel}
                          animationBegin={200}
                          animationDuration={1500}
                          animationEasing="ease-out"
                          isAnimationActive={true}
                        >
                          {categoryData.filter(item => item.value > 0).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                              fill={`url(#colorGradient-${index})`} 
                              stroke="rgba(255,255,255,0.5)"
                              strokeWidth={2}
                              className="hover:opacity-90 cursor-pointer transition-opacity focus:outline-none"
                              style={{
                                filter: 'drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.15))',
                              }}
                              tabIndex={-1} // 防止获取焦点，避免出现黑框
                              onClick={() => {
                                toast({
                                  title: entry.name,
                                  description: `占比: ${(entry.value / calculateTotalAllocated() * 100).toFixed(1)}%, 金额: ¥${formatNumber(entry.value)}`,
                                  duration: 3000
                                });
                              }}
                            />
                          ))}
                        </Pie>
                        
                        <Legend 
                          verticalAlign="bottom" 
                          layout="horizontal" 
                          align="center"
                          content={renderCustomLegend}
                          wrapperStyle={{ paddingTop: '0px' }} // 恢复原来的内边距
                        />
                        
                        <RechartsTooltip 
                          formatter={(value, name, props) => [
                            `¥${formatNumber(value)}`, 
                            `${props.payload.name}`
                          ]}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '10px',
                            border: 'none',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                            padding: '10px 14px',
                          }}
                          itemStyle={{ color: '#4b5563', fontWeight: 500 }}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '5px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </animated.div>
                  
                  {/* 添加饼图下方的支出信息面板 */}
                  <div className="mt-12 flex flex-col items-center"> {/* 增加上边距，使信息卡片下移 */}
                    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-md border border-blue-100 dark:border-blue-900">
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">总支出</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          ¥{formatNumber(calculateTotalAllocated())}
                        </p>
                      </div>
                      <div className="h-10 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">分配比例</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {(calculateTotalAllocated() / currentMonthData.income * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="h-10 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">分配项</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {currentMonthData.allocations.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <motion.div
                      className="mb-4 inline-block"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 4
                      }}
                    >
                      <div className="relative">
                        <PieChartIcon className="h-20 w-20 text-gray-200 dark:text-gray-700" />
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-100/20 to-transparent rounded-full blur-lg"></div>
                      </div>
                    </motion.div>
                    <p className="mb-5 text-lg">暂无分配数据</p>
                    <animated.div
                      style={useReactSpring({
                        from: { transform: 'translateY(0px)' },
                        to: async (next) => {
                          while (true) {
                            await next({ transform: 'translateY(-5px)' });
                            await next({ transform: 'translateY(0px)' });
                            await new Promise(resolve => setTimeout(resolve, 1000));
                          }
                        },
                        config: { tension: 200, friction: 20 },
                      })}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addAllocation}
                        className="h-10 flex items-center gap-1 border-blue-200 dark:border-blue-800 shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 hover:shadow-lg transition-all"
                      >
                        <PlusIcon className="h-4 w-4 text-blue-500" />
                        添加分配项
                      </Button>
                    </animated.div>
                  </div>
                </div>
                                  )}
                                </div>
          </motion.div>

          {/* 创业启动期预算分析 - 美化版 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden shadow-xl bg-white dark:bg-gray-800"
          >
            <div className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-b px-6 py-4 flex items-center justify-between">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  <BarChart2 className="h-5 w-5 text-white" />
                                </div>
                <div>
                  <motion.h2 
                    className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {activeTemplate ? `${activeTemplate}` : '预算分析'}
                  </motion.h2>
                  <motion.p 
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    合理分配是成功的关键
                  </motion.p>
                              </div>
              </motion.div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl flex items-center gap-1 shadow-sm border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 transition-all"
                  >
                    <LayoutTemplateIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">预算模板</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-1 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 mb-2">选择预算模板</p>
                    {Object.keys(TEMPLATES).map(templateName => (
                      <Button
                        key={templateName}
                        variant="ghost"
                        onClick={() => applyTemplate(templateName)}
                        className={`w-full justify-start text-left h-9 px-2 ${
                          activeTemplate === templateName ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : ''
                        }`}
                      >
                        <span className="text-sm">{templateName}</span>
                        {activeTemplate === templateName && (
                          <CheckIcon className="h-4 w-4 ml-auto text-blue-600" />
                        )}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
                              </div>

            <div className="p-6">
              {activeTemplate && groupExpenses && groupExpenses.length > 0 ? (
                <div className="space-y-8">
                  {groupExpenses.map((group, index) => (
                    <motion.div 
                      key={group.id} 
                      className="group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                    >
                      <div className="flex items-center mb-2 gap-3">
                        {/* 左侧彩色装饰 */}
                        <motion.div 
                          className="relative"
                          initial={{ scale: 0.8, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            delay: 0.2 * index,
                            duration: 1,
                            repeat: group.isExceeding ? Infinity : 0,
                            repeatType: "reverse",
                            repeatDelay: 2
                          }}
                        >
                          <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: group.color, opacity: 0.2 }}></div>
                          <div 
                            className="h-8 w-8 rounded-lg absolute top-0 left-0 right-0 bottom-0 m-auto"
                                            style={{
                                              backgroundColor: group.color,
                              opacity: 0.7,
                              transform: 'scale(0.7)',
                                            }}
                                          ></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
                            {group.name === '生活必需' && <LifeBuoyIcon className="h-4 w-4" />}
                            {group.name === '创业投入' && <FlameIcon className="h-4 w-4" />}
                            {group.name === '财务目标' && <TargetIcon className="h-4 w-4" />}
                            {group.name === '未来发展' && <ZapIcon className="h-4 w-4" />}
                            {group.name === '享受生活' && <AwardIcon className="h-4 w-4" />}
                                        </div>
                        </motion.div>
                        
                        {/* 标题和数据 */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium flex items-center">
                              {group.name}
                              {group.isExceeding && (
                                <motion.span 
                                  className="ml-2 px-1.5 py-0.5 text-2xs bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400 rounded-md flex items-center gap-1"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.3 * index }}
                                >
                                  <AlertTriangleIcon className="h-2.5 w-2.5" />
                                  超支
                                </motion.span>
                              )}
                            </h3>
                            <div className="text-lg font-bold" style={{ color: group.isExceeding ? '#ef4444' : '#0891b2' }}>
                              ¥{formatNumber(group.totalExpense)}
                            </div>
                            </div>
                            
                          {/* 动态进度条 */}
                          <div className="mt-2 relative h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            {/* 推荐比例指示线 */}
                            <motion.div
                              className="absolute h-full w-px bg-gray-400 dark:bg-gray-500 z-10" 
                              style={{ left: `${group.recommendedPercentage}%` }}
                              initial={{ height: 0 }}
                              animate={{ height: '100%' }}
                              transition={{ delay: 0.4 * index, duration: 0.3 }}
                            >
                              <div className="absolute -top-0.5 -left-1 h-3.5 w-2 bg-gray-400 dark:bg-gray-500 rounded-sm"></div>
                            </motion.div>
                            
                            {/* 进度条 */}
                            <motion.div 
                              className="h-full rounded-full relative overflow-hidden"
                              style={{ 
                                backgroundColor: group.isExceeding ? '#ef4444' : '#0891b2',
                                width: `${Math.min(100, group.actualPercentage)}%`,
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, group.actualPercentage)}%` }}
                              transition={{ delay: 0.5 * index, duration: 0.7, ease: "easeOut" }}
                            >
                              {/* 流动效果 */}
                              <motion.div 
                                className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ 
                                  x: ['-100%', '200%'], 
                                }}
                                transition={{ 
                                  repeat: Infinity,
                                  repeatType: "loop",
                                  duration: 2.5,
                                  ease: "linear",
                                }}
                              />
                            </motion.div>
                            </div>
                            
                          {/* 详细指标 */}
                          <div className="flex justify-between mt-1 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500">实际:</span>
                              <span className="font-medium" style={{ color: group.isExceeding ? '#ef4444' : '#0891b2' }}>
                                {group.actualPercentage.toFixed(1)}%
                              </span>
                              {group.isExceeding && (
                                <motion.span
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                  <TrendingUpIcon className="h-3 w-3 text-red-500" />
                                </motion.span>
                              )}
                              {!group.isExceeding && group.actualPercentage > (group.recommendedPercentage * 0.8) && (
                                <motion.span
                                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                >
                                  <CheckIcon className="h-3 w-3 text-green-500" />
                                </motion.span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500">推荐:</span>
                              <span className="font-medium text-blue-600">{group.recommendedPercentage}%</span>
                          </div>
                        </div>
                      </div>
                          </div>

                      {/* 可展开项目列表 - 添加折叠功能 */}
                      <div className="ml-11 mt-2">
                        {/* 可点击展开按钮 */}
                        <Collapsible>
                          <CollapsibleTrigger asChild>
                          <Button
                              variant="ghost" 
                            size="sm"
                              className="h-7 px-2 text-xs w-full justify-between rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 group"
                          >
                              <span className="font-medium text-gray-600 dark:text-gray-300">查看详细项目 ({currentMonthData.allocations.filter(a => getAllocationGroup(a)?.id === group.id).length}项)</span>
                              <ChevronDown className="h-3.5 w-3.5 text-gray-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                          </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="overflow-hidden">
                            <div className="pt-2 space-y-1.5">
                              {/* 筛选出属于该分组的分配项 */}
                              {currentMonthData.allocations
                                .filter(a => getAllocationGroup(a)?.id === group.id)
                                .map(allocation => {
                                  // 计算该项目占组总金额的比例
                                  const ratio = group.totalExpense ? (allocation.amount / group.totalExpense) * 100 : 0;
                                  // 找到分配项的分类信息
                                  const category = categories.find(c => c.id === allocation.category);
                                  
                                  return (
                                    <motion.div
                                      key={allocation.id}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex items-center justify-between py-2 px-3 rounded-md bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700"
                                    >
                    <div className="flex items-center gap-2">
                                        {/* 分类色块标识 - 替换为对应的图标 */}
                                        <div 
                                          className="w-6 h-6 rounded-full flex items-center justify-center"
                                          style={{ backgroundColor: category?.color || group.color, opacity: 0.9 }}
                                        >
                                          {category?.name.includes('房') || allocation.purpose.includes('房') ? (
                                            <HomeIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('餐') || allocation.purpose.includes('餐') ? (
                                            <UtensilsIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('交通') || allocation.purpose.includes('交通') ? (
                                            <CarIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('设备') || allocation.purpose.includes('设备') ? (
                                            <WrenchIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('开发') || allocation.purpose.includes('开发') ? (
                                            <CodeIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('学习') || allocation.purpose.includes('学习') ||
                                              category?.name.includes('技能') || allocation.purpose.includes('技能') ||
                                              category?.name.includes('能力') || allocation.purpose.includes('能力') ||
                                              group.name === '能力提升' ? (
                                            <GraduationCapIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('储蓄') || allocation.purpose.includes('储蓄') ||
                                              category?.name.includes('应急') || allocation.purpose.includes('应急') ||
                                              category?.name.includes('备用') || allocation.purpose.includes('备用') ||
                                              category?.name.includes('安全') || allocation.purpose.includes('安全') ||
                                              group.name === '安全缓冲' ? (
                                            <ShieldIcon className="h-3 w-3 text-white" />
                                          ) : category?.name.includes('享受') || allocation.purpose.includes('享受') ||
                                              category?.name.includes('娱乐') || allocation.purpose.includes('娱乐') ||
                                              category?.name.includes('休闲') || allocation.purpose.includes('休闲') ||
                                              group.name === '生活享受' ? (
                                            <CoffeeIcon className="h-3 w-3 text-white" />
                                          ) : (
                                            <CircleDotIcon className="h-3 w-3 text-white" />
                                          )}
                                        </div>
                                        
                                        {/* 项目名称及分类 */}
                                        <div>
                                          <div className="font-medium text-sm">{allocation.purpose}</div>
                                          {category && (
                                            <div className="text-xs text-gray-500">{category.name}</div>
                                          )}
                      </div>
                    </div>
                                      
                                      {/* 金额及占比 */}
                                      <div className="flex flex-col items-end">
                                        <div className="text-sm font-medium">¥{formatNumber(allocation.amount)}</div>
                                        <div className="text-xs text-gray-500">{ratio.toFixed(1)}%</div>
                  </div>
                                    </motion.div>
                                  );
                                })}
                                
                              {/* 如果没有项目，显示提示信息 */}
                              {currentMonthData.allocations.filter(a => getAllocationGroup(a)?.id === group.id).length === 0 && (
                                <div className="py-6 flex flex-col items-center justify-center text-gray-400 text-sm">
                                  <DollarSignIcon className="h-8 w-8 mb-2 text-gray-300" />
                                  <p>该分组暂无分配项</p>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                      
                      {/* 卡片式描述 */}
                      <motion.div 
                        className="ml-11 relative overflow-hidden bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-indigo-900/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 mt-2 group-hover:shadow-md transition-all"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.6 * index, duration: 0.4 }}
                      >
                        {/* 装饰元素 */}
                        <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50"></div>
                        <div className="absolute right-8 -bottom-4 h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 opacity-30"></div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 relative z-10">
                          {group.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                  
                  {/* 总体状态指示器 */}
                  <motion.div 
                    className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900 shadow-inner"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* 脉冲动画 */}
                      <motion.div 
                        className="relative h-10 w-10 flex-shrink-0"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2
                        }}
                      >
                        <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20"></div>
                        <div className="absolute inset-1 bg-blue-500 rounded-full opacity-40"></div>
                        <div className="absolute inset-2 bg-blue-600 rounded-full opacity-60"></div>
                        <div className="absolute inset-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <SparklesIcon className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">预算健康评分</h3>
                        <div className="flex items-center gap-2">
                          <motion.div 
                            className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                          >
                            {Math.floor(78 - (groupExpenses.filter(g => g.isExceeding).length * 15))}
                          </motion.div>
                          <span className="text-gray-500">/</span>
                          <span className="text-gray-500">100</span>
                          
                          {groupExpenses.some(g => g.isExceeding) ? (
                            <div className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded text-xs font-medium">
                              需要优化
                            </div>
                          ) : (
                            <div className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                              良好
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-50 dark:border-blue-900/50 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">已分配总额</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ¥{formatNumber(calculateTotalAllocated())}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-50 dark:border-blue-900/50 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">超支分类数</div>
                        <div className="text-lg font-bold text-orange-500 dark:text-orange-400">
                          {groupExpenses.filter(g => g.isExceeding).length}/{groupExpenses.length}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-50 dark:border-blue-900/50 shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">总体状态</div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {groupExpenses.filter(g => g.isExceeding).length > 1 
                            ? '需要调整' 
                            : groupExpenses.filter(g => g.isExceeding).length === 1 
                              ? '基本平衡' 
                              : '非常理想'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <motion.div 
                  className="h-[400px] flex flex-col items-center justify-center text-gray-400 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="relative mb-6"
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, -5, 0, 5, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 5
                    }}
                  >
                    <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                      <LayoutTemplateIcon className="h-12 w-12 text-blue-300 dark:text-blue-700" />
                    </div>
                    <motion.div 
                      className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                    >
                      <SparklesIcon className="h-4 w-4 text-yellow-400 dark:text-yellow-600" />
                    </motion.div>
                  </motion.div>

                  <motion.p 
                    className="text-center mb-3 text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    选择预算模板以查看智能分析
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 flex items-center gap-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:shadow-md transition-all"
                      onClick={() => document.querySelector('[class*="PopoverTrigger"]') && (document.querySelector('[class*="PopoverTrigger"]') as HTMLElement).click()}
                    >
                      <LayoutTemplateIcon className="h-4 w-4 text-blue-500" />
                      选择预算模板
                      <ChevronRightIcon className="h-3 w-3 text-blue-400 ml-1" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
                  </div>
          </motion.div>
        </div>
      </motion.div>

      {/* 回到顶部按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl z-50 border border-blue-300"
        aria-label="回到顶部"
      >
        <ChevronUpIcon className="h-5 w-5" />
      </motion.button>

      {/* 设置按钮 */}
      <Dialog>
        <DialogTrigger asChild>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            className="fixed bottom-20 right-6 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl z-50 border border-indigo-300"
            aria-label="设置"
          >
            <SettingsIcon className="h-5 w-5" />
          </motion.button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <SettingsIcon className="h-5 w-5 text-indigo-500" />
              设置
            </DialogTitle>
            <DialogDescription>
              导出或导入您的预算数据，避免数据丢失
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-indigo-100 dark:border-indigo-900 overflow-hidden bg-indigo-50 dark:bg-indigo-950 p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <DownloadIcon className="h-4 w-4 text-indigo-500" />
                导出数据
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                将您<span className="text-indigo-600 font-medium">所有月份</span>的预算数据保存为JSON文件，以便备份或转移到其他设备
              </p>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  // 准备导出数据
                  const exportData = {
                    monthlyData: monthlyData, // 导出所有月份数据
                    categories: categories,
                    exportDate: new Date().toISOString()
                  };

                  // 转换为JSON字符串
                  const jsonData = JSON.stringify(exportData, null, 2);

                  // 创建Blob对象
                  const blob = new Blob([jsonData], { type: 'application/json' });

                  // 创建URL
                  const url = URL.createObjectURL(blob);

                  // 创建下载链接
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `完整预算数据_${format(new Date(), 'yyyy-MM-dd')}.json`;
                  document.body.appendChild(a);
                  a.click();

                  // 清理
                  URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  // 显示成功提示
                  toast({
                    title: "✅ 导出成功",
                    description: `已导出${Object.keys(monthlyData).length}个月的预算数据`,
                    duration: 3000,
                  });
                }}
              >
                导出所有数据（{Object.keys(monthlyData).length}个月）
              </Button>
    </div>

            <div className="rounded-lg border border-indigo-100 dark:border-indigo-900 overflow-hidden bg-indigo-50 dark:bg-indigo-950 p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                <UploadIcon className="h-4 w-4 text-indigo-500" />
                导入数据
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                从之前导出的JSON文件中恢复预算数据
              </p>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-lg p-6 text-center bg-indigo-50/50 dark:bg-indigo-900/20">
                  <input
                    type="file"
                    id="importFile"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      // 检查是否有文件
                      if (!e.target.files || e.target.files.length === 0) {
                        return;
                      }

                      const file = e.target.files[0];
                      const reader = new FileReader();

                      reader.onload = (event) => {
                        try {
                          // 解析JSON
                          const data = JSON.parse(event.target?.result as string);

                          // 基本验证
                          if (!data.monthlyData || !data.categories) {
                            throw new Error('无效的数据格式');
                          }

                          // 确认导入
                          if (confirm(`此操作将导入${Object.keys(data.monthlyData).length}个月的数据并覆盖当前数据，确定要导入吗？`)) {
                            // 更新状态和本地存储
                            setMonthlyData(data.monthlyData);
                            setCategories(data.categories);
                            localStorage.setItem('monthlyData', JSON.stringify(data.monthlyData));
                            localStorage.setItem('userCategories', JSON.stringify(data.categories));

                            // 显示成功提示
                            toast({
                              title: "✅ 导入成功",
                              description: `已导入${Object.keys(data.monthlyData).length}个月的预算数据`,
                              duration: 3000,
                            });
                          }
                        } catch (error) {
                          // 显示错误提示
                          toast({
                            title: "❌ 导入失败",
                            description: "数据格式无效或已损坏",
                            duration: 5000,
                          });

                          console.error('Import error:', error);
                        }

                        // 重置文件输入
                        e.target.value = '';
                      };

                      reader.readAsText(file);
                    }}
                  />
                  <label
                    htmlFor="importFile"
                    className="cursor-pointer flex flex-col items-center justify-center gap-3 py-4"
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
                      <UploadIcon className="h-7 w-7" />
                    </div>
                    <span className="text-base font-medium text-indigo-600 dark:text-indigo-300">点击选择JSON文件</span>
                    <span className="text-xs text-gray-500">或拖放文件到此处</span>
                  </label>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    导入将覆盖当前所有数据。请确保导入文件是之前通过本应用导出的有效备份。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" className="w-full">关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加Toast容器到应用中 */}
      <ToastContainer />
    </div>
  );
}

export default App;

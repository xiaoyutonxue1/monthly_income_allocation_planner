import React, { useEffect, useState } from "react";
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
  ComposedChart,
  Sector
} from "recharts";
import {
  BarChart3Icon,
  CheckCircleIcon,
  PlusIcon,
  SettingsIcon,
  PieChartIcon,
  LayoutDashboardIcon,
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  LayoutIcon,
  AlertCircleIcon,
  Trash2Icon,
  WalletIcon,
  PiggyBankIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutTemplateIcon,
  ChevronUpIcon,
  CheckIcon,
  DownloadIcon,
  UploadIcon,
  TagIcon,
  FolderOpenIcon,
  XIcon,
  DollarSignIcon,
  ActivityIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addMonths, subMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, ToastContainer } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { BudgetProgressBar } from "./progress-bar";
import { CopyIcon, HamburgerMenuIcon, MagnifyingGlassIcon, Cross2Icon, StarIcon, PlusCircledIcon, RocketIcon, PersonIcon } from "@radix-ui/react-icons";
import { ChevronDownIcon, ExclamationTriangleIcon, FileTextIcon, BookmarkIcon, BellIcon, InfoCircledIcon } from "@radix-ui/react-icons";

interface Allocation {
  id: string;
  purpose: string;
  amount: number;
  category?: string;
  note?: string;
  manualGroup?: string;
}

interface MonthData {
  income: number;
  allocations: Allocation[];
  activeTemplate?: string;
}

// 定义分类
const CATEGORIES = [
  { id: "housing", name: "住房", color: "#4f46e5" },
  { id: "food", name: "餐饮", color: "#16a34a" },
  { id: "transport", name: "交通", color: "#facc15" },
  { id: "entertainment", name: "娱乐", color: "#f97316" },
  { id: "shopping", name: "购物", color: "#3b82f6" },
  { id: "medical", name: "医疗", color: "#06b6d4" },
  { id: "education", name: "教育", color: "#eab308" },
  { id: "saving", name: "储蓄", color: "#6366f1" },
  { id: "investment", name: "投资", color: "#14b8a6" },
  { id: "other", name: "其他", color: "#64748b" },
];

const colorPalette = [
  "#3b82f6", // 蓝色
  "#22c55e", // 绿色
  "#f59e0b", // 黄色
  "#ef4444", // 红色
  "#8b5cf6", // 紫色
  "#ec4899", // 粉色
  "#06b6d4", // 青色
  "#14b8a6", // 蓝绿色
  "#f97316", // 橙色
  "#6366f1", // 靛蓝色
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
  六罐法则: [
    {
      id: "necessities",
      name: "生活必需",
      color: "#16a34a",
      categories: ["housing", "food", "transport", "medical"],
      recommendedPercentage: 55,
      description: "日常生活的必要开支，如住房、食品、基本交通和医疗",
    },
    {
      id: "education",
      name: "教育投资",
      color: "#eab308",
      categories: ["education"],
      recommendedPercentage: 10,
      description: "用于自我提升和学习的支出，包括书籍、课程等",
    },
    {
      id: "savings",
      name: "储蓄备用",
      color: "#3b82f6",
      categories: ["saving"],
      recommendedPercentage: 10,
      description: "应急基金，以应对突发情况",
    },
    {
      id: "enjoyment",
      name: "享受生活",
      color: "#f97316",
      categories: ["entertainment"],
      recommendedPercentage: 10,
      description: "提升生活品质的支出，如旅行、爱好、娱乐等",
    },
    {
      id: "investment",
      name: "长期投资",
      color: "#6366f1",
      categories: ["investment"],
      recommendedPercentage: 10,
      description: "用于长期财富增值的投资",
    },
    {
      id: "generosity",
      name: "慷慨捐赠",
      color: "#ec4899",
      categories: ["other"],
      recommendedPercentage: 5,
      description: "回馈社会的慈善捐款",
    },
  ],

  "50/30/20法则": [
    {
      id: "necessities",
      name: "必要开支",
      color: "#16a34a",
      categories: ["housing", "food", "transport", "medical"],
      recommendedPercentage: 50,
      description: "生活必需品，包括房租/房贷、水电、食品、基本交通等",
    },
    {
      id: "personal",
      name: "个人支出",
      color: "#f97316",
      categories: ["entertainment", "education", "other"],
      recommendedPercentage: 30,
      description: "提升生活品质的支出，包括娱乐、购物、餐厅等非必需品",
    },
    {
      id: "financial",
      name: "储蓄投资",
      color: "#3b82f6",
      categories: ["saving", "investment"],
      recommendedPercentage: 20,
      description: "为未来做准备，包括应急基金、债务偿还和投资",
    },
  ],

  "4321预算法": [
    {
      id: "basicLiving",
      name: "基本生活",
      color: "#16a34a",
      categories: ["housing", "food", "transport", "medical"],
      recommendedPercentage: 40,
      description: "基础生活必需品，包括住房、餐饮、基本服装等",
    },
    {
      id: "discretionary",
      name: "自由支配",
      color: "#f97316",
      categories: ["entertainment", "other"],
      recommendedPercentage: 30,
      description: "个人享受和提升生活品质的支出，如娱乐、旅行等",
    },
    {
      id: "financialGoals",
      name: "财务目标",
      color: "#eab308",
      categories: ["saving", "education"],
      recommendedPercentage: 20,
      description: "针对性储蓄，如购房首付、教育金等特定目标",
    },
    {
      id: "investment",
      name: "储蓄投资",
      color: "#6366f1",
      categories: ["investment"],
      recommendedPercentage: 10,
      description: "长期理财增值，为退休或财务自由做准备",
    },
  ],

  零基预算法: [],
  "70/20/10法则": [],
  创业启动期: [
    {
      id: "life_essential",
      name: "生活必需",
      color: "#16a34a", // 绿色
      categories: ["housing", "food"],
      recommendedPercentage: 40,
      description: "维持基本生活所需的必要开支，如房租、食品等基本生活成本",
    },
    {
      id: "startup_cost",
      name: "创业投入",
      color: "#0891b2", // 青蓝色
      categories: ["transport", "housing"],
      recommendedPercentage: 30,
      description: "直接投入创业项目的资金，包括产品开发、设备购买等",
    },
    {
      id: "skill_growth",
      name: "能力提升",
      color: "#9333ea", // 紫色
      categories: ["education"],
      recommendedPercentage: 15,
      description: "提升自身技能和知识的投资，如学习课程、专业书籍等",
    },
    {
      id: "safety_net",
      name: "安全缓冲",
      color: "#f97316", // 橙色
      categories: ["saving"],
      recommendedPercentage: 10,
      description: "应对不确定性的现金储备，推荐维持至少3个月的生活费",
    },
    {
      id: "enjoyment",
      name: "生活享受",
      color: "#ec4899", // 粉色
      categories: ["entertainment"],
      recommendedPercentage: 5,
      description: "保持生活平衡和心理健康的小额享受，避免创业疲劳",
    },
  ],
  创业成长期: [
    {
      id: "life_stability",
      name: "生活稳定",
      color: "#16a34a", // 绿色
      categories: ["housing", "food"],
      recommendedPercentage: 30,
      description: "稳定的生活保障，随着收入增长可适当提高生活质量",
    },
    {
      id: "business_growth",
      name: "业务扩展",
      color: "#0891b2", // 青蓝色
      categories: ["transport", "housing"],
      recommendedPercentage: 35,
      description: "扩大业务规模的资金，包括市场营销、团队扩充等",
    },
    {
      id: "networking",
      name: "人脉资源",
      color: "#9333ea", // 紫色
      categories: ["entertainment", "education"],
      recommendedPercentage: 15,
      description: "行业交流、客户维护等关系建设的投入",
    },
    {
      id: "financial_planning",
      name: "财务规划",
      color: "#f97316", // 橙色
      categories: ["saving", "investment"],
      recommendedPercentage: 15,
      description: "长期资产配置和财富增值，为个人财务自由做准备",
    },
    {
      id: "life_quality",
      name: "生活品质",
      color: "#ec4899", // 粉色
      categories: ["entertainment", "other"],
      recommendedPercentage: 5,
      description: "提升生活品质，保持创业动力和工作生活平衡",
    },
  ],
  精益创业: [
    {
      id: "minimal_living",
      name: "极简生活",
      color: "#16a34a", // 绿色
      categories: ["housing", "food"],
      recommendedPercentage: 35,
      description: "将生活成本控制在最低水平，延长资金燃烧周期",
    },
    {
      id: "mvp_development",
      name: "最小验证",
      color: "#0891b2", // 青蓝色
      categories: ["housing", "transport"],
      recommendedPercentage: 30,
      description: "开发最小可行产品(MVP)所需的最低投入",
    },
    {
      id: "learning_testing",
      name: "学习测试",
      color: "#9333ea", // 紫色
      categories: ["education", "entertainment"],
      recommendedPercentage: 20,
      description: "持续学习和市场验证的投入，收集用户反馈",
    },
    {
      id: "runway_buffer",
      name: "生存缓冲",
      color: "#f97316", // 橙色
      categories: ["saving"],
      recommendedPercentage: 15,
      description: "确保基本生活的应急资金，至少6个月的基本开支",
    },
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
  "50/30/20法则": {
    title: "50/30/20法则",
    description:
      "由美国参议员Elizabeth Warren推广的经典预算法则，将收入分为三大类：必要开支、个人支出和储蓄/投资。简单易行，适合大多数人作为起点。",
    suitableFor: "适合初次预算、稳定收入人群、工薪阶层",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "必要支出",
        amount: income * 0.5,
        category: "housing",
        note: "生活必需品，包括房租/房贷、水电、食品、基本交通和基础医疗等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "个人支出",
        amount: income * 0.3,
        category: "entertainment",
        note: "提升生活品质的支出，包括娱乐、购物、餐厅、旅行等非必需品",
      },
      {
        id: crypto.randomUUID(),
        purpose: "储蓄与投资",
        amount: income * 0.2,
        category: "saving",
        note: "为未来做准备，包括应急基金、退休储蓄、债务偿还和投资增值",
      },
    ],
  },
  零基预算法: {
    title: "零基预算法",
    description:
      '以"收入-支出=零"为原则的精细预算方法，要求为每一分钱安排归属。强调根据本月实际情况灵活规划，适合需要严格控制支出的人群。',
    suitableFor: "适合财务精细化管理、不稳定收入人群、需要还债人群",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "住房费用",
        amount: 0,
        category: "housing",
        note: "房租/房贷、物业费、水电气网费等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "日常餐饮",
        amount: 0,
        category: "food",
        note: "日常三餐、食材购买等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "交通出行",
        amount: 0,
        category: "transport",
        note: "公共交通、油费、车辆维护等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "医疗健康",
        amount: 0,
        category: "medical",
        note: "医疗保险、门诊费用、药品等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "个人消费",
        amount: 0,
        category: "entertainment",
        note: "娱乐、爱好、外出就餐等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "紧急备用",
        amount: 0,
        category: "saving",
        note: "应急基金，建议3-6个月生活费",
      },
      {
        id: crypto.randomUUID(),
        purpose: "未来投资",
        amount: 0,
        category: "investment",
        note: "退休金、股票、基金等投资",
      },
      {
        id: crypto.randomUUID(),
        purpose: "债务偿还",
        amount: 0,
        category: "other",
        note: "信用卡、贷款等债务的还款",
      },
    ],
  },
  "4321预算法": {
    title: "4321预算法",
    description:
      "简单易记的收入分配策略，将收入按比例分为四大块：40%基本生活、30%自由支配、20%财务目标、10%储蓄投资。平衡了必要支出与个人所需。",
    suitableFor: "适合平衡稳健型人群、初次理财人士",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "基本生活(40%)",
        amount: income * 0.4,
        category: "housing",
        note: "基础生活必需品，包括住房、餐饮、基本服装等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "自由支配(30%)",
        amount: income * 0.3,
        category: "entertainment",
        note: "个人享受和提升生活品质的支出，如娱乐、旅行等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "财务目标(20%)",
        amount: income * 0.2,
        category: "other",
        note: "针对性储蓄，如购房首付、教育金等特定目标",
      },
      {
        id: crypto.randomUUID(),
        purpose: "储蓄投资(10%)",
        amount: income * 0.1,
        category: "investment",
        note: "长期理财增值，为退休或财务自由做准备",
      },
    ],
  },
  "70/20/10法则": {
    title: "70/20/10法则",
    description:
      "一种较为激进的理财方法，强调更大比例的当期生活支出和享受。70%用于生活开支，20%用于储蓄，10%用于投资或捐赠。",
    suitableFor: "适合高收入人群、年轻人、追求当下生活品质者",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "生活开支(70%)",
        amount: income * 0.7,
        category: "housing",
        note: "所有日常生活开支，包括住房、食品、交通、娱乐等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "储蓄目标(20%)",
        amount: income * 0.2,
        category: "saving",
        note: "短期和中期储蓄，包括应急基金和阶段性目标",
      },
      {
        id: crypto.randomUUID(),
        purpose: "投资/捐赠(10%)",
        amount: income * 0.1,
        category: "investment",
        note: "长期投资或回馈社会的捐赠支出",
      },
    ],
  },
  六罐法则: {
    title: "六罐法则",
    description:
      '源自《小狗钱钱》的理财方法，将收入分为六个"罐子"，分别用于不同目的。注重长期财务安全和生活品质的平衡。',
    suitableFor: "适合家庭理财、长期稳健规划、有多元理财需求者",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "生活必需(55%)",
        amount: income * 0.55,
        category: "housing",
        note: "日常生活的必要开支，如住房、食品、基本服装等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "教育投资(10%)",
        amount: income * 0.1,
        category: "education",
        note: "用于自我提升和学习的支出，包括书籍、课程等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "储蓄备用(10%)",
        amount: income * 0.1,
        category: "saving",
        note: "应急基金，以应对突发情况",
      },
      {
        id: crypto.randomUUID(),
        purpose: "享受生活(10%)",
        amount: income * 0.1,
        category: "entertainment",
        note: "提升生活品质的支出，如旅行、娱乐等",
      },
      {
        id: crypto.randomUUID(),
        purpose: "长期投资(10%)",
        amount: income * 0.1,
        category: "investment",
        note: "用于长期财富增值的投资",
      },
      {
        id: crypto.randomUUID(),
        purpose: "慷慨捐赠(5%)",
        amount: income * 0.05,
        category: "other",
        note: "回馈社会的慈善捐款",
      },
    ],
  },
  创业启动期: {
    title: "创业启动期预算",
    description: "适合刚开始创业的个人，平衡生活必需与创业投入，保持安全缓冲金",
    suitableFor: "副业创业者、独立创业者、刚离职创业的个人",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "房租水电",
        amount: income * 0.25,
        category: "housing",
        manualGroup: "life_essential",
      },
      {
        id: crypto.randomUUID(),
        purpose: "日常餐饮",
        amount: income * 0.15,
        category: "food",
        manualGroup: "life_essential",
      },
      {
        id: crypto.randomUUID(),
        purpose: "产品开发",
        amount: income * 0.2,
        category: "housing",
        manualGroup: "startup_cost",
      },
      {
        id: crypto.randomUUID(),
        purpose: "设备工具",
        amount: income * 0.1,
        category: "transport",
        manualGroup: "startup_cost",
      },
      {
        id: crypto.randomUUID(),
        purpose: "技能学习",
        amount: income * 0.15,
        category: "education",
        manualGroup: "skill_growth",
      },
      {
        id: crypto.randomUUID(),
        purpose: "应急储备",
        amount: income * 0.1,
        category: "saving",
        manualGroup: "safety_net",
      },
      {
        id: crypto.randomUUID(),
        purpose: "减压娱乐",
        amount: income * 0.05,
        category: "entertainment",
        manualGroup: "enjoyment",
      },
    ],
  },
  创业成长期: {
    title: "创业成长期预算",
    description: "适合已有稳定收入的个人创业者，平衡业务增长与个人生活质量提升",
    suitableFor: "有稳定收入的个人创业者、自由职业者、小型工作室经营者",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "生活住房",
        amount: income * 0.2,
        category: "housing",
        manualGroup: "life_stability",
      },
      {
        id: crypto.randomUUID(),
        purpose: "饮食健康",
        amount: income * 0.1,
        category: "food",
        manualGroup: "life_stability",
      },
      {
        id: crypto.randomUUID(),
        purpose: "业务扩展",
        amount: income * 0.2,
        category: "housing",
        manualGroup: "business_growth",
      },
      {
        id: crypto.randomUUID(),
        purpose: "市场推广",
        amount: income * 0.15,
        category: "transport",
        manualGroup: "business_growth",
      },
      {
        id: crypto.randomUUID(),
        purpose: "行业社交",
        amount: income * 0.1,
        category: "entertainment",
        manualGroup: "networking",
      },
      {
        id: crypto.randomUUID(),
        purpose: "进修培训",
        amount: income * 0.05,
        category: "education",
        manualGroup: "networking",
      },
      {
        id: crypto.randomUUID(),
        purpose: "长期投资",
        amount: income * 0.08,
        category: "investment",
        manualGroup: "financial_planning",
      },
      {
        id: crypto.randomUUID(),
        purpose: "应急储备",
        amount: income * 0.07,
        category: "saving",
        manualGroup: "financial_planning",
      },
      {
        id: crypto.randomUUID(),
        purpose: "生活享受",
        amount: income * 0.05,
        category: "entertainment",
        manualGroup: "life_quality",
      },
    ],
  },
  精益创业: {
    title: "精益创业模式",
    description:
      "基于精益创业理念，最小成本验证创业想法，延长资金跑道，适合资源有限者",
    suitableFor: "兼职创业者、bootstrapping创业者、验证创业想法阶段",
    allocations: (income: number) => [
      {
        id: crypto.randomUUID(),
        purpose: "基本住房",
        amount: income * 0.25,
        category: "housing",
        manualGroup: "minimal_living",
      },
      {
        id: crypto.randomUUID(),
        purpose: "简单饮食",
        amount: income * 0.1,
        category: "food",
        manualGroup: "minimal_living",
      },
      {
        id: crypto.randomUUID(),
        purpose: "原型开发",
        amount: income * 0.2,
        category: "housing",
        manualGroup: "mvp_development",
      },
      {
        id: crypto.randomUUID(),
        purpose: "测试设备",
        amount: income * 0.1,
        category: "transport",
        manualGroup: "mvp_development",
      },
      {
        id: crypto.randomUUID(),
        purpose: "专业学习",
        amount: income * 0.1,
        category: "education",
        manualGroup: "learning_testing",
      },
      {
        id: crypto.randomUUID(),
        purpose: "用户测试",
        amount: income * 0.1,
        category: "entertainment",
        manualGroup: "learning_testing",
      },
      {
        id: crypto.randomUUID(),
        purpose: "生存储备",
        amount: income * 0.15,
        category: "saving",
        manualGroup: "runway_buffer",
      },
    ],
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
  const [monthlyData, setMonthlyData] = useState<Record<string, MonthData>>(
    () => {
      const saved = localStorage.getItem("monthlyData");
    return saved ? JSON.parse(saved) : {};
    },
  );
  const [categories, setCategories] = useState<typeof CATEGORIES>(() => {
    const savedCategories = localStorage.getItem("userCategories");
    return savedCategories ? JSON.parse(savedCategories) : CATEGORIES;
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"income" | "balance" | "combined">(
    "income",
  );
  // 修改布局控制状态，增加'side'选项
  // const [chartLayout, setChartLayout] = useState<"top" | "bottom" | "side">(
  //   "bottom",
  // );
  const [activeTab, setActiveTab] = useState<
    "budget" | "reports" | "categories" | "templates" | "settings"
  >("budget");
  const [categoryData, setCategoryData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);

  const currentMonthKey = format(selectedDate, "yyyy-MM");
  const currentMonthData = monthlyData[currentMonthKey] || {
    income: 0,
    allocations: [],
  };

  useEffect(() => {
    if (currentMonthData) {
      // 根据支出计算分类数据
      const categoryTotals: Record<string, number> = {};

      currentMonthData.allocations.forEach((alloc) => {
        if (alloc.category) {
          categoryTotals[alloc.category] =
            (categoryTotals[alloc.category] || 0) + alloc.amount;
        }
      });

      const newCategoryData = categories
        .map((category) => {
          const totalAmount = categoryTotals[category.id] || 0;
          return {
            name: category.name,
            value: totalAmount,
            color: category.color,
          };
        })
        .filter((item) => item.value > 0);

      setCategoryData(newCategoryData);

      // 计算分组支出
      calculateGroupExpenses();
    }

    // 同步template状态
    setActiveTemplate(currentMonthData.activeTemplate || null);
  }, [currentMonthData, categories]);

  // 导航相关
  //const navigate = useNavigate();

  const updateMonthData = (data: MonthData) => {
    const newMonthlyData = {
      ...monthlyData,
      [currentMonthKey]: data,
    };
    setMonthlyData(newMonthlyData);
    localStorage.setItem("monthlyData", JSON.stringify(newMonthlyData));
  };

  // 修改收入输入框及相关处理函数
  const handleIncomeChange = (value: string) => {
    // 移除所有非数字字符，获取纯数字值
    const numericValue = value.replace(/[^\d]/g, "");

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
          purpose: "",
          amount: 0,
        },
      ],
    });
  };

  const updateAllocation = (
    id: string,
    field: keyof Allocation,
    value: string | number,
  ) => {
    updateMonthData({
      ...currentMonthData,
      allocations: currentMonthData.allocations.map((allocation) =>
        allocation.id === id ? { ...allocation, [field]: value } : allocation,
      ),
    });
  };

  const removeAllocation = (id: string) => {
    updateMonthData({
      ...currentMonthData,
      allocations: currentMonthData.allocations.filter(
        (allocation) => allocation.id !== id,
      ),
    });
  };

  const handleMonthChange = (offset: number) => {
    const newDate =
      offset > 0
        ? addMonths(selectedDate, offset)
        : subMonths(selectedDate, Math.abs(offset));
    setSelectedDate(newDate);

    // 获取新月份数据
    const newMonthKey = format(newDate, "yyyy-MM");
    const newMonthData = monthlyData[newMonthKey] || {
      income: 0,
      allocations: [],
    };

    // 同步更新 activeTemplate 状态
    setActiveTemplate(newMonthData.activeTemplate || null);
  };

  const applyTemplate = (templateName: string) => {
    const template = TEMPLATES[templateName];
    if (template) {
      // 更新活动模板，同时保存到月份数据中
      setActiveTemplate(templateName);

      // 应用模板前添加过渡效果
      const container = document.querySelector(".allocations-table-container");
      if (container) {
        container.classList.add("apply-template-animation");
        setTimeout(() => {
          container.classList.remove("apply-template-animation");
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
    0,
  );
  const balance = currentMonthData.income - totalAllocated;

  const totalBalance = Object.values(monthlyData).reduce(
    (sum, data) =>
      sum + (data.income - data.allocations.reduce((a, b) => a + b.amount, 0)),
    0,
  );

  // 为图表准备数据
  const monthlyBalanceData = Object.entries(monthlyData)
    .map(([month, data]) => {
      const monthBalance =
        data.income -
        data.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
      return {
        month: format(new Date(month + "-01"), "yyyy年MM月"),
        balance: monthBalance,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // 只显示最近6个月

  const saveCategories = (updatedCategories: typeof CATEGORIES) => {
    setCategories(updatedCategories);
    localStorage.setItem("userCategories", JSON.stringify(updatedCategories));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newCategory = {
      id: newId,
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };

    const updatedCategories = [...categories, newCategory];
    saveCategories(updatedCategories);
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  const removeCategory = (id: string) => {
    const updatedCategories = categories.filter(
      (category) => category.id !== id,
    );
    saveCategories(updatedCategories);
  };

  useEffect(() => {
    const handleCategorySelection = (value: string, allocationId: string) => {
      if (value === "manage_categories") {
        setIsAddingCategory(true);
        const allocation = currentMonthData.allocations.find(
          (a) => a.id === allocationId,
        );
        if (allocation) {
          updateAllocation(allocationId, "category", allocation.category || "");
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
    const result = groups.map((group) => {
      // 计算该组中所有分配项的支出总和，优先考虑手动分配的组
      const totalExpense = currentMonthData.allocations
        .filter(
          (alloc) =>
            // 如果有手动分配的组，就使用它
            alloc.manualGroup === group.id ||
            // 否则使用自动分配的组（通过分类）
            (!alloc.manualGroup &&
              group.categories.includes(alloc.category || "")),
        )
        .reduce((sum, alloc) => sum + alloc.amount, 0);

      // 计算占总收入的比例
      const percentage =
        currentMonthData.income > 0
          ? (totalExpense / currentMonthData.income) * 100
          : 0;

      // 判断是否超支
      const isExceeding = percentage > group.recommendedPercentage;

      return {
        ...group,
        totalExpense,
        actualPercentage: percentage,
        isExceeding,
      };
    });

    return result;
  };

  // 获取计算结果
  const groupExpenses = calculateGroupExpenses();

  // 获取一个分配项所属的分类组
  const getAllocationGroup = (allocation: Allocation) => {
    // 如果存在手动分配的组ID，直接返回对应组
    if (
      allocation.manualGroup &&
      activeTemplate &&
      TEMPLATE_GROUPS[activeTemplate]
    ) {
      const groups = TEMPLATE_GROUPS[activeTemplate];
      const manualGroup = groups.find(
        (group) => group.id === allocation.manualGroup,
      );
      if (manualGroup) return manualGroup;
    }

    // 否则使用自动分配的组
    if (!activeTemplate || !TEMPLATE_GROUPS[activeTemplate]) {
      return null;
    }

    const groups = TEMPLATE_GROUPS[activeTemplate];
  return (
      groups.find((group) =>
        group.categories.includes(allocation.category || ""),
      ) || null
    );
  };

  // 添加手动更新分组的方法
  const updateAllocationGroup = (id: string, groupId: string) => {
    const updatedAllocations = currentMonthData.allocations.map(
      (allocation) => {
        if (allocation.id === id) {
          return {
            ...allocation,
            manualGroup: groupId === "auto" ? undefined : groupId, // 如果是 "auto" 则清除手动组
          };
        }
        return allocation;
      },
    );

    updateMonthData({
      ...currentMonthData,
      allocations: updatedAllocations,
    });
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
                    "w-[240px] justify-start text-left font-medium bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all rounded-xl h-12 border border-blue-200 dark:border-blue-800",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  {selectedDate ? (
                    format(selectedDate, "yyyy年 MM月", { locale: zhCN })
                  ) : (
                    <span>选择月份</span>
                  )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <Card className="lg:col-span-3 shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-blue-500" />
                月度收入
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4 md:space-y-6">
                <div>
                  <Label htmlFor="income" className="text-lg font-medium">
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
                      type="text" // 改为text类型以支持格式化显示
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

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <PiggyBankIcon className="h-5 w-5 text-green-500" />
                      收入分配
                    </h3>
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
                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mb-1">
                                个人理财
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {[
                                  "50/30/20法则",
                                  "零基预算法",
                                  "4321预算法",
                                  "70/20/10法则",
                                  "六罐法则",
                                ].map((key) => {
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
                                          <div className="font-medium text-base">
                                            {template.title}
                                          </div>
                                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full whitespace-nowrap ml-2">
                                            {
                                              template.suitableFor.split(
                                                "、",
                                              )[0]
                                            }
                                          </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">
                                          {template.description}
                                        </p>
                                        <div className="space-y-1.5 mb-3">
                                          <div className="text-xs font-medium text-gray-600">
                                            适合人群:
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            {template.suitableFor}
                                          </p>
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

                              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-1 mt-4 mb-1">
                                创业者专用
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {["创业启动期", "创业成长期", "精益创业"].map(
                                  (key) => {
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
                                            <div className="font-medium text-base text-indigo-700 dark:text-indigo-300">
                                              {template.title}
                                            </div>
                                            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full whitespace-nowrap ml-2">
                                              {
                                                template.suitableFor.split(
                                                  "、",
                                                )[0]
                                              }
                                            </span>
                                          </div>
                                          <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mb-3">
                                            {template.description}
                                          </p>

                                          <div className="space-y-1.5 mb-3">
                                            <div className="text-xs font-medium text-indigo-600">
                                              主要分配:
                                            </div>
                                            <div className="grid grid-cols-2 gap-1">
                                              {template
                                                .allocations(1000)
                                                .slice(0, 4)
                                                .map((alloc) => (
                                                  <div
                                                    key={alloc.id}
                                                    className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300"
                                                  >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    <span>
                                                      {alloc.purpose}:{" "}
                                                      {Math.round(
                                                        alloc.amount / 10,
                                                      )}
                                                      %
                                                    </span>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>

                                          <div className="space-y-1.5 mb-4">
                                            <div className="text-xs font-medium text-indigo-600">
                                              适合人群:
                                            </div>
                                            <p className="text-xs text-indigo-600/80">
                                              {template.suitableFor}
                                            </p>
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
                                  },
                                )}
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
                            className="h-10 flex items-center gap-1 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                          >
                            <FolderOpenIcon className="h-4 w-4 text-green-500" />
                            管理分类
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-0 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 border-b border-green-100 dark:border-green-800">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                                <FolderOpenIcon className="h-4 w-4" />
                                预算分类管理
                              </h4>
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 px-3 bg-gradient-to-r from-green-500 to-emerald-500 border-none text-white"
                                onClick={() => setIsAddingCategory(!isAddingCategory)}
                              >
                                <PlusIcon className="h-3.5 w-3.5 mr-1" />
                                添加
                              </Button>
                            </div>
                            
                            {isAddingCategory && (
                              <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={newCategoryName}
                                      onChange={(e) => setNewCategoryName(e.target.value)}
                                      placeholder="分类名称"
                                      className="h-9"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">颜色:</label>
                                    <div className="flex gap-1 flex-wrap">
                                      {colorPalette.map((color) => (
                                        <div 
                                          key={color} 
                                          className={`w-6 h-6 rounded-full cursor-pointer border-2 ${newCategoryColor === color ? 'border-blue-500' : 'border-transparent'}`}
                                          style={{ backgroundColor: color }}
                                          onClick={() => setNewCategoryColor(color)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">自定义:</label>
                                    <Input
                                      type="text"
                                      value={newCategoryColor.startsWith('#') ? newCategoryColor : `#${newCategoryColor}`}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // 确保值以#开头
                                        const colorValue = value.startsWith('#') ? value : `#${value}`;
                                        setNewCategoryColor(colorValue);
                                      }}
                                      placeholder="#000000"
                                      className="h-9 w-32"
                                    />
                                    <div 
                                      className="w-6 h-6 rounded-full border border-gray-200"
                                      style={{ backgroundColor: newCategoryColor }}
                                    />
                                  </div>
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      size="sm"
                                      onClick={addCategory}
                                      className="bg-blue-500 hover:bg-blue-600 text-white"
                                    >
                                      确认添加
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="max-h-[320px] overflow-y-auto p-2">
                            <div className="space-y-2 p-2">
                              {categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center justify-between group bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <div
                                      className="w-4 h-4 rounded-full flex-shrink-0 cursor-pointer"
                                      style={{
                                        backgroundColor: category.color,
                                      }}
                                      onClick={() => {
                                        const colors = document.getElementById(`colors-${category.id}`);
                                        if (colors) {
                                          colors.style.display = colors.style.display === 'none' ? 'flex' : 'none';
                                        }
                                      }}
                                    ></div>
                                    <input
                                      type="text"
                                      value={category.name}
                                      onChange={(e) => {
                                        const newCategories = [...categories];
                                        const index = newCategories.findIndex(
                                          (c) => c.id === category.id,
                                        );
                                        newCategories[index] = {
                                          ...newCategories[index],
                                          name: e.target.value,
                                        };
                                        saveCategories(newCategories);
                                      }}
                                      className="text-sm border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-green-500 px-1 py-0.5 rounded flex-1"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      id={`colors-${category.id}`} 
                                      className="hidden flex-wrap gap-1 p-1 bg-gray-50 dark:bg-gray-900 rounded-md absolute z-10 shadow-lg border border-gray-200 dark:border-gray-700"
                                      style={{ display: 'none' }}
                                    >
                                      {colorPalette.map((color) => (
                                        <div 
                                          key={color} 
                                          className="w-5 h-5 rounded-full cursor-pointer"
                                          style={{ backgroundColor: color }}
                                          onClick={() => {
                                            const newCategories = [...categories];
                                            const index = newCategories.findIndex((c) => c.id === category.id);
                                            newCategories[index] = {
                                              ...newCategories[index],
                                              color,
                                            };
                                            saveCategories(newCategories);
                                            const colors = document.getElementById(`colors-${category.id}`);
                                            if (colors) {
                                              colors.style.display = 'none';
                                            }
                                          }}
                                        />
                                      ))}
                                      <div className="w-full mt-1 px-1 flex items-center gap-1">
                                        <Input
                                          type="text"
                                          defaultValue={category.color}
                                          placeholder="#000000"
                                          className="h-7 text-xs"
                                          onChange={(e) => {
                                            const color = e.target.value;
                                            const newCategories = [...categories];
                                            const index = newCategories.findIndex((c) => c.id === category.id);
                                            newCategories[index] = {
                                              ...newCategories[index],
                                              color,
                                            };
                                            saveCategories(newCategories);
                                          }}
                                        />
                                        <div 
                                          className="w-5 h-5 rounded-full border border-gray-200"
                                          style={{ backgroundColor: category.color }}
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 w-7 p-0 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border-red-100"
                                      onClick={() => removeCategory(category.id)}
                                      title="删除此分类"
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button
                        onClick={addAllocation}
                        className="h-10 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-lg flex items-center gap-1.5"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>添加分配项</span>
                      </Button>
                    </div>
                  </div>

                  <Table className="allocations-table-container">
                    <TableHeader>
                      <TableRow>
                        <TableHead>用途</TableHead>
                        <TableHead className="w-[120px]">金额</TableHead>
                        <TableHead className="w-[120px]">分类</TableHead>
                        {activeTemplate &&
                          TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
                            <TableHead className="w-[120px]">所属组</TableHead>
                          )}
                        <TableHead>备注</TableHead>
                        <TableHead className="w-[70px] text-center">
                          操作
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                      {currentMonthData.allocations.map((allocation) => (
                          <motion.tr
                            key={allocation.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                          <TableCell>
                              <div className="relative group">
                            <Input
                              value={allocation.purpose}
                              onChange={(e) =>
                                    updateAllocation(
                                      allocation.id,
                                      "purpose",
                                      e.target.value,
                                    )
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
                                  <span className="text-gray-500 dark:text-gray-400">
                                    ¥
                                  </span>
                                </div>
                            <Input
                                  type="text" // 改为text类型以支持格式化显示
                                  value={
                                    allocation.amount
                                      ? formatNumber(allocation.amount)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    // 移除非数字字符
                                    const numericValue = e.target.value.replace(
                                      /[^\d]/g,
                                      "",
                                    );
                                    updateAllocation(
                                      allocation.id,
                                      "amount",
                                      numericValue ? Number(numericValue) : 0,
                                    );
                                  }}
                              placeholder="0"
                                  className="pl-6 w-full h-10 rounded-lg border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all bg-white dark:bg-gray-800 shadow-sm group-hover:shadow text-base"
                            />
                              </div>
                          </TableCell>
                          <TableCell>
                              <div className="flex gap-1">
                                <Select
                                  value={allocation.category || ""}
                                  onValueChange={(value) =>
                                    updateAllocation(
                                      allocation.id,
                                      "category",
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full h-9 border-gray-200">
                                    <SelectValue placeholder="选择分类" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem
                                        key={category.id}
                                        value={category.id}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                              backgroundColor: category.color,
                                            }}
                                          ></div>
                                          {category.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            {activeTemplate &&
                              TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
                                <TableCell>
                                  <Select
                                    value={allocation.manualGroup || "auto"}
                                    onValueChange={(value) =>
                                      updateAllocationGroup(
                                        allocation.id,
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-full h-9 border-gray-200">
                                      <SelectValue>
                                        {(() => {
                                          const group =
                                            getAllocationGroup(allocation);
                                          if (!group)
                                            return (
                                              <span className="text-xs text-gray-400">
                                                未分组
                                              </span>
                                            );

                                          return (
                                            <div className="flex items-center gap-1.5">
                                              <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                  backgroundColor: group.color,
                                                }}
                                              ></div>
                                              <span className="text-xs">
                                                {group.name}
                                              </span>
                                            </div>
                                          );
                                        })()}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="auto">
                                        <div className="flex items-center gap-2">
                                          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                          <span className="text-gray-600">
                                            使用自动分配
                                          </span>
                                        </div>
                                      </SelectItem>
                                      {activeTemplate &&
                                        TEMPLATE_GROUPS[activeTemplate].map(
                                          (group) => (
                                            <SelectItem
                                              key={group.id}
                                              value={group.id}
                                            >
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className="w-3 h-3 rounded-full"
                                                  style={{
                                                    backgroundColor:
                                                      group.color,
                                                  }}
                                                ></div>
                                                {group.name}
                                              </div>
                                            </SelectItem>
                                          ),
                                        )}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                              )}
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="relative w-full">
                            <Input
                                      value={allocation.note || ""}
                                      readOnly
                              placeholder="添加备注"
                                      className="w-full h-9 text-base cursor-pointer hover:bg-gray-50 truncate pr-8"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                      </svg>
                                    </div>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4">
                                  <div className="space-y-2">
                                    <h4 className="font-medium text-sm text-gray-500">
                                      编辑备注
                                    </h4>
                                    <textarea
                                      value={allocation.note || ""}
                                      onChange={(e) =>
                                        updateAllocation(
                                          allocation.id,
                                          "note",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="在此输入详细备注"
                                      className="w-full min-h-[100px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                      autoFocus
                                    />

                                    <div className="flex justify-end gap-2 mt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          updateAllocation(
                                            allocation.id,
                                            "note",
                                            "",
                                          )
                                        }
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
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="flex-shrink-0"
                                >
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
          </Card>

          <div className="space-y-4">
            <Card
              className={cn(
                "shadow-lg transition-all transform hover:scale-102 rounded-2xl overflow-hidden",
                balance >= 0 ? "border-green-500" : "border-red-500",
                "border-2",
              )}
            >
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5 text-blue-500" />
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
        </div>

        {/* 使用固定的底部布局 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* 主要内容区域 */}
          <div className="grid grid-cols-1 gap-4 mb-4">
            {/* 饼图和支出分析卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 当月支出分类占比 */}
              <Card className="shadow-lg rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChartIcon className="h-5 w-5 text-blue-500" />
                    支出分类占比
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 25, right: 25, bottom: 25, left: 25 }}>
                        <defs>
                          <filter id="pie-shadow" height="150%" width="150%">
                            <feOffset dx="0" dy="3" />
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feFlood floodColor="rgba(0,0,0,0.15)" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="shadow" />
                            <feComposite in="SourceGraphic" in2="shadow" operator="over" />
                          </filter>
                          <filter id="pie-hover-shadow" height="150%" width="150%">
                            <feOffset dx="0" dy="4" />
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feFlood floodColor="rgba(0,0,0,0.2)" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="shadow" />
                            <feMerge>
                              <feMergeNode in="shadow" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                          <linearGradient id="pie-3d-edge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        <Pie
                          data={
                            categoryData.length > 0
                              ? categoryData
                              : [
                                  {
                                    name: "暂无数据",
                                    value: 100,
                                    color: "#e5e7eb",
                                  },
                                ]
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={{ 
                            stroke: "#6b7280", 
                            strokeWidth: 1, 
                            strokeDasharray: "3 3",
                            opacity: 0.7
                          }}
                          label={({
                            name,
                            percent,
                            x, 
                            y,
                            cx
                          }: {
                            name: string;
                            percent: number;
                            x: number;
                            y: number;
                            cx: number;
                          }) => (
                            <g>
                              <text 
                                x={x} 
                                y={y} 
                                fill="#374151" 
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                style={{
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  textShadow: "0 1px 2px rgba(255,255,255,0.9)"
                                }}
                              >
                                {name}
                              </text>
                              <text 
                                x={x} 
                                y={y + 15} 
                                fill="#6b7280" 
                                textAnchor={x > cx ? "start" : "end"}
                                dominantBaseline="central"
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "500"
                                }}
                              >
                                {(percent * 100).toFixed(1)}%
                              </text>
                            </g>
                          )}
                          outerRadius={85}
                          innerRadius={40}
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                          cornerRadius={6}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={1800}
                          animationEasing="ease-out"
                          filter="url(#pie-shadow)"
                          activeIndex={[]}
                          activeShape={(props: {
                            cx: number;
                            cy: number;
                            innerRadius: number;
                            outerRadius: number;
                            startAngle: number;
                            endAngle: number;
                            fill: string;
                            midAngle: number;
                            percent: number;
                            value: number;
                            name: string;
                          }) => {
                            const { 
                              cx, 
                              cy, 
                              innerRadius, 
                              outerRadius, 
                              startAngle, 
                              endAngle, 
                              fill, 
                              midAngle,
                              percent,
                              value,
                              name
                            } = props;
                            
                            // 3D效果的偏移量
                            const offset = 6;
                            const sin = Math.sin(-midAngle * Math.PI / 180);
                            const cos = Math.cos(-midAngle * Math.PI / 180);
                            const sx = cx + (outerRadius + 10) * cos;
                            const sy = cy + (outerRadius + 10) * sin;
                            const ex = cx + (outerRadius + 30) * cos;
                            const ey = cy + (outerRadius + 30) * sin;
                            
                            return (
                              <g filter="url(#pie-hover-shadow)">
                                {/* 3D侧面效果 */}
                                <Sector
                                  cx={cx}
                                  cy={cy + offset}
                                  innerRadius={innerRadius - 3}
                                  outerRadius={outerRadius + 3}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill="url(#pie-3d-edge)"
                                  opacity={0.8}
                                  cornerRadius={6}
                                />
                                {/* 顶部高亮扇区 */}
                                <Sector
                                  cx={cx}
                                  cy={cy}
                                  innerRadius={innerRadius - 3}
                                  outerRadius={outerRadius + 5}
                                  startAngle={startAngle}
                                  endAngle={endAngle}
                                  fill={fill}
                                  cornerRadius={6}
                                />
                                {/* 扩展标签 */}
                                <path 
                                  d={`M${sx},${sy}L${ex},${ey}`} 
                                  stroke={fill} 
                                  strokeWidth={2} 
                                  fill="none"
                                  filter="url(#pie-shadow)"
                                />
                                <circle 
                                  cx={ex} 
                                  cy={ey} 
                                  r={4} 
                                  fill={fill} 
                                  stroke="white" 
                                  strokeWidth={1.5}
                                />
                                {/* 数据标签 */}
                                <text 
                                  x={ex + (cos > 0 ? 10 : -10)} 
                                  y={ey - 15} 
                                  textAnchor={cos > 0 ? "start" : "end"} 
                                  fill="#374151"
                                  style={{ 
                                    fontWeight: "600", 
                                    fontSize: "13px",
                                    filter: "drop-shadow(0 1px 1px white)"
                                  }}
                                >
                                  {name}
                                </text>
                                <text 
                                  x={ex + (cos > 0 ? 10 : -10)} 
                                  y={ey + 5} 
                                  textAnchor={cos > 0 ? "start" : "end"} 
                                  fill="#4b5563"
                                  style={{ 
                                    fontWeight: "500", 
                                    fontSize: "12px" 
                                  }}
                                >
                                  {`¥${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                                </text>
                              </g>
                            );
                          }}
                        >
                          {categoryData.length > 0 ? (
                            categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="#ffffff"
                                strokeWidth={3}
                              />
                            ))
                          ) : (
                            <Cell fill="#e5e7eb" stroke="#ffffff" strokeWidth={1} />
                          )}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number, name: string) => [
                            `￥${value.toLocaleString()}`,
                            `${name} (支出)`,
                          ]}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            border: "none",
                            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}
                          itemStyle={{ 
                            padding: "4px 0",
                            color: "#374151" 
                          }}
                          labelStyle={{
                            fontWeight: "600",
                            color: "#1f2937",
                            marginBottom: "6px"
                          }}
                          cursor={{ fill: "transparent" }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: "30px" }}
                          iconSize={12}
                          iconType="circle"
                          formatter={(value: string) => value}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* 预算模板支出分析 */}
              {activeTemplate && groupExpenses.length > 0 && (
                <Card className="shadow-lg rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3Icon className="h-5 w-5 text-blue-500" />
                      {TEMPLATES[activeTemplate]?.title || activeTemplate}{" "}
                      预算分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {groupExpenses.length > 0 ? (
                      <div className="space-y-6">
                        {groupExpenses.map((group) => {
                          // 获取该组内的所有分配项
                          const groupAllocations =
                            currentMonthData.allocations.filter(
                              (alloc) =>
                                alloc.manualGroup === group.id ||
                                (!alloc.manualGroup &&
                                  group.categories.includes(
                                    alloc.category || "",
                                  )),
                            );

                          return (
                            <div
                              key={group.id}
                              className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
                            >
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-4 w-4 rounded-full"
                                    style={{ backgroundColor: group.color }}
                                  ></div>
                                  <span className="font-medium text-base text-gray-800 dark:text-gray-200">
                                    {group.name}
                                  </span>
                                  {group.isExceeding && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs px-1.5 py-0 h-5 ml-2 bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                    >
                                      <AlertTriangleIcon className="h-3 w-3 mr-1" />
                                      超支
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <span
                                    className="font-bold text-base"
                                    style={{ color: group.color }}
                                  >
                                    ¥{group.totalExpense.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              <BudgetProgressBar
                                actualPercentage={group.actualPercentage}
                                recommendedPercentage={group.recommendedPercentage}
                                totalExpense={group.totalExpense}
                                color={group.color}
                                isExceeding={group.isExceeding}
                              />

                              <div
                                className="text-xs text-gray-600 dark:text-gray-400 italic mb-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border-l-2"
                                style={{ borderColor: group.color }}
                              >
                                {group.description}
                              </div>

                              {/* 显示该组内的具体支出项目 */}
                              {groupAllocations.length > 0 && (
                                <div
                                  className="mt-3 pl-2 space-y-1 bg-white/50 dark:bg-gray-800/50 rounded-lg p-2"
                                  style={{
                                    borderLeft: `3px solid ${group.color}`,
                                  }}
                                >
                                  <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 pb-1 border-b border-gray-200 dark:border-gray-700">
                                    详细支出项目
                                  </div>
                                  <div className="grid gap-1 pt-1">
                                  {groupAllocations.map((alloc) => {
                                    const percentage =
                                      currentMonthData.income > 0
                                        ? (alloc.amount /
                                            currentMonthData.income) *
                                          100
                                        : 0;
                                    return (
                                      <div
                                        key={alloc.id}
                                        className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{
                                              backgroundColor: group.color,
                                            }}
                                          ></div>
                                          <span className="font-medium truncate">
                                            {alloc.purpose}
                                          </span>
                                          {alloc.note && (
                                            <span className="text-gray-500 text-xs truncate hidden sm:inline">
                                              ({alloc.note})
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <div className="h-1.5 w-14 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                              className="h-full rounded-full"
                                              style={{
                                                width: `${Math.min(100, (percentage / group.actualPercentage) * 100)}%`,
                                                backgroundColor: group.color,
                                                backgroundImage: `linear-gradient(90deg, ${group.color}70, ${group.color})`,
                                              }}
                                            ></div>
                                          </div>
                                          <span className="text-gray-500 text-xs w-12 text-right">
                                            {percentage.toFixed(1)}%
                                          </span>
                                          <span className="font-semibold w-16 text-right">
                                            ¥{alloc.amount.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <div className="mt-6 p-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-blue-100 dark:border-blue-900 shadow-md">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
                              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <ArrowUpCircleIcon className="h-3 w-3 mr-1 text-blue-500" />
                                总收入
                              </span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                ¥{currentMonthData?.income.toLocaleString() || 0}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
                              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <ArrowDownCircleIcon className="h-3 w-3 mr-1 text-red-500" />
                                总支出
                              </span>
                              <span className="font-bold text-red-500 dark:text-red-400">
                                ¥{groupExpenses
                                  .reduce(
                                    (sum, group) => sum + group.totalExpense,
                                    0,
                                  )
                                  .toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 shadow-sm">
                              <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                                <DollarSignIcon className="h-3 w-3 mr-1 text-green-500" />
                                结余
                              </span>
                              <span
                                className={`font-bold ${(currentMonthData?.income || 0) - groupExpenses.reduce((sum, group) => sum + group.totalExpense, 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                ¥{(
                                  (currentMonthData?.income || 0) -
                                  groupExpenses.reduce(
                                    (sum, group) => sum + group.totalExpense,
                                    0,
                                  )
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <EmptyPlaceholder>
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-full mb-4">
                            <AlertCircleIcon className="h-8 w-8 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                            没有预算分析数据
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4">
                            应用模板并将您的支出分配到相应类别，以查看预算分析
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("settings")}
                          >
                            <SettingsIcon className="h-4 w-4 mr-2" />
                            前往设置
                          </Button>
                        </div>
                      </EmptyPlaceholder>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 财务趋势图 */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="shadow-lg h-full rounded-2xl border border-green-100 dark:border-green-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ActivityIcon className="h-5 w-5 text-blue-500" />
                      财务趋势分析
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChartMode("income")}
                          className={cn(
                            "rounded px-3 text-xs font-medium",
                            chartMode === "income"
                              ? "bg-white dark:bg-gray-700 shadow"
                              : "text-gray-600 hover:text-gray-900",
                          )}
                        >
                          <TrendingUpIcon className="h-4 w-4 mr-1" />
                          收入
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChartMode("balance")}
                          className={cn(
                            "rounded px-3 text-xs font-medium",
                            chartMode === "balance"
                              ? "bg-white dark:bg-gray-700 shadow"
                              : "text-gray-600 hover:text-gray-900",
                          )}
                        >
                          <BarChart3Icon className="h-4 w-4 mr-1" />
                          结余
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChartMode("combined")}
                          className={cn(
                            "rounded px-3 text-xs font-medium",
                            chartMode === "combined"
                              ? "bg-white dark:bg-gray-700 shadow"
                              : "text-gray-600 hover:text-gray-900",
                          )}
                        >
                          <ActivityIcon className="h-4 w-4 mr-1" />
                          合并
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full h-72 md:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartMode === "income" && (
                        <AreaChart
                          data={[...Array(6)].map((_, i) => {
                            const monthDate = subMonths(
                              new Date(selectedDate),
                              5 - i,
                            );
                            const key = format(monthDate, "yyyy-MM");
                            const monthData = monthlyData[key] || {
                              income: 0,
                              allocations: [],
                            };
                            return {
                              name: format(monthDate, "M月"),
                              income: monthData.income,
                            };
                          })}
                          margin={{ top: 15, right: 20, left: 20, bottom: 30 }}
                        >
                          <defs>
                            <linearGradient
                              id="incomeGradient3"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            strokeOpacity={0.3}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                          />
                          <YAxis
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                            tickFormatter={(value: number) =>
                              `¥${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                            }
                          />
                          <RechartsTooltip
                            formatter={(value: number) => [
                              `￥${value.toLocaleString()}`,
                              "收入",
                            ]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#incomeGradient3)"
                            strokeWidth={2}
                            dot={{
                              r: 4,
                              fill: "#10b981",
                              stroke: "#ffffff",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      )}

                      {chartMode === "balance" && (
                        <BarChart
                          data={monthlyBalanceData}
                          margin={{ top: 15, right: 20, left: 20, bottom: 30 }}
                        >
                          <defs>
                            <linearGradient
                              id="positiveBalance3"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#10b981"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#10b981"
                                stopOpacity={0.6}
                              />
                            </linearGradient>
                            <linearGradient
                              id="negativeBalance3"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#ef4444"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="100%"
                                stopColor="#ef4444"
                                stopOpacity={0.6}
                              />
                            </linearGradient>
                            <filter id="shadow3" height="130%">
                              <feDropShadow
                                dx="0"
                                dy="3"
                                stdDeviation="3"
                                floodColor="#00000020"
                              />
                            </filter>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            strokeOpacity={0.3}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            angle={-30}
                            textAnchor="end"
                            height={60}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                          />
                          <YAxis
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                            tickFormatter={(value: number) =>
                              `¥${Math.abs(value) >= 1000 ? Math.abs(value) / 1000 + "k" : Math.abs(value)}`
                            }
                          />
                          <RechartsTooltip
                            formatter={(value: number) => [
                              `￥${Number(value).toLocaleString()}`,
                              "结余",
                            ]}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.9)",
                              borderRadius: "8px",
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            }}
                            labelStyle={{
                              fontWeight: "bold",
                              color: "#374151",
                            }}
                            itemStyle={{ color: "#1f2937" }}
                            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                          />
                          <Bar
                            dataKey="balance"
                            name="结余"
                            fill="#000000"
                            animationDuration={1500}
                            animationEasing="ease-out"
                            radius={[6, 6, 0, 0]}
                            filter="url(#shadow3)"
                            isAnimationActive={true}
                          >
                            {monthlyBalanceData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                cursor="pointer"
                                fill={
                                  entry.balance >= 0 ? "#10b981" : "#f43f5e"
                                }
                                strokeWidth={0}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      )}

                      {chartMode === "combined" && (
                        <ComposedChart
                          data={[...Array(6)].map((_, i) => {
                            const monthDate = subMonths(
                              new Date(selectedDate),
                              5 - i,
                            );
                            const key = format(monthDate, "yyyy-MM");
                            const monthData = monthlyData[key] || {
                              income: 0,
                              allocations: [],
                            };

                            // 计算结余
                            let monthBalance = 0;
                            if (monthData) {
                              const allocatedAmount =
                                monthData.allocations.reduce(
                                  (sum, item) => sum + item.amount,
                                  0,
                                );
                              monthBalance = monthData.income - allocatedAmount;
                            }

                            return {
                              name: format(monthDate, "M月"),
                              income: monthData.income,
                              balance: monthBalance,
                            };
                          })}
                          margin={{ top: 25, right: 30, left: 20, bottom: 40 }}
                        >
                          <defs>
                            <linearGradient
                              id="combinedIncomeGradient3"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                            <filter id="shadow" height="200%">
                              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
                            </filter>
                            <linearGradient id="positiveBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                            </linearGradient>
                            <linearGradient id="negativeBalanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f87171" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="5 5"
                            strokeOpacity={0.2}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                            tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
                            tickMargin={10}
                          />
                          <YAxis
                            yAxisId="left"
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                            tickFormatter={(value: number) =>
                              `¥${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                            }
                            domain={[0, (dataMax: number) => Math.round(dataMax * 1.2)]}
                            tick={{ fill: "#10b981", fontSize: 11 }}
                            tickMargin={8}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            axisLine={{ stroke: "#e5e7eb" }}
                            tickLine={{ stroke: "#e5e7eb" }}
                            tickFormatter={(value: number) =>
                              `¥${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}`
                            }
                            tick={{ fill: "#6b7280", fontSize: 11 }}
                            tickMargin={8}
                          />
                          <RechartsTooltip
                            formatter={(value: number, name: string) => {
                              if (name === "income")
                                return [`￥${value.toLocaleString()}`, "收入"];
                              if (name === "balance")
                                return [`￥${value.toLocaleString()}`, "结余"];
                              return [value, name];
                            }}
                            contentStyle={{
                              backgroundColor: "rgba(255, 255, 255, 0.95)",
                              borderRadius: "10px",
                              border: "none",
                              padding: "12px",
                              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                              fontSize: "13px",
                              fontWeight: "500"
                            }}
                            itemStyle={{ 
                              padding: "4px 0"
                            }}
                            labelStyle={{
                              fontWeight: "bold",
                              color: "#374151",
                              marginBottom: "6px"
                            }}
                            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                          />
                          <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: "30px" }}
                            iconSize={10}
                            iconType="circle"
                            formatter={(value: string) => {
                              return <span style={{ color: "#4b5563", fontSize: "13px", fontWeight: "500", padding: "0 10px" }}>{value}</span>;
                            }}
                          />
                          {/* 先渲染Area，再渲染Bar，以便Bar显示在Area上面 */}
                          <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="income"
                            name="收入"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#combinedIncomeGradient3)"
                            strokeWidth={3}
                            dot={{
                              r: 6,
                              fill: "#10b981",
                              stroke: "#ffffff",
                              strokeWidth: 2,
                              filter: "url(#shadow)"
                            }}
                            activeDot={{
                              r: 8,
                              fill: "#10b981",
                              stroke: "#ffffff",
                              strokeWidth: 3,
                              filter: "url(#shadow)"
                            }}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="balance"
                            name="结余"
                            radius={[8, 8, 0, 0]}
                            barSize={40}
                          >
                            {[...Array(6)].map((_, i) => {
                              const monthDate = subMonths(
                                new Date(selectedDate),
                                5 - i,
                              );
                              const key = format(monthDate, "yyyy-MM");
                              const monthData = monthlyData[key] || {
                                income: 0,
                                allocations: [],
                              };

                              // 计算结余
                              let monthBalance = 0;
                              if (monthData) {
                                const allocatedAmount =
                                  monthData.allocations.reduce(
                                    (sum, item) => sum + item.amount,
                                    0,
                                  );
                                monthBalance =
                                  monthData.income - allocatedAmount;
                              }

                              return (
                                <Cell
                                  key={`cell-balance-${i}`}
                                  fill={
                                    monthBalance >= 0 
                                      ? "url(#positiveBalanceGradient)" 
                                      : "url(#negativeBalanceGradient)"
                                  }
                                  stroke={monthBalance >= 0 ? "#10b981" : "#ef4444"}
                                  strokeWidth={1}
                                />
                              );
                            })}
                          </Bar>
                        </ComposedChart>
                      )}
                    </ResponsiveContainer>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      </motion.div>

      {/* 回到顶部按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                将您
                <span className="text-indigo-600 font-medium">所有月份</span>
                的预算数据保存为JSON文件，以便备份或转移到其他设备
              </p>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => {
                  // 准备导出数据
                  const exportData = {
                    monthlyData: monthlyData, // 导出所有月份数据
                    categories: categories,
                    exportDate: new Date().toISOString(),
                  };

                  // 转换为JSON字符串
                  const jsonData = JSON.stringify(exportData, null, 2);

                  // 创建Blob对象
                  const blob = new Blob([jsonData], {
                    type: "application/json",
                  });

                  // 创建URL
                  const url = URL.createObjectURL(blob);

                  // 创建下载链接
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `完整预算数据_${format(new Date(), "yyyy-MM-dd")}.json`;
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
                          const data = JSON.parse(
                            event.target?.result as string,
                          );

                          // 基本验证
                          if (!data.monthlyData || !data.categories) {
                            throw new Error("无效的数据格式");
                          }

                          // 确认导入
                          if (
                            confirm(
                              `此操作将导入${Object.keys(data.monthlyData).length}个月的数据并覆盖当前数据，确定要导入吗？`,
                            )
                          ) {
                            // 更新状态和本地存储
                            setMonthlyData(data.monthlyData);
                            setCategories(data.categories);
                            localStorage.setItem(
                              "monthlyData",
                              JSON.stringify(data.monthlyData),
                            );
                            localStorage.setItem(
                              "userCategories",
                              JSON.stringify(data.categories),
                            );

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

                          console.error("Import error:", error);
                        }

                        // 重置文件输入
                        e.target.value = "";
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
                    <span className="text-base font-medium text-indigo-600 dark:text-indigo-300">
                      点击选择JSON文件
                    </span>
                    <span className="text-xs text-gray-500">
                      或拖放文件到此处
                    </span>
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
            <Button variant="outline" className="w-full">
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加Toast容器 */}
      <ToastContainer />
    </div>
  );
}

export default App;

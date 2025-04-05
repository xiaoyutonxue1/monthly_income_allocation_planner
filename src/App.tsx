import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  CalendarIcon, 
  PlusIcon, 
  Trash2Icon, 
  WalletIcon, 
  PiggyBankIcon, 
  BarChart3Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutTemplateIcon,
  PieChartIcon,
  ChevronUpIcon,
  CheckIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { toast, ToastContainer } from '@/components/ui/use-toast';

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
  '70/20/10法则': []
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
  }
};

function App() {
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
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const currentMonthKey = format(selectedDate, 'yyyy-MM');
  const currentMonthData = monthlyData[currentMonthKey] || { income: 0, allocations: [] };

  const updateMonthData = (data: MonthData) => {
    const newMonthlyData = {
      ...monthlyData,
      [currentMonthKey]: data,
    };
    setMonthlyData(newMonthlyData);
    localStorage.setItem('monthlyData', JSON.stringify(newMonthlyData));
  };

  const handleIncomeChange = (value: string) => {
    updateMonthData({
      ...currentMonthData,
      income: Number(value) || 0,
    });
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

  // 按分类汇总当月数据
  const categoryData = categories.map(category => {
    const totalAmount = currentMonthData.allocations
      .filter(alloc => alloc.category === category.id)
      .reduce((sum, alloc) => sum + alloc.amount, 0);
    
    return {
      name: category.name,
      value: totalAmount,
      color: category.color,
    };
  }).filter(item => item.value > 0);

  const saveCategories = (updatedCategories: typeof CATEGORIES) => {
    setCategories(updatedCategories);
    localStorage.setItem('userCategories', JSON.stringify(updatedCategories));
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

  // 在组件初始化时设置 activeTemplate
  useEffect(() => {
    // 从当前月份数据中获取 activeTemplate
    setActiveTemplate(currentMonthData.activeTemplate || null);
  }, [currentMonthData]);

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
                  <Label htmlFor="income" className="text-lg">
                    {format(selectedDate, 'yyyy年 MM月', { locale: zhCN })}收入
                  </Label>
                  <Input
                    id="income"
                    type="number"
                    value={currentMonthData.income || ''}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    placeholder="请输入月收入"
                    className="mt-2 h-10 text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <PiggyBankIcon className="h-5 w-5 text-green-500" />
                      收入分配
                    </h3>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <LayoutTemplateIcon className="h-4 w-4 text-blue-500" />
                            使用模板
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[700px] p-0 max-h-[600px] overflow-auto bg-white/95 backdrop-blur-sm border-blue-100 dark:border-blue-900">
                          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 sticky top-0 z-10">
                            <h4 className="font-medium text-base">选择预算模板</h4>
                            <p className="text-sm text-muted-foreground">选择一个适合您的预算模板作为起点</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {Object.entries(TEMPLATES).map(([key, template], index) => (
                              <motion.div 
                                key={key} 
                                className="relative overflow-hidden rounded-xl border border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-900 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ 
                                  scale: 1.02, 
                                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.2), 0 10px 10px -5px rgba(59, 130, 246, 0.1)",
                                  borderColor: "rgba(59, 130, 246, 0.5)"
                                }}
                              >
                                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium text-base">{template.title}</h5>
                                    <motion.div 
                                      className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                      推荐
                                    </motion.div>
                                  </div>
                                </div>
                                
                                <div className="flex-1 p-4 space-y-3">
                                  <p className="text-sm text-muted-foreground">{template.description}</p>
                                  
                                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2 text-xs">
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">适用人群：</span> 
                                    <span>{template.suitableFor}</span>
                                  </div>
                                  
                                  <div className="space-y-1 mt-3">
                                    {template.allocations(1000).map((allocation, idx) => (
                                      <div key={idx} className="flex justify-between text-xs">
                                        <motion.div 
                                          className="flex items-center gap-1.5"
                                          initial={{ x: -5, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: 0.2 + idx * 0.05 }}
                                        >
                                          <span 
                                            className="inline-block w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: categories.find(c => c.id === allocation.category)?.color || '#888' }}
                                          ></span>
                                          <span className="text-muted-foreground">{allocation.purpose}</span>
                                        </motion.div>
                                        <span className="font-medium">{Math.round(allocation.amount / 10)}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="mt-auto p-4 pt-2 border-t border-dashed border-blue-100 dark:border-blue-900/30">
                                  <motion.button
                                    onClick={() => applyTemplate(key)}
                                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <CheckIcon className="h-4 w-4" />
                                    应用此模板
                                  </motion.button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <PlusIcon className="h-4 w-4 mr-1" />
                            管理分类
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72">
                          <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                              <h4 className="font-medium">添加新分类</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Input 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="分类名称"
                                    className="w-full h-9"
                                  />
                                </div>
                                <div>
                                  <input 
                                    type="color"
                                    value={newCategoryColor}
                                    onChange={(e) => setNewCategoryColor(e.target.value)}
                                    className="w-9 h-9 p-1 border rounded"
                                  />
                                </div>
                                <Button 
                                  onClick={addCategory} 
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  添加
                                </Button>
                              </div>
                            </div>
                            
                            <div className="max-h-[200px] overflow-y-auto">
                              <div className="grid grid-cols-1 gap-2">
                                {categories.map((category) => (
                                  <div 
                                    key={category.id} 
                                    className="flex items-center justify-between p-2 border rounded-md"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: category.color }}
                                      ></div>
                                      <span>{category.name}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCategory(category.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                      title="删除分类"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      </svg>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <Button onClick={addAllocation} size="sm" className="bg-green-500 hover:bg-green-600 h-9 px-3">
                        <PlusIcon className="h-5 w-5 mr-1" />
                      添加分配项
                    </Button>
                    </div>
                  </div>

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
                        <TableHead className="w-[70px]"></TableHead>
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
                            <Input
                              value={allocation.purpose}
                              onChange={(e) =>
                                updateAllocation(allocation.id, 'purpose', e.target.value)
                              }
                              placeholder="输入用途"
                                className="w-full h-9"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={allocation.amount || ''}
                              onChange={(e) =>
                                updateAllocation(allocation.id, 'amount', Number(e.target.value) || 0)
                              }
                              placeholder="0"
                                className="w-full h-9 text-base"
                            />
                          </TableCell>
                          <TableCell>
                              <div className="flex gap-1">
                                <Select
                                  value={allocation.category || ''}
                                  onValueChange={(value) => updateAllocation(allocation.id, 'category', value)}
                                >
                                  <SelectTrigger className="w-full h-9 border-gray-200">
                                    <SelectValue placeholder="选择分类" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: category.color }}
                                          ></div>
                                          {category.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            {activeTemplate && TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
                              <TableCell>
                                <Select
                                  value={allocation.manualGroup || "auto"}
                                  onValueChange={(value) => updateAllocationGroup(allocation.id, value)}
                                >
                                  <SelectTrigger className="w-full h-9 border-gray-200">
                                    <SelectValue>
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
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                        <span className="text-gray-600">使用自动分配</span>
                                      </div>
                                    </SelectItem>
                                    {activeTemplate && TEMPLATE_GROUPS[activeTemplate].map((group) => (
                                      <SelectItem key={group.id} value={group.id}>
                                        <div className="flex items-center gap-2">
                                          <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: group.color }}
                                          ></div>
                                          {group.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                          <TableCell>
                            <Button
                              variant="ghost"
                                size="sm"
                              onClick={() => removeAllocation(allocation.id)}
                                className="w-full h-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-md"
                                title="删除"
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
          </Card>

          <div className="space-y-4">
            <Card className={cn(
              'shadow-lg transition-all transform hover:scale-102 rounded-2xl overflow-hidden',
              balance >= 0 ? 'border-green-500' : 'border-red-500',
              'border-2'
            )}>
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
                      className={balance >= 0 ? 'text-green-600' : 'text-red-600'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 月度结余趋势图 */}
          <Card className="shadow-lg h-full rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5 text-emerald-500" />
                最近月度结余趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {monthlyBalanceData.length > 0 ? (
                <div className="w-full h-72 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyBalanceData}
                      margin={{ top: 15, right: 20, left: 20, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="positiveBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.6}/>
                        </linearGradient>
                        <linearGradient id="negativeBalance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6}/>
                        </linearGradient>
                        <filter id="shadow" height="130%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#00000020"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        angle={-30} 
                        textAnchor="end" 
                        height={60}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={{ stroke: '#e5e7eb' }}
                        tickFormatter={(value) => `¥${Math.abs(value) >= 1000 ? Math.abs(value)/1000 + 'k' : Math.abs(value)}`}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`￥${Number(value).toLocaleString()}`, '结余']} 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                        itemStyle={{ color: '#1f2937' }}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                      />
                      <Bar 
                        dataKey="balance" 
                        name="结余" 
                        fill="#000000"
                        animationDuration={1500}
                        animationEasing="ease-out"
                        radius={[6, 6, 0, 0]}
                        filter="url(#shadow)"
                        isAnimationActive={true}
                      >
                        {monthlyBalanceData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            cursor="pointer"
                            fill={entry.balance >= 0 ? '#10b981' : '#f43f5e'}
                            strokeWidth={0}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground rounded-xl border border-dashed border-gray-200 p-6">
                  <BarChart3Icon className="h-12 w-12 text-gray-300 mb-2" />
                  <p>暂无历史数据</p>
                  <p className="text-sm text-gray-400 mt-1">添加月度收入和分配后将在此显示趋势图</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 当月支出分类占比 */}
          <Card className="shadow-lg rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-blue-500" />
                当月分配分类占比
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {categoryData.length > 0 ? (
                <div className="w-full h-72 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieShadow" height="130%">
                          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#00000020"/>
                        </filter>
                      </defs>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        labelLine={{
                          stroke: '#d1d5db',
                          strokeWidth: 1,
                          strokeDasharray: '2 2',
                        }}
                        label={({ name, percent }) => (
                          `${name} ${(percent * 100).toFixed(0)}%`
                        )}
                        outerRadius={90}
                        innerRadius={30}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                        animationDuration={1500}
                        animationEasing="ease-out"
                        filter="url(#pieShadow)"
                        isAnimationActive={true}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color || colorPalette[index % colorPalette.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                        iconSize={10}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`￥${Number(value).toLocaleString()}`]} 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          borderRadius: '8px', 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                        itemStyle={{ color: '#1f2937' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground rounded-xl border border-dashed border-gray-200 p-6">
                  <PieChartIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p>暂无分类数据</p>
                  <p className="text-sm text-gray-400 mt-1">添加收入分配分类后将在此显示饼图</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 添加一个新的Card组件用于显示预算组比例分析 */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          {activeTemplate && TEMPLATE_GROUPS[activeTemplate]?.length > 0 && (
            <Card className="shadow-lg rounded-2xl border border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardTitle className="flex items-center gap-2">
                  <LayoutTemplateIcon className="h-5 w-5 text-blue-500" />
                  {activeTemplate}模板支出分析
                </CardTitle>
                <CardDescription>
                  分析各分类组支出比例，红色表示超出建议比例
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {groupExpenses.map((group, index) => (
                    <div key={group.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: group.color }}
                          ></div>
                          <span className="font-medium">{group.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-sm font-medium",
                            group.isExceeding ? "text-red-500" : "text-gray-600 dark:text-gray-400"
                          )}>
                            {group.actualPercentage.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            (建议: {group.recommendedPercentage}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {/* 建议比例区域 */}
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/30 rounded-full"
                          style={{ width: `${group.recommendedPercentage}%` }}
                        ></div>
                        
                        {/* 实际比例条 */}
                        <div 
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                            group.isExceeding ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ width: `${Math.min(group.actualPercentage, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {group.description}
                      </div>
                      
                      {/* 列出该组中包含的分配项 */}
                      <div className="mt-2 pl-6 text-sm">
                        {currentMonthData.allocations
                          .filter(alloc => 
                            (alloc.manualGroup === group.id) || 
                            (!alloc.manualGroup && group.categories.includes(alloc.category || ''))
                          )
                          .map((alloc, i) => (
                            <div key={i} className="flex justify-between py-1 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0">
                              <span className="text-gray-600 dark:text-gray-400">{alloc.purpose}</span>
                              <span className="font-medium">¥{alloc.amount.toLocaleString()}</span>
                            </div>
                        ))}
                        
                        {currentMonthData.allocations
                          .filter(alloc => 
                            (alloc.manualGroup === group.id) || 
                            (!alloc.manualGroup && group.categories.includes(alloc.category || ''))
                          ).length === 0 && (
                          <div className="text-gray-400 italic py-1">暂无支出项</div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {!groupExpenses.length && (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mb-2" />
                      <p>未应用预算模板或当前模板未定义分组</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
      
      {/* 添加Toast容器 */}
      <ToastContainer />
    </div>
  );
}

export default App;
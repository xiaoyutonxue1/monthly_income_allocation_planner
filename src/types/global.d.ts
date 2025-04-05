import 'react';

declare module 'recharts' {
  export const BarChart: any;
  export const Bar: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const ResponsiveContainer: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const Legend: any;
}

// 为图表中的参数类型添加声明
interface PieLabel {
  name: string;
  percent: number;
}

interface ChartEntry {
  balance: number;
  [key: string]: any;
}

// 添加所有隐式any类型的声明
interface EventWithTarget {
  target: {
    value: string;
  };
}

// 确保Date类型正确
declare module 'date-fns' {
  export function format(date: Date, format: string, options?: any): string;
  export function addMonths(date: Date, amount: number): Date;
  export function subMonths(date: Date, amount: number): Date;
}

declare module 'date-fns/locale' {
  export const zhCN: any;
}

declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'lucide-react' {
  export const CalendarIcon: any;
  export const PlusIcon: any;
  export const Trash2Icon: any;
  export const WalletIcon: any;
  export const PiggyBankIcon: any;
  export const BarChart3Icon: any;
  export const ChevronLeftIcon: any;
  export const ChevronRightIcon: any;
  export const LayoutTemplateIcon: any;
  export const PieChart: any;
} 
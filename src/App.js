import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addMonths, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { CalendarIcon, PlusIcon, Trash2Icon, WalletIcon, PiggyBankIcon, BarChart3Icon, ChevronLeftIcon, ChevronRightIcon, LayoutTemplateIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// 定义分类
const CATEGORIES = [
    { id: 'housing', name: '住房', color: '#8884d8' },
    { id: 'food', name: '餐饮', color: '#82ca9d' },
    { id: 'transport', name: '交通', color: '#ffc658' },
    { id: 'entertainment', name: '娱乐', color: '#ff8042' },
    { id: 'shopping', name: '购物', color: '#0088fe' },
    { id: 'medical', name: '医疗', color: '#00C49F' },
    { id: 'education', name: '教育', color: '#FFBB28' },
    { id: 'saving', name: '储蓄', color: '#FF8042' },
    { id: 'investment', name: '投资', color: '#8dd1e1' },
    { id: 'other', name: '其他', color: '#a4a4a4' },
];
// 预设模板
const TEMPLATES = {
    '50/30/20法则': (income) => [
        { id: crypto.randomUUID(), purpose: '必要支出', amount: income * 0.5, category: 'housing', note: '包括房租/房贷、水电、食品等必需品' },
        { id: crypto.randomUUID(), purpose: '个人支出', amount: income * 0.3, category: 'entertainment', note: '包括娱乐、购物、餐厅等非必需品' },
        { id: crypto.randomUUID(), purpose: '储蓄与投资', amount: income * 0.2, category: 'saving', note: '存款、投资和紧急基金' },
    ],
    '零基预算': (income) => [
        { id: crypto.randomUUID(), purpose: '住房', amount: 0, category: 'housing' },
        { id: crypto.randomUUID(), purpose: '食品', amount: 0, category: 'food' },
        { id: crypto.randomUUID(), purpose: '交通', amount: 0, category: 'transport' },
        { id: crypto.randomUUID(), purpose: '医疗', amount: 0, category: 'medical' },
        { id: crypto.randomUUID(), purpose: '储蓄', amount: 0, category: 'saving' },
        { id: crypto.randomUUID(), purpose: '投资', amount: 0, category: 'investment' },
        { id: crypto.randomUUID(), purpose: '娱乐', amount: 0, category: 'entertainment' },
    ],
};
function App() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [monthlyData, setMonthlyData] = useState(() => {
        const saved = localStorage.getItem('monthlyData');
        return saved ? JSON.parse(saved) : {};
    });
    const currentMonthKey = format(selectedDate, 'yyyy-MM');
    const currentMonthData = monthlyData[currentMonthKey] || { income: 0, allocations: [] };
    const updateMonthData = (data) => {
        const newMonthlyData = {
            ...monthlyData,
            [currentMonthKey]: data,
        };
        setMonthlyData(newMonthlyData);
        localStorage.setItem('monthlyData', JSON.stringify(newMonthlyData));
    };
    const handleIncomeChange = (value) => {
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
    const updateAllocation = (id, field, value) => {
        updateMonthData({
            ...currentMonthData,
            allocations: currentMonthData.allocations.map((allocation) => allocation.id === id ? { ...allocation, [field]: value } : allocation),
        });
    };
    const removeAllocation = (id) => {
        updateMonthData({
            ...currentMonthData,
            allocations: currentMonthData.allocations.filter((allocation) => allocation.id !== id),
        });
    };
    const handleMonthChange = (offset) => {
        setSelectedDate(offset > 0 ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1));
    };
    const applyTemplate = (templateName) => {
        const template = TEMPLATES[templateName];
        if (template) {
            updateMonthData({
                ...currentMonthData,
                allocations: template(currentMonthData.income),
            });
        }
    };
    const totalAllocated = currentMonthData.allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
    const balance = currentMonthData.income - totalAllocated;
    const totalBalance = Object.values(monthlyData).reduce((sum, data) => sum + (data.income - data.allocations.reduce((a, b) => a + b.amount, 0)), 0);
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
    const categoryData = CATEGORIES.map(category => {
        const totalAmount = currentMonthData.allocations
            .filter(alloc => alloc.category === category.id)
            .reduce((sum, alloc) => sum + alloc.amount, 0);
        return {
            name: category.name,
            value: totalAmount,
            color: category.color,
        };
    }).filter(item => item.value > 0);
    return (_jsx("div", { className: "min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-indigo-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "max-w-6xl mx-auto space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start gap-6", children: [_jsxs("div", { className: "flex-1", children: [_jsx(motion.h1, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent", children: "\u6708\u5EA6\u6536\u5165\u89C4\u5212" }), _jsx("p", { className: "text-muted-foreground", children: "\u89C4\u5212\u548C\u8FFD\u8E2A\u60A8\u7684\u6708\u5EA6\u6536\u5165\u5206\u914D" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "icon", onClick: () => handleMonthChange(-1), className: "shadow-sm hover:shadow-md transition-shadow", children: _jsx(ChevronLeftIcon, { className: "h-4 w-4" }) }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", className: cn('w-[240px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-shadow', !selectedDate && 'text-muted-foreground'), children: [_jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }), selectedDate ? format(selectedDate, 'yyyy年 MM月', { locale: zhCN }) : _jsx("span", { children: "\u9009\u62E9\u6708\u4EFD" })] }) }), _jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: _jsx(Calendar, { mode: "single", selected: selectedDate, onSelect: (date) => date && setSelectedDate(date), locale: zhCN, initialFocus: true }) })] }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => handleMonthChange(1), className: "shadow-sm hover:shadow-md transition-shadow", children: _jsx(ChevronRightIcon, { className: "h-4 w-4" }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "md:col-span-2 shadow-lg hover:shadow-xl transition-shadow", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(WalletIcon, { className: "h-5 w-5 text-blue-500" }), "\u6708\u5EA6\u6536\u5165"] }) }), _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: "income", className: "text-lg", children: [format(selectedDate, 'yyyy年 MM月', { locale: zhCN }), "\u6536\u5165"] }), _jsx(Input, { id: "income", type: "number", value: currentMonthData.income || '', onChange: (e) => handleIncomeChange(e.target.value), placeholder: "\u8BF7\u8F93\u5165\u6708\u6536\u5165", className: "mt-2" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("h3", { className: "text-lg font-semibold flex items-center gap-2", children: [_jsx(PiggyBankIcon, { className: "h-5 w-5 text-green-500" }), "\u6536\u5165\u5206\u914D"] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: "outline", size: "sm", className: "flex items-center gap-1", children: [_jsx(LayoutTemplateIcon, { className: "h-4 w-4" }), "\u4F7F\u7528\u6A21\u677F"] }) }), _jsx(PopoverContent, { className: "w-52", children: _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "\u9009\u62E9\u9884\u8BBE\u6A21\u677F" }), _jsx("div", { className: "flex flex-col gap-1.5", children: Object.keys(TEMPLATES).map((templateName) => (_jsx(Button, { variant: "outline", size: "sm", onClick: () => applyTemplate(templateName), className: "justify-start", children: templateName }, templateName))) })] }) })] }), _jsxs(Button, { onClick: addAllocation, size: "sm", className: "bg-green-500 hover:bg-green-600", children: [_jsx(PlusIcon, { className: "h-4 w-4 mr-1" }), "\u6DFB\u52A0\u5206\u914D\u9879"] })] })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "\u7528\u9014" }), _jsx(TableHead, { children: "\u91D1\u989D" }), _jsx(TableHead, { children: "\u5206\u7C7B" }), _jsx(TableHead, { children: "\u5907\u6CE8" }), _jsx(TableHead, { className: "w-[50px]" })] }) }), _jsx(TableBody, { children: _jsx(AnimatePresence, { children: currentMonthData.allocations.map((allocation) => (_jsxs(motion.tr, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.2 }, children: [_jsx(TableCell, { children: _jsx(Input, { value: allocation.purpose, onChange: (e) => updateAllocation(allocation.id, 'purpose', e.target.value), placeholder: "\u8F93\u5165\u7528\u9014" }) }), _jsx(TableCell, { children: _jsx(Input, { type: "number", value: allocation.amount || '', onChange: (e) => updateAllocation(allocation.id, 'amount', Number(e.target.value) || 0), placeholder: "0" }) }), _jsx(TableCell, { children: _jsxs(Select, { value: allocation.category || '', onValueChange: (value) => updateAllocation(allocation.id, 'category', value), children: [_jsx(SelectTrigger, { className: "w-full", children: _jsx(SelectValue, { placeholder: "\u9009\u62E9\u5206\u7C7B" }) }), _jsx(SelectContent, { children: CATEGORIES.map((category) => (_jsx(SelectItem, { value: category.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: category.color } }), category.name] }) }, category.id))) })] }) }), _jsx(TableCell, { children: _jsx(Input, { value: allocation.note || '', onChange: (e) => updateAllocation(allocation.id, 'note', e.target.value), placeholder: "\u6DFB\u52A0\u5907\u6CE8" }) }), _jsx(TableCell, { children: _jsx(Button, { variant: "ghost", size: "icon", onClick: () => removeAllocation(allocation.id), className: "hover:text-red-500", children: _jsx(Trash2Icon, { className: "h-4 w-4" }) }) })] }, allocation.id))) }) })] })] })] }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: cn('shadow-lg transition-all transform hover:scale-105', balance >= 0 ? 'border-green-500' : 'border-red-500', 'border-2'), children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3Icon, { className: "h-5 w-5 text-blue-500" }), "\u6708\u5EA6\u7ED3\u4F59"] }) }), _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "\u6536\u5165\uFF1A" }), _jsxs("span", { children: ["\uFFE5", currentMonthData.income.toLocaleString()] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "\u5DF2\u5206\u914D\uFF1A" }), _jsxs("span", { children: ["\uFFE5", totalAllocated.toLocaleString()] })] }), _jsx("div", { className: "h-px bg-border my-2" }), _jsxs("div", { className: "flex justify-between font-semibold text-lg", children: [_jsx("span", { children: "\u7ED3\u4F59\uFF1A" }), _jsxs(motion.span, { initial: { scale: 1.2 }, animate: { scale: 1 }, className: balance >= 0 ? 'text-green-600' : 'text-red-600', children: ["\uFFE5", balance.toLocaleString()] }, balance)] })] }) })] }), _jsxs(Card, { className: "shadow-lg hover:shadow-xl transition-shadow", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PiggyBankIcon, { className: "h-5 w-5 text-green-500" }), "\u603B\u7ED3\u4F59"] }) }), _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "text-3xl font-bold text-center text-green-600", children: _jsxs(motion.div, { initial: { scale: 1.1 }, animate: { scale: 1 }, children: ["\uFFE5", totalBalance.toLocaleString()] }, totalBalance) }), _jsx("p", { className: "text-center text-muted-foreground text-sm mt-2", children: "\u6240\u6709\u6708\u4EFD\u7D2F\u8BA1\u7ED3\u4F59" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "shadow-lg", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3Icon, { className: "h-5 w-5 text-blue-500" }), "\u6700\u8FD1\u6708\u5EA6\u7ED3\u4F59\u8D8B\u52BF"] }) }), _jsx(CardContent, { className: "p-6", children: monthlyBalanceData.length > 0 ? (_jsx("div", { className: "w-full h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: monthlyBalanceData, margin: { top: 5, right: 30, left: 20, bottom: 25 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month", angle: -45, textAnchor: "end", height: 60, tick: { fontSize: 12 } }), _jsx(YAxis, {}), _jsx(RechartsTooltip, { formatter: (value) => [`￥${Number(value).toLocaleString()}`, '结余'] }), _jsx(Bar, { dataKey: "balance", name: "\u7ED3\u4F59", fill: (entry) => entry.balance >= 0 ? '#10b981' : '#ef4444' })] }) }) })) : (_jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: "\u6682\u65E0\u5386\u53F2\u6570\u636E" })) })] }), _jsxs(Card, { className: "shadow-lg", children: [_jsx(CardHeader, { className: "border-b", children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PieChart, { className: "h-5 w-5 text-blue-500" }), "\u5F53\u6708\u5206\u914D\u5206\u7C7B\u5360\u6BD4"] }) }), _jsx(CardContent, { className: "p-6", children: categoryData.length > 0 ? (_jsx("div", { className: "w-full h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: categoryData, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: categoryData.map((entry, index) => (_jsx(Cell, { fill: entry.color || '#8884d8' }, `cell-${index}`))) }), _jsx(Legend, {}), _jsx(RechartsTooltip, { formatter: (value) => [`￥${Number(value).toLocaleString()}`] })] }) }) })) : (_jsx("div", { className: "flex items-center justify-center h-64 text-muted-foreground", children: "\u6682\u65E0\u5206\u7C7B\u6570\u636E" })) })] })] })] }) }));
}
export default App;

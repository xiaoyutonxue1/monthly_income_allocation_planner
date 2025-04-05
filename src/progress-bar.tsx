import React from 'react';

interface BudgetProgressBarProps {
  actualPercentage: number;
  recommendedPercentage: number;
  totalExpense: number;
  color: string;
  isExceeding: boolean;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  actualPercentage,
  recommendedPercentage,
  totalExpense,
  color,
  isExceeding,
}) => {
  // 确定金额显示的位置 - 当超过了推荐百分比且二者差距较小时，在外部显示金额
  const shouldShowAmountOutside = 
    actualPercentage > 5 && 
    actualPercentage - recommendedPercentage > -10 && 
    actualPercentage - recommendedPercentage < 10;

  return (
    <div className="flex flex-col space-y-1 w-full my-3">
      {/* 两层进度条设计 */}
      <div className="relative h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner">
        {/* 底层推荐比例进度条 - 浅色背景 */}
        <div 
          className="absolute h-full rounded-xl transition-all duration-500 ease-out"
          style={{ 
            width: `${recommendedPercentage}%`,
            backgroundColor: color,
            opacity: 0.15,
          }}
        >
        </div>
        
        {/* 顶层实际进度条 */}
        <div 
          className="relative h-full rounded-xl flex items-center justify-start px-3 text-xs font-medium transition-all duration-700 ease-out z-10"
          style={{ 
            width: `${Math.min(100, actualPercentage)}%`,
            background: isExceeding
              ? `linear-gradient(90deg, rgba(239,68,68,0.8) 0%, rgba(239,68,68,1) 100%)`
              : `linear-gradient(90deg, ${color}90 0%, ${color} 100%)`,
            boxShadow: isExceeding 
              ? '0 0 10px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)'
              : `0 0 10px ${color}50, inset 0 0 15px rgba(255, 255, 255, 0.2)`,
            border: isExceeding 
              ? '1px solid rgba(239, 68, 68, 0.8)'
              : `1px solid ${color}`,
          }}
        >
          {/* 仅当不应在外部显示时，在进度条内显示金额 */}
          {!shouldShowAmountOutside && actualPercentage >= 8 ? (
            <div className="flex items-center gap-1 text-white">
              <span className="truncate font-bold">¥{totalExpense.toLocaleString()}</span>
              <span className="text-white/80 text-[10px]">({actualPercentage.toFixed(1)}%)</span>
            </div>
          ) : null}
        </div>
        
        {/* 当进度条太短或需要在外部显示时，在右侧显示数值 */}
        {(actualPercentage < 8 || shouldShowAmountOutside) && (
          <div className="absolute left-[calc(100%+10px)] top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <span className="text-sm font-semibold" style={{ color }}>
              ¥{totalExpense.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({actualPercentage.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
      
      {/* 进度条底部信息 */}
      <div className="flex justify-between items-center text-xs px-1 mt-2">
        <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ 
              backgroundColor: isExceeding ? '#ef4444' : color,
              boxShadow: isExceeding ? '0 0 5px rgba(239, 68, 68, 0.5)' : `0 0 5px ${color}50`
            }}
          ></div>
          {isExceeding ? (
            <span className="flex items-center text-red-500 font-semibold">
              已超支 {(actualPercentage - recommendedPercentage).toFixed(1)}%
            </span>
          ) : (
            <span>
              已用<span className="mx-0.5 font-semibold">{(actualPercentage / recommendedPercentage * 100).toFixed(0)}%</span>预算
            </span>
          )}
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          推荐比例: <span className="font-semibold" style={{ color }}>
            {recommendedPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}; 
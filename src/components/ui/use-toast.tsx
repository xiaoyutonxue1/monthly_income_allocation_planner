import { useState, useEffect } from 'react';

// 定义Toast接口
interface Toast {
  id: string;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

type ToastFunction = (options: ToastOptions) => void;

// 创建全局toasts数组
let toasts: Toast[] = [];
let listeners: Function[] = [];

// 添加toast
export const toast: ToastFunction = (options) => {
  const id = crypto.randomUUID();
  const newToast = { id, ...options };
  toasts = [...toasts, newToast];
  
  // 通知所有监听器
  listeners.forEach(listener => listener(toasts));
  
  // 设置自动消失
  if (options.duration !== 0) {
    setTimeout(() => {
      dismissToast(id);
    }, options.duration || 3000);
  }
  
  return id;
};

// 移除toast
export const dismissToast = (id: string) => {
  toasts = toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toasts));
};

// 使用Hook获取和更新toasts
export function useToasts() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    // 添加监听器
    const handleToastsChange = (newToasts: Toast[]) => {
      setCurrentToasts([...newToasts]);
    };
    
    listeners.push(handleToastsChange);
    
    // 清理
    return () => {
      listeners = listeners.filter(listener => listener !== handleToastsChange);
    };
  }, []);
  
  return { toasts: currentToasts, dismissToast };
}

// 添加Toast组件到App.tsx
// 在合适的位置添加以下代码
// <ToastContainer />

export function ToastContainer() {
  const { toasts, dismissToast } = useToasts();
  
  return (
    <div className="fixed inset-0 flex flex-col items-end justify-start p-4 pointer-events-none z-50 max-h-screen overflow-hidden">
      <div className="flex flex-col space-y-2 w-full max-w-xs">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 pointer-events-auto transform transition-all duration-300 translate-y-0 opacity-100 ring-1 ring-black ring-opacity-5"
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{toast.title}</h3>
                {toast.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{toast.description}</p>}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">关闭</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
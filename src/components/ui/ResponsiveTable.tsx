import React from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoint, Breakpoint } from '@/hooks/useBreakpoint';

export interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  responsive?: boolean;
}

/**
 * Wrapper responsivo para tabelas com rolagem horizontal automática
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  children,
  className,
  minWidth = { mobile: 600, tablet: 800, desktop: 1000 },
  striped = false,
  bordered = false,
  hover = true,
  responsive = true,
}) => {
  const breakpoint = useBreakpoint();
  const currentMinWidth = minWidth[breakpoint] || minWidth.desktop || 1000;

  const tableClasses = cn(
    'w-full text-sm',
    striped && 'striped',
    bordered && 'bordered',
    hover && 'hover',
    className
  );

  if (!responsive) {
    return (
      <table className={tableClasses}>
        {children}
      </table>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full" style={{ minWidth: `${currentMinWidth}px` }}>
        <table className={tableClasses}>
          {children}
        </table>
      </div>
    </div>
  );
};

export interface ResponsiveTableHeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

/**
 * Cabeçalho de tabela responsivo
 */
export const ResponsiveTableHeader: React.FC<ResponsiveTableHeaderProps> = ({
  children,
  className,
  sticky = true,
}) => {
  return (
    <thead className={cn(
      'bg-gray-50',
      sticky && 'sticky top-0 z-10',
      className
    )}>
      {children}
    </thead>
  );
};

export interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

/**
 * Linha de tabela responsiva
 */
export const ResponsiveTableRow: React.FC<ResponsiveTableRowProps> = ({
  children,
  className,
  onClick,
  hover = true,
}) => {
  return (
    <tr 
      className={cn(
        'border-b border-gray-200',
        hover && 'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  padding?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

/**
 * Célula de tabela responsiva
 */
export const ResponsiveTableCell: React.FC<ResponsiveTableCellProps> = ({
  children,
  className,
  width,
  align = 'left',
  padding = { mobile: 'px-3 py-2', tablet: 'px-4 py-3', desktop: 'px-6 py-4' },
}) => {
  const breakpoint = useBreakpoint();
  const currentPadding = padding[breakpoint] || padding.desktop || 'px-6 py-4';

  const cellClasses = cn(
    'text-sm text-gray-900',
    currentPadding,
    getTextAlign(align),
    width && `w-${width}`,
    className
  );

  return (
    <td className={cellClasses} style={width ? { width } : {}}>
      {children}
    </td>
  );
};

export interface ResponsiveTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | null;
}

/**
 * Célula de cabeçalho de tabela responsiva
 */
export const ResponsiveTableHeaderCell: React.FC<ResponsiveTableHeaderCellProps> = ({
  children,
  className,
  width,
  align = 'left',
  sortable = false,
  onSort,
  sortDirection,
}) => {
  const cellClasses = cn(
    'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
    getTextAlign(align),
    sortable && 'cursor-pointer select-none hover:text-gray-700',
    width && `w-${width}`,
    className
  );

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th 
      className={cellClasses} 
      style={width ? { width } : {}}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <div className="flex flex-col">
            <svg 
              className={cn(
                'w-3 h-3',
                sortDirection === 'asc' ? 'text-gray-700' : 'text-gray-400'
              )}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg 
              className={cn(
                'w-3 h-3 -mt-1',
                sortDirection === 'desc' ? 'text-gray-700' : 'text-gray-400'
              )}
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
};

/**
 * Funções auxiliares
 */
const getTextAlign = (align: 'left' | 'center' | 'right'): string => {
  const alignMap = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return alignMap[align];
};
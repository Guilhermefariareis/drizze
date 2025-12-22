import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ValueSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
  formatValue?: (value: number) => string
  showMinMax?: boolean
}

const ValueSlider = React.forwardRef<
  HTMLDivElement,
  ValueSliderProps
>(({ 
  value, 
  onChange, 
  min = 100, 
  max = 50000, 
  step = 100,
  className,
  formatValue = (val) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val),
  showMinMax = true,
  ...props 
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(false)
  
  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0])
  }

  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
      {/* Valor atual destacado */}
      <div className="text-center">
        <div className={cn(
          "text-3xl font-bold transition-all duration-200",
          isDragging ? "text-primary scale-105" : "text-foreground"
        )}>
          {formatValue(value)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Arraste para ajustar o valor
        </p>
      </div>

      {/* Container do slider com gradiente */}
      <div className="relative px-3">
        <Slider
          value={[value]}
          onValueChange={handleValueChange}
          onPointerDown={() => setIsDragging(true)}
          onPointerUp={() => setIsDragging(false)}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-full",
            "[&>span:first-child]:h-3 [&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-gray-200 [&>span:first-child]:to-gray-300",
            "[&>span:first-child>span]:bg-gradient-to-r [&>span:first-child>span]:from-blue-500 [&>span:first-child>span]:to-blue-600",
            "[&>span:last-child]:h-6 [&>span:last-child]:w-6 [&>span:last-child]:border-4 [&>span:last-child]:border-blue-500 [&>span:last-child]:bg-white",
            "[&>span:last-child]:shadow-lg [&>span:last-child]:transition-all [&>span:last-child]:duration-200",
            isDragging && "[&>span:last-child]:scale-110 [&>span:last-child]:shadow-xl"
          )}
        />
        
        {/* Indicador de progresso visual */}
        <div className="absolute top-1/2 left-3 right-3 -translate-y-1/2 pointer-events-none">
          <div className="relative h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Valores mínimo e máximo */}
      {showMinMax && (
        <div className="flex justify-between text-xs text-muted-foreground px-3">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}

      {/* Valores sugeridos */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[1000, 2500, 5000, 10000, 15000, 25000].filter(val => val >= min && val <= max).map((suggestedValue) => (
          <button
            key={suggestedValue}
            onClick={() => onChange(suggestedValue)}
            className={cn(
              "px-3 py-1 text-xs rounded-full border transition-all duration-200",
              value === suggestedValue
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
            )}
          >
            {formatValue(suggestedValue)}
          </button>
        ))}
      </div>
    </div>
  )
})

ValueSlider.displayName = "ValueSlider"

export { ValueSlider }
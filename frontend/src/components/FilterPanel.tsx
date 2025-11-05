import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
}

interface FilterPanelProps {
  categories: FilterCategory[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (categoryId: string, optionId: string, checked: boolean) => void;
}

export function FilterPanel({ categories, selectedFilters, onFilterChange }: FilterPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-muted-foreground">Filter By</h3>
      
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="border-b pb-3 last:border-b-0">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full text-left py-2 hover:text-primary transition-colors"
            >
              <span className="text-muted-foreground">{category.label}</span>
              {expandedCategories[category.id] ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedCategories[category.id] && (
              <div className="space-y-2 mt-2 pl-2">
                {category.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${category.id}-${option.id}`}
                      checked={selectedFilters[category.id]?.includes(option.id) || false}
                      onCheckedChange={(checked) => 
                        onFilterChange(category.id, option.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`${category.id}-${option.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

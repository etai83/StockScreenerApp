"use client";

import React, { useState, useCallback } from 'react';
import { FilterRule, FilterableMetric, FilterOperator, filterableMetricsList, filterOperatorList, FilterGroup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for rules

// Helper to get default value based on operator
const getDefaultValueForOperator = (operator: FilterOperator): number | [number, number] => {
  if (operator === 'between') {
    return [0, 100]; // Default range
  }
  return 0; // Default single value
};

interface FilterBuilderProps {
  onApplyFilters: (filterGroup: FilterGroup) => void;
  initialFilterGroup?: FilterGroup; // To load existing filters
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({ onApplyFilters, initialFilterGroup }) => {
  const [filterGroup, setFilterGroup] = useState<FilterGroup>(
    initialFilterGroup || { id: uuidv4(), logic: 'AND', rules: [] }
  );

  const handleAddRule = () => {
    const newRule: FilterRule = {
      id: uuidv4(),
      metric: filterableMetricsList[0].value, // Default metric
      operator: filterOperatorList[0].value, // Default operator
      value: getDefaultValueForOperator(filterOperatorList[0].value),
    };
    setFilterGroup(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
  };

  const handleRemoveRule = (ruleId: string) => {
    setFilterGroup(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId),
    }));
  };

  const handleRuleChange = <K extends keyof FilterRule>(
    ruleId: string,
    field: K,
    value: FilterRule[K]
  ) => {
    setFilterGroup(prev => ({
      ...prev,
      rules: prev.rules.map(rule => {
        if (rule.id === ruleId) {
          const updatedRule = { ...rule, [field]: value };
          // If operator changes, reset value to a compatible default
          if (field === 'operator') {
            updatedRule.value = getDefaultValueForOperator(value as FilterOperator);
          }
          return updatedRule;
        }
        return rule;
      }),
    }));
  };

  const handleLogicChange = (logic: 'AND' | 'OR') => {
    setFilterGroup(prev => ({ ...prev, logic }));
  };

  const handleSubmit = () => {
    // TODO: Add validation for filter values if needed
    onApplyFilters(filterGroup);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-card shadow">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filter Stocks</h3>
        <div className="space-x-2">
          <span className="text-sm">Combine rules with:</span>
          <Select value={filterGroup.logic} onValueChange={(value: 'AND' | 'OR') => handleLogicChange(value)}>
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Logic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filterGroup.rules.map((rule, index) => (
        <div key={rule.id} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
          {/* Metric Select */}
          <Select
            value={rule.metric}
            onValueChange={(value: FilterableMetric) => handleRuleChange(rule.id, 'metric', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Metric" />
            </SelectTrigger>
            <SelectContent>
              {filterableMetricsList.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Operator Select */}
          <Select
            value={rule.operator}
            onValueChange={(value: FilterOperator) => handleRuleChange(rule.id, 'operator', value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {filterOperatorList.map(op => (
                <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value Input(s) */}
          {rule.operator === 'between' ? (
            <>
              <Input
                type="number"
                className="w-[100px]"
                value={(rule.value as [number, number])[0]}
                onChange={(e) => handleRuleChange(rule.id, 'value', [parseFloat(e.target.value), (rule.value as [number, number])[1]])}
                placeholder="Min"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                className="w-[100px]"
                value={(rule.value as [number, number])[1]}
                onChange={(e) => handleRuleChange(rule.id, 'value', [(rule.value as [number, number])[0], parseFloat(e.target.value)])}
                placeholder="Max"
              />
            </>
          ) : (
            <Input
              type="number"
              className="w-[100px]"
              value={rule.value as number}
              onChange={(e) => handleRuleChange(rule.id, 'value', parseFloat(e.target.value))}
              placeholder="Value"
            />
          )}

          <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)} aria-label="Remove filter rule">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center space-x-2 mt-3">
        <Button variant="outline" onClick={handleAddRule} size="sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
        </Button>
        <Button onClick={handleSubmit} size="sm" disabled={filterGroup.rules.length === 0}>
          Apply Filters
        </Button>
        {/* "Create Alert" button - will be handled by parent */}
      </div>

      {/* For advanced users: Raw JSON view/edit (Optional v2) */}
      {/* <div className="mt-4">
        <label htmlFor="rawJsonFilters" className="block text-sm font-medium text-gray-700">Raw JSON Filters (Advanced)</label>
        <textarea
          id="rawJsonFilters"
          rows={5}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={JSON.stringify(filterGroup, null, 2)}
          onChange={(e) => {
            try {
              const newGroup = JSON.parse(e.target.value);
              // Basic validation before setting
              if (newGroup && Array.isArray(newGroup.rules)) {
                setFilterGroup(newGroup);
              }
            } catch (error) {
              console.warn("Invalid JSON for filters:", error);
            }
          }}
        />
      </div> */}
    </div>
  );
};

export default FilterBuilder;

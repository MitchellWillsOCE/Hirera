import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobApplication, FilterOptions, SortOptions } from '@/lib/types';
import { Search, X, Filter, SortAsc, SortDesc, Calendar, DollarSign, Building, Clock, Briefcase } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  sortOptions: SortOptions;
  onSortChange: (options: SortOptions) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  jobs: JobApplication[];
  showSearch?: boolean;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  sortOptions,
  onSortChange,
  searchQuery,
  onSearchChange,
  jobs,
  showSearch = true,
}: FilterPanelProps) {
  const statusOptions: JobApplication['status'][] = [
    'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'
  ];

  const priorityOptions: JobApplication['priority'][] = ['LOW', 'MEDIUM', 'HIGH'];

  const toggleStatusFilter = (status: JobApplication['status']) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const togglePriorityFilter = (priority: JobApplication['priority']) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = 
    searchQuery || 
    (filters.status && filters.status.length > 0) ||
    (filters.priority && filters.priority.length > 0) ||
    filters.company;

  const getStatusEmoji = (status: JobApplication['status']) => {
    const statusEmojis = {
      APPLIED: '📝',
      SCREENING: '📞',
      INTERVIEW: '🎤',
      OFFER: '🎉',
      REJECTED: '❌',
      WITHDRAWN: '🚫'
    };
    return statusEmojis[status];
  };

  const getPriorityEmoji = (priority: JobApplication['priority']) => {
    const priorityEmojis = {
      LOW: '🟢',
      MEDIUM: '🟡',
      HIGH: '🔴'
    };
    return priorityEmojis[priority];
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0 flex-1">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Filters & Search</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700 h-8 px-2 sm:h-9 sm:px-3 flex-shrink-0">
              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Search */}
        {showSearch && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search Applications
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by job title, company, location, or tags..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 h-10 sm:h-9 text-base sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Status Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Application Status</label>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status}
                variant={filters.status?.includes(status) ? "default" : "secondary"}
                className="cursor-pointer hover:opacity-80 transition-all duration-200 justify-center py-2 px-3 text-xs sm:text-xs h-10 sm:h-8"
                onClick={() => toggleStatusFilter(status)}
              >
                <span className="mr-1">{getStatusEmoji(status)}</span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Priority Level</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((priority) => (
              <Badge
                key={priority}
                variant={filters.priority?.includes(priority) ? "default" : "secondary"}
                className="cursor-pointer hover:opacity-80 transition-all duration-200 py-2 px-3 text-xs h-10 sm:h-8"
                onClick={() => togglePriorityFilter(priority)}
              >
                <span className="mr-1">{getPriorityEmoji(priority)}</span>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Company Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </label>
          <Input
            placeholder="Filter by company name..."
            value={filters.company || ''}
            onChange={(e) => onFiltersChange({ ...filters, company: e.target.value })}
            className="h-10 sm:h-9 text-base sm:text-sm"
          />
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Sort Applications</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              variant={sortOptions.field === 'appliedDate' ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange({ 
                field: 'appliedDate', 
                direction: sortOptions.field === 'appliedDate' && sortOptions.direction === 'desc' ? 'asc' : 'desc' 
              })}
              className="justify-start text-xs h-10 sm:h-8"
            >
              <Calendar className="h-3 w-3 mr-2" />
              Date Applied
              {sortOptions.field === 'appliedDate' && (
                sortOptions.direction === 'desc' ? 
                <SortDesc className="h-3 w-3 ml-1" /> : 
                <SortAsc className="h-3 w-3 ml-1" />
              )}
            </Button>
            
            <Button
              variant={sortOptions.field === 'lastUpdated' ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange({ 
                field: 'lastUpdated', 
                direction: sortOptions.field === 'lastUpdated' && sortOptions.direction === 'desc' ? 'asc' : 'desc' 
              })}
              className="justify-start text-xs h-10 sm:h-8"
            >
              <Clock className="h-3 w-3 mr-2" />
              Last Updated
              {sortOptions.field === 'lastUpdated' && (
                sortOptions.direction === 'desc' ? 
                <SortDesc className="h-3 w-3 ml-1" /> : 
                <SortAsc className="h-3 w-3 ml-1" />
              )}
            </Button>
            
            <Button
              variant={sortOptions.field === 'company' ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange({ 
                field: 'company', 
                direction: sortOptions.field === 'company' && sortOptions.direction === 'desc' ? 'asc' : 'desc' 
              })}
              className="justify-start text-xs h-10 sm:h-8"
            >
              <Building className="h-3 w-3 mr-2" />
              Company
              {sortOptions.field === 'company' && (
                sortOptions.direction === 'desc' ? 
                <SortDesc className="h-3 w-3 ml-1" /> : 
                <SortAsc className="h-3 w-3 ml-1" />
              )}
            </Button>
            
            <Button
              variant={sortOptions.field === 'jobTitle' ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange({ 
                field: 'jobTitle', 
                direction: sortOptions.field === 'jobTitle' && sortOptions.direction === 'desc' ? 'asc' : 'desc' 
              })}
              className="justify-start text-xs h-10 sm:h-8"
            >
              <Briefcase className="h-3 w-3 mr-2" />
              Job Title
              {sortOptions.field === 'jobTitle' && (
                sortOptions.direction === 'desc' ? 
                <SortDesc className="h-3 w-3 ml-1" /> : 
                <SortAsc className="h-3 w-3 ml-1" />
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-4 border-t">
            <label className="text-sm font-medium">Active Filters</label>
            <div className="space-y-2">
              {searchQuery && (
                <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <span className="truncate">Search: "{searchQuery}"</span>
                  <Button variant="ghost" size="sm" onClick={() => onSearchChange('')} className="h-6 w-6 p-0 flex-shrink-0 ml-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {filters.company && (
                <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <span className="truncate">Company: "{filters.company}"</span>
                  <Button variant="ghost" size="sm" onClick={() => onFiltersChange({ ...filters, company: undefined })} className="h-6 w-6 p-0 flex-shrink-0 ml-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {filters.status && filters.status.length > 0 && (
                <div className="text-xs bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                  <span>Status: {filters.status.join(', ')}</span>
                </div>
              )}
              
              {filters.priority && filters.priority.length > 0 && (
                <div className="text-xs bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  <span>Priority: {filters.priority.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
import React, { useState, useEffect, useRef } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MemberData {
  id: number;
  memberName: string;
  installment: number;
  amount: number;
  interest: number;
  fine: number;
  withdrawal: number;
  newWithdrawal: number;
  total: number;
  highlighted?: boolean;
}

interface CustomMemberDropdownProps {
  data: MemberData[];
  value: string;
  onSelect: (member: MemberData) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

const CustomMemberDropdown: React.FC<CustomMemberDropdownProps> = ({
  data,
  value,
  onSelect,
  placeholder = "Select or type member name...",
  searchPlaceholder = "Search member...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const [filteredData, setFilteredData] = useState<MemberData[]>(data);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter data based on search input
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        item.memberName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [search, data]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (member: MemberData) => {
    onSelect(member);
    setSearch(member.memberName);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setSearch(value || '');
  };

  const handleInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <Input
          type="text"
          value={search}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="w-full pr-10 cursor-pointer text-sm sm:text-base"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={handleButtonClick}
        >
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md max-h-60 overflow-hidden">
          {/* Search Input inside dropdown */}
          <div className="p-2 border-b border-gray-100">
            <Input
              type="text"
              value={search}
              onChange={handleInputChange}
              placeholder={searchPlaceholder}
              className="w-full text-sm"
              autoFocus
            />
          </div>

          {/* Dropdown List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredData.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No member found
              </div>
            ) : (
              <div className="py-1">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-gray-50 ${
                      value === item.memberName ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <Check
                      className={`h-4 w-4 ${
                        value === item.memberName ? 'opacity-100 text-blue-600' : 'opacity-0'
                      }`}
                    />
                    <span className="flex-1 truncate">{item.memberName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMemberDropdown;
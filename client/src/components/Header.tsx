import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onPostBook: () => void;
  onToggleSearch: () => void;
  onSearch: (query: string) => void;
  onOpenFilter: () => void;
  showSearch: boolean;
}

export default function Header({ 
  onPostBook, 
  onToggleSearch, 
  onSearch, 
  onOpenFilter, 
  showSearch 
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="material-icons text-[#1A73E8] mr-2">auto_stories</span>
          <h1 className="text-xl font-bold text-[#1A73E8]">BookLoop</h1>
        </Link>
        
        <div className="flex items-center">
          <button 
            onClick={onToggleSearch}
            className="p-2 rounded-full hover:bg-[#F8F9FA] mr-1"
            aria-label="Toggle search"
          >
            <span className="material-icons">search</span>
          </button>
          
          <button 
            onClick={onPostBook}
            className="bg-[#1A73E8] text-white px-4 py-2 rounded-lg flex items-center"
          >
            <span className="material-icons mr-1">add</span>
            <span className="hidden sm:inline">Post a Book</span>
          </button>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      {showSearch && (
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="material-icons text-[#5F6368] text-sm">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search by title or author"
                className="w-full pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={onOpenFilter}
              className="flex items-center justify-center"
            >
              <span className="material-icons mr-1">filter_list</span>
              <span>Filters</span>
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}

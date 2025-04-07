import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import FilterModal from "@/components/FilterModal";
import PostBookModal from "@/components/PostBookModal";
import ContactModal from "@/components/ContactModal";
import { Book } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [contactBook, setContactBook] = useState<Book | null>(null);
  const [filters, setFilters] = useState({
    subject: "All Subjects",
    condition: "All",
    freeOnly: false
  });

  // Fetch books based on search query and filters
  const { data: books = [], isLoading } = useQuery({
    queryKey: [
      '/api/books', 
      searchQuery ? `/api/books/search?q=${encodeURIComponent(searchQuery)}` : null,
      filters.subject !== "All Subjects" || filters.condition !== "All" || filters.freeOnly ? 
        `/api/books/filter?subject=${encodeURIComponent(filters.subject)}&condition=${encodeURIComponent(filters.condition)}&freeOnly=${filters.freeOnly}` : 
        null
    ].filter(Boolean),
    queryFn: async ({ queryKey }) => {
      const endpoint = queryKey[1] || queryKey[2] || queryKey[0];
      const response = await fetch(endpoint as string);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      return response.json();
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const openContactModal = (book: Book) => {
    setContactBook(book);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <Header 
        onPostBook={() => setShowPostModal(true)} 
        onToggleSearch={() => setShowSearch(!showSearch)}
        showSearch={showSearch}
        onSearch={handleSearch}
        onOpenFilter={() => setShowFilterModal(true)}
      />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Campus Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Books at</h2>
            <button className="flex items-center text-[#1A73E8] font-medium">
              <span>Delhi University North Campus</span>
              <span className="material-icons ml-1">expand_more</span>
            </button>
          </div>
          <p className="text-[#5F6368] text-sm mt-1">Browse and exchange books in your campus</p>
        </div>

        {/* Book Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map((book: Book) => (
              <BookCard 
                key={book.id} 
                book={book} 
                onContact={() => openContactModal(book)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons text-gray-300" style={{ fontSize: 60 }}>auto_stories</span>
            <h3 className="text-xl font-semibold mt-4">No books found</h3>
            <p className="text-[#5F6368] text-center mt-2 max-w-md">
              There are no books available at your campus right now. Be the first to post a book!
            </p>
            <button 
              onClick={() => setShowPostModal(true)}
              className="mt-6 bg-[#1A73E8] text-white px-6 py-3 rounded-lg flex items-center"
            >
              <span className="material-icons mr-2">add</span>
              <span>Post a Book</span>
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Only */}
      <div className="sm:hidden fixed right-6 bottom-6 z-20">
        <button 
          onClick={() => setShowPostModal(true)}
          className="flex items-center justify-center w-14 h-14 bg-[#1A73E8] text-white rounded-full shadow-lg"
        >
          <span className="material-icons">add</span>
        </button>
      </div>

      {/* Modals */}
      {showFilterModal && (
        <FilterModal 
          filters={filters}
          onClose={() => setShowFilterModal(false)} 
          onApply={handleFilterChange}
        />
      )}

      {showPostModal && (
        <PostBookModal onClose={() => setShowPostModal(false)} />
      )}

      {contactBook && (
        <ContactModal 
          book={contactBook} 
          onClose={() => setContactBook(null)} 
        />
      )}
    </div>
  );
}

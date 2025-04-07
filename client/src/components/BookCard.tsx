import { Book } from "@shared/schema";

interface BookCardProps {
  book: Book;
  onContact: () => void;
}

// Map of subjects to background and text colors
const subjectColors: Record<string, { bg: string; text: string }> = {
  "Computer Science": { bg: "bg-indigo-100", text: "text-indigo-800" },
  "Mathematics": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "Physics": { bg: "bg-blue-100", text: "text-blue-800" },
  "Chemistry": { bg: "bg-green-100", text: "text-green-800" },
  "Biology": { bg: "bg-teal-100", text: "text-teal-800" },
  "Economics": { bg: "bg-blue-100", text: "text-blue-800" },
  "History": { bg: "bg-red-100", text: "text-red-800" },
  "Literature": { bg: "bg-orange-100", text: "text-orange-800" },
  "Psychology": { bg: "bg-purple-100", text: "text-purple-800" },
  "Other": { bg: "bg-gray-100", text: "text-gray-800" },
};

export default function BookCard({ book, onContact }: BookCardProps) {
  const { bg, text } = subjectColors[book.subject] || { bg: "bg-gray-100", text: "text-gray-800" };

  return (
    <div className="book-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md relative transition transform hover:-translate-y-0.5">
      {book.sold && (
        <div className="sold-ribbon absolute top-[10px] right-[-30px] transform rotate-45 w-[120px] text-center py-1 bg-[#34A853] text-white font-bold z-10">
          SOLD
        </div>
      )}
      
      <div className="relative pb-[65%]">
        <img 
          src={book.imageUrl} 
          alt={`Cover of ${book.title}`} 
          className={`absolute inset-0 w-full h-full object-cover ${book.sold ? 'opacity-60' : ''}`}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
        <p className="text-[#5F6368] mb-2">by {book.author}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className={`${bg} ${text} px-2 py-1 rounded-full text-xs font-medium`}>
            {book.subject}
          </span>
          <span className="text-[#5F6368] text-sm">{book.condition}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`font-bold text-lg ${book.price === 0 ? 'text-[#34A853]' : 'text-[#202124]'}`}>
            {book.price === 0 ? 'FREE' : `₹${book.price}`}
          </span>
          
          <div className="flex space-x-2">
            <button 
              className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 ${
                book.sold ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-[#F8F9FA]'
              }`}
              onClick={book.sold ? undefined : onContact}
              disabled={book.sold}
              title="Call seller"
            >
              <span className={`material-icons ${book.sold ? 'text-gray-400' : 'text-[#5F6368]'}`}>
                call
              </span>
            </button>
            
            <button 
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                book.sold ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={book.sold ? undefined : onContact}
              disabled={book.sold}
              title="WhatsApp"
            >
              <span className="material-icons text-white">chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

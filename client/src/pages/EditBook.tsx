import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Book } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditBook() {
  const { secretId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    subject: "",
    condition: "",
    price: 0,
    phone: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch book data by secret ID
  const { data: book, isLoading, isError } = useQuery({
    queryKey: [`/api/books/secret/${secretId}`],
    queryFn: async () => {
      const res = await fetch(`/api/books/secret/${secretId}`);
      if (!res.ok) {
        throw new Error('Book not found');
      }
      return res.json() as Promise<Book>;
    }
  });

  // Update book mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch(`/api/books/secret/${secretId}`, {
        method: 'PUT',
        body: data,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update book');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mark as sold mutation
  const markAsSoldMutation = useMutation({
    mutationFn: () => {
      return apiRequest('PUT', `/api/books/secret/${secretId}/sold`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Success",
        description: "Book marked as sold",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark book as sold",
        variant: "destructive",
      });
    }
  });

  // Delete book mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      return apiRequest('DELETE', `/api/books/secret/${secretId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Success",
        description: "Book listing deleted",
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  });

  // Initialize form with book data
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        subject: book.subject,
        condition: book.condition,
        price: book.price,
        phone: book.phone,
      });
      setImagePreview(book.imageUrl);
    }
  }, [book]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid or Expired Link</h1>
          <p className="mb-6">This edit link is invalid or has expired.</p>
          <Button onClick={() => navigate('/')}>Go Back Home</Button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseInt(value) : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('author', formData.author);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('condition', formData.condition);
    formDataToSend.append('price', formData.price.toString());
    formDataToSend.append('phone', formData.phone);
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    updateMutation.mutate(formDataToSend);
  };

  const handleMarkAsSold = () => {
    markAsSoldMutation.mutate();
  };

  const confirmDelete = () => {
    setDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Edit Your Book</h1>
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-[#F8F9FA]"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Book Title*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Author*</Label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject*</Label>
            <Select 
              name="subject" 
              value={formData.subject} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
                <SelectItem value="Economics">Economics</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Literature">Literature</SelectItem>
                <SelectItem value="Psychology">Psychology</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Condition*</Label>
            <div className="flex space-x-2 mt-1.5">
              <Button
                type="button"
                variant={formData.condition === "New" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFormData(prev => ({ ...prev, condition: "New" }))}
              >
                New
              </Button>
              <Button
                type="button"
                variant={formData.condition === "Used" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setFormData(prev => ({ ...prev, condition: "Used" }))}
              >
                Used
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="price">Price*</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-[#5F6368]">₹</span>
              </div>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="pl-8"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number*</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              pattern="[0-9]{10}"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <p className="text-xs text-[#5F6368] mt-1">Buyers will contact you on this number</p>
          </div>

          <div>
            <Label htmlFor="image">Book Image</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1.5">
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={imagePreview} 
                    alt="Book preview" 
                    className="h-40 object-contain mb-2" 
                  />
                  <label 
                    htmlFor="image" 
                    className="text-[#1A73E8] cursor-pointer"
                  >
                    Change photo (optional)
                  </label>
                </div>
              ) : (
                <label htmlFor="image" className="cursor-pointer">
                  <span className="material-icons text-[#5F6368] text-3xl">add_photo_alternate</span>
                  <p className="mt-2 text-[#5F6368]">Click to upload a photo</p>
                </label>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-[#1A73E8]"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button
              type="button"
              className="w-full bg-[#34A853]"
              onClick={handleMarkAsSold}
              disabled={book.sold || markAsSoldMutation.isPending}
            >
              {book.sold ? "Already Marked as Sold" : markAsSoldMutation.isPending ? "Processing..." : "Mark as Sold"}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#EA4335] text-[#EA4335]"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Listing"}
            </Button>
          </div>
        </form>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your book listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

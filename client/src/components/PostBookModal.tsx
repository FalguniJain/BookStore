import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { validateBookSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PostBookModalProps {
  onClose: () => void;
}

type FormValues = z.infer<typeof validateBookSchema>;

export default function PostBookModal({ onClose }: PostBookModalProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(validateBookSchema),
    defaultValues: {
      title: "",
      author: "",
      subject: "",
      condition: "Used",
      price: 0,
      phone: "",
      imageUrl: "",
      sold: false,
      secretId: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/books', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post book');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Show success toast
      toast({
        title: "Success",
        description: "Book posted successfully! Save the edit link to update your listing later.",
      });
      
      // Copy edit link to clipboard
      const editLink = `${window.location.origin}/edit/${data.secretId}`;
      navigator.clipboard.writeText(editLink)
        .then(() => {
          toast({
            title: "Edit Link Copied",
            description: "The edit link has been copied to your clipboard.",
          });
        })
        .catch(() => {
          toast({
            title: "Note",
            description: `Keep this link to edit later: ${editLink}`,
          });
        });
      
      // Refresh books list
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      
      // Close modal
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (values: FormValues) => {
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Please upload a book image",
        variant: "destructive",
      });
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("author", values.author);
    formData.append("subject", values.subject);
    formData.append("condition", values.condition);
    formData.append("price", values.price.toString());
    formData.append("phone", values.phone);
    formData.append("image", imageFile);

    mutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Book</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter book title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter author name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition*</FormLabel>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={field.value === "New" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => form.setValue("condition", "New")}
                    >
                      New
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === "Used" ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => form.setValue("condition", "Used")}
                    >
                      Used
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price*</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-[#5F6368]">₹</span>
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="0 for free books" 
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-xs text-[#5F6368] mt-1">Buyers will contact you on this number</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="block mb-1.5">Book Image*</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-[#F8F9FA] cursor-pointer">
                <input 
                  type="file" 
                  id="book-image" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                <label htmlFor="book-image" className="cursor-pointer">
                  {imagePreview ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={imagePreview} 
                        alt="Book preview" 
                        className="h-40 object-contain mb-2" 
                      />
                      <p className="text-[#1A73E8]">Change photo</p>
                    </div>
                  ) : (
                    <>
                      <span className="material-icons text-[#5F6368] text-3xl">add_photo_alternate</span>
                      <p className="mt-2 text-[#5F6368]">Click to upload a photo</p>
                      <p className="text-xs text-[#5F6368] mt-1">JPG, PNG or GIF (max. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
              {!imageFile && form.formState.isSubmitted && (
                <p className="text-sm font-medium text-destructive mt-1">Book image is required</p>
              )}
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-[#1A73E8]"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Posting..." : "Post Book"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

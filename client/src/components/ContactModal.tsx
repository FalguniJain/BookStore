import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Book } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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

interface ContactModalProps {
  book: Book;
  onClose: () => void;
}

export default function ContactModal({ book, onClose }: ContactModalProps) {
  const { toast } = useToast();
  const [confirmReportOpen, setConfirmReportOpen] = useState(false);

  // Mutation for reporting a book
  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/books/${book.id}/report`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        throw new Error('Failed to report book');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Reported",
        description: "This listing has been reported to moderators.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report this listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Format phone number for links
  const formattedPhone = book.phone.startsWith('+') ? book.phone.substring(1) : book.phone;

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-3">
            <p className="text-[#5F6368]">
              Book: <span className="font-medium text-[#202124]">{book.title}</span>
            </p>
            <p className="text-lg mt-2">Seller's Phone Number</p>
            <p className="text-2xl font-bold text-[#1A73E8] my-3">
              {book.phone.length === 10 ? `+91 ${book.phone.substring(0, 5)} ${book.phone.substring(5)}` : book.phone}
            </p>
            
            <div className="flex justify-center space-x-4 mt-4">
              <a 
                href={`tel:+${formattedPhone}`} 
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-[#F8F9FA]"
              >
                <span className="material-icons text-3xl text-[#5F6368]">call</span>
                <span className="mt-1 text-sm">Call</span>
              </a>
              
              <a 
                href={`https://wa.me/${formattedPhone}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-[#F8F9FA]"
              >
                <span className="material-icons text-3xl text-green-500">chat</span>
                <span className="mt-1 text-sm">WhatsApp</span>
              </a>
              
              <button 
                onClick={() => setConfirmReportOpen(true)}
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-[#F8F9FA]"
              >
                <span className="material-icons text-3xl text-[#EA4335]">flag</span>
                <span className="mt-1 text-sm">Report</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmReportOpen} onOpenChange={setConfirmReportOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this listing? This will notify moderators to review it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-[#EA4335]" 
              onClick={() => {
                setConfirmReportOpen(false);
                reportMutation.mutate();
              }}
            >
              {reportMutation.isPending ? "Reporting..." : "Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

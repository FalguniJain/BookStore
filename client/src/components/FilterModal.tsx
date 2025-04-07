import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface FilterModalProps {
  filters: {
    subject: string;
    condition: string;
    freeOnly: boolean;
  };
  onClose: () => void;
  onApply: (filters: { subject: string; condition: string; freeOnly: boolean }) => void;
}

export default function FilterModal({ filters, onClose, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleReset = () => {
    setLocalFilters({
      subject: "All Subjects",
      condition: "All",
      freeOnly: false
    });
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Subject</Label>
            <Select 
              value={localFilters.subject} 
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, subject: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
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
            <Label className="text-sm font-medium mb-1.5 block">Condition</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={localFilters.condition === "All" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocalFilters(prev => ({ ...prev, condition: "All" }))}
              >
                All
              </Button>
              <Button
                type="button"
                variant={localFilters.condition === "New" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocalFilters(prev => ({ ...prev, condition: "New" }))}
              >
                New
              </Button>
              <Button
                type="button"
                variant={localFilters.condition === "Used" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setLocalFilters(prev => ({ ...prev, condition: "Used" }))}
              >
                Used
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Label className="text-sm font-medium">Show only free books</Label>
            <Switch 
              checked={localFilters.freeOnly}
              onCheckedChange={(checked) => setLocalFilters(prev => ({ ...prev, freeOnly: checked }))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-4">
          <Button variant="outline" className="flex-1" onClick={handleReset}>
            Reset
          </Button>
          <Button className="flex-1 bg-[#1A73E8]" onClick={() => onApply(localFilters)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

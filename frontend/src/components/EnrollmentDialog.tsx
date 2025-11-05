import type { Course } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useState } from 'react';
import { Check } from 'lucide-react';

interface EnrollmentDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnroll: (optionId: string) => void;
}

export function EnrollmentDialog({ course, open, onOpenChange, onEnroll }: EnrollmentDialogProps) {
  const [selectedOption, setSelectedOption] = useState(course.enrollmentOptions[0]?.id || '');

  const handleEnroll = () => {
    onEnroll(selectedOption);
    onOpenChange(false);
  };

  if (course.price === 'Free') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              This is a free lite course designed to give you an introduction to {course.title.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Unlimited access to all lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Earn a completion badge</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Access anytime, anywhere</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => { onEnroll('free'); onOpenChange(false); }}>
              Start Learning for Free
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Select the best enrollment option for your learning journey. If you don't complete the course within your plan period, you can extend or upgrade.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {course.enrollmentOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedOption === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOption(option.id)}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 w-full cursor-pointer">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-full">
                    <div>
                      <p className="capitalize">{option.type.replace('-', ' ')} Plan</p>
                      <p className="text-sm text-muted-foreground">{option.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${option.price}</p>
                      {option.type === 'yearly' && (
                        <p className="text-xs text-green-600">Best Value</p>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll}>
            Enroll Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

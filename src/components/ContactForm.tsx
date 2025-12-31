'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ContactForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [subjectType, setSubjectType] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    toast.success('Message sent!', {
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubjectType('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setSubjectType(value);
    if (value !== 'Other') {
      setFormData((prev) => ({ ...prev, subject: value }));
    } else {
      setFormData((prev) => ({ ...prev, subject: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject-select">Subject</Label>
        <Select value={subjectType} onValueChange={handleSelectChange}>
          <SelectTrigger id="subject-select">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
            <SelectItem value="Support">Support</SelectItem>
            <SelectItem value="Feedback">Feedback</SelectItem>
            <SelectItem value="Partnership">Partnership</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <AnimatePresence>
          {subjectType === 'Other' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <Label htmlFor="subject" className="sr-only">
                  Custom Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Please specify..."
                  required={subjectType === 'Other'}
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Tell us more..."
          required
          className="min-h-[150px]"
          value={formData.message}
          onChange={handleChange}
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto" loading={isLoading}>
        {isLoading ? (
          'Sending'
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}

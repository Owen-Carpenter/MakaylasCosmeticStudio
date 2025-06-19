import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { CalendarIcon, Clock, User, Mail, Phone, CreditCard } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: string;
  price: number;
}

interface BookingFormProps {
  services: Service[];
  serviceId?: string;
}

interface BookingFormValues {
  service: string;
  date: Date;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export function BookingForm({ services, serviceId }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    defaultValues: {
      service: serviceId || "",
      date: new Date(),
      time: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const handleBookingSubmit = (data: BookingFormValues) => {
    console.log("Booking data:", data);
    // Here we would normally:
    // 1. Submit the booking to the backend
    // 2. Redirect to Stripe checkout
    window.alert(`Booking submitted and would redirect to payment for $${getServicePrice(data.service)}`);
  };

  const getServicePrice = (id: string) => {
    const service = services.find(s => s.id === id);
    return service ? service.price : 0;
  };

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Service Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-white/90 border-0 shadow-sm">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the service you want to book.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="font-medium">Date</FormLabel>
                <div className="relative">
                  <div className="absolute top-0 right-0 p-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 2))}
                      className="border rounded-md bg-white/90 backdrop-blur-sm shadow-sm"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Time Slot</FormLabel>
                  <div className="relative">
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/90 border-0 shadow-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a time" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Full Name</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input className="pl-10 bg-white/90 border-0 shadow-sm" placeholder="John Doe" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Email</FormLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input className="pl-10 bg-white/90 border-0 shadow-sm" type="email" placeholder="you@example.com" {...field} />
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
                  <FormLabel className="font-medium">Phone</FormLabel>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input className="pl-10 bg-white/90 border-0 shadow-sm" placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <div className="flex justify-between mb-6">
            <span className="text-sm text-muted-foreground">Service Fee:</span>
            <span className="font-semibold text-lg">${getServicePrice(form.watch("service"))}</span>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-md hover:shadow-lg transition-all duration-300">
            <CreditCard className="mr-2 h-4 w-4" />
            Proceed to Payment
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Payments are processed securely through our payment provider
          </p>
        </div>
      </form>
    </Form>
  );
}
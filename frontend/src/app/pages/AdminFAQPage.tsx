import { useState } from "react";
import { Card } from "../components/ui/card";
import { ChevronDown } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FAQItems: FAQItem[] = [
  {
    id: "dashboard-1",
    category: "Dashboard",
    question: "How do I use the revenue dashboard?",
    answer: "The revenue dashboard lets you track all revenue from wallet top-ups, machine bookings, and other transactions. You can view revenue by month, segment, and detailed history by clicking items on the charts.",
  },
  {
    id: "dashboard-2",
    category: "Dashboard",
    question: "How do I filter revenue by date?",
    answer: "You can filter revenue by entering 'From date' and 'To date' in the date filters. Then press Enter or move to another field, and revenue will update for the selected range.",
  },
  {
    id: "dashboard-3",
    category: "Dashboard",
    question: "What do the dashboard metrics mean?",
    answer: "- Wallet top-up revenue: Total money customers added to wallets\n- Total orders: Number of machine rental orders\n- Booking revenue: Total money from machine rental orders\n- Customers: Total customers with transactions",
  },
  {
    id: "dashboard-4",
    category: "Dashboard",
    question: "Can I view revenue details for a specific month?",
    answer: "Yes, you can click any point or bar on the chart to view revenue details for that month. It will show all wallet top-up transactions or machine rental orders in that month.",
  },
  {
    id: "dashboard-5",
    category: "Dashboard",
    question: "What is revenue by segment?",
    answer: "Revenue by segment shows revenue from each computer type or package. You can view total revenue, percentage share, number of customers, and order count for each segment.",
  },
  {
    id: "dashboard-6",
    category: "Dashboard",
    question: "How do I filter revenue by segment?",
    answer: "You can filter revenue by segment in three ways:\n1. Search by name: Enter the segment name in the 'Search segments' field\n2. Filter by revenue: Enter minimum and maximum revenue\n3. Filter by customers: Enter minimum and maximum customer counts\nClick 'Clear filters' to reset your selections.",
  },
  {
    id: "account-1",
    category: "Account Management",
    question: "How do I manage customer accounts?",
    answer: "You can view and manage all customer accounts in 'Account Management'. There you can view basic information, transaction history, and activation status for each account.",
  },
  {
    id: "order-1",
    category: "Order Management",
    question: "How do I view order details?",
    answer: "You can view order details in 'Order Management'. It shows all machine booking orders with customer, package, price, time, and status information.",
  },
  {
    id: "order-2",
    category: "Order Management",
    question: "What statuses can orders have?",
    answer: "Order statuses include:\n- Pending: A new order was just created\n- Paid: The customer has paid\n- Active: The customer is using the machine\n- Completed: The rental period has ended\n- Cancelled: The customer cancelled the order",
  },
  {
    id: "invoice-1",
    category: "Invoice Management",
    question: "How do I view customer top-up history?",
    answer: "You can view top-up history for all customers in 'Invoice Management'. It shows every top-up transaction with amount, top-up date, and status information.",
  },
  {
    id: "invoice-2",
    category: "Invoice Management",
    question: "Can I filter invoices by date?",
    answer: "Yes, you can filter invoices by date in the filter section. You can also search by customer email or transaction ID.",
  },
  {
    id: "computer-1",
    category: "Computer Management",
    question: "How do I add a new computer?",
    answer: "You can add a new computer in 'Computer Management'. Click 'Add Computer' and fill in details such as name, CPU, RAM, storage, and more. Then click 'Save' to create the new computer.",
  },
  {
    id: "computer-2",
    category: "Computer Management",
    question: "How do I edit computer information?",
    answer: "You can edit computer information by clicking a computer in the list and selecting 'Edit'. Update the required information and click 'Save'.",
  },
  {
    id: "computer-3",
    category: "Computer Management",
    question: "How do I delete a computer?",
    answer: "You can delete a computer by clicking it in the list and selecting 'Delete'. Note: You can only delete a computer if there are no active bookings for that machine.",
  },
  {
    id: "package-1",
    category: "Package Management",
    question: "How do I create a new pricing package?",
    answer: "You can create a new pricing package in 'Pricing Packages'. Click 'Add Package' and fill in details such as package name, CPU, RAM, price, rental duration, and more. Then click 'Save' to create the new package.",
  },
  {
    id: "package-2",
    category: "Package Management",
    question: "How do I edit package pricing?",
    answer: "You can edit package pricing by clicking a package in the list and selecting 'Edit'. Update the price and any other needed information, then click 'Save'.",
  },
  {
    id: "package-3",
    category: "Package Management",
    question: "Can pricing packages be deleted?",
    answer: "You can delete a pricing package if no computers are linked to it. If the package already has linked computers, please move those machines to another package before deleting it.",
  },
  {
    id: "report-1",
    category: "Reports",
    question: "How do I create a revenue report?",
    answer: "The revenue dashboard is the revenue reporting tool. You can filter data by date, month, or segment, then export or print the report.",
  },
  {
    id: "report-2",
    category: "Reports",
    question: "Can I compare revenue between months?",
    answer: "Yes, the revenue charts let you compare revenue across different months. You can choose 'Top Up Chart' or 'Booking Chart' to compare revenue by transaction type.",
  },
  {
    id: "session-1",
    category: "Session Management",
    question: "How do I manage customer sessions?",
    answer: "You can manage customer sessions in 'Session Management'. There you can view all active sessions, connection time, and disconnect sessions when needed.",
  },
  {
    id: "session-2",
    category: "Session Management",
    question: "Can I disconnect a customer?",
    answer: "Yes, you can disconnect a customer by clicking a session in the list and selecting 'Disconnect'. This closes the customer's remote connection to the computer.",
  },
];

export function AdminFAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(FAQItems.map((item) => item.category)));
  const filteredItems = selectedCategory
    ? FAQItems.filter((item) => item.category === selectedCategory)
    : FAQItems;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Management Guide
          </h1>
          <p className="text-muted-foreground text-lg">
            Detailed guidance on how to use the admin dashboard
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-border overflow-hidden transition-all hover:shadow-lg"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full p-6 flex items-start justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{item.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground ml-4 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 border-t border-border bg-muted/30">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {item.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Support Section */}
        <Card className="p-8 mt-12 border-border bg-muted/50">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you need technical support or have questions about the system, please contact technical support.
          </p>
          <div className="space-y-2">
            <p className="text-foreground">
              <strong>Email:</strong> tech-support@onnet-pc.com
            </p>
            <p className="text-foreground">
              <strong>Internal Chat:</strong> Use the internal chat system
            </p>
          </div>
        </Card>
      </div>
      </div>
      <Footer />
    </>
  );
}

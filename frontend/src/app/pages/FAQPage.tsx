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
    id: "account-1",
    category: "Account",
    question: "How do I create an account?",
    answer:
      "You can create an account by clicking the 'Sign Up' button on the homepage. Then fill in your email, password, and personal information. A confirmation email will be sent to your email, please click the confirmation link to complete the registration.",
  },
  {
    id: "account-2",
    category: "Account",
    question: "I forgot my password, what should I do?",
    answer:
      "Click on the 'Forgot Password' link on the login page. Enter your email and you will receive an email with a link to reset your password.",
  },
  {
    id: "account-3",
    category: "Account",
    question: "Can I change my personal information?",
    answer:
      "Yes, you can change your personal information by going to 'Account' > 'Account Info' and updating your information. You can also change your password in the 'Change Password' section.",
  },
  {
    id: "rental-1",
    category: "Rental",
    question: "How does your computer rental work?",
    answer:
      "You can browse different computer packages on the 'Computers' or 'Pricing' page. Select a package, view the machine details, and click 'Rent Now'. Then pay and your machine will be activated immediately.",
  },
  {
    id: "rental-2",
    category: "Rental",
    question: "What features do the rental packages have?",
    answer:
      "Each rental package has different CPU, RAM, storage capacity, rental time, and price. You can view the full details of each package before renting. All packages support 24/7 remote access.",
  },
  {
    id: "rental-3",
    category: "Rental",
    question: "What is the minimum rental time?",
    answer:
      "The minimum rental time depends on the package you choose. Most packages can be rented for 1 hour or more. You can view the rental time details in the package description.",
  },
  {
    id: "rental-4",
    category: "Rental",
    question: "Can I extend or cancel my rental order?",
    answer:
      "You can view your rental history in 'Account' > 'Rental History'. Here you can see detailed information about each order. To extend or cancel, please contact customer support.",
  },
  {
    id: "payment-1",
    category: "Payment",
    question: "What payment methods do you accept?",
    answer:
      "We accept payment via e-wallet. You can top up your wallet from 'Wallet' > 'Top Up'. After topping up, you can use the balance in your wallet to pay for our services.",
  },
  {
    id: "payment-2",
    category: "Payment",
    question: "How can I top up my wallet?",
    answer:
      "You can top up your wallet by going to 'Wallet' > 'Top Up', select the amount to top up, choose the payment method, and follow the instructions. The money will be added to your wallet immediately after successful payment.",
  },
  {
    id: "payment-3",
    category: "Payment",
    question: "Can I withdraw money from my wallet?",
    answer:
      "Currently, we do not support withdrawing money from the wallet. However, you can use the balance in your wallet to pay for our services or contact customer support for assistance.",
  },
  {
    id: "payment-4",
    category: "Payment",
    question: "Where can I view my top-up invoices?",
    answer:
      "You can view all your top-up invoices in 'Account' > 'Top-up Bills'. Here you can see the details of each top-up transaction.",
  },
  {
    id: "technical-1",
    category: "Technical Issues",
    question: "I can't connect to the rented computer, what should I do?",
    answer:
      "Please check your internet connection. If the connection is normal, try refreshing the browser or trying the connection again. If the problem persists, please contact our technical support team.",
  },
  {
    id: "technical-2",
    category: "Technical Issues",
    question: "The computer performance is slow, what can I do?",
    answer:
      "Computer performance may be affected by your internet connection or programs running on the machine. Try closing unnecessary programs or upgrading your computer package for better performance.",
  },
  {
    id: "technical-3",
    category: "Technical Issues",
    question: "Can I install software on the rented computer?",
    answer:
      "Yes, you can install any software you need on the rented computer. You have full access to the operating system and can install applications as desired.",
  },
  {
    id: "support-1",
    category: "Support",
    question: "How can I contact customer support?",
    answer:
      "You can contact customer support via email or live chat on the website. We have a support team ready to help you 24/7.",
  },
  {
    id: "support-2",
    category: "Support",
    question: "How long is the support response time?",
    answer:
      "We commit to responding to support requests within 24 hours. For urgent issues, we will try to respond faster.",
  },
];

export function FAQPage() {
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
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about our services
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
                    <h3 className="text-lg font-semibold mb-1">
                      {item.question}
                    </h3>
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
                    <p className="text-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="p-8 mt-12 border-border bg-muted/50">
            <h2 className="text-2xl font-bold mb-4">
              Could not find your answer?
            </h2>
            <p className="text-muted-foreground mb-6">
              If you have another question, please contact our customer support
              team. We are ready to help.
            </p>
            <div className="space-y-2">
              <p className="text-foreground">
                <strong>Email:</strong> support@onnet-pc.com
              </p>
              <p className="text-foreground">
                <strong>Chat:</strong> Click the chat icon in the bottom-right
                corner to talk with us
              </p>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}

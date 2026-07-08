import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I book a photographer on SnapZeiT?",
    answer: "Booking is simple! Browse photographers, view their portfolios, check availability, and book instantly. You can filter by location, specialty, price, and style to find your perfect match.",
    category: "booking"
  },
  {
    question: "Are all photographers on SnapZeiT verified?",
    answer: "Yes, all photographers undergo a verification process including portfolio review, background checks, and identity verification. We ensure only professional, qualified photographers join our platform.",
    category: "safety"
  },
  {
    question: "What photography services are available?",
    answer: "We offer wedding photography, portrait sessions, event photography, commercial shoots, fashion photography, product photography, maternity shoots, newborn photography, and more.",
    category: "services"
  },
  {
    question: "How much does photography cost on SnapZeiT?",
    answer: "Prices vary by photographer, location, and service type. Wedding photography starts from $2,500, portrait sessions from $300, and event photography from $800. All prices are transparent with no hidden fees.",
    category: "pricing"
  },
  {
    question: "Can I see photographer portfolios before booking?",
    answer: "Absolutely! Every photographer has a detailed profile with portfolio images, client reviews, pricing, and availability. You can browse their work and read reviews from previous clients.",
    category: "portfolios"
  },
  {
    question: "What if I need to cancel or reschedule my session?",
    answer: "Cancellation and rescheduling policies vary by photographer. Most offer flexible options with advance notice. Check the specific photographer's policy before booking.",
    category: "policies"
  },
  {
    question: "How do payments work on SnapZeiT?",
    answer: "Payments are secure and protected. We hold funds safely until your session is completed to your satisfaction. We accept all major credit cards and digital payment methods.",
    category: "payments"
  },
  {
    question: "Can I hire photographers internationally?",
    answer: "Yes! SnapZeiT operates in 50+ countries with photographers available worldwide. You can book local photographers or arrange for travel photography services.",
    category: "international"
  },
  {
    question: "What happens if I'm not satisfied with my photos?",
    answer: "We work with you and the photographer to resolve any issues. Our quality guarantee ensures you receive professional results that meet your expectations.",
    category: "satisfaction"
  },
  {
    question: "How far in advance should I book a photographer?",
    answer: "For weddings and major events, we recommend booking 3-6 months in advance. Portrait sessions can often be booked within days or weeks, depending on photographer availability.",
    category: "timing"
  }
];

interface FAQProps {
  category?: string;
  limit?: number;
}

export function FAQ({ category, limit }: FAQProps) {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);
  
  const filteredFAQs = category 
    ? FAQ_DATA.filter(faq => faq.category === category)
    : FAQ_DATA;
    
  const displayFAQs = limit 
    ? filteredFAQs.slice(0, limit)
    : filteredFAQs;

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Add FAQ structured data for SEO
  useEffect(() => {
    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": displayFAQs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq', 'true');
    script.textContent = JSON.stringify(faqStructuredData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[data-faq="true"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [displayFAQs]);

  return (
    <section className="py-16" aria-labelledby="faq-heading">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-4">
            <HelpCircle className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('howItWorks.faq')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('howItWorks.faqSubtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {displayFAQs.map((faq, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={openItems.includes(index)}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div 
                    id={`faq-answer-${index}`}
                    className="px-6 pb-6 text-gray-600 dark:text-gray-300 leading-relaxed animate-in slide-in-from-top-2 duration-300"
                  >
                    {faq.answer}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {limit && filteredFAQs.length > limit && (
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Have more questions? <a href="/contact" className="text-blue-600 hover:underline">Contact our support team</a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default FAQ;
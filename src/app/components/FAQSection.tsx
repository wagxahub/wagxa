import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does this platform work?',
    answer: 'Join live rounds, participate in real time, and earn based on activity and outcomes.',
  },
  {
    question: 'How do I earn rewards?',
    answer: 'You earn through participation, activity, and inviting others to the platform.',
  },
  {
    question: 'Is this real / legit?',
    answer: 'Yes. Activity, results, and payouts are tracked and updated live on the platform.',
  },
  {
    question: 'How do withdrawals work?',
    answer: 'You can request a withdrawal anytime. Processing is fast once your account is verified.',
  },
  {
    question: 'Is my account safe?',
    answer: 'Yes. Your account and transactions are secured with standard protection systems.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      className="w-full max-w-[480px] mx-auto px-6 py-8"
      style={{
        backgroundColor: 'transparent',
      }}
    >
      {/* Section Title */}
      <h3
        className="mb-3"
        style={{
          fontSize: '17px',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        FAQ
      </h3>

      {/* Accordion Items */}
      <div className="space-y-3">
        {faqData.map((item, index) => (
          <div
            key={index}
            className="rounded-xl transition-all"
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Question Row (Clickable) */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between gap-3 text-left transition-all"
            >
              <span
                className="font-medium"
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                {item.question}
              </span>
              
              <ChevronDown
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  width: '16px',
                  height: '16px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Answer (Collapsed by default) */}
            <div
              className="overflow-hidden transition-all duration-200 ease-out"
              style={{
                maxHeight: openIndex === index ? '200px' : '0',
                opacity: openIndex === index ? 1 : 0,
              }}
            >
              <p
                className="mt-2"
                style={{
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

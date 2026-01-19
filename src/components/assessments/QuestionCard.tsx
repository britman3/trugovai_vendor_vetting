'use client';

import React from 'react';
import { Card, RadioGroup, Input, TextArea } from '@/components/ui';
import { VettingQuestion, QuestionAnswer, AnswerValue } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: VettingQuestion;
  answer?: QuestionAnswer;
  onChange: (answer: QuestionAnswer) => void;
  questionNumber: number;
  showCriticalWarning?: boolean;
}

export function QuestionCard({
  question,
  answer,
  onChange,
  questionNumber,
  showCriticalWarning = false
}: QuestionCardProps) {
  const currentAnswer = answer || {
    answer: '' as AnswerValue,
    evidence: null,
    notes: null
  };

  const handleAnswerChange = (value: string) => {
    onChange({
      ...currentAnswer,
      answer: value as AnswerValue
    });
  };

  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...currentAnswer,
      evidence: e.target.value || null
    });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...currentAnswer,
      notes: e.target.value || null
    });
  };

  const isCritical = question.importance === 'critical';
  const isNoAnswer = currentAnswer.answer === 'no';

  return (
    <Card className={cn(
      'transition-all',
      currentAnswer.answer === 'yes' && 'border-l-4 border-l-approved',
      isNoAnswer && 'border-l-4 border-l-rejected',
      !currentAnswer.answer && 'border-l-4 border-l-transparent'
    )}>
      <div className="space-y-4">
        {/* Question Header */}
        <div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-navy text-white rounded-full flex items-center justify-center text-xs font-medium">
              {questionNumber}
            </span>
            <div className="flex-1">
              <p className="font-medium text-navy">
                {question.question}
              </p>
              {isCritical && (
                <span className="inline-block mt-1 text-xs font-medium text-rejected uppercase">
                  Critical
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Answer Options */}
        <div className="pl-9">
          <RadioGroup
            name={`question-${question.id}`}
            value={currentAnswer.answer}
            onChange={handleAnswerChange}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
              { value: 'na', label: 'N/A' },
              { value: 'unknown', label: 'Unknown' }
            ]}
            inline
          />
        </div>

        {/* Red Flag Warning */}
        <div className="pl-9">
          <div className={cn(
            'p-3 rounded-[var(--radius)] text-sm',
            isNoAnswer ? 'bg-rejected/10 border border-rejected/20' : 'bg-conditional/10'
          )}>
            <p className={cn(
              'flex items-start gap-2',
              isNoAnswer ? 'text-rejected' : 'text-conditional'
            )}>
              <span>⚠️</span>
              <span>
                <strong>Red Flag:</strong> {question.redFlag}
              </span>
            </p>
            {showCriticalWarning && isCritical && isNoAnswer && (
              <p className="mt-2 text-rejected font-medium">
                ⚠️ CRITICAL: A &quot;No&quot; answer will result in automatic rejection
              </p>
            )}
          </div>
        </div>

        {/* Evidence & Notes */}
        <div className="pl-9 space-y-3">
          <Input
            label="Evidence"
            value={currentAnswer.evidence || ''}
            onChange={handleEvidenceChange}
            placeholder={question.evidenceType}
            helperText={currentAnswer.answer === 'yes' ? 'Required for Yes answers' : 'Optional'}
          />

          <TextArea
            label="Notes"
            value={currentAnswer.notes || ''}
            onChange={handleNotesChange}
            placeholder="Additional notes or context (optional)"
            className="min-h-[60px]"
          />
        </div>
      </div>
    </Card>
  );
}

export default QuestionCard;

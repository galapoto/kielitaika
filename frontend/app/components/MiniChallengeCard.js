import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MiniChallengeCard({ challengeData, onComplete, questionNumber = 1, totalQuestions = 10 }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState(null); // 'correct' | 'wrong'
  const [timer, setTimer] = useState(20);
  const [lifelines] = useState(1);

  useEffect(() => {
    if (timer > 0 && !status) {
      const interval = setInterval(() => {
        setTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, status]);

  if (!challengeData) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No challenge</Text>
      </View>
    );
  }

  const handleSelect = (option) => {
    if (status) return;
    setSelected(option);
    const isCorrect = option === challengeData.answer;
    setStatus(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  };

  const progress = questionNumber / totalQuestions;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>👥</Text>
          <Text style={styles.headerText}>{questionNumber} of {totalQuestions}</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity style={styles.headerRight}>
          <Text style={styles.headerIcon}>⚡</Text>
          <Text style={styles.headerText}>{lifelines} of {totalQuestions}</Text>
        </TouchableOpacity>
      </View>

      {/* Timer/Score Circle */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{timer}</Text>
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <TouchableOpacity style={styles.hintButton}>
          <Text style={styles.hintIcon}>💡</Text>
          <Text style={styles.hintText}>Hint</Text>
        </TouchableOpacity>
        <Text style={styles.questionNumber}>
          Question <Text style={styles.questionNumberHighlight}>{String(questionNumber).padStart(2, '0')}</Text>
        </Text>
        <Text style={styles.questionCategory}>Sports Quiz</Text>
        <Text style={styles.questionText}>
          "{challengeData.prompt || challengeData.sentence || 'What is the most popular sport throughout the world?'}"
        </Text>
      </View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {challengeData.options?.map((opt, index) => {
          const isSelected = selected === opt;
          const isCorrect = opt === challengeData.answer;
          const isWrong = isSelected && !isCorrect;
          
          let buttonStyle = styles.answerButton;
          let textStyle = styles.answerButtonText;
          let statusIcon = null;

          if (status) {
            if (isCorrect) {
              buttonStyle = styles.answerButtonCorrect;
              statusIcon = <View style={styles.statusIconCorrect}><Text style={styles.statusIconText}>✓</Text></View>;
            } else if (isWrong) {
              buttonStyle = styles.answerButtonWrong;
              statusIcon = <View style={styles.statusIconWrong}><Text style={styles.statusIconText}>✗</Text></View>;
            } else {
              buttonStyle = styles.answerButtonUnselected;
            }
          } else if (isSelected) {
            buttonStyle = styles.answerButtonSelected;
          }

          return (
            <TouchableOpacity
              key={index}
              style={[buttonStyle, isSelected && styles.answerButtonSelectedState]}
              onPress={() => handleSelect(opt)}
              disabled={!!status}
            >
              <Text style={textStyle}>{opt}</Text>
              {statusIcon}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Next Button */}
      {status && (
        <TouchableOpacity style={styles.nextButton} onPress={onComplete}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C', // Dark purple background
    padding: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 4,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionCard: {
    backgroundColor: '#1A0B2E', // Dark indigo
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
  },
  hintButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF8C42', // Light orange
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  hintIcon: {
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  questionNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  questionNumberHighlight: {
    color: '#FF6B35',
  },
  questionCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  answersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  answerButton: {
    backgroundColor: '#2A1B3D', // Dark gray
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerButtonSelected: {
    backgroundColor: '#2A1B3D',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  answerButtonSelectedState: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  answerButtonCorrect: {
    backgroundColor: '#22C55E', // Green
  },
  answerButtonWrong: {
    backgroundColor: '#F97316', // Orange
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  answerButtonUnselected: {
    backgroundColor: '#2A1B3D',
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  statusIconCorrect: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconWrong: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#FF6B35', // Orange
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
  },
});






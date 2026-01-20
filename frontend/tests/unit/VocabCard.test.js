import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../app/context/ThemeContext';
import VocabCard from '../../app/components/VocabCard';

describe('VocabCard', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders word and example, handles press', () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <ThemeProvider>
      <VocabCard
        word="juoda"
        example="Minä juon kahvia."
        imageUrl="https://example.com"
        onPress={onPress}
        testID="vocab-card"
      />
      </ThemeProvider>
    );

    expect(getByText('juoda')).toBeTruthy();
    expect(getByText(/Minä juon kahvia/)).toBeTruthy();
    fireEvent.press(getByTestId('vocab-card'));
    expect(onPress).toHaveBeenCalled();
  });
});

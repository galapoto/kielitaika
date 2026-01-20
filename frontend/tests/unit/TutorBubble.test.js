import React from 'react';
import { render } from '@testing-library/react-native';
import TutorBubble from '../../app/components/TutorBubble';
import { ThemeProvider } from '../../app/context/ThemeContext';

describe('TutorBubble', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders message text', () => {
    const { getByText } = render(
      <ThemeProvider>
        <TutorBubble
          message="Hei maailma"
          maskedMessage="Hei ..."
          supportLevel={0}
          showMasked={false}
          grammar={null}
        />
      </ThemeProvider>
    );
    expect(getByText('Hei maailma')).toBeTruthy();
  });
});

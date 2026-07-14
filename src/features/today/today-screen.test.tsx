import { render, screen } from '@/lib/test-utils';

import { TodayScreen } from './today-screen';

describe('todayScreen', () => {
  it('renders the today title and empty state', () => {
    render(<TodayScreen />);
    expect(screen.getByTestId('today-screen')).toBeOnTheScreen();
    expect(screen.getByText('Today')).toBeOnTheScreen();
  });
});

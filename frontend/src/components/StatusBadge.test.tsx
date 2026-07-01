import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders PENDING status correctly', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeDefined();
  });

  it('renders DELIVERED status correctly', () => {
    render(<StatusBadge status="DELIVERED" />);
    expect(screen.getByText('Delivered')).toBeDefined();
  });
});

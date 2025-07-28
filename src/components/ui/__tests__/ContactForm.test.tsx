import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ContactForm } from '../ContactForm';

expect.extend(toHaveNoViolations);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock fetch
global.fetch = jest.fn();

describe('ContactForm', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<ContactForm />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<ContactForm className="custom-form" />);
      
      expect(container.firstChild).toHaveClass('custom-form');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty required fields', async () => {
      render(<ContactForm />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/message is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      render(<ContactForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('validates minimum message length', async () => {
      render(<ContactForm />);
      
      const messageInput = screen.getByLabelText(/message/i);
      await userEvent.type(messageInput, 'Hi');
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    it('clears validation errors when fields are corrected', async () => {
      render(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Trigger validation error
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
      
      // Fix the error
      await userEvent.type(nameInput, 'John Doe');
      
      await waitFor(() => {
        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters.',
    };

    it('submits form with valid data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ContactForm />);
      
      await userEvent.type(screen.getByLabelText(/name/i), validFormData.name);
      await userEvent.type(screen.getByLabelText(/email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/subject/i), validFormData.subject);
      await userEvent.type(screen.getByLabelText(/message/i), validFormData.message);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validFormData),
        });
      });
    });

    it('shows loading state during submission', async () => {
      (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ContactForm />);
      
      await userEvent.type(screen.getByLabelText(/name/i), validFormData.name);
      await userEvent.type(screen.getByLabelText(/email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/message/i), validFormData.message);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('shows success message after successful submission', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ContactForm />);
      
      await userEvent.type(screen.getByLabelText(/name/i), validFormData.name);
      await userEvent.type(screen.getByLabelText(/email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/message/i), validFormData.message);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
    });

    it('shows error message on submission failure', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ContactForm />);
      
      await userEvent.type(screen.getByLabelText(/name/i), validFormData.name);
      await userEvent.type(screen.getByLabelText(/email/i), validFormData.email);
      await userEvent.type(screen.getByLabelText(/message/i), validFormData.message);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
      });
    });

    it('resets form after successful submission', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      
      await userEvent.type(nameInput, validFormData.name);
      await userEvent.type(emailInput, validFormData.email);
      await userEvent.type(messageInput, validFormData.message);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
      
      // Check that form is reset
      expect(nameInput).toHaveValue('');
      expect(emailInput).toHaveValue('');
      expect(messageInput).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(<ContactForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper form labels', () => {
      render(<ContactForm />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('associates error messages with form fields', async () => {
      render(<ContactForm />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i);
        const errorMessage = screen.getByText(/name is required/i);
        
        expect(nameInput).toHaveAttribute('aria-describedby');
        expect(errorMessage).toHaveAttribute('id');
      });
    });

    it('supports keyboard navigation', async () => {
      render(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const subjectInput = screen.getByLabelText(/subject/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Tab through form elements
      nameInput.focus();
      expect(nameInput).toHaveFocus();
      
      fireEvent.keyDown(nameInput, { key: 'Tab' });
      expect(emailInput).toHaveFocus();
      
      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(subjectInput).toHaveFocus();
      
      fireEvent.keyDown(subjectInput, { key: 'Tab' });
      expect(messageInput).toHaveFocus();
      
      fireEvent.keyDown(messageInput, { key: 'Tab' });
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('calls onSubmit callback when provided', async () => {
      const onSubmit = jest.fn();
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<ContactForm onSubmit={onSubmit} />);
      
      await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
      await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
      await userEvent.type(screen.getByLabelText(/message/i), 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          subject: '',
          message: 'Test message',
        });
      });
    });
  });
});
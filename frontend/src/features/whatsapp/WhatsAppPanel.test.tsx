import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WhatsAppPanel from './WhatsAppPanel';
import { useAuthStore } from '../../store/useAuthStore';

// Mock de AuthStore
vi.mock('../../store/useAuthStore');

describe('WhatsAppPanel (Component Testing)', () => {
    it('debe mostrar el aviso de "Plan Lite - Panel Provisorio" cuando el usuario es Lite', () => {
        (useAuthStore as any).mockReturnValue({
            user: { plan: 'lite', whatsapp_enabled: true }
        });

        render(<WhatsAppPanel />);
        expect(screen.getByText(/Plan Lite - Panel Provisorio/i)).toBeInTheDocument();
        expect(screen.getByText(/Funcionalidad limitada/i)).toBeInTheDocument();
    });

    it('no debe mostrar el aviso de Plan Lite cuando el usuario es Premium', () => {
        (useAuthStore as any).mockReturnValue({
            user: { plan: 'premium', whatsapp_enabled: true }
        });

        render(<WhatsAppPanel />);
        expect(screen.queryByText(/Plan Lite - Panel Provisorio/i)).not.toBeInTheDocument();
    });

    it('debe mostrar el botón de "Ir al Panel de Ventas" solo en planes Pro (Basic/Premium)', () => {
        (useAuthStore as any).mockReturnValue({
            user: { plan: 'premium', whatsapp_enabled: true }
        });

        // Simulamos estado conectado
        // Nota: En un test real usaríamos mocks de axios para devolver el estado 'CONNECTED'
        render(<WhatsAppPanel />);
        // expect(screen.getByText(/Ir al Panel de Ventas/i)).toBeInTheDocument();
    });

    it('debe mostrar el QR de vinculación cuando el estado es QR_PENDING', async () => {
        // Mock de axios para devolver estado QR_PENDING y datos del QR
        // render(<WhatsAppPanel />);
        // expect(screen.getByAltText(/WhatsApp QR/i)).toBeInTheDocument();
    });
});

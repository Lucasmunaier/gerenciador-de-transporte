import React, { useRef } from 'react';
import { Passenger, Trip, TripType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { DocumentArrowDownIcon, CheckCircleIcon } from './icons';
import { TRIP_TYPE_OPTIONS } from '../constants';

interface ChargeModalProps {
  passenger: Passenger;
  unpaidTrips: Trip[];
  onClose: () => void;
}

// Ensure jspdf and html2canvas are declared globally if using script tags
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const ChargeModal: React.FC<ChargeModalProps> = ({ passenger, unpaidTrips, onClose }) => {
  const { markTripsAsPaid, profile } = useAppContext();
  const modalContentRef = useRef<HTMLDivElement>(null);

  const totalDue = unpaidTrips.reduce((sum, trip) => sum + trip.tripValue, 0);

  const handleMarkAsPaid = () => {
    if (unpaidTrips.length === 0) return;
    const tripIdsToPay = unpaidTrips.map(trip => trip.id);
    markTripsAsPaid(tripIdsToPay);
    alert(`Pagamento de R$ ${totalDue.toFixed(2)} para ${passenger.name} registrado com sucesso!`);
    onClose();
  };

  const handleExportPDF = () => {
    if (modalContentRef.current && window.html2canvas && window.jspdf) {
      const { jsPDF } = window.jspdf;
      // Temporarily make the total due visible for PDF capture if it's outside the main scrollable area
      const footerTotalElement = modalContentRef.current.querySelector('#pdf-total-due-display');
      if (footerTotalElement) {
        (footerTotalElement as HTMLElement).style.display = 'block';
      }

      window.html2canvas(modalContentRef.current, { scale: 2, scrollY: -window.scrollY }).then((canvas) => {
        if (footerTotalElement) {
          (footerTotalElement as HTMLElement).style.display = 'none'; // Hide it again after capture
        }
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        // const pdfHeight = pdf.internal.pageSize.getHeight(); // Not used directly for scaling image
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth; // Scale to fit width, allow height to adjust
        
        let finalImgHeight = imgHeight * ratio;
        let position = 10; // Initial top margin

        // Check if image is too tall for one page after scaling
        if (finalImgHeight > pdf.internal.pageSize.getHeight() - 20) { // -20 for top/bottom margins
          // Implement multi-page if necessary, or simply scale to fit height (might make it too small)
          // For simplicity, we'll just add it and let it be cut if too long, or user can scroll on PDF.
          // A more robust solution would involve splitting the canvas or image.
           finalImgHeight = pdf.internal.pageSize.getHeight() - 20; // Crop to fit
        }

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight);
        pdf.save(`cobranca_${passenger.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('sv')}.pdf`);
      });
    } else {
      alert("Erro ao exportar PDF. Bibliotecas não carregadas ou conteúdo não encontrado.");
    }
  };
  
  const getTripTypeLabel = (type: TripType | string) => { // Allow string for safety, though TripType is expected
    return TRIP_TYPE_OPTIONS.find(opt => opt.value === type)?.label || String(type);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="chargeModalTitle">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div ref={modalContentRef} className="p-6 overflow-y-auto"> {/* This div is captured by html2canvas */}
          <h3 id="chargeModalTitle" className="text-2xl font-semibold text-gray-800 mb-2">Cobrança para {passenger.name}</h3>
          <p className="text-sm text-gray-600 mb-6">Endereço: {passenger.address}</p>

          {unpaidTrips.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhuma viagem pendente de pagamento para este passageiro.</p>
          ) : (
            <>
              <h4 className="text-lg font-medium text-gray-700 mb-3">Viagens Pendentes:</h4>
              <div className="border border-gray-200 rounded-md mb-4">
                <ul className="divide-y divide-gray-200 max-h-[40vh] overflow-y-auto">
                  {unpaidTrips.map(trip => (
                    <li key={trip.id} className="px-4 py-3 flex justify-between items-center text-sm hover:bg-gray-50">
                      <div>
                        <span className="font-medium text-gray-700">{new Date(trip.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span> 
                        <span className="text-gray-500"> - {getTripTypeLabel(trip.type)}</span>
                      </div>
                      <span className="font-semibold text-green-600">R$ {trip.tripValue.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {profile?.pix_key && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Chave PIX para pagamento:</strong>
                        <span className="font-mono ml-2 bg-blue-100 px-2 py-1 rounded">{profile.pix_key}</span>
                    </p>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-300">
                <div className="flex justify-end items-center">
                  <span className="text-lg font-semibold text-gray-700 mr-2">Total a Pagar:</span>
                  <span className="text-2xl font-bold text-blue-700">R$ {totalDue.toFixed(2)}</span>
                </div>
              </div>
              {/* Hidden element for PDF total, if needed outside main content flow - though current placement is fine */}
              <div id="pdf-total-due-display" style={{display: 'none', textAlign: 'right', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#1D4ED8' }}>
                 Total a Pagar: R$ {totalDue.toFixed(2)}
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
           <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition duration-150"
          >
            Fechar
          </button>
          {unpaidTrips.length > 0 && (
            <button
              onClick={handleMarkAsPaid}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition duration-150"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Marcar como Pago
            </button>
          )}
           <button
            onClick={handleExportPDF}
            className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition duration-150"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargeModal;
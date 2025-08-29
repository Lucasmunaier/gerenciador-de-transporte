import React, { useRef, useState } from 'react';
import { Passenger, Trip, TripType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { DocumentArrowDownIcon, CheckCircleIcon } from './icons';
import { TRIP_TYPE_OPTIONS } from '../constants';

// Ícone do WhatsApp
const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 14c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.7-.8.9-.1.1-.3.1-.5 0-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.2-.3.4-.4.1-.1.2-.2.3-.3.1-.1.2-.3.1-.5-.1-.2-.6-1.5-.8-2.1-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.2-.6.4-.2.2-.7.7-.7 1.6 0 1 .7 1.9.8 2 .1.1 1.5 2.3 3.6 3.2.5.2.9.4 1.2.5.5.2 1 .1 1.3-.1.4-.2.6-.7.8-.9.1-.2.1-.4 0-.5l-.2-.1zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" />
  </svg>
);

interface ChargeModalProps {
  passenger: Passenger;
  unpaidTrips: Trip[];
  onClose: () => void;
}

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
  
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleMarkAsPaid = () => {
    if (window.confirm("Confirmar o recebimento deste valor?")) {
        const tripIdsToPay = unpaidTrips.map(trip => trip.id);
        markTripsAsPaid(tripIdsToPay);
        alert(`Pagamento de R$ ${totalDue.toFixed(2)} para ${passenger.name} registrado com sucesso!`);
        onClose();
    }
  };
  
  const handleExportPDF = () => {
    const element = modalContentRef.current;
    if (element && window.html2canvas && window.jspdf) {
      const { jsPDF } = window.jspdf;

      const originalScrollTop = element.scrollTop;
      element.scrollTop = 0;

      window.html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      }).then((canvas) => {
        element.scrollTop = originalScrollTop;

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, imgHeight * ratio);
        pdf.save(`cobranca_${passenger.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('sv')}.pdf`);
        
        setPdfDownloaded(true);
      }).catch(err => {
        element.scrollTop = originalScrollTop;
        console.error("Erro no html2canvas:", err);
        alert("Ocorreu um erro ao tentar exportar o PDF.");
      });
    } else {
      alert("Não foi possível encontrar os recursos para exportar o PDF.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!passenger.phone) {
      alert("Este passageiro não possui um número de telefone cadastrado.");
      return;
    }
    const phone = `55${passenger.phone.replace(/\D/g, '')}`;
    let message = `Olá, ${passenger.name}! A cobrança referente às suas viagens é de R$${totalDue.toFixed(2)}.`;
    if (profile?.pix_key) {
      message += `\n\nVocê pode pagar via PIX para a chave:\n*${profile.pix_key}*`;
    }
    message += `\n\nO PDF com os detalhes está em anexo. Qualquer dúvida, estou à disposição. Obrigado!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };
  
  const getTripTypeLabel = (type: TripType | string) => {
    return TRIP_TYPE_OPTIONS.find(opt => opt.value === type)?.label || String(type);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div ref={modalContentRef} className="p-6 overflow-y-auto">
          {/* --- CONTEÚDO RESTAURADO AQUI --- */}
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
            </>
          )}
        </div>
        
        {/* --- RODAPÉ COM NOVO LAYOUT --- */}
        <div className="p-4 border-t bg-gray-50 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Botão de Fechar (à esquerda) */}
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
                Fechar
            </button>
            
            {/* Botões de Ação (à direita) */}
            {unpaidTrips.length > 0 && (
                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3">
                    <button onClick={handleMarkAsPaid} className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        Marcar como Pago
                    </button>
                    <button 
                        onClick={handleSendWhatsApp} 
                        disabled={!pdfDownloaded} 
                        title={!pdfDownloaded ? "Exporte o PDF primeiro para habilitar" : "Enviar cobrança via WhatsApp"}
                        className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <WhatsAppIcon className="w-5 h-5 mr-2" />
                        Enviar via WhatsApp
                    </button>
                    <button onClick={handleExportPDF} className={`flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium transition-all ${pdfDownloaded ? 'bg-gray-200 text-gray-500 border-gray-300' : 'border-gray-400 text-gray-700 hover:bg-gray-50'}`}>
                        {pdfDownloaded ? <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" /> : <DocumentArrowDownIcon className="w-5 h-5 mr-2" />}
                        {pdfDownloaded ? "PDF Exportado" : "Exportar PDF"}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChargeModal;
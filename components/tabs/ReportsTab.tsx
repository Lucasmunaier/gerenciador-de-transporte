import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { TripType } from '../../types';
import { ChartBarIcon, CalendarDaysIcon } from '../icons';

const ReportsTab: React.FC = () => {
  const { trips, fuelLogs } = useAppContext();

  const [filterType, setFilterType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const reportData = useMemo(() => {
    const filteredTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date + 'T00:00:00');
      if (filterType === 'month') {
        if (!selectedMonth) return true;
        const [year, month] = selectedMonth.split('-').map(Number);
        return tripDate.getFullYear() === year && tripDate.getMonth() + 1 === month;
      } else { // range
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;
        if (start && tripDate < start) return false;
        if (end && tripDate > end) return false;
        return true;
      }
    });

    const filteredFuelLogs = fuelLogs.filter(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      if (filterType === 'month') {
        if (!selectedMonth) return true;
        const [year, month] = selectedMonth.split('-').map(Number);
        return logDate.getFullYear() === year && logDate.getMonth() + 1 === month;
      } else { // range
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;
        if (start && logDate < start) return false;
        if (end && logDate > end) return false;
        return true;
      }
    });

    const totalRevenue = filteredTrips
      .filter(trip => trip.paid)
      .reduce((sum, trip) => sum + trip.tripValue, 0);

    const totalFuelCosts = filteredFuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const netProfit = totalRevenue - totalFuelCosts;

    let idaCount = 0;
    let voltaCount = 0;
    filteredTrips.forEach(trip => {
      if (trip.type === TripType.IDA) idaCount++;
      else if (trip.type === TripType.VOLTA) voltaCount++;
      else if (trip.type === TripType.AMBOS) {
        idaCount++;
        voltaCount++;
      }
    });
    const totalSegments = idaCount + voltaCount;

    let overallAverageConsumption: number | undefined = undefined;
    const logsWithConsumption = filteredFuelLogs.filter(log => log.kmPerLiter !== undefined);
    if (logsWithConsumption.length >= 1) { // Changed from >=2 to >=1 to show average if any log has consumption
        // To calculate overall average: (total km driven) / (total liters used)
        // This requires knowing delta_km for each log pair.
        // Simplified: average of individual km/L values IF available on each log.
        // A more accurate approach would be sum of (current_odo - prev_odo) / sum of liters.
        // For now, let's use the average of available kmPerLiter values.
        const sumKmPerLiter = logsWithConsumption.reduce((sum, log) => sum + (log.kmPerLiter || 0), 0);
        overallAverageConsumption = sumKmPerLiter / logsWithConsumption.length;
    }
    
    // More accurate general consumption: sum delta km / sum liters
    let totalDeltaKm = 0;
    let totalLitersForConsumption = 0;
    const sortedFuelLogsForCalc = [...filteredFuelLogs].sort((a,b) => a.odometer - b.odometer);

    for (let i = 1; i < sortedFuelLogsForCalc.length; i++) {
        const prev = sortedFuelLogsForCalc[i-1];
        const curr = sortedFuelLogsForCalc[i];
        if (curr.odometer > prev.odometer && curr.liters > 0) {
            totalDeltaKm += (curr.odometer - prev.odometer);
            totalLitersForConsumption += curr.liters;
        }
    }
    if (totalLitersForConsumption > 0) {
        overallAverageConsumption = totalDeltaKm / totalLitersForConsumption;
    } else {
        // Fallback to simple average if no chained calc possible but individual values exist
        if(logsWithConsumption.length > 0) {
            const sumKmPerLiter = logsWithConsumption.reduce((sum, log) => sum + (log.kmPerLiter || 0), 0);
            overallAverageConsumption = sumKmPerLiter / logsWithConsumption.length;
        } else {
            overallAverageConsumption = undefined;
        }
    }


    return {
      totalRevenue,
      totalFuelCosts,
      netProfit,
      idaCount,
      voltaCount,
      totalSegments,
      overallAverageConsumption,
      hasData: filteredTrips.length > 0 || filteredFuelLogs.length > 0,
    };
  }, [trips, fuelLogs, filterType, selectedMonth, startDate, endDate]);

  const StatCard: React.FC<{ title: string; value: string | React.ReactNode; colorClass?: string }> = ({ title, value, colorClass = 'text-blue-600' }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Relatórios Financeiros e Operacionais</h2>

      {/* Filters */}
      <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Filtros</h3>
        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center space-x-2">
            <input type="radio" name="filterType" value="month" checked={filterType === 'month'} onChange={() => setFilterType('month')} className="form-radio h-4 w-4 text-blue-600"/>
            <span>Mês/Ano</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" name="filterType" value="range" checked={filterType === 'range'} onChange={() => setFilterType('range')} className="form-radio h-4 w-4 text-blue-600"/>
            <span>Intervalo</span>
          </label>
        </div>

        {filterType === 'month' && (
          <div>
            <label htmlFor="monthPicker" className="block text-sm font-medium text-gray-700">Selecionar Mês/Ano:</label>
            <input
              type="month"
              id="monthPicker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full md:w-1/2 lg:w-1/3 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        )}

        {filterType === 'range' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Inicial:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Final:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Report Summary */}
      {!reportData.hasData ? (
        <div className="p-8 text-center text-gray-500 text-lg bg-white shadow-xl rounded-lg">
           Nenhum dado encontrado para o período selecionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Receita Total" value={`R$ ${reportData.totalRevenue.toFixed(2)}`} colorClass="text-green-600" />
          <StatCard title="Custos Combustível" value={`R$ ${reportData.totalFuelCosts.toFixed(2)}`} colorClass="text-red-600" />
          <StatCard 
            title="Lucro Líquido" 
            value={`R$ ${reportData.netProfit.toFixed(2)}`}
            colorClass={reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
          />
          <StatCard title="Trechos Ida" value={reportData.idaCount.toString()} />
          <StatCard title="Trechos Volta" value={reportData.voltaCount.toString()} />
          <StatCard title="Total de Trechos" value={reportData.totalSegments.toString()} />
          <StatCard 
            title="Consumo Médio Geral" 
            value={reportData.overallAverageConsumption !== undefined ? `${reportData.overallAverageConsumption.toFixed(2)} km/L` : 'N/A'}
            colorClass={
                reportData.overallAverageConsumption === undefined ? 'text-gray-500' :
                reportData.overallAverageConsumption > 10 ? 'text-green-600' :
                reportData.overallAverageConsumption > 7 ? 'text-yellow-600' : 'text-red-600'
            }
          />
        </div>
      )}
       <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <p><strong className="font-semibold">Nota:</strong> O consumo médio geral é calculado como a razão entre o total de quilômetros rodados (diferença de odômetro entre abastecimentos consecutivos) e o total de litros abastecidos nesses intervalos, para o período filtrado. Se houver menos de dois abastecimentos com odômetros sequenciais no período, ou se os dados forem insuficientes, o cálculo pode não ser preciso ou exibido.</p>
      </div>
    </div>
  );
};

export default ReportsTab;

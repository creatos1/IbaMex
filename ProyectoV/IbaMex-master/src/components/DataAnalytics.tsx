
import { useState, useEffect } from 'react';
import '../styles/DataAnalytics.css';

interface RouteStats {
  routeId: string;
  routeName: string;
  totalPassengers: number;
  avgOccupancy: number;
  peakHours: { hour: number; count: number }[];
}

interface BusStats {
  busId: string;
  routeId: string;
  routeName: string;
  totalTrips: number;
  avgPassengersPerTrip: number;
}

interface DataAnalyticsProps {
  token: string;
}

export default function DataAnalytics({ token }: DataAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [routeStats, setRouteStats] = useState<RouteStats[]>([]);
  const [busStats, setBusStats] = useState<BusStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe, token]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Mock data for now - replace with actual API calls
      // This would be fetched from your backend with Redis cache
      
      // In real implementation:
      // const response = await fetch(`/api/analytics?timeframe=${timeframe}`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      
      // Simulate API response
      setTimeout(() => {
        // Mock route stats
        const mockRouteStats: RouteStats[] = [
          {
            routeId: '1',
            routeName: 'Ruta Centro - Norte',
            totalPassengers: 1250 * (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30),
            avgOccupancy: 68,
            peakHours: [
              { hour: 7, count: 145 },
              { hour: 8, count: 210 },
              { hour: 17, count: 180 },
              { hour: 18, count: 195 }
            ]
          },
          {
            routeId: '2',
            routeName: 'Ruta Sur - Universidad',
            totalPassengers: 980 * (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30),
            avgOccupancy: 72,
            peakHours: [
              { hour: 7, count: 120 },
              { hour: 8, count: 190 },
              { hour: 13, count: 150 },
              { hour: 18, count: 170 }
            ]
          }
        ];
        
        // Mock bus stats
        const mockBusStats: BusStats[] = [
          {
            busId: 'bus1',
            routeId: '1',
            routeName: 'Ruta Centro - Norte',
            totalTrips: 12 * (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30),
            avgPassengersPerTrip: 45
          },
          {
            busId: 'bus2',
            routeId: '1',
            routeName: 'Ruta Centro - Norte',
            totalTrips: 10 * (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30),
            avgPassengersPerTrip: 38
          },
          {
            busId: 'bus3',
            routeId: '2',
            routeName: 'Ruta Sur - Universidad',
            totalTrips: 14 * (timeframe === 'daily' ? 1 : timeframe === 'weekly' ? 7 : 30),
            avgPassengersPerTrip: 52
          }
        ];
        
        setRouteStats(mockRouteStats);
        setBusStats(mockBusStats);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      setError('Error fetching analytics data');
      setIsLoading(false);
    }
  };

  const renderPeakHoursChart = (peakHours: { hour: number; count: number }[]) => {
    const maxCount = Math.max(...peakHours.map(h => h.count));
    
    return (
      <div className="peak-hours-chart">
        {peakHours.map(({ hour, count }) => (
          <div key={hour} className="chart-bar-container">
            <div 
              className="chart-bar" 
              style={{ height: `${(count / maxCount) * 100}%` }}
              title={`${count} passengers at ${hour}:00`}
            ></div>
            <div className="chart-label">{hour}:00</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="data-analytics">
      <h2>Data Analytics & Reports</h2>
      
      <div className="analytics-controls">
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'monthly')}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <button 
          onClick={fetchAnalyticsData} 
          disabled={isLoading}
          className="refresh-btn"
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="analytics-content">
        <section className="routes-analytics">
          <h3>Routes Performance</h3>
          {isLoading ? (
            <p>Loading route data...</p>
          ) : routeStats.length === 0 ? (
            <p>No route data available</p>
          ) : (
            <div className="routes-stats-grid">
              {routeStats.map(route => (
                <div key={route.routeId} className="stats-card">
                  <h4>{route.routeName}</h4>
                  <div className="stats-data">
                    <div className="stat-item">
                      <span className="stat-label">Total Passengers:</span>
                      <span className="stat-value">{route.totalPassengers.toLocaleString()}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Average Occupancy:</span>
                      <span className="stat-value">{route.avgOccupancy}%</span>
                    </div>
                  </div>
                  
                  <div className="peak-hours">
                    <h5>Peak Hours</h5>
                    {renderPeakHoursChart(route.peakHours)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        <section className="buses-analytics">
          <h3>Bus Performance</h3>
          {isLoading ? (
            <p>Loading bus data...</p>
          ) : busStats.length === 0 ? (
            <p>No bus data available</p>
          ) : (
            <table className="bus-stats-table">
              <thead>
                <tr>
                  <th>Bus ID</th>
                  <th>Route</th>
                  <th>Total Trips</th>
                  <th>Avg. Passengers/Trip</th>
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {busStats.map(bus => (
                  <tr key={bus.busId}>
                    <td>{bus.busId}</td>
                    <td>{bus.routeName}</td>
                    <td>{bus.totalTrips}</td>
                    <td>{bus.avgPassengersPerTrip}</td>
                    <td>
                      <div className="efficiency-bar-container">
                        <div 
                          className="efficiency-bar"
                          style={{ 
                            width: `${Math.min(bus.avgPassengersPerTrip, 100)}%`,
                            backgroundColor: bus.avgPassengersPerTrip > 80 
                              ? '#4CAF50' 
                              : bus.avgPassengersPerTrip > 50 
                                ? '#FFC107' 
                                : '#FF5722'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

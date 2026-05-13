import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'bootstrap/dist/css/bootstrap.min.css';

const DisasterSimulator = ({ hospitalId }) => {
  const [formData, setFormData] = useState({
    blood_group: "A+",
    extreme_weather_category: "Normal / Clear",
    mass_casualties: 0,
    supply_chain_delay_hrs: 0,
    is_holiday: false,
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSimulate = async () => {
    try {
      setLoading(true);

      const weatherMapping = {
        "Normal / Clear": 0,
        "Heavy Storm": 50,
        "Severe Flooding": 150,
        "Catastrophic (Hurricane/Cyclone)": 300
      };
      
      const mappedWeatherMm = weatherMapping[formData.extreme_weather_category] || 0;

      const { data } = await axios.post("http://127.0.0.1:8000/simulate-disaster", {
        blood_group: formData.blood_group,
        extreme_weather_mm: mappedWeatherMm,
        mass_casualties: Number(formData.mass_casualties),
        supply_chain_delay_hrs: Number(formData.supply_chain_delay_hrs),
        is_holiday: formData.is_holiday,
        hospital_id: hospitalId,
      });
      if (data.success) {
        setResults(data);
        toast.success("Simulation completed successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Simulation failed. Ensure AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4 rounded" data-bs-theme="dark" style={{ backgroundColor: "#121212", color: "#f8f9fa" }}>
      <div className="container">
        <h2 className="text-danger mb-4 text-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          War Room: Disaster Simulator
        </h2>
        <p className="text-center mb-5">
          Inject exogenous stress variables into the federated global model to forecast emergency blood demand. Baseline data uses this hospital's local inventory.
        </p>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card shadow border-danger h-100">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Simulation Parameters</h5>
              </div>
              <div className="card-body bg-dark text-light">
                
                <div className="mb-4">
                  <label className="form-label fw-bold">Target Blood Group</label>
                  <select 
                    className="form-select bg-dark text-white border-secondary"
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between">
                    <span>Extreme Weather Event</span>
                  </label>
                  <select 
                    className={`form-select bg-dark text-white border-${
                      formData.extreme_weather_category === "Normal / Clear" ? "secondary" : 
                      formData.extreme_weather_category === "Heavy Storm" ? "info" : 
                      formData.extreme_weather_category === "Severe Flooding" ? "warning" : "danger"
                    }`}
                    name="extreme_weather_category"
                    value={formData.extreme_weather_category}
                    onChange={handleChange}
                  >
                    <option value="Normal / Clear">Normal / Clear</option>
                    <option value="Heavy Storm">Heavy Storm</option>
                    <option value="Severe Flooding">Severe Flooding</option>
                    <option value="Catastrophic (Hurricane/Cyclone)">Catastrophic (Hurricane/Cyclone)</option>
                  </select>
                  <small className="text-muted mt-2 d-block">Simulates extreme weather events impacting supply chain and accidents.</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between">
                    <span>Estimated Mass Casualties (ER Influx)</span>
                    <span className="text-danger">+{formData.mass_casualties} Patients</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    name="mass_casualties"
                    min="0"
                    max="500"
                    step="10"
                    value={formData.mass_casualties}
                    onChange={handleChange}
                  />
                  <small className="text-muted">Simulates sudden trauma demand (Train derailment, industrial accident).</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold d-flex justify-content-between">
                    <span>Supply Chain Restock Delay</span>
                    <span className="text-warning">{formData.supply_chain_delay_hrs} Hours</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    name="supply_chain_delay_hrs"
                    min="0"
                    max="72"
                    step="12"
                    value={formData.supply_chain_delay_hrs}
                    onChange={handleChange}
                  />
                  <small className="text-muted">Simulates blocked highways or grounded flights preventing new blood deliveries.</small>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="holidaySwitch"
                    name="is_holiday"
                    checked={formData.is_holiday}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-bold" htmlFor="holidaySwitch">
                    Simulate Public Holiday / Festival
                  </label>
                </div>

                <div className="d-grid mt-4">
                  <button 
                    className="btn btn-danger btn-lg text-uppercase fw-bold" 
                    onClick={handleSimulate}
                    disabled={loading}
                  >
                    {loading ? (
                      <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Computing...</span>
                    ) : (
                      "Run Global Simulation"
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card shadow h-100 border-secondary">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">Simulation Results</h5>
              </div>
              <div className="card-body bg-dark text-light d-flex flex-column justify-content-center align-items-center">
                {!results ? (
                  <div className="text-center text-muted">
                    <h1 className="display-1"><i className="bi bi-graph-up text-secondary"></i></h1>
                    <p>Run a simulation to view comparative analytics.</p>
                  </div>
                ) : (
                  <div className="w-100 text-center">
                    <h3 className="mb-4">Forecast for {results.blood_group}</h3>
                    
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="p-3 border border-success rounded bg-success bg-opacity-10">
                          <p className="mb-1 text-success fw-bold">Normal Forecast</p>
                          <h2 className="text-success m-0">{results.normal_forecast} <span className="fs-6">units</span></h2>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-3 border border-danger rounded bg-danger bg-opacity-10 shadow-sm">
                          <p className="mb-1 text-danger fw-bold">Disaster Scenario</p>
                          <h2 className="text-danger m-0">{results.simulated_forecast} <span className="fs-6">units</span></h2>
                        </div>
                      </div>
                    </div>

                    {results.delta > 0 ? (
                      <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading"><i className="bi bi-exclamation-octagon-fill me-2"></i> Critical Warning</h4>
                        <p className="mb-0">
                          Demand is projected to spike by <strong>{results.delta} units</strong> ({results.percent_increase}% increase) compared to standard operations. 
                          Immediate resource mobilization is recommended.
                        </p>
                      </div>
                    ) : results.delta < 0 ? (
                      <div className="alert alert-warning" role="alert">
                        <h4 className="alert-heading"><i className="bi bi-info-circle-fill me-2"></i> Demand Drop</h4>
                        <p className="mb-0">
                          Demand is projected to decrease by <strong>{Math.abs(results.delta)} units</strong> under these conditions.
                        </p>
                      </div>
                    ) : (
                      <div className="alert alert-secondary" role="alert">
                        <h4 className="alert-heading"><i className="bi bi-check-circle-fill me-2"></i> Stable</h4>
                        <p className="mb-0">No significant deviation from normal operations.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterSimulator;
